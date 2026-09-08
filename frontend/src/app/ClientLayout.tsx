'use client';

import React, { Fragment, Suspense, useMemo, useEffect, useState } from 'react';
import { tUi } from '@/i18n/staticUi';

import Header from '../layout/header/Header';
import type { PublicMenuItemDto } from '@/integrations/shared';
import FooterTwo from '../layout/footer/Footer';
import ScrollProgress from '../layout/ScrollProgress';

import AnalyticsScripts from '../features/analytics/AnalyticsScripts';
import GAViewPages from '../features/analytics/GAViewPages';
import AdsConversionClicks from '../features/analytics/AdsConversionClicks';
import CookieConsentBanner from '../layout/banner/CookieConsentBanner';
import PwaRegistration from '../components/system/PwaRegistration';
import RouteEffects from './RouteEffects';


import { getPublicAppName } from '@/lib/site-config';
import WhatsAppFloatingButton from '@/components/woody/WhatsAppFloatingButton';
import StickyStoreButton from '@/components/woody/StickyStoreButton';

export default function ClientLayout({
  children,
  locale,
  initialMenuItems,
}: {
  children: React.ReactNode;
  locale?: string;
  initialMenuItems?: PublicMenuItemDto[];
}) {
  // Keep layout light: Header already fetches dynamic brand/settings on its own.
  const brand = useMemo(() => ({ name: getPublicAppName() }), []);
  const [analyticsReady, setAnalyticsReady] = useState(false);
  
  // Start after hydration. A fixed five-second delay loses short visits and
  // early lead clicks; consent defaults remain owned by AnalyticsScripts.
  useEffect(() => { setAnalyticsReady(true); }, []);

  // Sync <html lang="..."> with current locale
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <Fragment>
      <PwaRegistration />
      {/* useSearchParams kullanan her sey BU kucuk adada — children Suspense DISINDA
          kalir ki page'lerin notFound()/redirect() status kodlari calissin. */}
      <Suspense fallback={null}>
        <RouteEffects />
        {/* Internal CTA capture hemen mount olur; analytics destination gec acilsa bile
            event sessionStorage ile sonraki route'a tasinir. */}
        <GAViewPages />
        {analyticsReady ? (
          <>
            <AnalyticsScripts />
            <AdsConversionClicks />
          </>
        ) : null}
      </Suspense>
      <a href="#main-content" className="skip-link">
        {tUi(locale, 'Skip to main content')}
      </a>
      
      <Header brand={brand} locale={locale} initialMenuItems={initialMenuItems} />
      <main id="main-content" className="min-h-screen bg-bg-primary" tabIndex={-1}>
        {children}
      </main>

      <FooterTwo locale={locale} />
      <StickyStoreButton locale={locale} />
      <WhatsAppFloatingButton locale={locale} />
      <ScrollProgress />

      <CookieConsentBanner />
    </Fragment>
  );
}
