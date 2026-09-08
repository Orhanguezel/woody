// =============================================================
// FILE: src/lib/ecommerce-events.ts
// GA4 e-ticaret olaylari (REVIZE 2026-08-30 — PayTR satin alma akisi).
// gtag yuklu degilse sessizce no-op; akis asla bozulmaz (ads-conversion.ts kalibi).
// purchase olayi sessionStorage ile siparis basina TEK KEZ atilir (yenilemede tekrarlamaz).
// =============================================================

import { reportAdsPurchase } from './ads-conversion';

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

declare global {
  interface Window {
    __pendingAnalyticsEvents?: Array<[string, Record<string, unknown>]>;
  }
}

function sendEvent(name: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  // Analitik bileşeni performans için gecikmeli yükleniyor. Özellikle ürün
  // detayındaki view_item ilk render'da gtag'den önce çalışabilir. Olayı
  // kaybetmek yerine beklet; AnalyticsScripts önce consent default/update
  // komutlarını kurduktan sonra bu kuyruğu boşaltır.
  if (typeof gtag !== 'function') {
    window.__pendingAnalyticsEvents = window.__pendingAnalyticsEvents || [];
    window.__pendingAnalyticsEvents.push([name, payload]);
    return;
  }
  try {
    gtag('event', name, payload);
  } catch {
    // analytics opsiyonel
  }
}

export function reportBeginCheckout(payload: EcommercePayload): void {
  sendEvent('begin_checkout', payload);
}

export function reportViewItem(payload: EcommercePayload): void {
  sendEvent('view_item', payload);
}

export function reportAddToCart(payload: EcommercePayload, eventCallback?: () => void): void {
  sendEvent('add_to_cart', eventCallback
    ? { ...payload, event_callback: eventCallback, event_timeout: 800 }
    : payload);
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
export function reportPurchaseOnce(orderId: string, verified?: EcommercePayload): void {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    if (window.sessionStorage.getItem(PURCHASE_SENT_KEY(orderId))) return;
  } catch {
    // storage yoksa yine de tek seferlik gonderim denenir
  }
  let payload: EcommercePayload = verified || { currency: 'TRY', items: [] };
  try {
    if (!verified) {
      const raw = window.sessionStorage.getItem(PENDING_ORDER_KEY(orderId));
      if (raw) payload = { ...payload, ...(JSON.parse(raw) as EcommercePayload) };
    }
  } catch {
    // bozuk kayit — transaction_id yeterli
  }
  sendEvent('purchase', { transaction_id: orderId, ...payload });

  // GA4'e ek olarak Google Ads'e de bildir. GA4 olayi tek basina Ads'te
  // donusum SAYILMAZ (ayrica ice aktarim gerekir); dogrudan etiket hem daha
  // hizli hem daha guvenilir. Etiket bos oldugu surece bu cagri no-op'tur.
  reportAdsPurchase({
    orderId,
    value: typeof payload.value === 'number' ? payload.value : undefined,
    currency: typeof payload.currency === 'string' ? payload.currency : 'TRY',
  });
  try {
    window.sessionStorage.setItem(PURCHASE_SENT_KEY(orderId), '1');
    window.sessionStorage.removeItem(PENDING_ORDER_KEY(orderId));
  } catch {
    // yoksay
  }
}
