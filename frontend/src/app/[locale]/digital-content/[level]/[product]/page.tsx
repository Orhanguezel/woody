import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph } from '@/seo/jsonld';
import DigitalContentDetailClient from '@/components/woody/digital-content/DigitalContentDetailClient';
import {
  getLevelTitle,
  getMusiclandTracks,
  getSectionTitle,
  type DigitalContentCopy,
} from '@/components/woody/digital-content/digital-content-data';
import { findWoodyDigitalProduct, loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { WOODY_DIGITAL_LEVELS, WOODY_DIGITAL_PRODUCTS, WOODY_LOCALES } from '@/components/woody/routes';
import { woodyMetadata, woodyProductGraph } from '@/components/woody/seo';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';

type Props = { params: Promise<{ locale: string; level: string; product: string }> };

async function musiclandMetadata(locale: string, level: string, product: string, copy?: DigitalContentCopy): Promise<Metadata> {
  const levelTitle = getLevelTitle(level, copy);
  const sectionTitle = getSectionTitle(product, copy);
  const tracks = getMusiclandTracks(level, copy);
  const topics = tracks.map((track) => track.topic || track.title).filter(Boolean).slice(0, 4).join(', ');
  const title = `${levelTitle} ${sectionTitle}`;
  const description = topics
    ? `${title}: ${topics}`
    : copy?.sectionLabels?.[product]?.description || title;

  const metadata = await woodyMetadata({
    locale,
    pageKey: 'digital-product',
    pathname: `/digital-content/${level}/${product}`,
    content: {
      key: 'digital-product',
      title,
      description,
      seo: { title, description },
    },
  });
  return {
    ...metadata,
    // Library is intentionally hidden from search until subscription content is ready.
    robots: product === 'library' ? { index: false, follow: false } : { index: true, follow: true },
  };
}

function absoluteAssetUrl(siteUrl: string, value?: string) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function musiclandGraph(locale: string, level: string, product: string, copy?: DigitalContentCopy) {
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${locale}/digital-content/${level}/${product}`;
  const tracks = getMusiclandTracks(level, copy);
  return graph([
    breadcrumbSchema([
      { name: app, item: `${siteUrl}/${locale}` },
      { name: getLevelTitle(level, copy), item: pageUrl },
    ]),
    {
      '@type': 'ItemList',
      name: `${getLevelTitle(level, copy)} ${getSectionTitle(product, copy)}`,
      itemListElement: tracks.map((track, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicRecording',
          name: track.title,
          inLanguage: 'en',
          ...(track.audioUrl ? { url: absoluteAssetUrl(siteUrl, track.audioUrl) } : {}),
          ...(track.thumbnail ? { image: absoluteAssetUrl(siteUrl, track.thumbnail) } : {}),
        },
      })),
    },
  ]);
}

export function generateStaticParams() {
  return WOODY_LOCALES.flatMap((locale) =>
    WOODY_DIGITAL_LEVELS.flatMap((level) =>
      WOODY_DIGITAL_PRODUCTS.map((product) => ({ locale, level, product })),
    ),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, level, product } = await params;
  const digitalContent = await loadWoodyPageContent('digital-content', locale);
  const copy = digitalContent?.raw as DigitalContentCopy | undefined;
  if (product === 'musicland' || product === 'library') return musiclandMetadata(locale, level, product, copy);

  const item = await findWoodyDigitalProduct(level, product, locale);
  return woodyMetadata({
    locale,
    pageKey: 'digital-product',
    pathname: `/digital-content/${level}/${product}`,
    content: item
      ? {
          key: 'digital-product',
          title: item.title,
          description: item.description,
          seo: { title: item.title, description: item.description, image: item.image },
        }
      : null,
  });
}

export default async function DigitalProductPage({ params }: Props) {
  const { locale, level, product } = await params;
  const digitalContent = await loadWoodyPageContent('digital-content', locale);
  const copy = digitalContent?.raw as DigitalContentCopy | undefined;
  const item = await findWoodyDigitalProduct(level, product, locale);
  if (!item && product !== 'musicland' && product !== 'library') notFound();
  const pathname = `/digital-content/${level}/${product}`;

  return (
    <>
      {product === 'musicland' ? (
        <JsonLd id="woody-digital-musicland" data={musiclandGraph(locale, level, product, copy)} />
      ) : item ? (
        <JsonLd id="woody-digital-product" data={woodyProductGraph({ locale, pathname, item })} />
      ) : null}
      <DigitalContentDetailClient locale={locale} level={level} section={product} copy={copy} />
    </>
  );
}
