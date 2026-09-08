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
  const connection = await pool.getConnection();
  const lockName = `refund:${params.orderId}`;
  const refundId = randomUUID();
  let reserved = false;
  let locked = false;
  try {
    const [locks] = await connection.execute<RowDataPacket[]>('SELECT GET_LOCK(?, 0) AS acquired', [lockName]);
    locked = Number(locks[0]?.acquired) === 1;
    if (!locked) throw new PaytrRefundError('refund_in_progress');
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT id,total,payment_status,payment_method,payment_ref FROM orders WHERE id=? LIMIT 1`, [params.orderId],
    );
    const order = rows[0];
    if (!order) throw new PaytrRefundError('order_not_found');
    if (order.payment_status === 'refunded') throw new PaytrRefundError('already_refunded');
    if (order.payment_status !== 'paid') throw new PaytrRefundError('order_not_paid');
    if (order.payment_method !== 'paytr') throw new PaytrRefundError('refund_not_supported_for_payment_method');
    const merchantOid = String(order.payment_ref || '').trim();
    if (!merchantOid) throw new PaytrRefundError('payment_reference_missing');
    const [ledger] = await connection.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(CASE WHEN status='succeeded' THEN amount ELSE 0 END),0) AS refunded,
              SUM(status IN ('processing','uncertain')) AS unresolved
         FROM commerce_refunds WHERE order_id=?`, [params.orderId],
    );
    if (Number(ledger[0]?.unresolved)) throw new PaytrRefundError('refund_requires_reconciliation');
    const remainingMinor = Math.round(Number(order.total) * 100) - Math.round(Number(ledger[0]?.refunded || 0) * 100);
    const raw = params.amount == null ? remainingMinor / 100 : Number(params.amount);
    const requestedMinor = Math.round(raw * 100);
    if (!Number.isFinite(raw) || requestedMinor <= 0 || Math.abs(raw * 100 - requestedMinor) > 0.0001) throw new PaytrRefundError('invalid_refund_amount');
    if (requestedMinor > remainingMinor) throw new PaytrRefundError('refund_amount_exceeds_remaining');
    const requested = requestedMinor / 100;
    const full = requestedMinor === remainingMinor;
    const config = await loadPaytrConfig();
    if (!isPaytrUsable(config)) throw new PaytrRefundError('refund_not_configured');
    const returnAmount = formatAmount(requested);
    const token = buildToken({merchantId:config.merchantId, merchantOid, returnAmount, merchantSalt:config.merchantSalt, merchantKey:config.merchantKey});
    // Commit intent BEFORE contacting the gateway. A timeout/crash requires reconciliation,
    // never an automatic second money transfer.
    await connection.execute(
      `INSERT INTO commerce_refunds (id,order_id,amount,status,reason) VALUES (?,?,?,'processing',?)`,
      [refundId,params.orderId,returnAmount,params.reason?.slice(0,500) || null],
    );
    reserved = true;
    const res = await fetch(PAYTR_REFUND_URL, {
      method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, signal:AbortSignal.timeout(20_000),
      body:new URLSearchParams({merchant_id:config.merchantId,merchant_oid:merchantOid,return_amount:returnAmount,paytr_token:token,reference_no:refundId.replaceAll('-','')}),
    });
    const payload = await res.json() as {status?:string;merchant_oid?:string;return_amount?:string;reference_no?:string;is_test?:number};
    if (!res.ok || !['success','error','failed'].includes(payload.status || '')) throw new PaytrRefundError('refund_requires_reconciliation');
    if (payload.status === 'error' || payload.status === 'failed') {
      await connection.execute(`UPDATE commerce_refunds SET status='failed' WHERE id=?`,[refundId]);
      reserved = false;
      throw new PaytrRefundError('paytr_refund_failed');
    }
    if (payload.merchant_oid !== merchantOid || Math.round(Number(payload.return_amount) * 100) !== requestedMinor || String(payload.is_test) === '1') throw new PaytrRefundError('refund_requires_reconciliation');
    await connection.beginTransaction();
    try {
      await connection.execute(`UPDATE commerce_refunds SET status='succeeded',completed_at=CURRENT_TIMESTAMP(3) WHERE id=?`,[refundId]);
      if (full) {
        await connection.execute(`UPDATE orders SET payment_status='refunded',status='cancelled',updated_at=CURRENT_TIMESTAMP(3) WHERE id=? AND payment_status='paid'`,[params.orderId]);
        await connection.execute('DELETE FROM user_entitlements WHERE order_id=?',[params.orderId]);
      }
      await connection.execute(`UPDATE payment_attempts SET status=?,updated_at=CURRENT_TIMESTAMP(3) WHERE payment_ref=?`,[full?'refunded':'partially_refunded',merchantOid]);
      await connection.execute(`INSERT INTO commerce_measurement_outbox (id,order_id,destination,event_name,status,next_attempt_at) VALUES (?,?,'ga4',?,'pending',CURRENT_TIMESTAMP(3))`,[randomUUID(),params.orderId,`refund:${refundId}`]);
      await connection.commit();
      reserved = false;
    } catch (error) { await connection.rollback(); throw error; }
    return {refunded:requested,full};
  } catch (error) {
    if (reserved) {
      await connection.execute(`UPDATE commerce_refunds SET status='uncertain' WHERE id=? AND status='processing'`,[refundId]);
      throw new PaytrRefundError('refund_requires_reconciliation');
    }
    throw error;
  } finally {
    try { if (locked) await connection.execute('SELECT RELEASE_LOCK(?)',[lockName]); } finally { connection.release(); }
  }
}
