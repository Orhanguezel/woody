// =============================================================
// FILE: src/modules/contentSource/router.ts
// Tanitio "İçerik Kaynağı API Kontratı" v1.3 sağlayıcı ucu.
//
//   GET /api/v1/content-source/articles   → yayınlanmış blog yazıları
//   GET /api/v1/content-source/products   → aktif ürünler (eğitim setleri)
//
// Tüketici: ekosistem-sosyal-medya (Tanitio) content-sources modülü. Base URL'e
// /articles ve /products ekleyerek çağırır, X-Api-Key ile kimlik doğrular.
//
// Neden ayrı bir uç (mevcut /blog ve /products dururken):
//   • Kontrat mutlak-kanonik URL istiyor; /blog ve /products göreli yol döndürüyor
//     (`/media/...`, `/assets/...`) ve `url` alanı hiç yok. Tüketici slug'dan URL
//     türetmeye kalkınca yanlış yola (/urun/<slug>) çıkıyor — doğrusu /tr/store/<slug>.
//   • Paylaşıma açık, salt-okuma, anahtarla korunan dar bir yüzey isteniyor;
//     sitenin kendi iç uçlarının şeklini kontrata bağlamak istemiyoruz.
// =============================================================
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2';

import { env } from '@/core/env';
import { pool } from '@/db/client';

/** Sitenin kanonik kökü — apex. www.woodyvearkadaslari.com apex'e 301 döner ve
 *  kontrat yönlendirmeli host'u yasaklar; bu yüzden FRONTEND_URL'i olduğu gibi
 *  kullanıp yalnız sondaki eğik çizgiyi atıyoruz. */
function siteOrigin(): string {
  return env.FRONTEND_URL.replace(/\/+$/, '');
}

/** Göreli yolu mutlak kanonik URL'e çevirir. Zaten mutlaksa dokunmaz. */
function absolute(path: string | null | undefined): string | null {
  const value = typeof path === 'string' ? path.trim() : '';
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteOrigin()}/${value.replace(/^\/+/, '')}`;
}

function isoOrNull(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const LOCALES = new Set(['tr', 'en', 'de', 'fr', 'es', 'it', 'nl', 'pt-BR', 'ru', 'ar']);

type Query = {
  limit: number;
  offset: number;
  locale: string;
  q: string;
  sort: string;
  updatedSince: string | null;
};

function parseQuery(raw: Record<string, string | undefined>): Query {
  const limit = Math.min(60, Math.max(1, Number.parseInt(raw.limit ?? '20', 10) || 20));
  const offset = Math.max(0, Number.parseInt(raw.offset ?? '0', 10) || 0);
  const requested = (raw.locale ?? 'tr').trim();
  const locale = LOCALES.has(requested) ? requested : 'tr';
  const q = (raw.q ?? '').trim().slice(0, 120);
  const since = (raw.updated_since ?? '').trim();
  const parsedSince = since ? new Date(since) : null;
  return {
    limit,
    offset,
    locale,
    q,
    sort: (raw.sort ?? '').trim(),
    updatedSince:
      parsedSince && !Number.isNaN(parsedSince.getTime())
        ? parsedSince.toISOString().slice(0, 19).replace('T', ' ')
        : null,
  };
}

/** Salt-okuma anahtar kontrolü. Anahtar TANIMLI DEĞİLSE uç açılmaz (fail-closed) —
 *  varsayılan/yedek anahtar YOK. */
function guardApiKey(req: FastifyRequest, reply: FastifyReply): boolean {
  const expected = (process.env.CONTENT_SOURCE_API_KEY ?? '').trim();
  if (!expected) {
    reply.code(503).send({
      error: { code: 'CONTENT_SOURCE_DISABLED', message: 'CONTENT_SOURCE_API_KEY tanımlı değil.' },
    });
    return false;
  }
  const header = req.headers['x-api-key'];
  const provided = (Array.isArray(header) ? header[0] : header ?? '').trim();
  if (provided !== expected) {
    reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Geçersiz X-Api-Key.' } });
    return false;
  }
  return true;
}

// ── /articles ────────────────────────────────────────────────────────────────
async function listArticles(req: FastifyRequest, reply: FastifyReply) {
  if (!guardApiKey(req, reply)) return;
  const { limit, offset, locale, q, sort, updatedSince } = parseQuery(
    req.query as Record<string, string | undefined>,
  );

  const where: string[] = [
    "b.status = 'published'",
    'b.is_active = 1',
    'b.published_at IS NOT NULL',
    'i.locale = ?',
    "i.slug <> ''",
  ];
  const params: unknown[] = [locale];
  if (q) {
    where.push('(i.title LIKE ? OR i.excerpt LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (updatedSince) {
    where.push('b.updated_at >= ?');
    params.push(updatedSince);
  }
  const whereSql = where.join(' AND ');
  const orderSql =
    sort === 'updated'
      ? 'b.updated_at DESC'
      : 'b.published_at DESC, b.display_order ASC';

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM blog_posts b
       JOIN blog_posts_i18n i ON i.blog_post_id = b.id
      WHERE ${whereSql}`,
    params,
  );
  const total = Number(countRows[0]?.n ?? 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.id, b.category, b.author, b.image_url, b.published_at, b.updated_at,
            i.title, i.slug, i.excerpt, i.meta_description
       FROM blog_posts b
       JOIN blog_posts_i18n i ON i.blog_post_id = b.id
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const items = rows.map((row) => {
    const url = `${siteOrigin()}/${locale}/blog/${encodeURIComponent(String(row.slug))}`;
    const image = absolute(row.image_url as string | null);
    return {
      id: String(row.id),
      content_type: 'blog',
      title: String(row.title),
      slug: String(row.slug),
      url,
      excerpt: (row.excerpt as string | null) || (row.meta_description as string | null) || null,
      image_url: image,
      og_image: image,
      category: (row.category as string | null) || null,
      author: (row.author as string | null) || null,
      locale,
      published_at: isoOrNull(row.published_at),
      updated_at: isoOrNull(row.updated_at),
    };
  });

  return reply.send({ items, total, hasMore: offset + items.length < total });
}

// ── /products ────────────────────────────────────────────────────────────────
async function listProducts(req: FastifyRequest, reply: FastifyReply) {
  if (!guardApiKey(req, reply)) return;
  const { limit, offset, locale, q, sort, updatedSince } = parseQuery(
    req.query as Record<string, string | undefined>,
  );

  const where: string[] = ['p.is_active = 1', 'i.locale = ?', "i.slug <> ''"];
  const params: unknown[] = [locale];
  if (q) {
    where.push('(i.title LIKE ? OR i.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (updatedSince) {
    where.push('p.updated_at >= ?');
    params.push(updatedSince);
  }
  const whereSql = where.join(' AND ');
  // 'popular' için gerçek tıklama sayacı yok; öne çıkan + editör sırası en yakın vekil.
  const orderSql =
    sort === 'newest'
      ? 'p.created_at DESC'
      : sort === 'price_asc'
        ? 'p.price ASC'
        : sort === 'price_desc'
          ? 'p.price DESC'
          : 'p.is_featured DESC, p.order_num ASC, p.created_at DESC';

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM products p
       JOIN product_i18n i ON i.product_id = p.id
      WHERE ${whereSql}`,
    params,
  );
  const total = Number(countRows[0]?.n ?? 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.price, p.image_url, p.is_featured, p.order_num, p.stock_quantity,
            p.purchase_mode, p.created_at, p.updated_at,
            i.title, i.slug, i.description, i.tags
       FROM products p
       JOIN product_i18n i ON i.product_id = p.id
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const items = rows.map((row) => {
    const image = absolute(row.image_url as string | null);
    const price = Number(row.price);
    return {
      id: String(row.id),
      content_type: 'product',
      title: String(row.title),
      slug: String(row.slug),
      url: `${siteOrigin()}/${locale}/store/${encodeURIComponent(String(row.slug))}`,
      excerpt: (row.description as string | null) || null,
      image_url: image,
      og_image: image,
      // Teklif usulü (purchase_mode='quote') ürünlerde vitrin fiyatı yok → null.
      price: row.purchase_mode === 'quote' || !Number.isFinite(price) || price <= 0 ? null : price,
      currency: 'TRY',
      in_stock: Number(row.stock_quantity) > 0,
      tags: Array.isArray(row.tags) ? row.tags : [],
      locale,
      published_at: isoOrNull(row.created_at),
      updated_at: isoOrNull(row.updated_at),
    };
  });

  return reply.send({ items, total, hasMore: offset + items.length < total });
}

export async function registerContentSourcePublic(app: FastifyInstance) {
  await app.register(
    async (scope) => {
      scope.get('/articles', { config: { public: true } }, listArticles);
      scope.get('/products', { config: { public: true } }, listProducts);
    },
    { prefix: '/content-source' },
  );
}
