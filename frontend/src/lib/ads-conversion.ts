// =============================================================
// FILE: src/lib/ads-conversion.ts
// Google Ads dönüşüm (conversion) raporlama yardımcısı.
// - Conversion ID + label'lar site-defaults.json > analytics altından gelir
//   (env NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID ile override edilebilir).
// - gtag yüklü değilse veya label yoksa sessizce no-op (analytics opsiyonel).
// - Consent Mode v2: ad_storage 'denied' olsa bile gtag dönüşümü modeller.
// =============================================================
import {
  getDefaultGoogleAdsConversionId,
  getDefaultGoogleAdsConversionLabels,
  type GoogleAdsConversionKind,
} from './site-config';

export type { GoogleAdsConversionKind };

/**
 * Ads dönüşümünün GA4 karşılığı. Site başlangıçta lead-gen'di; 2026-09'da
 * gerçek e-ticaret satışı da var. Lead olayları tek çağrı noktasından
 * (ContactForm.onSubmit + AdsConversionClicks) tam bir kez atılır; satın alma
 * ise ecommerce-events.ts'ten gelir ve GA4 olayını ORASI gönderir.
 */
const GA4_EVENT: Record<GoogleAdsConversionKind, string> = {
  form: 'generate_lead',
  whatsapp: 'whatsapp_click',
  phone: 'phone_click',
  // purchase'in GA4 olayi BURADAN atilmaz — ecommerce-events.ts zaten
  // gonderiyor. Ikinci kez atmak satislari cift sayardi.
  purchase: 'purchase',
};

function reportGa4Lead(kind: GoogleAdsConversionKind, details: Record<string, string> = {}): void {
  const gtag = window.gtag;
  if (typeof gtag !== 'function') {
    window.__pendingAnalyticsEvents = window.__pendingAnalyticsEvents || [];
    window.__pendingAnalyticsEvents.push([GA4_EVENT[kind], { page_path: window.location.pathname, lead_channel: kind, ...details }]);
    return;
  }
  try {
    gtag('event', GA4_EVENT[kind], {
      page_path: window.location.pathname,
      lead_channel: kind,
      ...details,
    });
  } catch {
    // Analytics opsiyonel — dönüşüm/navigasyon akışını asla bozmaz.
  }
}

/**
 * Bir lead dönüşümünü Google Ads'e bildirir.
 * @param kind   'form' | 'whatsapp' | 'phone'
 * @param url    (opsiyonel) dönüşüm sonrası yönlendirilecek URL — verilirse
 *               event_callback ile navigasyon dönüşüm gönderildikten sonra yapılır.
 */
export function reportAdsConversion(kind: GoogleAdsConversionKind, url?: string, details: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return;

  // GA4 lead olayi Ads etiketinden BAGIMSIZ atilir: etiket/ID eksik olsa bile
  // GA4 raporlarinda lead gorunur.
  reportGa4Lead(kind, details);

  const gtag = window.gtag;
  const conversionId = getDefaultGoogleAdsConversionId();
  const label = getDefaultGoogleAdsConversionLabels()[kind];

  if (typeof gtag !== 'function' && conversionId && label) {
    window.__pendingAnalyticsEvents = window.__pendingAnalyticsEvents || [];
    window.__pendingAnalyticsEvents.push(['conversion', { send_to: `${conversionId}/${label}` }]);
  }
  if (typeof gtag !== 'function' || !conversionId || !label) {
    // Etiket/ID yoksa veya gtag yüklenmediyse: navigasyonu engelleme.
    if (url) window.location.assign(url);
    return;
  }

  let navigated = false;
  const go = () => {
    if (navigated || !url) return;
    navigated = true;
    window.location.assign(url);
  };

  try {
    gtag('event', 'conversion', {
      send_to: `${conversionId}/${label}`,
      ...(url ? { event_callback: go } : {}),
    });
  } catch {
    go();
    return;
  }

  // event_callback gelmezse navigasyonu kilitlememek için emniyet zaman aşımı.
  if (url) window.setTimeout(go, 800);
}


/**
 * Satın almayı Google Ads'e bildirir.
 *
 * `reportAdsConversion`'dan AYRI durur çünkü:
 *  - GA4 `purchase` olayını ecommerce-events.ts zaten gönderiyor; buradan da
 *    göndermek satışları çift sayardı.
 *  - Ads'in satın almada DEĞERE ihtiyacı var (value + currency), yoksa ROAS
 *    hesaplanamaz ve akıllı teklif öğrenemez.
 *  - `transaction_id` Ads tarafında tekilleştirme sağlar: kullanıcı başarı
 *    sayfasını yenilerse dönüşüm ikinci kez sayılmaz.
 *
 * Etiket (label) boşsa sessizce hiçbir şey yapmaz — Ads'te "Satın alma"
 * dönüşüm eylemi oluşturulup etiketi site-defaults.json'a yazılana kadar
 * güvenle no-op kalır.
 */
export function reportAdsPurchase(input: {
  orderId: string;
  value?: number;
  currency?: string;
}): void {
  if (typeof window === 'undefined' || !input.orderId) return;

  const gtag = window.gtag;
  const conversionId = getDefaultGoogleAdsConversionId();
  const label = getDefaultGoogleAdsConversionLabels().purchase;
  if (!conversionId || !label) return;

  const payload: Record<string, unknown> = {
    send_to: `${conversionId}/${label}`,
    transaction_id: input.orderId,
    currency: input.currency || 'TRY',
  };
  if (typeof input.value === 'number' && Number.isFinite(input.value)) {
    payload.value = input.value;
  }

  if (typeof gtag !== 'function') {
    // gtag henüz yüklenmediyse kuyruğa al — AnalyticsScripts boşaltır.
    window.__pendingAnalyticsEvents = window.__pendingAnalyticsEvents || [];
    window.__pendingAnalyticsEvents.push(['conversion', payload]);
    return;
  }
  try {
    gtag('event', 'conversion', payload);
  } catch {
    // Ölçüm opsiyonel — satın alma akışını asla bozmaz.
  }
}
