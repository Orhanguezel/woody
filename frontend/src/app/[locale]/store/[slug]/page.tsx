import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyStoreClient from '@/components/woody/store/WoodyStoreClient';
import WoodyStoreProductDetail from '@/components/woody/store/WoodyStoreProductDetail';
import { findWoodyStoreProduct, loadWoodyPageContent, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { loadDbStoreProduct, loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
import type { StoreUiCopy } from '@/components/woody/store/types';
import { WOODY_LOCALES } from '@/components/woody/routes';
import { woodyMetadata, woodyProductGraph } from '@/components/woody/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const dbProducts = await loadDbStoreProducts('tr');
  const products = dbProducts.length ? dbProducts : await loadWoodyProducts('store-products', 'tr');
  return WOODY_LOCALES.flatMap((locale) =>
    products
      .filter((product) => product.slug)
      .map((product) => ({ locale, slug: product.slug as string })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const item = (await loadDbStoreProduct(slug, locale)) ?? (await findWoodyStoreProduct(slug, locale));
  return woodyMetadata({
    locale,
    pageKey: 'store-product',
    pathname: `/store/${slug}`,
    content: item
      ? {
          key: 'store-product',
          title: item.title,
          description: item.description,
          seo: {
            title: 'meta_title' in item && item.meta_title ? item.meta_title : item.title,
            description:
              'meta_description' in item && item.meta_description
                ? item.meta_description
                : item.description,
            image: item.image,
          },
        }
      : null,
  });
}

export default async function StoreProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const [dbItem, storeContent] = await Promise.all([
    loadDbStoreProduct(slug, locale),
    loadWoodyPageContent('store', locale),
  ]);
  const item = dbItem ?? (await findWoodyStoreProduct(slug, locale));
  if (!item) notFound();
  const pathname = `/store/${slug}`;
  const raw = (storeContent?.raw ?? {}) as Record<string, unknown>;
  const ui = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;
  return (
    <>
      <JsonLd id="woody-store-product" data={woodyProductGraph({ locale, pathname, item })} />
      {dbItem ? <WoodyStoreProductDetail product={dbItem} locale={locale} ui={ui} /> : null}
      {dbItem ? <div id="checkout"><WoodyStoreClient products={[dbItem]} locale={locale} ui={ui} /></div> : null}
    </>
  );
}
