import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';

function asStr(v: unknown): string {
  return String(v ?? '').trim();
}

const ZERO_TOTALS = {
  bookings_total: 0,
  bookings_new: 0,
  bookings_confirmed: 0,
  bookings_completed: 0,
  bookings_cancelled: 0,
  bookings_other: 0,
  revenue_total: 0,
  slots_total: 0,
  slots_reserved: 0,
  resources_total: 0,
  services_total: 0,
  faqs_total: 0,
  email_templates_total: 0,
  site_settings_total: 0,
  custom_pages_total: 0,
  menu_items_total: 0,
  slider_total: 0,
  footer_sections_total: 0,
  reviews_total: 0,
  users_total: 0,
  storage_assets_total: 0,
  db_snapshots_total: 0,
  audit_logs_total: 0,
  availability_total: 0,
  notifications_total: 0,
  contact_messages_unread: 0,
  contact_messages_total: 0,
  consultants_active: 0,
  today_bookings: 0,
  support_tickets_total: 0,
  announcements_total: 0,
};

function parseRange(q: Record<string, unknown>): '7d' | '30d' | '90d' {
  const r = String(q.range ?? '30d');
  if (r === '7d' || r === '90d') return r;
  return '30d';
}

function rangeDays(key: '7d' | '30d' | '90d'): number {
  if (key === '7d') return 7;
  if (key === '90d') return 90;
  return 30;
}

function dashboardAnalyticsStub(req: FastifyRequest, reply: FastifyReply) {
  const q = (req.query ?? {}) as Record<string, unknown>;
  const range = parseRange(q);
  const days = rangeDays(range);
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);
  const fromYmd = from.toISOString().slice(0, 10);
  const toYmdExclusive = to.toISOString().slice(0, 10);
  return reply.send({
    range,
    fromYmd,
    toYmdExclusive,
    meta: { bucket: 'day' },
    totals: ZERO_TOTALS,
    resources: [],
    services: [],
    trend: [],
    revenueTrend: [],
  });
}

function ordersListStub(req: FastifyRequest, reply: FastifyReply) {
  const q = (req.query ?? {}) as Record<string, string>;
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
  return reply.send({ data: [], page, limit, total: 0 });
}

function orderDetailStub(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const now = new Date().toISOString();
  return reply.send({
    id,
    order_number: '—',
    status: 'pending',
    payment_status: 'unpaid',
    total_amount: '0.00',
    currency: 'TRY',
    transaction_id: null,
    user_id: '00000000-0000-0000-0000-000000000000',
    user_email: null,
    user_name: null,
    order_notes: null,
    created_at: now,
    updated_at: now,
    items: [],
    payments: [],
  });
}

function emptySubscriptionList(reply: FastifyReply, q: Record<string, string>) {
  const limit = Math.min(500, Math.max(1, Number(q.limit) || 20));
  const offset = Math.max(0, Number(q.offset) || 0);
  return reply.send({ data: [], limit, offset, total: 0 });
}

function emptyPlanList(reply: FastifyReply, q: Record<string, string>) {
  const limit = Math.min(500, Math.max(1, Number(q.limit) || 200));
  const offset = Math.max(0, Number(q.offset) || 0);
  return reply.send({ data: [], limit, offset, total: 0 });
}

function stubSubscription(id: string) {
  const now = new Date().toISOString();
  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    plan_id: '00000000-0000-0000-0000-000000000001',
    provider: 'manual',
    provider_subscription_id: null,
    provider_customer_id: null,
    status: 'cancelled',
    started_at: null,
    ends_at: null,
    trial_ends_at: null,
    cancelled_at: now,
    cancellation_reason: 'Abonelik modulu bu kurulumda kapali (stub).',
    auto_renew: 0,
    price_minor: 0,
    currency: 'TRY',
    created_at: now,
    updated_at: now,
    user_email: null,
    user_full_name: null,
    user_phone: null,
    plan_code: null,
    plan_name_tr: null,
    plan_name_en: null,
  };
}

function stubPlan(id: string) {
  const now = new Date().toISOString();
  return {
    id,
    code: 'stub',
    name_tr: 'Stub',
    name_en: 'Stub',
    description_tr: null,
    description_en: null,
    price_minor: 0,
    currency: 'TRY',
    period: 'monthly',
    trial_days: 0,
    features: null,
    is_active: 0,
    display_order: 0,
    created_at: now,
    updated_at: now,
  };
}

function stubTicket(id: string, patch?: Record<string, unknown>) {
  const now = new Date().toISOString();
  const base = {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    subject: '—',
    message: 'Destek modulu bu kurulumda kapali (stub).',
    status: 'closed' as const,
    priority: 'low' as const,
    user_display_name: null as string | null,
    user_email: null as string | null,
    created_at: now,
    updated_at: now,
  };
  if (!patch) return base;
  return { ...base, ...patch, id: base.id };
}

export async function registerAdminPanelCommerceStubs(adminApi: FastifyInstance) {
  adminApi.get('/dashboard/analytics', dashboardAnalyticsStub);

  // NOT: /orders* gercek `orders` modulune tasindi (Faz 2B) — stub kaldirildi
  // (FST_ERR_DUPLICATED_ROUTE'u onlemek icin). ordersListStub/orderDetailStub artik kullanilmiyor.

  adminApi.get('/payment-gateways', async (_req, reply) => reply.send([]));
  adminApi.post('/payment-gateways', async (_req, reply) =>
    reply.send({ success: true, id: randomUUID() }),
  );
  adminApi.patch('/payment-gateways/:id', async (_req, reply) => reply.send({ success: true }));

  adminApi.get('/subscriptions', (req, reply) =>
    emptySubscriptionList(reply, (req.query ?? {}) as Record<string, string>),
  );
  adminApi.get('/subscriptions/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubSubscription(id));
  });
  adminApi.post('/subscriptions/:id/refund', async (_req, reply) => reply.send({ success: true }));

  adminApi.get('/subscription-plans', (req, reply) =>
    emptyPlanList(reply, (req.query ?? {}) as Record<string, string>),
  );
  adminApi.get('/subscription-plans/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubPlan(id));
  });
  adminApi.post('/subscription-plans', async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = randomUUID();
    const periodRaw = asStr(body.period);
    const period = ['monthly', 'yearly', 'lifetime'].includes(periodRaw) ? periodRaw : 'monthly';
    return reply.send({
      ...stubPlan(id),
      code: asStr(body.code) || 'plan',
      name_tr: asStr(body.name_tr) || 'Plan',
      name_en: asStr(body.name_en) || 'Plan',
      description_tr: body.description_tr != null ? asStr(body.description_tr) : null,
      description_en: body.description_en != null ? asStr(body.description_en) : null,
      price_minor: Number(body.price_minor) || 0,
      currency: asStr(body.currency) || 'TRY',
      period,
      trial_days: Number(body.trial_days) || 0,
      is_active: body.is_active === 1 || body.is_active === true ? 1 : 0,
      display_order: Number(body.display_order) || 0,
    });
  });
  adminApi.patch('/subscription-plans/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body ?? {}) as Record<string, unknown>;
    return reply.send({ ...stubPlan(id), ...body, id });
  });
  adminApi.delete('/subscription-plans/:id', async (_req, reply) => reply.send({ success: true }));

  adminApi.get('/support_tickets', async (_req, reply) => reply.send([]));
  adminApi.get('/support_tickets/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send(stubTicket(id));
  });
  adminApi.patch('/support_tickets/:id', (req, reply) => {
    const { id } = req.params as { id: string };
    const patch = (req.body ?? {}) as Record<string, unknown>;
    return reply.send(stubTicket(id, patch));
  });
  adminApi.post('/support_tickets/:id/:action', (req, reply) => {
    const { id, action } = req.params as { id: string; action: string };
    const status = action === 'reopen' ? 'open' : 'closed';
    return reply.send(stubTicket(id, { status }));
  });

  adminApi.get('/ticket_replies/by-ticket/:ticketId', async (_req, reply) => reply.send([]));
  adminApi.post('/ticket_replies', async (req, reply) => {
    const body = (req.body ?? {}) as { ticket_id?: string; message?: string };
    const now = new Date().toISOString();
    return reply.send({
      id: randomUUID(),
      ticket_id: String(body.ticket_id ?? ''),
      user_id: null,
      message: String(body.message ?? ''),
      is_admin: true,
      created_at: now,
    });
  });
}
