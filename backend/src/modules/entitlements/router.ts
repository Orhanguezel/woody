import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import { requireAuth, type JwtUser } from '@shared/shared-backend/middleware/auth';
import { pool } from '@/db/client';

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function requireUserId(req: FastifyRequest): string {
  const user = (req as FastifyRequest & { user?: JwtUser }).user;
  const id = typeof user?.sub === 'string' ? user.sub.trim() : '';
  if (!id) {
    const err = new Error('missing_user_id');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }
  return id;
}

export async function registerEntitlementsPublic(app: FastifyInstance) {
  app.get('/me/library', { preHandler: [requireAuth] }, async (req) => {
    const userId = requireUserId(req);
    const q = (req.query || {}) as { locale?: string };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT ue.id AS entitlementId, ue.product_id AS productId, ue.source, ue.status,
               ue.starts_at AS startsAt, ue.expires_at AS expiresAt,
               CASE
                 WHEN ue.expires_at IS NULL THEN NULL
                 ELSE GREATEST(0, TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP(3), ue.expires_at))
               END AS remainingDays,
               p.price, p.image_url AS imageUrl, p.purchase_mode AS purchaseMode,
               p.is_free AS isFree, p.access_duration_days AS accessDurationDays,
               pi.title, pi.slug, pi.description,
               psi.slug AS seriesSlug, psi.name AS seriesName,
               pli.slug AS levelSlug, pli.name AS levelName
          FROM user_entitlements ue
          INNER JOIN products p ON p.id = ue.product_id
          INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
          LEFT JOIN product_series_i18n psi ON psi.series_id = p.series_id AND psi.locale = ?
          LEFT JOIN product_level_i18n pli ON pli.level_id = p.level_id AND pli.locale = ?
         WHERE ue.user_id = ?
           AND ue.status = 'active'
           AND (ue.expires_at IS NULL OR ue.expires_at > CURRENT_TIMESTAMP(3))
         ORDER BY ue.updated_at DESC, ue.created_at DESC
      `,
      [locale, locale, locale, userId],
    );

    const productIds = rows.map((row) => String(row.productId));
    if (!productIds.length) return { items: [] };

    const placeholders = productIds.map(() => '?').join(', ');
    const [contents] = await pool.execute<RowDataPacket[]>(
      `
        SELECT pc.product_id AS productId, pc.id, pc.kind, pc.media_type AS mediaType,
               pci.title, pci.description, pc.is_preview AS isPreview,
               pc.display_order AS displayOrder
          FROM product_contents pc
          INNER JOIN product_content_i18n pci ON pci.content_id = pc.id AND pci.locale = ?
         WHERE pc.product_id IN (${placeholders})
           AND pc.is_active = 1
         ORDER BY pc.product_id ASC, pc.display_order ASC
      `,
      [locale, ...productIds],
    );
    const byProduct = new Map<string, RowDataPacket[]>();
    for (const content of contents) {
      const productId = String(content.productId);
      byProduct.set(productId, [...(byProduct.get(productId) || []), content]);
    }

    return {
      items: rows.map((row) => ({
        ...row,
        contents: byProduct.get(String(row.productId)) || [],
      })),
    };
  });

  app.post('/me/library/free/:productId', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = requireUserId(req);
    const { productId } = req.params as { productId: string };
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, is_free FROM products WHERE id = ? AND item_type = "product" AND is_active = 1 LIMIT 1',
      [productId],
    );
    const product = rows[0];
    if (!product) return reply.code(404).send({ error: { message: 'not_found' } });
    if (Number(product.is_free) !== 1) {
      return reply.code(400).send({ error: { message: 'product_not_free' } });
    }

    await pool.execute(
      `
        INSERT INTO user_entitlements
          (id, user_id, product_id, source, status, starts_at, expires_at, created_at, updated_at)
        VALUES (?, ?, ?, 'free', 'active', CURRENT_TIMESTAMP(3), NULL, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        ON DUPLICATE KEY UPDATE
          source = 'free',
          status = 'active',
          expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP(3)
      `,
      [randomUUID(), userId, productId],
    );

    return reply.code(201).send({ ok: true });
  });

  app.get('/me/contents/:contentId', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = requireUserId(req);
    const { contentId } = req.params as { contentId: string };
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT pc.id, pc.product_id AS productId, pc.kind, pc.is_preview AS isPreview,
               pc.storage_asset_id AS storageAssetId, pc.external_url AS externalUrl,
               p.is_free AS isFree,
               ue.status AS entitlementStatus, ue.expires_at AS expiresAt,
               sa.url AS storageUrl
          FROM product_contents pc
          INNER JOIN products p ON p.id = pc.product_id
          LEFT JOIN user_entitlements ue ON ue.product_id = pc.product_id AND ue.user_id = ?
          LEFT JOIN storage_assets sa ON sa.id = pc.storage_asset_id
         WHERE pc.id = ?
           AND pc.is_active = 1
         LIMIT 1
      `,
      [userId, contentId],
    );
    const content = rows[0];
    if (!content) return reply.code(404).send({ error: { message: 'not_found' } });
    if (content.kind !== 'digital') {
      return reply.code(400).send({ error: { message: 'content_not_digital' } });
    }

    const hasOpenAccess = Number(content.isFree) === 1 || Number(content.isPreview) === 1;
    const expiresAt = content.expiresAt ? new Date(String(content.expiresAt)).getTime() : null;
    const hasActiveEntitlement =
      content.entitlementStatus === 'active' && (expiresAt === null || expiresAt > Date.now());
    if (!hasOpenAccess && !hasActiveEntitlement) {
      if (content.entitlementStatus === 'active' && expiresAt !== null && expiresAt <= Date.now()) {
        return reply.code(403).send({ error: { message: 'forbidden' }, reason: 'expired' });
      }
      return reply.code(403).send({ error: { message: 'forbidden' }, reason: 'entitlement_required' });
    }

    const url = clean(content.externalUrl) || clean(content.storageUrl);
    if (!url) return reply.code(404).send({ error: { message: 'asset_not_found' } });
    return reply.redirect(url);
  });
}

export async function registerEntitlementsAdmin(app: FastifyInstance) {
  app.get('/entitlements', async (req) => {
    const q = (req.query || {}) as {
      userId?: string;
      productId?: string;
      status?: string;
      q?: string;
      limit?: string;
      offset?: string;
    };
    const where: string[] = [];
    const params: Array<string | number> = [];
    if (clean(q.userId)) {
      where.push('ue.user_id = ?');
      params.push(clean(q.userId));
    }
    if (clean(q.productId)) {
      where.push('ue.product_id = ?');
      params.push(clean(q.productId));
    }
    if (clean(q.status)) {
      where.push('ue.status = ?');
      params.push(clean(q.status));
    }
    if (clean(q.q)) {
      where.push('(u.email LIKE ? OR u.full_name LIKE ? OR pi.title LIKE ?)');
      const needle = `%${clean(q.q)}%`;
      params.push(needle, needle, needle);
    }
    const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 100);
    const offset = Math.max(Number(q.offset) || 0, 0);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT ue.id, ue.user_id AS userId, u.email AS userEmail, u.full_name AS userName,
               ue.product_id AS productId, pi.title AS productTitle, ue.order_id AS orderId,
               ue.source, ue.status, ue.starts_at AS startsAt, ue.expires_at AS expiresAt,
               CASE
                 WHEN ue.expires_at IS NULL THEN NULL
                 ELSE GREATEST(0, TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP(3), ue.expires_at))
               END AS remainingDays,
               ue.created_at AS createdAt, ue.updated_at AS updatedAt
          FROM user_entitlements ue
          INNER JOIN users u ON u.id = ue.user_id
          INNER JOIN product_i18n pi ON pi.product_id = ue.product_id AND pi.locale = 'tr'
          ${whereSql}
         ORDER BY ue.updated_at DESC, ue.created_at DESC
         LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
          FROM user_entitlements ue
          INNER JOIN users u ON u.id = ue.user_id
          INNER JOIN product_i18n pi ON pi.product_id = ue.product_id AND pi.locale = 'tr'
          ${whereSql}
      `,
      params,
    );
    return { data: rows, total: Number(countRows[0]?.total || 0), limit, offset };
  });

  app.post('/entitlements', async (req, reply) => {
    const body = (req.body || {}) as { userId?: string; productId?: string; days?: number | string | null };
    const userId = clean(body.userId);
    const productId = clean(body.productId);
    if (!userId || !productId) return reply.code(400).send({ error: { message: 'user_product_required' } });
    const days = body.days == null || body.days === '' ? null : Math.max(1, Number(body.days) || 1);
    await pool.execute(
      `
        INSERT INTO user_entitlements
          (id, user_id, product_id, source, status, starts_at, expires_at, created_at, updated_at)
        VALUES (
          ?, ?, ?, 'manual', 'active', CURRENT_TIMESTAMP(3),
          ${days == null ? 'NULL' : 'DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL ? DAY)'},
          CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
        )
        ON DUPLICATE KEY UPDATE
          source = 'manual',
          status = 'active',
          expires_at = ${days == null ? 'NULL' : 'DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL ? DAY)'},
          updated_at = CURRENT_TIMESTAMP(3)
      `,
      days == null
        ? [randomUUID(), userId, productId]
        : [randomUUID(), userId, productId, days, days],
    );
    return reply.code(201).send({ ok: true });
  });

  app.patch('/entitlements/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as { days?: number | string; status?: string; revoke?: boolean };
    if (body.revoke || body.status === 'revoked') {
      await pool.execute(
        "UPDATE user_entitlements SET status = 'revoked', updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
        [id],
      );
      return { ok: true };
    }
    const days = Math.max(1, Number(body.days) || 0);
    if (!days) return reply.code(400).send({ error: { message: 'days_required' } });
    await pool.execute(
      `
        UPDATE user_entitlements
           SET status = 'active',
               expires_at = DATE_ADD(GREATEST(COALESCE(expires_at, CURRENT_TIMESTAMP(3)), CURRENT_TIMESTAMP(3)), INTERVAL ? DAY),
               updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [days, id],
    );
    return { ok: true };
  });
}
