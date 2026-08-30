// =============================================================
// (locale) grubunun ROOT LAYOUT'u (2026-08-30 lang refactor).
// <html lang> artik params.locale'den gelir — statik prerender'da da dogru.
// Eski app/layout.tsx (headers() tabanli lang) kaldirildi; kabuk root-shell.tsx'te.
// =============================================================
import '../../globals.css';
import type { Metadata, Viewport } from 'next';
import { tUi } from '@/i18n/staticUi';

import { Providers } from '../../providers';
import ClientLayout from '../../ClientLayout';
import { RootHtmlShell, buildRootMetadata, buildRootViewport } from '../../root-shell';
import { ThemeProvider } from '@/components/ThemeProvider';
import ScrollAnchorFixer from '@/components/common/ScrollAnchorFixer';
import { buildPageMetadata } from '@/seo/server';
import JsonLd from '@/seo/JsonLd';
import { graph, org, website } from '@/seo/jsonld';
import type { PublicMenuItemDto } from '@/integrations/shared';
import {
  getDefaultContactInfo,
  getDefaultSocialUrls,
  getOrgJsonLdDescription,
  getPlaceholderSameAsUrls,
  getPublicApiBaseUrl,
  getPublicAppName,
  getPublicLogoUrl,
  getPublicSiteOrigin,
} from '@/lib/site-config';
import { WOODY_LOCALES } from '@/components/woody/routes';

const API_BASE = getPublicApiBaseUrl().replace(/\/+$/, '');

async function fetchHeaderMenuItems(locale: string): Promise<PublicMenuItemDto[]> {
  try {
    const url = `${API_BASE}/menu_items?location=header&is_active=true&locale=${encodeURIComponent(locale)}&nested=true`;
    const res = await fetch(url, { next: { revalidate: 60, tags: ['menu_items_header'] } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json?.items ?? json?.data ?? []);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function generateViewport(): Promise<Viewport> {
  return buildRootViewport();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Kok metadata (metadataBase, title template, ikonlar, dogrulamalar) + locale home
  // varsayilanlari. Sayfalarin kendi generateMetadata'lari bunlarin uzerine yazar;
  // title template'i (" | Woody and Friends") kok katmandan gelir.
  const [rootMeta, localeMeta] = await Promise.all([
    buildRootMetadata(),
    buildPageMetadata({
      locale,
      pageKey: 'home',
      pathname: '/',
      fallback: {
        title: tUi(locale, 'Woody and Friends | Preschool English'),
        description:
          tUi(locale, 'Preschool English learning sets, digital content, and teacher support platform.'),
      },
    }),
  ]);
  return {
    ...localeMeta,
    metadataBase: rootMeta.metadataBase,
    manifest: rootMeta.manifest,
    icons: rootMeta.icons,
    verification: rootMeta.verification,
    // title: sablon kok'ten (sayfa basliklarina " | marka" eki), default locale home'dan
    title: {
      default:
        typeof localeMeta.title === 'string'
          ? localeMeta.title
          : (localeMeta.title as { absolute?: string })?.absolute ||
            (rootMeta.title as { default: string }).default,
      template: (rootMeta.title as { template: string }).template,
    },
  };
}

const SITE_URL = getPublicSiteOrigin();
const SITE_LOGO_URL = new URL(getPublicLogoUrl(), SITE_URL).toString();
const BRAND_SAME_AS = Array.from(
  new Set([...getPlaceholderSameAsUrls(), ...Object.values(getDefaultSocialUrls())]),
);

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  // proxy.ts bilinmeyen segmentleri /tr'ye yonlendirir; yine de lang icin sanitize et
  const locale = (WOODY_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : 'tr';
  // SSR fetch: header menu items — hidrasyon mismatch'i önlemek için server'da çekilir
  const initialMenuItems = await fetchHeaderMenuItems(locale);
  const contact = getDefaultContactInfo();

  const jsonLdData = graph([
    org({
      id: `${SITE_URL}/#org`,
      name: getPublicAppName(),
      url: SITE_URL,
      logo: SITE_LOGO_URL,
      sameAs: BRAND_SAME_AS,
      description: getOrgJsonLdDescription(locale),
      ...(contact.phone ? { telephone: contact.phone } : {}),
      ...(contact.email ? { email: contact.email } : {}),
      contactPoint: [
        {
          contactType: 'customer support',
          ...(contact.phone ? { telephone: contact.phone } : {}),
          ...(contact.email ? { email: contact.email } : {}),
          availableLanguage: ['tr', 'en'],
        },
      ],
      areaServed: 'TR',
    }),
    website({
      id: `${SITE_URL}/#website`,
      name: getPublicAppName(),
      url: SITE_URL,
      publisherId: `${SITE_URL}/#org`,
      searchUrlTemplate: `${SITE_URL}/${locale}/blog?q={q}`,
    }),
  ]);

  return (
    <RootHtmlShell lang={locale}>
      <ThemeProvider>
        <div className="font-sans antialiased text-text-primary bg-bg-primary">
          <JsonLd data={jsonLdData} id="site-graph" />
          <ScrollAnchorFixer />
          <Providers>
            {/* Suspense YOK (2026-08-30): children'i sarmak tum sayfalari stream
                ediyor, notFound()/redirect() hep 200 donuyordu (soft-404 fabrikasi).
                useSearchParams ihtiyaci ClientLayout icindeki kucuk Suspense adasinda. */}
            <ClientLayout locale={locale} initialMenuItems={initialMenuItems}>
              {children}
            </ClientLayout>
          </Providers>
        </div>
      </ThemeProvider>
    </RootHtmlShell>
  );
}
