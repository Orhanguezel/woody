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
 * Bir lead dönüşümünü Google Ads'e bildirir.
 * @param kind   'form' | 'whatsapp' | 'phone'
 * @param url    (opsiyonel) dönüşüm sonrası yönlendirilecek URL — verilirse
 *               event_callback ile navigasyon dönüşüm gönderildikten sonra yapılır.
 */
export function reportAdsConversion(kind: GoogleAdsConversionKind, url?: string): void {
  if (typeof window === 'undefined') return;

  const gtag = window.gtag;
  const conversionId = getDefaultGoogleAdsConversionId();
  const label = getDefaultGoogleAdsConversionLabels()[kind];

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
