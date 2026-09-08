// =============================================================
// FILE: src/modules/dashboard/router.ts
// Woody admin dashboard ozeti — GERCEK veri.
//
// Onceki hali adminPanelStubs icinde sifir donen bir stub'di ve sablonun
// randevu/danisman metrikerini gosteriyordu. Woody bir e-ticaret + okul
// icerik platformu: burada siparis, teklif talebi, iletisim mesaji,
// uye, katalog ve bekleme listesi olculur.
//
// Akis metrikleri (ciro, siparis, teklif, mesaj) secili araliga gore,
// stok metrikleri (uye, urun, blog, okul) her zaman toplam doner.
// =============================================================

import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2';

import { pool } from '@/db/client';

type RangeKey = '7d' | '30d' | '90d';

const RANGE_DAYS: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90 };

function parseRange(req: FastifyRequest): RangeKey {
  const raw = String(((req.query ?? {}) as Record<string, unknown>).range ?? '30d');
  return raw === '7d' || raw === '90d' ? raw : '30d';
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function one<T extends RowDataPacket>(sql: string, params: Array<string | number> = []): Promise<T | undefined> {
  const [rows] = await pool.execute<T[]>(sql, params);
  return rows[0];
}

async function many<T extends RowDataPacket>(sql: string, params: Array<string | number> = []): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return rows;
}

export async function registerDashboardAdmin(adminApi: FastifyInstance) {
  adminApi.get('/dashboard/analytics', async (req) => {
    const range = parseRange(req);
    const days = RANGE_DAYS[range];

    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - days);
    const fromYmd = from.toISOString().slice(0, 10);
    const toYmdExclusive = to.toISOString().slice(0, 10);

    // Tum sorgular birbirinden bagimsiz — paralel calistir.
    const [
      orderAgg,
      refundAgg,
      quoteAgg,
      messageAgg,
      stock,
      revenueTrend,
      recentOrders,
      recentQuotes,
      recentMessages,
      topProducts,
    ] = await Promise.all([
      // --- Siparis ozeti (aralik ici) ---
      one<RowDataPacket>(
        `SELECT
           COUNT(*)                                                             AS orders_total,
           SUM(payment_status = 'paid')                                         AS orders_paid,
           SUM(payment_status IN ('unpaid','pending'))                          AS orders_pending,
           SUM(payment_status = 'failed')                                       AS orders_failed,
           COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total END), 0)   AS revenue_paid
         FROM orders
         WHERE created_at >= ?`,
        [fromYmd],
      ),

      // --- Tam iadeler (iade tarihi aralik icinde) ---
      one<RowDataPacket>(
        `SELECT
           COUNT(*)                                                           AS orders_refunded,
           COALESCE(SUM(total), 0)                                            AS refund_amount
         FROM orders
         WHERE payment_status = 'refunded' AND updated_at >= ?`,
        [fromYmd],
      ),

      // --- Teklif talepleri ---
      one<RowDataPacket>(
        `SELECT
           COUNT(*)                       AS quotes_total,
           SUM(status = 'new')            AS quotes_new,
           SUM(status = 'won')            AS quotes_won
         FROM quote_requests
         WHERE created_at >= ?`,
        [fromYmd],
      ),

      // --- Iletisim mesajlari ---
      one<RowDataPacket>(
        `SELECT
           COUNT(*)                       AS messages_total,
           SUM(status = 'new')            AS messages_new
         FROM contact_messages
         WHERE created_at >= ?`,
        [fromYmd],
      ),

      // --- Stok metrikleri (toplam, aralik disi) ---
      one<RowDataPacket>(
        `SELECT
           (SELECT COUNT(*) FROM users)                                    AS users_total,
           (SELECT COUNT(*) FROM schools)                                  AS schools_total,
           (SELECT COUNT(*) FROM products WHERE is_active = 1)             AS products_active,
           (SELECT COUNT(*) FROM blog_posts
              WHERE status = 'published' AND is_active = 1)                 AS blog_published,
           (SELECT COUNT(*) FROM waitlist_signups)                         AS waitlist_total,
           (SELECT COUNT(*) FROM quote_requests WHERE status = 'new')      AS quotes_open,
           (SELECT COUNT(*) FROM contact_messages WHERE status = 'new')    AS messages_open`,
      ),

      // --- Gunluk ciro trendi ---
      many<RowDataPacket>(
        `SELECT DATE(created_at) AS bucket,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total END), 0) AS revenue,
                COUNT(*) AS orders
           FROM orders
          WHERE created_at >= ?
          GROUP BY DATE(created_at)
          ORDER BY bucket ASC`,
        [fromYmd],
      ),

      // --- Son siparisler ---
      many<RowDataPacket>(
        `SELECT o.id, o.total, o.status, o.payment_status, o.created_at,
                u.full_name AS customer_name, u.email AS customer_email
           FROM orders o
           LEFT JOIN users u ON u.id = o.dealer_id
          ORDER BY o.created_at DESC
          LIMIT 8`,
      ),

      // --- Son teklif talepleri ---
      many<RowDataPacket>(
        `SELECT id, org_name, contact_name, email, phone, student_count, level,
                city, status, created_at
           FROM quote_requests
          ORDER BY created_at DESC
          LIMIT 6`,
      ),

      // --- Son iletisim mesajlari ---
      many<RowDataPacket>(
        `SELECT id, name, email, phone, subject, status, created_at
           FROM contact_messages
          ORDER BY created_at DESC
          LIMIT 6`,
      ),

      // --- Cok satan urunler (aralik ici, odenmis siparislerden) ---
      many<RowDataPacket>(
        `SELECT oi.product_id,
                COALESCE(pi.title, oi.product_id)       AS product_title,
                SUM(oi.quantity)                        AS qty,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
           FROM order_items oi
           JOIN orders o        ON o.id = oi.order_id
           LEFT JOIN product_i18n pi
                  ON pi.product_id = oi.product_id AND pi.locale = 'tr'
          WHERE o.payment_status = 'paid' AND o.created_at >= ?
          GROUP BY oi.product_id, pi.title
          ORDER BY revenue DESC
          LIMIT 5`,
        [fromYmd],
      ),
    ]);

    return {
      range,
      fromYmd,
      toYmdExclusive,
      totals: {
        // akis (aralik ici)
        revenue_paid: num(orderAgg?.revenue_paid),
        orders_total: num(orderAgg?.orders_total),
        orders_paid: num(orderAgg?.orders_paid),
        orders_pending: num(orderAgg?.orders_pending),
        orders_failed: num(orderAgg?.orders_failed),
        orders_refunded: num(refundAgg?.orders_refunded),
        refund_amount: num(refundAgg?.refund_amount),
        quotes_total: num(quoteAgg?.quotes_total),
        quotes_new: num(quoteAgg?.quotes_new),
        quotes_won: num(quoteAgg?.quotes_won),
        messages_total: num(messageAgg?.messages_total),
        messages_new: num(messageAgg?.messages_new),
        // stok (toplam)
        users_total: num(stock?.users_total),
        schools_total: num(stock?.schools_total),
        products_active: num(stock?.products_active),
        blog_published: num(stock?.blog_published),
        waitlist_total: num(stock?.waitlist_total),
        quotes_open: num(stock?.quotes_open),
        messages_open: num(stock?.messages_open),
      },
      revenueTrend: revenueTrend.map((r) => ({
        bucket: String(r.bucket),
        revenue: num(r.revenue),
        orders: num(r.orders),
      })),
      recentOrders: recentOrders.map((r) => ({
        id: String(r.id),
        order_number: `WD${String(r.id).replace(/-/g, '')}`,
        total: num(r.total),
        status: String(r.status),
        payment_status: String(r.payment_status),
        customer_name: r.customer_name ? String(r.customer_name) : null,
        customer_email: r.customer_email ? String(r.customer_email) : null,
        created_at: String(r.created_at),
      })),
      recentQuotes: recentQuotes.map((r) => ({
        id: String(r.id),
        org_name: String(r.org_name ?? ''),
        contact_name: String(r.contact_name ?? ''),
        email: String(r.email ?? ''),
        phone: r.phone ? String(r.phone) : null,
        student_count: num(r.student_count),
        level: String(r.level ?? ''),
        city: r.city ? String(r.city) : null,
        status: String(r.status ?? ''),
        created_at: String(r.created_at),
      })),
      recentMessages: recentMessages.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        phone: r.phone ? String(r.phone) : null,
        subject: r.subject ? String(r.subject) : null,
        status: String(r.status ?? ''),
        created_at: String(r.created_at),
      })),
      topProducts: topProducts.map((r) => ({
        product_id: String(r.product_id),
        product_title: String(r.product_title ?? ''),
        qty: num(r.qty),
        revenue: num(r.revenue),
      })),
    };
  });
}
