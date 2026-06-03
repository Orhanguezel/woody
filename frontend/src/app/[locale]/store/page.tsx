import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import WoodyPage from '@/components/woody/WoodyPage';
import { loadWoodyPageContent, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';

const PAGE_KEY = 'store';
const PATHNAME = '/store';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function StorePage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  const products = await loadWoodyProducts('store-products', locale);
  if (!content && !products.length) return <WoodyFallback pageKey={PAGE_KEY} />;
  const merged = content ?? { key: PAGE_KEY, title: PAGE_KEY };
  return (
    <>
      <JsonLd id="woody-store" data={woodyPageGraph({ locale, pathname: PATHNAME, content: merged })} />
      <WoodyPage content={{ ...merged, products }} locale={locale} />
    </>
  );
}
