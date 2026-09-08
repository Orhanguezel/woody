// =============================================================
// FILE: src/features/analytics/GAViewPages.tsx
// Page view tracking (Pages Router) respecting consent
// - If GTM present: push a custom dataLayer event (no dependency on window.gtag)
// - If only GA4 gtag present: send gtag('event','page_view', ...)
// =============================================================
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalyticsSettings } from './useAnalyticsSettings';
import { getAnalyticsPageViewEventName } from '@/lib/site-config';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    __analyticsConsentGranted?: boolean;
    __analyticsDestinationReady?: boolean;
    __pendingAnalyticsEvents?: Array<[string, Record<string, unknown>]>;
  }
}

function isValidGtmId(v: unknown) {
  const s = String(v ?? '').trim();
  return !!s && s.startsWith('GTM-');
}

function isValidGa4Id(v: unknown) {
  const s = String(v ?? '').trim();
  return !!s && s.startsWith('G-');
}

function isValidFbPixelId(v: unknown) {
  const s = String(v ?? '').trim();
  return !!s && /^\d+$/.test(s);
}

export default function GAViewPages() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, ga4Id, gtmId, facebookPixelId } = useAnalyticsSettings();

  const hasGtm = useMemo(() => isValidGtmId(gtmId), [gtmId]);
  const hasGa = useMemo(() => isValidGa4Id(ga4Id), [ga4Id]);
  const hasFbPixel = useMemo(() => isValidFbPixelId(facebookPixelId), [facebookPixelId]);

  const hasAnyAnalytics = hasGtm || hasGa || hasFbPixel;

  const lastAbsUrlRef = useRef<string>('');
  const firstRunRef = useRef<boolean>(true);

  // Ana içerikteki iç link/CTA katkısını internal UTM eklemeden ölç.
  // link_id hedefi, content_group ise tıklamanın çıktığı sayfa kümesini taşır.
  useEffect(() => {
    const onContentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('main a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname) return;
      const currentPath = window.location.pathname;
      const contentGroup = currentPath.includes('/blog/')
        ? 'blog'
        : currentPath.includes('/preschool')
          ? 'preschool'
          : currentPath.includes('/store')
            ? 'store'
            : 'site';
      const payload = {
        link_id: anchor.dataset.analyticsLinkId || `${contentGroup}:${url.pathname}`,
        content_group: contentGroup,
        link_url: url.pathname,
        page_location: window.location.origin + currentPath,
        link_text: (
          anchor.getAttribute('aria-label')
          || anchor.getAttribute('title')
          || anchor.querySelector('h1,h2,h3,h4,h5,h6')?.textContent
          || anchor.textContent
          || ''
        ).trim().replace(/\s+/g, ' ').slice(0, 120),
      };
      if (typeof window.gtag === 'function' && window.__analyticsDestinationReady) {
        // Beacon delivery must not add a delay or replace Next.js navigation.
        window.gtag('event', 'cta_click', { ...payload, transport_type: 'beacon' });
      } else {
        // Link hemen navigate ederse memory queue yeni document'ta kaybolur. Ayni-origin
        // CTA'yi sessionStorage ile sonraki sayfaya tasiyip config sonrasinda tek kez flush et.
        try {
          const key = 'woody_pending_analytics_events';
          const stored = JSON.parse(window.sessionStorage.getItem(key) || '[]');
          const pending = Array.isArray(stored) ? stored.slice(-19) : [];
          pending.push(['cta_click', payload]);
          window.sessionStorage.setItem(key, JSON.stringify(pending));
        } catch {}
      }
    };
    document.addEventListener('click', onContentClick, { capture: true });
    return () => document.removeEventListener('click', onContentClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!hasAnyAnalytics) return;

    // İlk sayfa görüntüleme platformların kendi init'i ile gönderilir
    // (GA4: gtag config send_page_view:true; GTM: gtm.js; FB: fbq init).
    // GAViewPages yalnızca sonraki SPA route değişimlerini raporlar → çift sayım olmaz.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      lastAbsUrlRef.current =
        typeof window !== 'undefined'
          ? window.location.origin + (pathname || '/')
          : '';
      return;
    }

    // Simulate current URL
    const nextUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    const send = (url: string) => {
      try {
        if (typeof window === 'undefined') return;
        // NOT: page_view'i onaya göre BURADA engellemiyoruz. Consent Mode v2
        // (AnalyticsScripts'teki gtag consent default 'denied') zaten devrede:
        // onay yokken gtag cookieless/modellenmiş ping gönderir (KVKK/GDPR uyumlu),
        // onay verilince tam ölçüm yapar. Sert JS engeli Consent Mode'u bozuyordu
        // (onaysız sayfalarda etiket hiç ateşlenmiyor → "Etiketli değil").

        const path = (url || '/').split(/[?#]/)[0] || '/';
        const abs = window.location.origin + path;

        if (lastAbsUrlRef.current === abs) return;
        lastAbsUrlRef.current = abs;

        const payload = {
          page_title: document.title,
          page_location: abs,
          page_path: path,
          language: locale,
        };

        // 1) GTM path: push custom event (recommended)
        if (hasGtm) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: getAnalyticsPageViewEventName(),
            ...payload,
          });
        }
        
        // 2) GA4 direct
        else if (hasGa && typeof window.gtag === 'function') {
           window.gtag('event', 'page_view', payload);
        }

        // 3) Facebook Pixel
        if (hasFbPixel && typeof window.fbq === 'function') {
          window.fbq('track', 'PageView');
        }
      } catch (e) {
          // ignore
      }
    };
    
    send(nextUrl);

    // No routeChangeComplete in App Router. The effect itself runs on change.
  }, [pathname, searchParams, hasAnyAnalytics, hasGtm, hasGa, hasFbPixel, locale]);

  return null;
}
