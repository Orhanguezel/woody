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
        // WhatsApp linki yeni sekmede açılır → navigasyonu beklemeye gerek yok.
        reportAdsConversion('whatsapp');
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
