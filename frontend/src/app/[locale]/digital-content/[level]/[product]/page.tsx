import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyPage from '@/components/woody/WoodyPage';
import { findWoodyDigitalProduct } from '@/components/woody/content-loader.server';
import { WOODY_DIGITAL_LEVELS, WOODY_DIGITAL_PRODUCTS, WOODY_LOCALES } from '@/components/woody/routes';
import { woodyMetadata, woodyProductGraph } from '@/components/woody/seo';

type Props = { params: Promise<{ locale: string; level: string; product: string }> };

export function generateStaticParams() {
  return WOODY_LOCALES.flatMap((locale) =>
    WOODY_DIGITAL_LEVELS.flatMap((level) =>
      WOODY_DIGITAL_PRODUCTS.map((product) => ({ locale, level, product })),
    ),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, level, product } = await params;
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
  const item = await findWoodyDigitalProduct(level, product, locale);
  if (!item) notFound();
  const pathname = `/digital-content/${level}/${product}`;
  const content = {
    key: 'digital-product',
    title: item.title,
    description: item.description,
    hero: {
      eyebrow: item.badge,
      title: item.title,
      description: item.description,
      image: item.image,
      imageAlt: item.title,
    },
    cards: [item],
  };

  return (
    <>
      <JsonLd id="woody-digital-product" data={woodyProductGraph({ locale, pathname, item })} />
      <WoodyPage content={content} locale={locale} />
    </>
  );
}
