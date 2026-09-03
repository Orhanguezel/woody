import { createHash } from 'crypto';
import type { FastifyInstance } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';

import { env } from '@/core/env';
import { pool } from '@/db/client';

export type PurchaseMeasurement = {
  transaction_id: string;
  currency: 'TRY';
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
  client_id: string;
};

export async function loadPurchaseMeasurement(orderId: string): Promise<PurchaseMeasurement | null> {
  const [orders] = await pool.execute<RowDataPacket[]>(
    `
      SELECT o.id, o.total, a.ga_client_id
        FROM orders o
        LEFT JOIN order_attribution a ON a.order_id = o.id
       WHERE o.id = ? AND o.payment_status = 'paid'
       LIMIT 1
    `,
    [orderId],
  );
  const order = orders[0];
  if (!order) return null;

  const [items] = await pool.execute<RowDataPacket[]>(
    `
      SELECT oi.product_id, oi.quantity, oi.unit_price, COALESCE(pi.title, oi.product_id) AS title
        FROM order_items oi
        LEFT JOIN product_i18n pi ON pi.product_id = oi.product_id AND pi.locale = 'tr'
       WHERE oi.order_id = ?
       ORDER BY oi.created_at ASC
    `,
    [orderId],
  );

  // Measurement Protocol client_id zorunludur. Consent ile yakalanmis GA id yoksa
  // PII icermeyen, siparise deterministik bir server id kullanilir.
  const fallbackId = createHash('sha256').update(orderId).digest('hex').slice(0, 24);
  return {
    transaction_id: String(order.id),
    currency: 'TRY',
    value: Number(order.total),
    client_id: String(order.ga_client_id || `server.${fallbackId}`),
    items: items.map((item) => ({
      item_id: String(item.product_id),
      item_name: String(item.title),
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
    })),
  };
}

async function processOutbox(app: FastifyInstance) {
  if (!env.GA4_API_SECRET || !env.GA4_MEASUREMENT_ID) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT id, order_id, attempt_count
        FROM commerce_measurement_outbox
       WHERE destination = 'ga4'
         AND status IN ('pending','failed')
         AND next_attempt_at <= CURRENT_TIMESTAMP(3)
       ORDER BY created_at ASC
       LIMIT 10
    `,
  );

  for (const row of rows) {
    const [claim] = await pool.execute<import('mysql2/promise').ResultSetHeader>(
      `UPDATE commerce_measurement_outbox SET status = 'processing' WHERE id = ? AND status IN ('pending','failed')`,
      [row.id],
    );
    if (claim.affectedRows !== 1) continue;

    try {
      const purchase = await loadPurchaseMeasurement(String(row.order_id));
      if (!purchase) throw new Error('paid_order_not_found');
      const endpoint = new URL('https://www.google-analytics.com/mp/collect');
      endpoint.searchParams.set('measurement_id', env.GA4_MEASUREMENT_ID);
      endpoint.searchParams.set('api_secret', env.GA4_API_SECRET);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: purchase.client_id,
          events: [{
            name: 'purchase',
            params: {
              transaction_id: purchase.transaction_id,
              currency: purchase.currency,
              value: purchase.value,
              items: purchase.items,
              engagement_time_msec: 1,
            },
          }],
        }),
      });
      if (!response.ok) throw new Error(`ga4_http_${response.status}`);
      await pool.execute(
        `
          UPDATE commerce_measurement_outbox
             SET status = 'sent', attempt_count = attempt_count + 1,
                 sent_at = CURRENT_TIMESTAMP(3), last_error = NULL
           WHERE id = ?
        `,
        [row.id],
      );
    } catch (error) {
      const attempts = Number(row.attempt_count || 0) + 1;
      const delayMinutes = Math.min(360, 2 ** Math.min(attempts, 8));
      const nextAttempt = new Date(Date.now() + delayMinutes * 60_000);
      await pool.execute(
        `
          UPDATE commerce_measurement_outbox
             SET status = 'failed', attempt_count = ?, next_attempt_at = ?, last_error = ?
           WHERE id = ?
        `,
        [attempts, nextAttempt, String((error as Error).message || 'ga4_delivery_failed').slice(0, 500), row.id],
      );
      app.log.warn({ err: error, orderId: row.order_id }, 'GA4 commerce outbox delivery failed');
    }
  }
}

export function startCommerceMeasurementWorker(app: FastifyInstance) {
  if (!env.GA4_API_SECRET || !env.GA4_MEASUREMENT_ID) {
    app.log.warn('GA4 Measurement Protocol disabled; verified browser purchase fallback is active');
    return;
  }
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await processOutbox(app);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void run(), 30_000);
  timer.unref();
  app.addHook('onClose', async () => clearInterval(timer));
  void run();
}
