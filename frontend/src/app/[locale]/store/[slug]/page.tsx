import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyPage from '@/components/woody/WoodyPage';
import WoodyStoreClient from '@/components/woody/store/WoodyStoreClient';
import { findWoodyStoreProduct, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { loadDbStoreProduct, loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
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
  const dbItem = await loadDbStoreProduct(slug, locale);
  const item = dbItem ?? (await findWoodyStoreProduct(slug, locale));
  if (!item) notFound();
  const pathname = `/store/${slug}`;
  const content = {
    key: 'store-product',
    title: item.title,
    description: item.description,
    hero: {
      title: item.title,
      description: item.description,
      image: item.image,
      imageAlt: item.title,
    },
    cards: dbItem ? [] : [item],
  };

  return (
    <>
      <JsonLd id="woody-store-product" data={woodyProductGraph({ locale, pathname, item })} />
      <WoodyPage content={content} locale={locale} />
      {dbItem ? <WoodyStoreClient products={[dbItem]} locale={locale} /> : null}
    </>
  );
}
