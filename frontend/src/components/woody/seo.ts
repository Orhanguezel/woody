import type { Metadata } from 'next';

import { buildPageMetadata } from '@/seo/serverMetadata';
import { breadcrumbSchema, faqSchema, graph, localBusiness, product } from '@/seo/jsonld';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';

import type { WoodyCard, WoodyPageContent } from './content-loader.server';

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
  const price = typeof args.item.price === 'number' ? args.item.price : Number(args.item.price || 0);

  return graph([
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${args.locale}` },
      { name: args.item.title, item: pageUrl },
    ]),
    product({
      name: args.item.title,
      description: args.item.description,
      image: args.item.image,
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
