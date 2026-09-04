// =============================================================
// FILE: src/modules/notifications/router.ts
// Kullanici bildirimleri — gercek modul.
//
// Onceki hali routes/project.ts icinde iki satirlik STUB'di
// (`/notifications` -> [], `/notifications/unread-count` -> {count:0}).
// Admin panelin 60sn'lik yoklamasi 404 + retry dongusu uretmesin diye
// konmustu; `notifications` tablosu bastan beri vardi ama HIC
// kullanilmiyordu. Sitede de bildirim sayfasi yoktu.
//
// Uclar:
//   GET    /notifications                 — kendi bildirimlerim
//   GET    /notifications/unread-count    — okunmamis sayisi
//   PATCH  /notifications/:id             — okundu/okunmadi (frontend sozlesmesi)
//   POST   /notifications/mark-all-read   — hepsini okundu isaretle
//   DELETE /notifications/:id             — sil
//   (admin) GET/POST/DELETE /admin/notifications
//
// Giris yapmamis istekler bos liste/0 doner — admin panelin acilis
// yoklamasi bu yuzden hata uretmez.
// =============================================================

import { randomUUID } from 'crypto';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

import { pool } from '@/db/client';

/** Bildirim turleri — arayuz ikon/renk secimi bunlara gore yapar. */
export const NOTIFICATION_TYPES = [
  'order',
  'payment',
  'content',
  'account',
  'system',
  'announcement',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

/** JWT yuku { sub, email, role } — auth/controller.ts boyle imzaliyor. */
function currentUserId(req: FastifyRequest): string | null {
  const u = (req as FastifyRequest & { user?: Record<string, unknown> }).user;
  if (!u) return null;
  const id = u.sub ?? u.id ?? u.user_id;
  return id ? String(id) : null;
}

/** Oturum yoksa null doner — cagiran bos yanit verir, 401 firlatmaz. */
async function optionalAuth(req: FastifyRequest): Promise<string | null> {
  try {
    await (req as FastifyRequest & { jwtVerify: () => Promise<unknown> }).jwtVerify();
  } catch {
    return null;
  }
  return currentUserId(req);
}

function mapRow(r: RowDataPacket) {
  return {
    id: str(r.id),
    title: str(r.title),
    message: str(r.message),
    type: str(r.type) || 'system',
    is_read: Number(r.is_read) === 1,
    created_at: str(r.created_at),
  };
}

/**
 * Bir kullaniciya bildirim yazar. Cagiran akisi ASLA bozmaz —
 * bildirim yazilamadi diye siparis/odeme akisi durmamali.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}): Promise<void> {
  try {
    if (!params.userId) return;
    await pool.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP(3))`,
      [randomUUID(), params.userId, params.title.slice(0, 255), params.message, params.type ?? 'system'],
    );
  } catch {
    // sessizce gec — cagiran akis etkilenmez
  }
}

export async function registerNotificationsPublic(app: FastifyInstance) {
  // Kendi bildirimlerim
  app.get('/notifications', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = await optionalAuth(req);
    if (!userId) return reply.send([]);

    const q = (req.query ?? {}) as { limit?: string; unread?: string };
    const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 100);
    const onlyUnread = String(q.unread ?? '') === '1';

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, message, type, is_read, created_at
         FROM notifications
        WHERE user_id = ? ${onlyUnread ? 'AND is_read = 0' : ''}
        ORDER BY created_at DESC
        LIMIT ?`,
      [userId, limit],
    );
    return reply.send(rows.map(mapRow));
  });

  app.get('/notifications/unread-count', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = await optionalAuth(req);
    if (!userId) return reply.send({ count: 0 });

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId],
    );
    return reply.send({ count: Number(rows[0]?.c ?? 0) });
  });

  // Frontend RTK sozlesmesi: PATCH /notifications/:id { is_read }
  app.patch('/notifications/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = await optionalAuth(req);
    if (!userId) return reply.code(401).send({ error: { message: 'unauthorized' } });

    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as { is_read?: boolean | number };
    const read = body.is_read === undefined ? 1 : body.is_read ? 1 : 0;

    const [res] = await pool.execute<ResultSetHeader>(
      `UPDATE notifications SET is_read = ? WHERE id = ? AND user_id = ?`,
      [read, id, userId],
    );
    if (!res.affectedRows) return reply.code(404).send({ error: { message: 'notification_not_found' } });

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, message, type, is_read, created_at FROM notifications WHERE id = ? LIMIT 1`,
      [id],
    );
    return reply.send(rows[0] ? mapRow(rows[0]) : { ok: true });
  });

  app.post('/notifications/mark-all-read', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = await optionalAuth(req);
    if (!userId) return reply.code(401).send({ error: { message: 'unauthorized' } });

    const [res] = await pool.execute<ResultSetHeader>(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [userId],
    );
    return reply.send({ ok: true, updated: res.affectedRows });
  });

  app.delete('/notifications/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = await optionalAuth(req);
    if (!userId) return reply.code(401).send({ error: { message: 'unauthorized' } });

    const { id } = req.params as { id: string };
    const [res] = await pool.execute<ResultSetHeader>(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    if (!res.affectedRows) return reply.code(404).send({ error: { message: 'notification_not_found' } });
    return reply.send({ ok: true });
  });
}

export async function registerNotificationsAdmin(adminApi: FastifyInstance) {
  // Tum bildirimler (kullanici bilgisiyle)
  adminApi.get('/notifications', async (req) => {
    const q = (req.query ?? {}) as { limit?: string; offset?: string; user_id?: string };
    const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
    const offset = Math.max(Number(q.offset) || 0, 0);
    const where = q.user_id ? 'WHERE n.user_id = ?' : '';
    const params: Array<string | number> = q.user_id ? [q.user_id] : [];

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT n.id, n.user_id, n.title, n.message, n.type, n.is_read, n.created_at,
              u.email, u.full_name
         FROM notifications n
         LEFT JOIN users u ON u.id = n.user_id
         ${where}
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM notifications n ${where}`,
      params,
    );
    return {
      data: rows.map((r) => ({
        ...mapRow(r),
        user_id: str(r.user_id),
        user_email: r.email ? str(r.email) : null,
        user_name: r.full_name ? str(r.full_name) : null,
      })),
      total: Number(countRows[0]?.total ?? 0),
      limit,
      offset,
    };
  });

  // Bildirim gonder — tek kullaniciya veya herkese
  adminApi.post('/notifications', async (req, reply) => {
    const body = (req.body ?? {}) as {
      user_id?: string;
      all?: boolean;
      title?: string;
      message?: string;
      type?: string;
    };
    const title = String(body.title ?? '').trim();
    const message = String(body.message ?? '').trim();
    if (!title || !message) {
      return reply.code(400).send({ error: { message: 'title_and_message_required' } });
    }
    const type = NOTIFICATION_TYPES.includes(body.type as NotificationType)
      ? (body.type as NotificationType)
      : 'announcement';

    let targets: string[] = [];
    if (body.all) {
      const [rows] = await pool.query<RowDataPacket[]>(`SELECT id FROM users WHERE is_active = 1`);
      targets = rows.map((r) => str(r.id));
    } else if (body.user_id) {
      targets = [String(body.user_id)];
    } else {
      return reply.code(400).send({ error: { message: 'user_id_or_all_required' } });
    }

    for (const userId of targets) {
      await createNotification({ userId, title, message, type });
    }
    return reply.code(201).send({ ok: true, sent: targets.length });
  });

  adminApi.delete('/notifications/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [res] = await pool.execute<ResultSetHeader>(`DELETE FROM notifications WHERE id = ?`, [id]);
    if (!res.affectedRows) return reply.code(404).send({ error: { message: 'notification_not_found' } });
    return reply.send({ ok: true });
  });
}
