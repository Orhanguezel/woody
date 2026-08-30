// =============================================================
// FILE: src/features/analytics/AdsConversionClicks.tsx
// Tıklama-bazlı Google Ads lead dönüşümlerini tek merkezden yakalar:
//   - tel:  linkleri        → 'phone'
//   - wa.me / whatsapp.com  → 'whatsapp'
// tel/WhatsApp linkleri header/footer/iletişim sayfası/floating buton gibi
// birçok yerde ve farklı bileşenlerde dağınık. Tek tek onClick eklemek yerine
// document seviyesinde delegated (capture) dinleyici → tüm linkleri kapsar,
// çift sayım olmaz.
// =============================================================
'use client';

import { useEffect } from 'react';
import { reportAdsConversion } from '@/lib/ads-conversion';

export default function AdsConversionClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';

      if (href.startsWith('tel:')) {
        // tel: tıklaması sayfayı değiştirmez (dialer açılır) → fire-and-forget.
        reportAdsConversion('phone');
        return;
      }
      if (/(^https?:)?\/\/(wa\.me|(web\.|api\.|chat\.)?whatsapp\.com)/i.test(href)) {
        // Yalnız telefon hedefli linkler lead'dir: wa.me/<numara> veya
        // .../send?phone=<numara>. Blog paylaşım linkleri (wa.me/?text=...)
        // telefon içermez → lead dönüşümü SAYILMAZ (Ads/GA4 şişmesin).
        let phoneTarget = false;
        try {
          const u = new URL(href, window.location.href);
          phoneTarget =
            /^\/\+?\d{6,}/.test(u.pathname) || /\d{6,}/.test(u.searchParams.get('phone') ?? '');
        } catch {
          // URL parse edilemezse eski davranış: lead say (yanlış negatif olmasın).
          phoneTarget = true;
        }
        // WhatsApp linki yeni sekmede açılır → navigasyonu beklemeye gerek yok.
        if (phoneTarget) reportAdsConversion('whatsapp');
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
