// =============================================================
// FILE: src/lib/whatsapp.ts
// WhatsApp link helper'lari.
// Masaustunde `wa.me` -> api.whatsapp.com otomatik `whatsapp://` protokolu
// dener; uygulama yoksa (ozellikle Linux) "No Apps Available" diyalogu cikar.
// Cozum: WhatsAppLink bileseni masaustunde web.whatsapp.com'a yonlendirir.
// =============================================================

const FALLBACK_PHONE = '905331570373';

export function cleanWaPhone(phone?: string | null): string {
  const cleaned = String(phone ?? '').replace(/\D/g, '');
  return cleaned || FALLBACK_PHONE;
}

/** Evrensel link (SSR + mobil uygulama icin guvenli varsayilan). */
export function buildWhatsAppHref(phone?: string | null, text?: string | null): string {
  const p = cleanWaPhone(phone);
  const t = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${p}${t}`;
}

/** Masaustu icin WhatsApp Web linki (custom protokol tetiklemez). */
export function buildWhatsAppWebHref(phone?: string | null, text?: string | null): string {
  const p = cleanWaPhone(phone);
  const t = text ? `&text=${encodeURIComponent(text)}` : '';
  return `https://web.whatsapp.com/send?phone=${p}${t}`;
}

export function isMobileUserAgent(ua: string): boolean {
  return /android|iphone|ipad|ipod|mobile|opera mini|iemobile|blackberry|windows phone/i.test(ua);
}
