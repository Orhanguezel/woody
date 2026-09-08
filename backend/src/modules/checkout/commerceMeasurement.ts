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
  session_id?: string;
};

export async function loadCommerceMeasurement(
  orderId: string,
  eventName: 'purchase' | 'refund' = 'purchase',
): Promise<PurchaseMeasurement | null> {
  const [orders] = await pool.execute<RowDataPacket[]>(
    `
      SELECT o.id, o.total, a.ga_client_id, a.ga_session_id
        FROM orders o
        JOIN order_attribution a ON a.order_id = o.id
        JOIN payment_attempts pa ON pa.payment_ref = o.payment_ref
       WHERE o.id = ? AND o.payment_status = ?
         AND a.consent_state = 'granted' AND a.ga_client_id IS NOT NULL
         AND a.ga_client_id <> ''
         AND pa.status IN ('succeeded','refunded','partially_refunded')
         AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(pa.request_payload, '$.testMode')), 'false') NOT IN ('true','1')
       LIMIT 1
    `,
    [orderId, eventName === 'refund' ? 'refunded' : 'paid'],
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

  return {
    transaction_id: String(order.id),
    currency: 'TRY',
    value: Number(order.total),
    client_id: String(order.ga_client_id),
    session_id: order.ga_session_id ? String(order.ga_session_id) : undefined,
    items: items.map((item) => ({
      item_id: String(item.product_id),
      item_name: String(item.title),
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
    })),
  };
}

export async function processCommerceMeasurementOutbox(app: FastifyInstance) {
  if (!env.GA4_API_SECRET || !env.GA4_MEASUREMENT_ID) return;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT id, order_id, event_name, attempt_count, created_at
        FROM commerce_measurement_outbox
       WHERE destination = 'ga4'
         AND status IN ('pending','failed')
         AND attempt_count < 10
         AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 72 HOUR)
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
      const eventName = row.event_name === 'refund' ? 'refund' : 'purchase';
      const purchase = await loadCommerceMeasurement(String(row.order_id), eventName);
      if (!purchase) {
        await pool.execute(`UPDATE commerce_measurement_outbox SET status='failed', attempt_count=10, last_error='measurement_ineligible_consent_payment_or_test' WHERE id=?`, [row.id]);
        continue;
      }
      const endpoint = new URL('https://www.google-analytics.com/mp/collect');
      endpoint.searchParams.set('measurement_id', env.GA4_MEASUREMENT_ID);
      endpoint.searchParams.set('api_secret', env.GA4_API_SECRET);
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: purchase.client_id,
          timestamp_micros: new Date(row.created_at).getTime() * 1000,
          events: [{
            name: eventName,
            params: {
              transaction_id: purchase.transaction_id,
              currency: purchase.currency,
              value: purchase.value,
              items: purchase.items,
              engagement_time_msec: 1,
              ...(purchase.session_id ? { session_id: purchase.session_id } : {}),
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
        [attempts, nextAttempt, 'ga4_delivery_failed', row.id],
      );
      app.log.warn({ orderId: row.order_id }, 'GA4 commerce outbox delivery failed');
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
      await processCommerceMeasurementOutbox(app);
    } catch {
      app.log.warn('GA4 commerce outbox unavailable');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void run(), 30_000);
  timer.unref();
  app.addHook('onClose', async () => clearInterval(timer));
  void run();
}
