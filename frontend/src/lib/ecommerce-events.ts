// =============================================================
// FILE: src/lib/ecommerce-events.ts
// GA4 e-ticaret olaylari (REVIZE 2026-08-30 — PayTR satin alma akisi).
// gtag yuklu degilse sessizce no-op; akis asla bozulmaz (ads-conversion.ts kalibi).
// purchase olayi sessionStorage ile siparis basina TEK KEZ atilir (yenilemede tekrarlamaz).
// =============================================================

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

type EcommercePayload = {
  currency: string;
  value?: number;
  items: EcommerceItem[];
};

function sendEvent(name: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', name, payload);
  } catch {
    // analytics opsiyonel
  }
}

export function reportBeginCheckout(payload: EcommercePayload): void {
  sendEvent('begin_checkout', payload);
}

/** PayTR iframe acildiginda — odeme bilgisi adimina gecis. */
export function reportAddPaymentInfo(payload: EcommercePayload & { payment_type?: string }): void {
  sendEvent('add_payment_info', { payment_type: 'paytr', ...payload });
}

const PENDING_ORDER_KEY = (orderId: string) => `woody_order_${orderId}`;
const PURCHASE_SENT_KEY = (orderId: string) => `woody_purchase_${orderId}`;

/** Odeme oncesi siparis bilgisini sakla — sonuc sayfasi purchase olayini bununla zenginlestirir. */
export function storePendingOrder(orderId: string, payload: EcommercePayload): void {
  try {
    window.sessionStorage.setItem(PENDING_ORDER_KEY(orderId), JSON.stringify(payload));
  } catch {
    // storage kapali olabilir
  }
}

/** Basari sayfasinda cagrilir; siparis basina tek purchase olayi gonderir. */
export function reportPurchaseOnce(orderId: string): void {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    if (window.sessionStorage.getItem(PURCHASE_SENT_KEY(orderId))) return;
  } catch {
    // storage yoksa yine de tek seferlik gonderim denenir
  }
  let payload: EcommercePayload = { currency: 'TRY', items: [] };
  try {
    const raw = window.sessionStorage.getItem(PENDING_ORDER_KEY(orderId));
    if (raw) payload = { ...payload, ...(JSON.parse(raw) as EcommercePayload) };
  } catch {
    // bozuk kayit — transaction_id yeterli
  }
  sendEvent('purchase', { transaction_id: orderId, ...payload });
  try {
    window.sessionStorage.setItem(PURCHASE_SENT_KEY(orderId), '1');
    window.sessionStorage.removeItem(PENDING_ORDER_KEY(orderId));
  } catch {
    // yoksay
  }
}
