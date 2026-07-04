import type { Metadata } from 'next';

import { buildPageMetadata } from '@/seo/serverMetadata';
import { breadcrumbSchema, faqSchema, graph, localBusiness } from '@/seo/jsonld';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';

import type { WoodyCard, WoodyPageContent } from './content-loader.server';

function parsePrice(value: string | number | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const numeric = raw.replace(/[^\d.,]/g, '');
  if (!numeric) return 0;
  const normalized = numeric.includes(',') && numeric.includes('.')
    ? numeric.replace(/\./g, '').replace(',', '.')
    : numeric.includes(',')
      ? numeric.replace(',', '.')
      : numeric.replace(/\.(?=\d{3}(?:\D|$))/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function woodyMetadata(args: {
  locale: string;
  pageKey: string;
  pathname: string;
  content?: WoodyPageContent | null;
}): Promise<Metadata> {
  return buildPageMetadata({
    locale: args.locale,
    pageKey: args.pageKey,
    pathname: args.pathname,
    fallback: {
      title: args.content?.seo?.title || args.content?.title,
      description: args.content?.seo?.description || args.content?.description,
      ogImage: args.content?.seo?.image,
    },
  });
}

export function woodyPageGraph(args: {
  locale: string;
  pathname: string;
  content: WoodyPageContent;
  schemaType?: 'EducationalOrganization' | 'LocalBusiness';
}) {
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${args.locale}${args.pathname === '/' ? '' : args.pathname}`;
  const crumbs = [
    { name: app, item: `${siteUrl}/${args.locale}` },
    ...(args.pathname === '/' ? [] : [{ name: args.content.title, item: pageUrl }]),
  ];
  const nodes = [breadcrumbSchema(crumbs)];

  if (args.schemaType === 'EducationalOrganization') {
    nodes.push({
      '@type': 'EducationalOrganization',
      '@id': `${pageUrl}#educational-organization`,
      name: args.content.title,
      description: args.content.description,
      url: pageUrl,
      provider: { '@id': `${siteUrl}/#org` },
    });
  }

  if (args.schemaType === 'LocalBusiness') {
    nodes.push(
      localBusiness({
        name: app,
        description: args.content.description || args.content.title,
        url: pageUrl,
      }),
    );
  }

  if (args.content.faq?.length) nodes.push(faqSchema(args.content.faq));

  return graph(nodes);
}

export function woodyProductGraph(args: {
  locale: string;
  pathname: string;
  item: WoodyCard;
}) {
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${args.locale}${args.pathname}`;

  // Teklif-bazli magaza: urunlerde fiyat/gecerli yorum yok -> Product rich snippet
  // icin gereken offers/review/aggregateRating uretilemez. Gecersiz Product node
  // basmak yerine (GSC "Product snippets" hatasi) yalniz BreadcrumbList birakilir.
  return graph([
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${args.locale}` },
      { name: args.item.title, item: pageUrl },
    ]),
  ]);
}

export function woodyStoreListingGraph(args: {
  locale: string;
  pathname: string;
  content: WoodyPageContent;
  items: Array<{
    title?: string;
    name?: string;
    description?: string;
    image?: string;
    price?: string | number;
    currency?: string;
    slug?: string;
    id?: string | number;
  }>;
}) {
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${args.locale}${args.pathname}`;
  // Teklif-bazli magaza: fiyat/gecerli yorum yok -> gecerli Product markup uretilemez.
  // Listeleme sayfasinda Product node basilmaz (GSC Product-snippet hatasi olmasin);
  // yalniz BreadcrumbList birakilir. args.items ileride fiyat eklenirse kullanilacak.
  return graph([
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${args.locale}` },
      { name: args.content.title, item: pageUrl },
    ]),
  ]);
}
