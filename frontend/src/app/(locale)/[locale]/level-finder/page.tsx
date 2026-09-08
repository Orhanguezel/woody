import { loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
import type { Metadata } from 'next';

import LevelFinderClient from '@/components/woody/level-finder/LevelFinderClient';
import { buildPageMetadata } from '@/seo/serverMetadata';
import { getPublicAppName } from '@/lib/site-config';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const appName = getPublicAppName();
  return buildPageMetadata({
    locale, pageKey: 'level-finder', pathname: '/level-finder',
    fallback: {
      title: locale === 'tr' ? 'Seviye Bulucu' : 'Level Finder',
      description: `${appName} Level Finder ile öğrencinin yaşına ve İngilizce becerilerine göre uygun seviyeyi belirleyin.`,
    },
  });
}

export default async function LevelFinderPage({params}: Props) {
  const {locale} = await params;
  const products = await loadDbStoreProducts(locale);
  return <LevelFinderClient locale={locale} products={products} />;
}
