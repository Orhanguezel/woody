import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { sendMailRaw } from '@shared/shared-backend/modules/mail-api';
import { z } from 'zod';

import { pool } from '@/db/client';

const LEVELS = ['basic', 'junior', 'senior', 'pro', 'mixed'] as const;
const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

const quoteRequestSchema = z.object({
  org_name: z.string().trim().min(2).max(180),
  contact_name: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(64).optional().nullable(),
  productId: z.string().trim().max(64).optional().nullable(),
  student_count: z.coerce.number().int().min(1).max(100000),
  level: z.enum(LEVELS).default('mixed'),
  city: z.string().trim().max(120).optional().nullable(),
  district: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(3000).optional().nullable(),
  source: z.string().trim().max(32).optional().default('website'),
  kvkk_accepted: z.literal(true),
});

const quotePatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  message: z.string().trim().max(3000).optional().nullable(),
});

type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

function nullable(value: string | null | undefined) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

function badRequest(reply: FastifyReply, message: string, detail?: unknown) {
  return reply.code(400).send({ error: { message, detail } });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function quoteHtml(data: QuoteRequestInput) {
  const rows = [
    ['Kurum', data.org_name],
    ['Yetkili', data.contact_name],
    ['E-posta', data.email],
    ['Telefon', data.phone || '-'],
    ['Ogrenci sayisi', String(data.student_count)],
    ['Seviye', data.level],
    ['Il / Ilce', [data.city, data.district].filter(Boolean).join(' / ') || '-'],
    ['Kaynak', data.source],
  ];
  return `
    <h2>Yeni fiyat teklifi talebi</h2>
    <table cellpadding="6" cellspacing="0" border="0">
      ${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}
    </table>
    ${data.message ? `<p><strong>Mesaj:</strong><br>${escapeHtml(data.message)}</p>` : ''}
  `;
}

async function sendAdminNotification(data: QuoteRequestInput) {
  const to = (process.env.QUOTE_REQUEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim();
  if (!to) return;
  await sendMailRaw({
    to,
    subject: `Yeni teklif talebi - ${data.org_name}`,
    html: quoteHtml(data),
    text: [
      'Yeni fiyat teklifi talebi',
      `Kurum: ${data.org_name}`,
      `Yetkili: ${data.contact_name}`,
      `E-posta: ${data.email}`,
      `Telefon: ${data.phone || '-'}`,
      `Ogrenci sayisi: ${data.student_count}`,
      `Seviye: ${data.level}`,
      `Il / Ilce: ${[data.city, data.district].filter(Boolean).join(' / ') || '-'}`,
      data.message ? `Mesaj: ${data.message}` : '',
    ].filter(Boolean).join('\n'),
  });
}

export async function registerQuoteRequestsPublic(app: FastifyInstance) {
  app.post('/quote-requests', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour',
      },
    },
  }, async (req, reply) => {
    const parsed = quoteRequestSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_quote_request', parsed.error.flatten());
    const data = parsed.data;
    const id = randomUUID();

    await pool.execute(
      `
        INSERT INTO quote_requests
          (id, org_name, contact_name, email, phone, product_id, student_count, level, city, district, message, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        data.org_name,
        data.contact_name,
        data.email.toLowerCase(),
        nullable(data.phone),
        nullable(data.productId),
        data.student_count,
        data.level,
        nullable(data.city),
        nullable(data.district),
        nullable(data.message),
        data.source || 'website',
      ],
    );

    sendAdminNotification(data).catch((err) => {
      req.log.error({ err }, 'quote_request_admin_mail_failed');
    });

    return reply.code(201).send({ id, success: true });
  });
}

export async function registerQuoteRequestsAdmin(app: FastifyInstance) {
  app.get('/quote-requests', async (req) => {
    const query = (req.query || {}) as { status?: string; q?: string; limit?: string; offset?: string };
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.status && STATUSES.includes(query.status as any)) {
      where.push('status = ?');
      params.push(query.status);
    }
    if (query.q?.trim()) {
      where.push('(org_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const needle = `%${query.q.trim()}%`;
      params.push(needle, needle, needle, needle);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `
        SELECT qr.id, qr.org_name, qr.contact_name, qr.email, qr.phone, qr.product_id AS productId,
               pi.title AS productTitle, qr.student_count, qr.level, qr.city, qr.district,
               qr.message, qr.status, qr.source, qr.created_at, qr.updated_at
          FROM quote_requests qr
          LEFT JOIN product_i18n pi ON pi.product_id = qr.product_id AND pi.locale = 'tr'
          ${whereSql}
         ORDER BY qr.created_at DESC
         LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM quote_requests ${whereSql}`,
      params,
    );
    const total = Number(((countRows as Array<{ total: number }>)[0]?.total) || 0);
    return { data: rows, total, limit, offset };
  });

  app.get('/quote-requests/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT qr.id, qr.org_name, qr.contact_name, qr.email, qr.phone, qr.product_id AS productId,
               pi.title AS productTitle, qr.student_count, qr.level, qr.city, qr.district,
               qr.message, qr.status, qr.source, qr.created_at, qr.updated_at
          FROM quote_requests qr
          LEFT JOIN product_i18n pi ON pi.product_id = qr.product_id AND pi.locale = 'tr'
         WHERE qr.id = ?
         LIMIT 1
      `,
      [id],
    );
    const [row] = rows as Record<string, unknown>[];
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.patch('/quote-requests/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = quotePatchSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_quote_request_update', parsed.error.flatten());

    const patches: string[] = [];
    const values: Array<string | null> = [];
    if (parsed.data.status !== undefined) {
      patches.push('status = ?');
      values.push(parsed.data.status);
    }
    if (parsed.data.message !== undefined) {
      patches.push('message = ?');
      values.push(nullable(parsed.data.message));
    }
    if (!patches.length) return badRequest(reply, 'empty_update');

    await pool.execute(
      `UPDATE quote_requests SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...values, id],
    );

    const [rows] = await pool.execute(
      `
        SELECT qr.id, qr.org_name, qr.contact_name, qr.email, qr.phone, qr.product_id AS productId,
               pi.title AS productTitle, qr.student_count, qr.level, qr.city, qr.district,
               qr.message, qr.status, qr.source, qr.created_at, qr.updated_at
          FROM quote_requests qr
          LEFT JOIN product_i18n pi ON pi.product_id = qr.product_id AND pi.locale = 'tr'
         WHERE qr.id = ?
         LIMIT 1
      `,
      [id],
    );
    const [row] = rows as Record<string, unknown>[];
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });
}
