import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth, type JwtUser } from '@shared/shared-backend/middleware/auth';
import { pool } from '@/db/client';

type SchoolBody = {
  name?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  city?: string | null;
  is_active?: boolean | number;
};

type SchoolUserBody = {
  user_id?: string;
  role?: 'owner' | 'teacher' | 'student';
};

type DigitalAssetBody = {
  title?: string;
  asset_type?: 'video' | 'pdf' | 'audio' | 'image' | 'other';
  storage_asset_id?: string | null;
  level?: 'basic' | 'junior' | 'senior' | null;
  product?: 'storyland' | 'movieland' | 'musicland' | 'library' | null;
  is_active?: boolean | number;
};

type AccessBody = {
  digital_asset_id?: string;
};

function boolToTinyint(value: unknown, fallback = 1) {
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return fallback;
}

function cleanNullable(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
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

function sendBadRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({ error: { message } });
}

export async function registerSchoolsAdmin(app: FastifyInstance) {
  app.get('/schools', async () => {
    const [rows] = await pool.execute(
      `
        SELECT id, name, contact_email, contact_phone, city, is_active, created_at, updated_at
          FROM schools
         ORDER BY created_at DESC
      `,
    );
    return rows;
  });

  app.post('/schools', async (req, reply) => {
    const body = (req.body || {}) as SchoolBody;
    const name = cleanNullable(body.name);
    if (!name) return sendBadRequest(reply, 'name_required');

    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO schools (id, name, contact_email, contact_phone, city, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        name,
        cleanNullable(body.contact_email),
        cleanNullable(body.contact_phone),
        cleanNullable(body.city),
        boolToTinyint(body.is_active, 1),
      ],
    );

    return reply.code(201).send({ id });
  });

  app.patch('/schools/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as SchoolBody;
    const name = cleanNullable(body.name);
    if (!name) return sendBadRequest(reply, 'name_required');

    await pool.execute(
      `
        UPDATE schools
           SET name = ?,
               contact_email = ?,
               contact_phone = ?,
               city = ?,
               is_active = ?,
               updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [
        name,
        cleanNullable(body.contact_email),
        cleanNullable(body.contact_phone),
        cleanNullable(body.city),
        boolToTinyint(body.is_active, 1),
        id,
      ],
    );

    return { success: true };
  });

  app.delete('/schools/:id', async (req) => {
    const { id } = req.params as { id: string };
    await pool.execute('DELETE FROM schools WHERE id = ?', [id]);
    return { success: true };
  });

  app.get('/schools/:id/users', async (req) => {
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT su.id, su.school_id, su.user_id, su.role, su.created_at, u.email
          FROM school_users su
          LEFT JOIN users u ON u.id = su.user_id
         WHERE su.school_id = ?
         ORDER BY su.created_at DESC
      `,
      [id],
    );
    return rows;
  });

  app.post('/schools/:id/users', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as SchoolUserBody;
    const userId = cleanNullable(body.user_id);
    if (!userId) return sendBadRequest(reply, 'user_id_required');

    const role = body.role || 'teacher';
    await pool.execute(
      `
        INSERT INTO school_users (id, school_id, user_id, role)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE role = VALUES(role)
      `,
      [randomUUID(), id, userId, role],
    );

    return { success: true };
  });

  app.delete('/schools/:id/users/:userId', async (req) => {
    const { id, userId } = req.params as { id: string; userId: string };
    await pool.execute('DELETE FROM school_users WHERE school_id = ? AND user_id = ?', [id, userId]);
    return { success: true };
  });

  app.get('/digital-assets', async () => {
    const [rows] = await pool.execute(
      `
        SELECT da.id, da.title, da.asset_type, da.storage_asset_id, da.level, da.product,
               da.is_active, da.created_at, da.updated_at,
               sa.name AS storage_name, sa.path AS storage_path, sa.mime AS storage_mime,
               sa.url AS storage_url
          FROM digital_assets da
          LEFT JOIN storage_assets sa ON sa.id = da.storage_asset_id
         ORDER BY da.created_at DESC
      `,
    );
    return rows;
  });

  app.post('/digital-assets', async (req, reply) => {
    const body = (req.body || {}) as DigitalAssetBody;
    const title = cleanNullable(body.title);
    if (!title) return sendBadRequest(reply, 'title_required');

    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO digital_assets (id, title, asset_type, storage_asset_id, level, product, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        title,
        body.asset_type || 'pdf',
        cleanNullable(body.storage_asset_id),
        body.level || null,
        body.product || null,
        boolToTinyint(body.is_active, 1),
      ],
    );

    return reply.code(201).send({ id });
  });

  app.patch('/digital-assets/:id', async (req) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as DigitalAssetBody;
    await pool.execute(
      `
        UPDATE digital_assets
           SET title = ?,
               asset_type = ?,
               storage_asset_id = ?,
               level = ?,
               product = ?,
               is_active = ?,
               updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [
        cleanNullable(body.title),
        body.asset_type || 'pdf',
        cleanNullable(body.storage_asset_id),
        body.level || null,
        body.product || null,
        boolToTinyint(body.is_active, 1),
        id,
      ],
    );
    return { success: true };
  });

  app.delete('/digital-assets/:id', async (req) => {
    const { id } = req.params as { id: string };
    await pool.execute('DELETE FROM digital_assets WHERE id = ?', [id]);
    return { success: true };
  });

  app.get('/schools/:id/content-access', async (req) => {
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT sca.id, sca.school_id, sca.digital_asset_id, sca.granted_at,
               da.title, da.asset_type, da.level, da.product, da.storage_asset_id, da.is_active,
               sa.name AS storage_name, sa.path AS storage_path, sa.mime AS storage_mime,
               sa.url AS storage_url
          FROM school_content_access sca
          INNER JOIN digital_assets da ON da.id = sca.digital_asset_id
          LEFT JOIN storage_assets sa ON sa.id = da.storage_asset_id
         WHERE sca.school_id = ?
         ORDER BY sca.granted_at DESC
      `,
      [id],
    );
    return rows;
  });

  app.post('/schools/:id/content-access', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as AccessBody;
    const assetId = cleanNullable(body.digital_asset_id);
    if (!assetId) return sendBadRequest(reply, 'digital_asset_id_required');

    await pool.execute(
      `
        INSERT INTO school_content_access (id, school_id, digital_asset_id)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP(3)
      `,
      [randomUUID(), id, assetId],
    );

    return { success: true };
  });

  app.delete('/schools/:id/content-access/:assetId', async (req) => {
    const { id, assetId } = req.params as { id: string; assetId: string };
    await pool.execute(
      'DELETE FROM school_content_access WHERE school_id = ? AND digital_asset_id = ?',
      [id, assetId],
    );
    return { success: true };
  });
}

export async function registerSchoolsPublic(app: FastifyInstance) {
  app.get('/school/assets', { preHandler: [requireAuth] }, async (req) => {
    const userId = requireUserId(req);
    const [rows] = await pool.execute(
      `
        SELECT da.id, da.title, da.asset_type, da.level, da.product, da.storage_asset_id,
               sa.name AS storage_name, sa.path AS storage_path, sa.mime AS storage_mime,
               sa.url AS storage_url,
               su.school_id, s.name AS school_name, sca.granted_at
          FROM school_users su
          INNER JOIN schools s ON s.id = su.school_id AND s.is_active = 1
          INNER JOIN school_content_access sca ON sca.school_id = su.school_id
          INNER JOIN digital_assets da ON da.id = sca.digital_asset_id AND da.is_active = 1
          LEFT JOIN storage_assets sa ON sa.id = da.storage_asset_id
         WHERE su.user_id = ?
         ORDER BY da.level ASC, da.product ASC, da.title ASC
      `,
      [userId],
    );
    return rows;
  });

  app.get('/school/assets/:id/file', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = requireUserId(req);
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT sa.url
          FROM school_users su
          INNER JOIN schools s ON s.id = su.school_id AND s.is_active = 1
          INNER JOIN school_content_access sca ON sca.school_id = su.school_id
          INNER JOIN digital_assets da ON da.id = sca.digital_asset_id AND da.is_active = 1
          INNER JOIN storage_assets sa ON sa.id = da.storage_asset_id
         WHERE su.user_id = ? AND da.id = ?
         LIMIT 1
      `,
      [userId, id],
    );
    const row = Array.isArray(rows) ? (rows[0] as { url?: string } | undefined) : undefined;
    const url = typeof row?.url === 'string' ? row.url.trim() : '';
    if (!url) return reply.code(404).send({ error: { message: 'asset_not_found' } });
    return reply.redirect(url);
  });
}
