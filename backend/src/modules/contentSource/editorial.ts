import { createHash, randomUUID } from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';

import { pool } from '@/db/client';
import { verifyCommerceRequest } from './commerce';

const localeSchema = z.string().trim().min(2).max(8).default('tr');
const articleSchema = z.object({
  locale: localeSchema,
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255),
  excerpt: z.string().trim().max(4000).nullable().optional(),
  content: z.string().trim().min(1).max(500_000),
  category: z.string().trim().min(1).max(64),
  author: z.string().trim().max(128).nullable().optional(),
  imageUrl: z.string().trim().max(512).nullable().optional(),
  metaTitle: z.string().trim().max(255).nullable().optional(),
  metaDescription: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['draft', 'published']),
  publishAt: z.string().datetime().nullable().optional(),
});

function editorialBodyHash(req: FastifyRequest): string {
  return createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex');
}

function verifyEditorialRequest(req: FastifyRequest, reply: FastifyReply): boolean {
  const bodyHash = String(req.headers['x-tanitio-content-sha256'] || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(bodyHash) || bodyHash !== editorialBodyHash(req)) {
    reply.code(401).send({ error: { code: 'INVALID_CONTENT_SIGNATURE' } });
    return false;
  }
  return verifyCommerceRequest(req, reply);
}

function output(row: RowDataPacket) {
  const publishedAt = row.published_at ? new Date(row.published_at).toISOString() : null;
  const scheduled = row.status === 'published' && publishedAt != null && Date.parse(publishedAt) > Date.now();
  return {
    id: String(row.id), locale: String(row.locale || 'tr'), title: String(row.title || ''),
    slug: String(row.slug || ''), excerpt: row.excerpt || null, content: String(row.content || ''),
    category: String(row.category || 'genel'), author: row.author || null, imageUrl: row.image_url || null,
    metaTitle: row.meta_title || null, metaDescription: row.meta_description || null,
    status: scheduled ? 'scheduled' : String(row.status), publishAt: publishedAt,
    isActive: Boolean(row.is_active), updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

const selectSql = `SELECT b.id,b.category,b.author,b.image_url,b.status,b.published_at,b.is_active,b.updated_at,
  i.locale,i.title,i.slug,i.excerpt,i.content,i.meta_title,i.meta_description
  FROM blog_posts b JOIN blog_posts_i18n i ON i.blog_post_id=b.id`;

export async function listEditorialArticles(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyEditorialRequest(req, reply)) return;
  const parsed = z.object({ locale: localeSchema.optional() }).safeParse(req.query ?? {});
  if (!parsed.success) return reply.code(422).send({ error: { code: 'INVALID_QUERY' } });
  const locale = parsed.data.locale || 'tr';
  const [rows] = await pool.query<RowDataPacket[]>(
    `${selectSql} WHERE i.locale=? AND (b.status='draft' OR (b.status='published' AND b.published_at>CURRENT_TIMESTAMP(3))) ORDER BY b.updated_at DESC`,
    [locale],
  );
  return reply.send({ schemaVersion: '1.0', tenantKey: 'woody', items: rows.map(output), total: rows.length });
}

export async function createEditorialArticle(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyEditorialRequest(req, reply)) return;
  const parsed = articleSchema.safeParse(req.body ?? {});
  if (!parsed.success) return reply.code(422).send({ error: { code: 'INVALID_ARTICLE', fields: parsed.error.flatten().fieldErrors } });
  const data = parsed.data;
  const id = randomUUID();
  const publishAt = data.status === 'published' ? new Date(data.publishAt || Date.now()) : null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO blog_posts (id,category,author,image_url,status,published_at,is_active,display_order) VALUES (?,?,?,?,?,?,1,0)`,
      [id, data.category, data.author || null, data.imageUrl || null, data.status, publishAt],
    );
    await connection.query(
      `INSERT INTO blog_posts_i18n (blog_post_id,locale,title,slug,excerpt,content,meta_title,meta_description) VALUES (?,?,?,?,?,?,?,?)`,
      [id, data.locale, data.title, data.slug, data.excerpt || null, data.content, data.metaTitle || null, data.metaDescription || null],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { code: 'SLUG_EXISTS' } });
    throw error;
  } finally { connection.release(); }
  const [rows] = await pool.query<RowDataPacket[]>(`${selectSql} WHERE b.id=? AND i.locale=? LIMIT 1`, [id, data.locale]);
  return reply.code(201).send(output(rows[0]));
}

export async function updateEditorialArticle(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyEditorialRequest(req, reply)) return;
  const id = String((req.params as { id?: string }).id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return reply.code(422).send({ error: { code: 'INVALID_ID' } });
  const parsed = articleSchema.safeParse(req.body ?? {});
  if (!parsed.success) return reply.code(422).send({ error: { code: 'INVALID_ARTICLE', fields: parsed.error.flatten().fieldErrors } });
  const data = parsed.data;
  const publishAt = data.status === 'published' ? new Date(data.publishAt || Date.now()) : null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [changed] = await connection.query(
      `UPDATE blog_posts SET category=?,author=?,image_url=?,status=?,published_at=?,is_active=1 WHERE id=?`,
      [data.category, data.author || null, data.imageUrl || null, data.status, publishAt, id],
    );
    if (!(changed as { affectedRows?: number }).affectedRows) {
      await connection.rollback();
      return reply.code(404).send({ error: { code: 'ARTICLE_NOT_FOUND' } });
    }
    await connection.query(
      `UPDATE blog_posts_i18n SET title=?,slug=?,excerpt=?,content=?,meta_title=?,meta_description=? WHERE blog_post_id=? AND locale=?`,
      [data.title, data.slug, data.excerpt || null, data.content, data.metaTitle || null, data.metaDescription || null, id, data.locale],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { code: 'SLUG_EXISTS' } });
    throw error;
  } finally { connection.release(); }
  const [rows] = await pool.query<RowDataPacket[]>(`${selectSql} WHERE b.id=? AND i.locale=? LIMIT 1`, [id, data.locale]);
  return reply.send(output(rows[0]));
}
