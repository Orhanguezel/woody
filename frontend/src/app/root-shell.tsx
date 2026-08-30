// =============================================================
// FILE: src/app/root-shell.tsx
// Cift root layout icin ortak <html> kabugu + kok metadata/viewport ureticileri.
// (2026-08-30 lang refactor: <html lang> artik headers()'tan DEGIL, layout'un
// kendi locale bilgisinden gelir — statik prerender'da da dogru cikar.
// headers() KULLANMA: generateStaticParams'li segmentlerde DYNAMIC_SERVER_USAGE 500.)
// =============================================================
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { brandFontVariableClassName } from '@/lib/fonts/brand-fonts';
import { fetchSetting } from '@/i18n/server';
import { fetchDesignTokens } from '@/lib/tokens/fetchTokens.server';
import { detectThemeMode } from '@/lib/tokens/detectThemeMode';
import {
  getDefaultTokenBranding,
  getDefaultBingSiteVerification,
  getPublicSiteOrigin,
  getRootLayoutTitleDefault,
  getRootLayoutTitleTemplate,
} from '@/lib/site-config';

export async function buildRootViewport(): Promise<Viewport> {
  let themeColor = getDefaultTokenBranding().theme_color;
  try {
    const row = await fetchSetting('design_tokens', '*', { revalidate: 300 });
    const raw = row?.value;
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    themeColor =
      obj?.branding?.theme_color || obj?.colors?.brand_primary || themeColor;
  } catch {
    // fallback to brand default
  }
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor,
  };
}

function extractUrl(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') {
    const s = val.trim();
    if (s.startsWith('{')) {
      try { return (JSON.parse(s) as { url?: string }).url || ''; } catch { return s; }
    }
    return s;
  }
  if (typeof val === 'object') return String((val as { url?: string }).url || '');
  return '';
}

/** Kok metadata: metadataBase, title template, manifest, ikonlar, site dogrulamalari. */
export async function buildRootMetadata(): Promise<Metadata> {
  const favicon = await fetchSetting('site_favicon', '*');
  const faviconUrl = extractUrl(favicon?.value) || '/favicon.svg';

  const appleTouch = await fetchSetting('site_apple_touch_icon', '*');
  const appleTouchUrl = extractUrl(appleTouch?.value) || faviconUrl;

  const gscVerification = await fetchSetting('google_site_verification', '*');
  const gscCode = String(gscVerification?.value || '').trim();
  const bingVerification = await fetchSetting('bing_site_verification', '*');
  const bingCode = String(
    process.env.BING_SITE_VERIFICATION ||
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
    bingVerification?.value ||
    getDefaultBingSiteVerification() ||
    '',
  ).trim();

  const metadata: Metadata = {
    metadataBase: new URL(getPublicSiteOrigin()),
    title: {
      default: getRootLayoutTitleDefault(),
      template: getRootLayoutTitleTemplate(),
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: appleTouchUrl,
    },
  };

  if (gscCode) {
    metadata.verification = { google: gscCode };
  }

  if (bingCode) {
    metadata.verification = {
      ...metadata.verification,
      other: {
        ...(metadata.verification?.other || {}),
        'msvalidate.01': bingCode,
      },
    };
  }

  return metadata;
}

/** Ortak <html> kabugu — lang cagiran layout'tan gelir (params.locale ya da varsayilan). */
export async function RootHtmlShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  // Tema mode'u design_tokens içindeki bg_base luminance'ından hesapla (preset'ten gelir).
  // Kullanıcı manuel toggle yaparsa client-side override eder (localStorage).
  const tokens = await fetchDesignTokens();
  const themeMode = detectThemeMode(tokens);
  return (
    <html
      lang={lang}
      data-theme={themeMode}
      data-scroll-behavior="smooth"
      className={brandFontVariableClassName}
      suppressHydrationWarning
    >
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
