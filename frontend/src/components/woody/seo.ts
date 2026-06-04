import type { Metadata } from 'next';

import { buildPageMetadata } from '@/seo/serverMetadata';
import { breadcrumbSchema, faqSchema, graph, localBusiness, product } from '@/seo/jsonld';
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

function absolutize(url: string | undefined, siteUrl: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl}${url.startsWith('/') ? url : `/${url}`}`;
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
  const price = parsePrice(args.item.price);

  return graph([
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${args.locale}` },
      { name: args.item.title, item: pageUrl },
    ]),
    product({
      name: args.item.title,
      description: args.item.description,
      image: absolutize(args.item.image, siteUrl),
      brand: app,
      offers: Number.isFinite(price) && price > 0
        ? {
            price,
            priceCurrency: args.item.currency || 'TRY',
            availability: 'https://schema.org/InStock',
            url: pageUrl,
          }
        : undefined,
    }),
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
  const nodes = [
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${args.locale}` },
      { name: args.content.title, item: pageUrl },
    ]),
  ];

  for (const item of args.items) {
    const name = item.title || item.name;
    if (!name) continue;
    const price = parsePrice(item.price);
    const itemUrl = item.slug ? `${siteUrl}/${args.locale}/store/${encodeURIComponent(item.slug)}` : pageUrl;
    nodes.push(
      product({
        name,
        description: item.description,
        image: absolutize(item.image, siteUrl),
        sku: String(item.id || item.slug || name),
        brand: app,
        offers: price > 0
          ? {
              price,
              priceCurrency: item.currency || 'TRY',
              availability: 'https://schema.org/InStock',
              url: itemUrl,
            }
          : undefined,
      }),
    );
  }

  return graph(nodes);
}
