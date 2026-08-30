import type { Metadata } from 'next';
import { tUi } from '@/i18n/staticUi';


import { Providers } from '../providers';
import ClientLayout from '../ClientLayout';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pageKey: 'home',
    pathname: '/',
    fallback: {
      title: tUi(locale, 'Woody and Friends | Preschool English'),
      description:
        tUi(locale, 'Preschool English learning sets, digital content, and teacher support platform.'),
    },
  });
}

const SITE_URL = getPublicSiteOrigin();
const SITE_LOGO_URL = new URL(getPublicLogoUrl(), SITE_URL).toString();
const BRAND_SAME_AS = Array.from(
  new Set([...getPlaceholderSameAsUrls(), ...Object.values(getDefaultSocialUrls())]),
);

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
    <ThemeProvider>
      <div className="font-sans antialiased text-text-primary bg-bg-primary">
        <JsonLd data={jsonLdData} id="site-graph" />
        <ScrollAnchorFixer />
        <Providers>
          {/* Suspense KALDIRILDI (2026-08-30): children'i sarmak tum sayfalari stream
              ediyor, notFound()/redirect() hep 200 donuyordu (soft-404 fabrikasi).
              useSearchParams ihtiyaci ClientLayout icindeki kucuk Suspense adasinda. */}
          <ClientLayout locale={locale} initialMenuItems={initialMenuItems}>
            {children}
          </ClientLayout>
        </Providers>
      </div>
    </ThemeProvider>
  );
}
