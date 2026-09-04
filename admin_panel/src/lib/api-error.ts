// =============================================================
// FILE: src/lib/api-error.ts
// API hatasindan HER ZAMAN string uretir.
//
// NEDEN: backend hatalari `{ error: { message: "..." } }` seklinde
// doner. `err.data.error` dogrudan okunursa elde edilen sey bir
// NESNEDIR; bu deger toast'a ya da JSX'e verildiginde React
// "Objects are not valid as a React child" (minified error #31) ile
// TUM SAYFAYI cokertir. Kullanici 400 yerine bembeyaz ekran gorur.
//
// Bu yardimci ne gelirse gelsin string dondurur.
// =============================================================

/** Backend hata kodlarinin Turkce karsiliklari. */
const CODE_LABEL: Record<string, string> = {
  order_not_found: 'Sipariş bulunamadı.',
  already_refunded: 'Bu sipariş zaten iade edilmiş.',
  order_not_paid: 'Yalnızca ödemesi tamamlanmış siparişler iade edilebilir.',
  refund_not_supported_for_payment_method:
    'Bu ödeme yöntemi için otomatik iade desteklenmiyor.',
  refund_not_configured: 'İade için ödeme sağlayıcı ayarları eksik.',
  paytr_refund_failed: 'PayTR iade isteğini reddetti.',
  dealer_not_found: 'Bayi kaydı bulunamadı.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  unauthorized: 'Oturumunuz sona ermiş. Yeniden giriş yapın.',
};

function pick(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    // { error: { message } } / { message } / { error: "kod" }
    return pick(o.message) || pick(o.error) || pick(o.detail) || '';
  }
  return '';
}

/**
 * Hata nesnesinden gosterilebilir bir metin cikarir.
 * Bilinen bir hata kodu ise Turkce karsiligini verir.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = (err ?? {}) as Record<string, unknown>;
  const data = e.data as unknown;

  const raw =
    pick(data) ||
    pick(e.error) ||
    pick(e.message) ||
    '';

  if (!raw) return fallback;
  return CODE_LABEL[raw] ?? raw;
}
