import { randomUUID } from 'crypto';
import type { ResultSetHeader } from 'mysql2/promise';
import { env } from '@/core/env';
import { pool } from '@/db/client';

export async function markPaymentResult(
  orderId: string,
  paymentRef: string,
  paid: boolean,
  callbackPayload: unknown,
): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `
        UPDATE orders
           SET payment_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ? AND payment_ref = ? AND payment_status IN ('pending','failed','unpaid')
      `,
      [paid ? 'paid' : 'failed', paid ? 'confirmed' : 'pending', orderId, paymentRef],
    );
    const newlyPaid = paid && result.affectedRows === 1;
    if (result.affectedRows === 0) {
      await connection.commit();
      return false;
    }
    await connection.execute(
      `
        UPDATE payment_attempts
           SET status = ?, callback_payload = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE payment_ref = ?
      `,
      [paid ? 'succeeded' : 'failed', JSON.stringify(callbackPayload), paymentRef],
    );
    if (newlyPaid) {
      await connection.execute(
        `
          INSERT IGNORE INTO commerce_measurement_outbox
            (id, order_id, destination, event_name, status, next_attempt_at)
          VALUES (?, ?, ?, 'purchase', 'pending', CURRENT_TIMESTAMP(3))
        `,
        [randomUUID(), orderId, env.GA4_API_SECRET && env.GA4_MEASUREMENT_ID ? 'ga4' : 'ga4_browser'],
      );
    }
    await connection.commit();
    return newlyPaid;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

