import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sendMailRaw } from '@shared/shared-backend/modules/mail-api';
import { z } from 'zod';

import { pool } from '@/db/client';

const STATUSES = ['new', 'in_progress', 'closed'] as const;
const ORDER_BY = ['created_at', 'updated_at', 'status', 'name'] as const;

const SELECT_COLS = `
  id, name, email, phone, subject, message,
  status, is_resolved, admin_note, ip, user_agent, website,
  created_at, updated_at
`;

const contactCreateSchema = z.object({
  name: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(64),
  subject: z.string().trim().max(255).optional().default(''),
  message: z.string().trim().min(1).max(5000),
  // Honeypot — bot doldurursa backend sessizce discard eder.
  website: z.string().trim().max(255).optional().nullable(),
});

const contactUpdateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  is_resolved: z.boolean().optional(),
  admin_note: z.string().trim().max(5000).optional().nullable(),
});

type ContactCreateInput = z.infer<typeof contactCreateSchema>;

function nullable(value: string | null | undefined) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

function badRequest(reply: FastifyReply, message: string, detail?: unknown) {
  return reply.code(400).send({ error: { message, detail } });
}

function clientIp(req: FastifyRequest) {
  const fwd = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return (fwd || req.ip || '').slice(0, 64) || null;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendAdminNotification(data: ContactCreateInput) {
  const to = (process.env.CONTACT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim();
  if (!to) return;
  const rows = [
    ['Ad Soyad', data.name],
    ['E-posta', data.email],
    ['Telefon', data.phone || '-'],
    ['Konu', data.subject || '-'],
  ];
  await sendMailRaw({
    to,
    subject: `Yeni iletişim mesajı - ${data.name}`,
    html: `
      <h2>Yeni iletişim formu mesajı</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        ${rows.map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('')}
      </table>
      <p><strong>Mesaj:</strong><br>${escapeHtml(data.message)}</p>
    `,
    text: [
      'Yeni iletişim formu mesajı',
      `Ad Soyad: ${data.name}`,
      `E-posta: ${data.email}`,
      `Telefon: ${data.phone || '-'}`,
      `Konu: ${data.subject || '-'}`,
      `Mesaj: ${data.message}`,
    ].join('\n'),
  });
}

async function fetchContact(id: string) {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_COLS} FROM contact_messages WHERE id = ? LIMIT 1`,
    [id],
  );
  return (rows as Record<string, unknown>[])[0] || null;
}

export async function registerContactsPublic(app: FastifyInstance) {
  app.post('/contacts', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour',
      },
    },
  }, async (req, reply) => {
    const parsed = contactCreateSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_contact', parsed.error.flatten());
    const data = parsed.data;

    // Honeypot dolu → bot. Sessizce başarı dön, kayıt oluşturma.
    if (data.website && data.website.trim()) {
      return reply.code(201).send({ id: randomUUID(), success: true });
    }

    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO contact_messages
          (id, name, email, phone, subject, message, ip, user_agent, website)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        data.name,
        data.email.toLowerCase(),
        nullable(data.phone),
        nullable(data.subject),
        data.message,
        clientIp(req),
        (req.headers['user-agent'] as string | undefined)?.slice(0, 512) || null,
        null,
      ],
    );

    sendAdminNotification(data).catch((err) => {
      req.log.error({ err }, 'contact_admin_mail_failed');
    });

    const row = await fetchContact(id);
    return reply.code(201).send(row ?? { id, success: true });
  });
}

export async function registerContactsAdmin(app: FastifyInstance) {
  app.get('/contacts', async (req) => {
    const query = (req.query || {}) as Record<string, string | undefined>;
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    const orderBy = ORDER_BY.includes(query.orderBy as any) ? (query.orderBy as string) : 'created_at';
    const order = String(query.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.status && STATUSES.includes(query.status as any)) {
      where.push('status = ?');
      params.push(query.status);
    }
    if (query.resolved === 'true' || query.resolved === 'false') {
      where.push('is_resolved = ?');
      params.push(query.resolved === 'true' ? 1 : 0);
    }
    const search = (query.search || query.q || '').trim();
    if (search) {
      where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ?)');
      const needle = `%${search}%`;
      params.push(needle, needle, needle, needle, needle);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT ${SELECT_COLS} FROM contact_messages ${whereSql} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM contact_messages ${whereSql}`,
      params,
    );
    const total = Number(((countRows as Array<{ total: number }>)[0]?.total) || 0);
    return { data: rows, total, limit, offset };
  });

  app.get('/contacts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const row = await fetchContact(id);
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.patch('/contacts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = contactUpdateSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_contact_update', parsed.error.flatten());

    const patches: string[] = [];
    const values: Array<string | number | null> = [];
    if (parsed.data.status !== undefined) {
      patches.push('status = ?');
      values.push(parsed.data.status);
    }
    if (parsed.data.is_resolved !== undefined) {
      patches.push('is_resolved = ?');
      values.push(parsed.data.is_resolved ? 1 : 0);
    }
    if (parsed.data.admin_note !== undefined) {
      patches.push('admin_note = ?');
      values.push(nullable(parsed.data.admin_note));
    }
    if (!patches.length) return badRequest(reply, 'empty_update');

    await pool.execute(
      `UPDATE contact_messages SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...values, id],
    );

    const row = await fetchContact(id);
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });
}
