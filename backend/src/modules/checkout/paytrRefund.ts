// =============================================================
// FILE: src/modules/checkout/paytrRefund.ts
// PayTR iade (odeme/iade) — woody siparisleri icin gercek iade.
//
// NEDEN GEREKLI
// /orders/:id/refund ucu paylasilan modulden geliyordu ve yalnizca
// `payment_method = 'dealer_credit'` (bayi cari hesap) modelini
// destekliyordu — baska bir projenin is modeli. Woody siparisleri
// `paytr` oldugu icin her iade denemesi 400
// `refund_not_supported_for_payment_method` donuyordu; ustelik
// panel bu hatayi nesne olarak render edip cokuyordu.
//
// Bu modul PayTR'nin iade API'sini cagirir ve sonucu siparise isler.
// Kismi iade desteklenir (amount verilmezse tam iade).
//
// PayTR sozlesmesi:
//   POST https://www.paytr.com/odeme/iade
//   merchant_id, merchant_oid, return_amount, paytr_token
//   paytr_token = base64(HMAC_SHA256(merchant_id + merchant_oid +
//                        return_amount + merchant_salt, merchant_key))
//   Yanit: { status: 'success' | 'error', err_no?, err_msg? }
// =============================================================

import { createHmac, randomUUID } from 'crypto';

import type { RowDataPacket } from 'mysql2/promise';

import { pool } from '@/db/client';

import { loadPaytrConfig, isPaytrUsable } from './paytrConfig';

const PAYTR_REFUND_URL = 'https://www.paytr.com/odeme/iade';

export class PaytrRefundError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail?: string,
  ) {
    super(code);
    this.name = 'PaytrRefundError';
  }
}

/** PayTR tutarlari nokta ayracli ve 2 haneli ister (ornek: "1500.00"). */
function formatAmount(v: number): string {
  return v.toFixed(2);
}

function buildToken(args: {
  merchantId: string;
  merchantOid: string;
  returnAmount: string;
  merchantSalt: string;
  merchantKey: string;
}): string {
  const raw = `${args.merchantId}${args.merchantOid}${args.returnAmount}${args.merchantSalt}`;
  return createHmac('sha256', args.merchantKey).update(raw).digest('base64');
}

/**
 * Siparisi PayTR uzerinden iade eder ve siparis kaydini gunceller.
 *
 * @param amount Kismi iade tutari. Verilmezse siparis toplami (tam iade).
 * @throws PaytrRefundError
 */
export async function refundPaytrOrder(params: {
  orderId: string;
  amount?: number | null;
  reason?: string | null;
}): Promise<{ refunded: number; full: boolean }> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, total, payment_status, payment_method, payment_ref
       FROM orders WHERE id = ? LIMIT 1`,
    [params.orderId],
  );
  const order = rows[0];
  if (!order) throw new PaytrRefundError('order_not_found');

  if (String(order.payment_status) === 'refunded') {
    throw new PaytrRefundError('already_refunded');
  }
  if (String(order.payment_status) !== 'paid') {
    throw new PaytrRefundError('order_not_paid');
  }

  const merchantOid = String(order.payment_ref ?? '').trim();
  if (!merchantOid) throw new PaytrRefundError('payment_reference_missing');

  const total = Number(order.total);
  const requested = params.amount == null ? total : Number(params.amount);
  if (!Number.isFinite(requested) || requested <= 0) {
    throw new PaytrRefundError('invalid_refund_amount');
  }
  if (requested > total + 0.001) {
    throw new PaytrRefundError('refund_amount_exceeds_total');
  }

  const config = await loadPaytrConfig();
  if (!isPaytrUsable(config)) throw new PaytrRefundError('refund_not_configured');

  const returnAmount = formatAmount(requested);
  const token = buildToken({
    merchantId: config.merchantId,
    merchantOid,
    returnAmount,
    merchantSalt: config.merchantSalt,
    merchantKey: config.merchantKey,
  });

  const body = new URLSearchParams({
    merchant_id: config.merchantId,
    merchant_oid: merchantOid,
    return_amount: returnAmount,
    paytr_token: token,
  });

  let payload: { status?: string; err_no?: unknown; err_msg?: unknown };
  try {
    const res = await fetch(PAYTR_REFUND_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    payload = (await res.json()) as typeof payload;
  } catch (err) {
    throw new PaytrRefundError('paytr_unreachable', String((err as Error)?.message ?? '').slice(0, 300));
  }

  if (payload?.status !== 'success') {
    const detail = [payload?.err_no, payload?.err_msg].filter(Boolean).join(' — ').slice(0, 300);
    throw new PaytrRefundError('paytr_refund_failed', detail || 'PayTR iade istegini reddetti');
  }

  // Tam iade ise siparis iptal + refunded; kismi iade ise durum korunur,
  // yalnizca not dusulur (siparis hala kismen odenmis sayilir).
  const full = requested >= total - 0.001;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (full) {
      await connection.execute(
        `UPDATE orders
            SET payment_status = 'refunded', status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP(3)
          WHERE id = ? AND payment_status = 'paid'`,
        [params.orderId],
      );
      // Iade edilen siparisin dijital erisim haklari geri alinir.
      await connection.execute(`DELETE FROM user_entitlements WHERE order_id = ?`, [params.orderId]);
      await connection.execute(
        `INSERT IGNORE INTO commerce_measurement_outbox
          (id, order_id, destination, event_name, status, next_attempt_at)
         VALUES (?, ?, 'ga4', 'refund', 'pending', CURRENT_TIMESTAMP(3))`,
        [randomUUID(), params.orderId],
      );
    }
    await connection.execute(
      `UPDATE payment_attempts
          SET status = ?, updated_at = CURRENT_TIMESTAMP(3)
        WHERE payment_ref = ?`,
      [full ? 'refunded' : 'partially_refunded', merchantOid],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return { refunded: requested, full };
}
