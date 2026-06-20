'use client';

import React, { Fragment, useMemo, useEffect } from 'react';
import { tUi } from '@/i18n/staticUi';

import { usePathname, useSearchParams } from 'next/navigation';
import Header from '../layout/header/Header';
import type { PublicMenuItemDto } from '@/integrations/shared';
import FooterTwo from '../layout/footer/Footer';
import ScrollProgress from '../layout/ScrollProgress';

import AnalyticsScripts from '../features/analytics/AnalyticsScripts';
import GAViewPages from '../features/analytics/GAViewPages';
import PhoneConversionListener from '../features/analytics/PhoneConversionListener';
import CookieConsentBanner from '../layout/banner/CookieConsentBanner';
import PwaRegistration from '../components/system/PwaRegistration';
import { resetLayoutSeo } from '../seo';


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
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
     // Reset SEO store on route change
     resetLayoutSeo();
  }, [pathname, searchParams]);

  // Sync <html lang="..."> with current locale
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Global scroll reveal observer.
  // Hydration-safe: Önce body'ye `scroll-reveal-ready` class eklenir
  // (CSS `.reveal` opacity/transform geçişini bu noktadan sonra aktive eder).
  // Sonra observer kurulur ve `.visible` class eklenmesi başlar — hydration
  // çoktan tamamlanmış olduğu için SSR/CSR class mismatch oluşmaz.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;
    let postPaintTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      document.body.classList.add('scroll-reveal-ready');

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
      );

      const scan = () => {
        document.querySelectorAll('.reveal:not(.visible)').forEach((el) => io!.observe(el));
      };

      scan();
      mo = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(scan, 100);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };

    const scheduleInit = () => {
      if (cancelled) return;
      postPaintTimer = globalThis.setTimeout(init, 0);
    };

    // Çift rAF + setTimeout(0): commit, paint, sonra observer (hydration ile çakışmasın)
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scheduleInit);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(postPaintTimer);
      io?.disconnect();
      mo?.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [pathname]);

  return (
    <Fragment>
      <PwaRegistration />
      <AnalyticsScripts />
      <GAViewPages />
      <PhoneConversionListener />
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
