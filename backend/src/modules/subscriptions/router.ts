import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth, type JwtUser } from '@shared/shared-backend/middleware/auth';
import { z } from 'zod';

import { pool } from '@/db/client';

const PERIODS = ['monthly', 'yearly'] as const;
const STATUSES = ['pending', 'active', 'canceled', 'expired'] as const;

const planSchema = z.object({
  code: z.string().trim().min(2).max(64),
  name_tr: z.string().trim().min(2).max(160),
  name_en: z.string().trim().min(2).max(160),
  price_minor: z.coerce.number().int().min(0).max(999999999),
  currency: z.string().trim().length(3).default('TRY'),
  period: z.enum(PERIODS).default('monthly'),
  is_active: z.union([z.boolean(), z.coerce.number()]).optional().default(true),
});

const subscriptionPatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  expires_at: z.string().optional().nullable(),
});

function badRequest(reply: FastifyReply, message: string, detail?: unknown) {
  return reply.code(400).send({ error: { message, detail } });
}

function boolInt(value: unknown) {
  return value === true || value === 1 || value === '1' ? 1 : 0;
}

function userId(req: FastifyRequest) {
  return String(((req as FastifyRequest & { user?: JwtUser }).user?.sub) || '').trim();
}

async function activeSubscriptionForUser(id: string) {
  const [rows] = await pool.execute(
    `
      SELECT us.id, us.user_id, us.plan_id, us.status, us.started_at, us.expires_at,
             us.created_at, us.updated_at, sp.code, sp.name_tr, sp.name_en, sp.period, sp.currency, sp.price_minor
        FROM user_subscriptions us
        JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE us.user_id = ?
       ORDER BY FIELD(us.status, 'active', 'pending', 'expired', 'canceled'), us.created_at DESC
       LIMIT 1
    `,
    [id],
  );
  return (rows as Record<string, unknown>[])[0] ?? null;
}

export async function registerSubscriptionsPublic(app: FastifyInstance) {
  app.get('/subscription-plans', async () => {
    const [rows] = await pool.execute(
      `
        SELECT id, code, name_tr, name_en, price_minor, currency, period, is_active, created_at, updated_at
          FROM subscription_plans
         WHERE is_active = 1
         ORDER BY price_minor ASC, created_at ASC
      `,
    );
    return rows;
  });

  app.get('/me/subscription', { preHandler: [requireAuth] }, async (req) => {
    const id = userId(req);
    const subscription = id ? await activeSubscriptionForUser(id) : null;
    return {
      hasAccess: Boolean(subscription && subscription.status === 'active'),
      status: subscription?.status ?? 'none',
      subscription,
    };
  });

  app.post('/me/subscription/checkout', { preHandler: [requireAuth] }, async (_req, reply) => {
    return reply.code(501).send({
      error: {
        message: 'subscription_checkout_not_implemented',
      },
    });
  });
}

export async function registerSubscriptionsAdmin(app: FastifyInstance) {
  app.get('/subscription-plans', async () => {
    const [rows] = await pool.execute(
      `
        SELECT id, code, name_tr, name_en, price_minor, currency, period, is_active, created_at, updated_at
          FROM subscription_plans
         ORDER BY created_at DESC
      `,
    );
    return { data: rows };
  });

  app.get('/subscription-plans/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT id, code, name_tr, name_en, price_minor, currency, period, is_active, created_at, updated_at
          FROM subscription_plans
         WHERE id = ?
         LIMIT 1
      `,
      [id],
    );
    const [row] = rows as Record<string, unknown>[];
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.post('/subscription-plans', async (req, reply) => {
    const parsed = planSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_subscription_plan', parsed.error.flatten());
    const data = parsed.data;
    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO subscription_plans (id, code, name_tr, name_en, price_minor, currency, period, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [id, data.code, data.name_tr, data.name_en, data.price_minor, data.currency.toUpperCase(), data.period, boolInt(data.is_active)],
    );
    return reply.code(201).send({ id });
  });

  app.patch('/subscription-plans/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = planSchema.partial().safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_subscription_plan', parsed.error.flatten());
    const entries = Object.entries(parsed.data);
    if (!entries.length) return badRequest(reply, 'empty_update');
    const patches = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([key, value]) => key === 'is_active' ? boolInt(value) : key === 'currency' ? String(value).toUpperCase() : value);
    await pool.execute(
      `UPDATE subscription_plans SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...values, id],
    );
    return { success: true };
  });

  app.get('/subscriptions', async () => {
    const [rows] = await pool.execute(
      `
        SELECT us.id, us.user_id, u.email AS user_email, u.full_name AS user_name,
               us.plan_id, sp.code AS plan_code, sp.name_tr AS plan_name_tr,
               us.status, us.started_at, us.expires_at, us.created_at, us.updated_at
          FROM user_subscriptions us
          JOIN subscription_plans sp ON sp.id = us.plan_id
          LEFT JOIN users u ON u.id = us.user_id
         ORDER BY us.created_at DESC
      `,
    );
    return { data: rows };
  });

  app.get('/subscriptions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [rows] = await pool.execute(
      `
        SELECT us.id, us.user_id, u.email AS user_email, u.full_name AS user_name,
               us.plan_id, sp.code AS plan_code, sp.name_tr AS plan_name_tr,
               us.status, us.started_at, us.expires_at, us.created_at, us.updated_at
          FROM user_subscriptions us
          JOIN subscription_plans sp ON sp.id = us.plan_id
          LEFT JOIN users u ON u.id = us.user_id
         WHERE us.id = ?
         LIMIT 1
      `,
      [id],
    );
    const [row] = rows as Record<string, unknown>[];
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.patch('/subscriptions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = subscriptionPatchSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_subscription_update', parsed.error.flatten());
    const patches: string[] = [];
    const values: Array<string | null> = [];
    if (parsed.data.status !== undefined) {
      patches.push('status = ?');
      values.push(parsed.data.status);
    }
    if (parsed.data.expires_at !== undefined) {
      patches.push('expires_at = ?');
      values.push(parsed.data.expires_at || null);
    }
    if (!patches.length) return badRequest(reply, 'empty_update');
    await pool.execute(
      `UPDATE user_subscriptions SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...values, id],
    );
    return { success: true };
  });
}
