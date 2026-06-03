import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyPage from '@/components/woody/WoodyPage';
import { findWoodyStoreProduct, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { WOODY_LOCALES } from '@/components/woody/routes';
import { woodyMetadata, woodyProductGraph } from '@/components/woody/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const products = await loadWoodyProducts('store-products', 'tr');
  return WOODY_LOCALES.flatMap((locale) =>
    products
      .filter((product) => product.slug)
      .map((product) => ({ locale, slug: product.slug as string })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const item = await findWoodyStoreProduct(slug, locale);
  return woodyMetadata({
    locale,
    pageKey: 'store-product',
    pathname: `/store/${slug}`,
    content: item
      ? {
          key: 'store-product',
          title: item.title,
          description: item.description,
          seo: { title: item.title, description: item.description, image: item.image },
        }
      : null,
  });
}

export default async function StoreProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const item = await findWoodyStoreProduct(slug, locale);
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
    cards: [item],
  };

  return (
    <>
      <JsonLd id="woody-store-product" data={woodyProductGraph({ locale, pathname, item })} />
      <WoodyPage content={content} locale={locale} />
    </>
  );
}
