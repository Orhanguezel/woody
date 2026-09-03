import { createHmac, timingSafeEqual } from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';

import { env } from '@/core/env';
import { pool } from '@/db/client';

const MAX_RANGE_DAYS = 90;
const ALLOWED_CLOCK_SKEW_SECONDS = 300;
const seenNonces = new Map<string, number>();

function commerceSecret(): string {
  return (process.env.TANITIO_COMMERCE_API_KEY || '').trim();
}

function header(req: FastifyRequest, name: string): string {
  const value = req.headers[name];
  return String(Array.isArray(value) ? value[0] : value || '').trim();
}

function safeEqualHex(expected: string, provided: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;
  const left = Buffer.from(expected, 'hex');
  const right = Buffer.from(provided, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function pruneNonces(nowSeconds: number) {
  for (const [nonce, expiresAt] of seenNonces) {
    if (expiresAt <= nowSeconds) seenNonces.delete(nonce);
  }
}

export function verifyCommerceRequest(req: FastifyRequest, reply: FastifyReply): boolean {
  const secret = commerceSecret();
  if (!secret) {
    reply.code(503).send({ error: { code: 'COMMERCE_SOURCE_DISABLED' } });
    return false;
  }
  if (env.NODE_ENV === 'production' && req.protocol !== 'https') {
    reply.code(400).send({ error: { code: 'HTTPS_REQUIRED' } });
    return false;
  }

  const keyId = header(req, 'x-tanitio-key-id');
  const timestamp = header(req, 'x-tanitio-timestamp');
  const nonce = header(req, 'x-tanitio-nonce');
  const signature = header(req, 'x-tanitio-signature');
  const nowSeconds = Math.floor(Date.now() / 1000);
  const requestSeconds = Number(timestamp);
  if (keyId !== 'woody' || !Number.isInteger(requestSeconds) || Math.abs(nowSeconds - requestSeconds) > ALLOWED_CLOCK_SKEW_SECONDS) {
    reply.code(401).send({ error: { code: 'UNAUTHORIZED' } });
    return false;
  }
  if (!/^[A-Za-z0-9_-]{16,96}$/.test(nonce)) {
    reply.code(401).send({ error: { code: 'UNAUTHORIZED' } });
    return false;
  }
  pruneNonces(nowSeconds);
  if (seenNonces.has(nonce)) {
    reply.code(409).send({ error: { code: 'REPLAY_DETECTED' } });
    return false;
  }

  const canonical = `${req.method.toUpperCase()}\n${req.raw.url || req.url}\n${timestamp}\n${nonce}`;
  const expected = createHmac('sha256', secret).update(canonical).digest('hex');
  if (!safeEqualHex(expected, signature)) {
    reply.code(401).send({ error: { code: 'UNAUTHORIZED' } });
    return false;
  }
  seenNonces.set(nonce, nowSeconds + ALLOWED_CLOCK_SKEW_SECONDS);
  return true;
}

type DateRange = { from: string; to: string; timezone: 'Europe/Istanbul' };

function isoDate(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(new Date(`${text}T00:00:00Z`).getTime())
    ? text
    : null;
}

function parseRange(req: FastifyRequest, reply: FastifyReply): DateRange | null {
  const query = (req.query || {}) as Record<string, unknown>;
  const today = new Date();
  const defaultTo = today.toISOString().slice(0, 10);
  const defaultFrom = new Date(today.getTime() - 29 * 86_400_000).toISOString().slice(0, 10);
  const from = isoDate(query.from) || (query.from ? null : defaultFrom);
  const to = isoDate(query.to) || (query.to ? null : defaultTo);
  if (!from || !to || query.timezone && query.timezone !== 'Europe/Istanbul') {
    reply.code(422).send({ error: { code: 'INVALID_RANGE' } });
    return null;
  }
  const fromMs = new Date(`${from}T00:00:00Z`).getTime();
  const toMs = new Date(`${to}T00:00:00Z`).getTime();
  const days = Math.floor((toMs - fromMs) / 86_400_000) + 1;
  if (days < 1 || days > MAX_RANGE_DAYS) {
    reply.code(422).send({ error: { code: 'INVALID_RANGE' } });
    return null;
  }
  return { from, to, timezone: 'Europe/Istanbul' };
}

function minor(value: unknown): number {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

function envelope(range: DateRange, data: Record<string, unknown>) {
  return {
    schemaVersion: '1.0',
    tenantKey: 'woody',
    generatedAt: new Date().toISOString(),
    range,
    currency: 'TRY',
    testOrdersExcluded: true,
    ...data,
  };
}

export async function commerceHealth(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyCommerceRequest(req, reply)) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT MAX(updated_at) AS last_paid_at FROM orders WHERE payment_status = 'paid'`,
  );
  return {
    schemaVersion: '1.0',
    tenantKey: 'woody',
    status: 'ok',
    generatedAt: new Date().toISOString(),
    lastPaidAt: rows[0]?.last_paid_at || null,
  };
}

export async function commerceSummary(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyCommerceRequest(req, reply)) return;
  const range = parseRange(req, reply);
  if (!range) return;
  const args = [range.from, range.to];
  const [sales] = await pool.execute<RowDataPacket[]>(
    `
      SELECT
        SUM(payment_status = 'paid') AS paid_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS gross_revenue,
        SUM(payment_status = 'refunded') AS refund_count,
        COALESCE(SUM(CASE WHEN payment_status = 'refunded' THEN total ELSE 0 END), 0) AS refund_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN
          (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = orders.id)
        ELSE 0 END), 0) AS items_sold,
        MAX(CASE WHEN payment_status = 'paid' THEN updated_at END) AS data_freshness
      FROM orders
      WHERE updated_at >= ? AND updated_at < DATE_ADD(?, INTERVAL 1 DAY)
    `,
    args,
  );
  const [attempts] = await pool.execute<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS payment_attempts,
             SUM(pa.status IN ('failed','cancelled') OR (pa.status = 'pending' AND pa.created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE))) AS abandoned_payments
        FROM payment_attempts pa
       WHERE pa.created_at >= ? AND pa.created_at < DATE_ADD(?, INTERVAL 1 DAY)
         AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(pa.request_payload, '$.testMode')), 'false') <> 'true'
    `,
    args,
  );
  const paidOrders = Number(sales[0]?.paid_orders || 0);
  const grossRevenueMinor = minor(sales[0]?.gross_revenue);
  const refundAmountMinor = minor(sales[0]?.refund_amount);
  return envelope(range, {
    paidOrders,
    grossRevenueMinor,
    refundCount: Number(sales[0]?.refund_count || 0),
    refundAmountMinor,
    netRevenueMinor: grossRevenueMinor - refundAmountMinor,
    paymentAttempts: Number(attempts[0]?.payment_attempts || 0),
    abandonedPayments: Number(attempts[0]?.abandoned_payments || 0),
    itemsSold: Number(sales[0]?.items_sold || 0),
    averageOrderValueMinor: paidOrders ? Math.round(grossRevenueMinor / paidOrders) : 0,
    dataFreshness: sales[0]?.data_freshness || null,
  });
}

export async function commerceDaily(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyCommerceRequest(req, reply)) return;
  const range = parseRange(req, reply);
  if (!range) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT DATE(updated_at) AS metric_date,
             SUM(payment_status = 'paid') AS paid_orders,
             COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS gross_revenue,
             SUM(payment_status = 'refunded') AS refund_count,
             COALESCE(SUM(CASE WHEN payment_status = 'refunded' THEN total ELSE 0 END), 0) AS refund_amount
        FROM orders
       WHERE updated_at >= ? AND updated_at < DATE_ADD(?, INTERVAL 1 DAY)
       GROUP BY DATE(updated_at)
       ORDER BY metric_date ASC
    `,
    [range.from, range.to],
  );
  return envelope(range, {
    items: rows.map((row) => ({
      date: String(row.metric_date),
      paidOrders: Number(row.paid_orders || 0),
      grossRevenueMinor: minor(row.gross_revenue),
      refundCount: Number(row.refund_count || 0),
      refundAmountMinor: minor(row.refund_amount),
      netRevenueMinor: minor(row.gross_revenue) - minor(row.refund_amount),
    })),
  });
}

export async function commerceProducts(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyCommerceRequest(req, reply)) return;
  const range = parseRange(req, reply);
  if (!range) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT oi.product_id, COALESCE(pi.title, oi.product_id) AS title,
             COUNT(DISTINCT o.id) AS paid_orders, SUM(oi.quantity) AS quantity,
             SUM(oi.total_price) AS gross_revenue
        FROM orders o
        INNER JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN product_i18n pi ON pi.product_id = oi.product_id AND pi.locale = 'tr'
       WHERE o.payment_status = 'paid'
         AND o.updated_at >= ? AND o.updated_at < DATE_ADD(?, INTERVAL 1 DAY)
       GROUP BY oi.product_id, pi.title
       ORDER BY gross_revenue DESC
       LIMIT 100
    `,
    [range.from, range.to],
  );
  return envelope(range, {
    items: rows.map((row) => ({
      productId: String(row.product_id),
      title: String(row.title),
      paidOrders: Number(row.paid_orders || 0),
      quantity: Number(row.quantity || 0),
      grossRevenueMinor: minor(row.gross_revenue),
    })),
  });
}

export async function commerceAttribution(req: FastifyRequest, reply: FastifyReply) {
  if (!verifyCommerceRequest(req, reply)) return;
  const range = parseRange(req, reply);
  if (!range) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT COALESCE(NULLIF(a.utm_source, ''), 'direct') AS source,
             COALESCE(NULLIF(a.utm_medium, ''), '(none)') AS medium,
             COALESCE(NULLIF(a.utm_campaign, ''), '(not set)') AS campaign,
             COUNT(*) AS paid_orders, SUM(o.total) AS gross_revenue
        FROM orders o
        LEFT JOIN order_attribution a ON a.order_id = o.id
       WHERE o.payment_status = 'paid'
         AND o.updated_at >= ? AND o.updated_at < DATE_ADD(?, INTERVAL 1 DAY)
       GROUP BY source, medium, campaign
       ORDER BY gross_revenue DESC
       LIMIT 100
    `,
    [range.from, range.to],
  );
  const visible = rows.filter((row) => Number(row.paid_orders) >= 3);
  const hidden = rows.filter((row) => Number(row.paid_orders) < 3);
  if (hidden.length) {
    visible.push({
      source: 'other',
      medium: 'other',
      campaign: 'suppressed',
      paid_orders: hidden.reduce((sum, row) => sum + Number(row.paid_orders || 0), 0),
      gross_revenue: hidden.reduce((sum, row) => sum + Number(row.gross_revenue || 0), 0),
    } as RowDataPacket);
  }
  return envelope(range, {
    suppressionThreshold: 3,
    items: visible.map((row) => ({
      source: String(row.source),
      medium: String(row.medium),
      campaign: String(row.campaign),
      paidOrders: Number(row.paid_orders || 0),
      grossRevenueMinor: minor(row.gross_revenue),
    })),
  });
}
