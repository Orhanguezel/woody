// =============================================================
// FILE: src/features/analytics/PhoneConversionListener.tsx
// `tel:` linklerine tıklamayı tek merkezden yakalayıp Google Ads
// telefon lead dönüşümünü tetikler. tel: linkleri header/footer/
// iletişim sayfası gibi birçok yerde dağınık olduğundan, her birine
// onClick eklemek yerine document seviyesinde delegated dinleyici.
// =============================================================
'use client';

import { useEffect } from 'react';
import { reportAdsConversion } from '@/lib/ads-conversion';

export default function PhoneConversionListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target?.closest?.('a[href^="tel:"]');
      if (!anchor) return;
      // tel: tıklaması sayfayı değiştirmez (dialer açılır) → fire-and-forget.
      reportAdsConversion('phone');
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
