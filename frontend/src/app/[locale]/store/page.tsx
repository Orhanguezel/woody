import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import WoodyStoreClient from '@/components/woody/store/WoodyStoreClient';
import WoodyStoreShowcase from '@/components/woody/store/WoodyStoreShowcase';
import type { StoreCatalog } from '@/components/woody/store/WoodyStoreShowcase';
import { loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
import { loadWoodyPageContent, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyStoreListingGraph } from '@/components/woody/seo';
import { loadPageContent } from '@/config/pages/loader';

const PAGE_KEY = 'store';
const PATHNAME = '/store';

type Props = { params: Promise<{ locale: string }> };

function asStoreCatalog(content: Awaited<ReturnType<typeof loadWoodyPageContent>>, fallback: StoreCatalog | null): StoreCatalog {
  const raw = (content?.raw ?? {}) as Record<string, any>;
  const hero = raw.hero && typeof raw.hero === 'object' ? raw.hero : {};

  return {
    ...(fallback ?? {}),
    quoteWhatsApp: raw.quoteWhatsApp ?? fallback?.quoteWhatsApp,
    quoteMessage: raw.quoteMessage ?? fallback?.quoteMessage,
    primaryCTA: raw.primaryCTA ?? hero.primaryCTA ?? fallback?.primaryCTA,
    showQuoteButtons: raw.showQuoteButtons,
    quoteForm: raw.quoteForm ?? fallback?.quoteForm,
    waitlistForm: raw.waitlistForm ?? fallback?.waitlistForm,
    categories: Array.isArray(raw.categories) ? raw.categories : fallback?.categories,
    products: Array.isArray(raw.products) ? raw.products : fallback?.products,
  };
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function StorePage({ params }: Props) {
  const { locale } = await params;
  const [content, dbProducts, catalog] = await Promise.all([
    loadWoodyPageContent(PAGE_KEY, locale),
    loadDbStoreProducts(locale),
    loadPageContent<StoreCatalog>('store-products', locale),
  ]);
  const fallbackProducts = dbProducts.length ? [] : await loadWoodyProducts('store-products', locale);
  if (!content && !dbProducts.length && !fallbackProducts.length && !catalog?.products?.length) {
    return <WoodyFallback pageKey={PAGE_KEY} />;
  }
  const merged = content ?? { key: PAGE_KEY, title: PAGE_KEY };
  const storeCatalog = asStoreCatalog(content, catalog ?? { products: fallbackProducts as any });
  const showCart = Boolean((content?.raw as any)?.showCart);
  const schemaProducts = dbProducts.length
    ? dbProducts
    : (storeCatalog.products ?? fallbackProducts).map((item: any) => ({
        title: item.title || item.name,
        description: item.description,
        image: item.image,
        price: item.price,
        slug: item.slug,
        id: item.id,
      }));
  return (
    <>
      <JsonLd
        id="woody-store"
        data={woodyStoreListingGraph({ locale, pathname: PATHNAME, content: merged, items: schemaProducts })}
      />
      <WoodyStoreShowcase catalog={storeCatalog} locale={locale} />
      {showCart && dbProducts.length ? <WoodyStoreClient products={dbProducts} locale={locale} /> : null}
    </>
  );
}
