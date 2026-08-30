import JsonLd from '@/seo/JsonLd';
import WoodyStoreClient from '@/components/woody/store/WoodyStoreClient';
import WoodyStoreShowcase from '@/components/woody/store/WoodyStoreShowcase';
import type { StoreCatalog } from '@/components/woody/store/WoodyStoreShowcase';
import { loadDbStoreProducts, loadDbStoreTaxonomy } from '@/components/woody/store/load-store-products.server';
import type { StoreProduct, StoreProductFilters, StoreTaxonomy, StoreUiCopy } from '@/components/woody/store/types';
import { loadWoodyPageContent, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyStoreListingGraph } from '@/components/woody/seo';
import { loadPageContent } from '@/config/pages/loader';

const PAGE_KEY = 'store';
const PATHNAME = '/store';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; series?: string; level?: string; isFree?: string }>;
};

function asStoreCatalog(content: Awaited<ReturnType<typeof loadWoodyPageContent>>, fallback: StoreCatalog | null): StoreCatalog {
  const raw = (content?.raw ?? {}) as Record<string, any>;
  const hero = raw.hero && typeof raw.hero === 'object' ? raw.hero : {};
  const ui = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;

  return {
    ...(fallback ?? {}),
    ui: ui ?? fallback?.ui,
    quoteWhatsApp: raw.quoteWhatsApp ?? fallback?.quoteWhatsApp,
    quoteMessage: raw.quoteMessage ?? fallback?.quoteMessage,
    primaryCTA: raw.primaryCTA ?? hero.primaryCTA ?? fallback?.primaryCTA,
    showQuoteButtons: raw.showQuoteButtons,
    quoteForm: raw.quoteForm ?? fallback?.quoteForm,
    waitlistForm: raw.waitlistForm ?? fallback?.waitlistForm,
    categories: fallback?.categories,
    products: fallback?.products,
  };
}

function money(value: number) {
  // PDF revizyonu (2026-08-30): fiyat bicimi "3.000 TL"
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value)} TL`;
}

function readFilters(raw: Awaited<Props['searchParams']>): StoreProductFilters {
  const filters: StoreProductFilters = {};
  if (raw.category) filters.category = raw.category;
  if (raw.series) filters.series = raw.series;
  if (raw.level) filters.level = raw.level;
  if (raw.isFree === '1' || raw.isFree === 'true') filters.isFree = true;
  if (raw.isFree === '0' || raw.isFree === 'false') filters.isFree = false;
  return filters;
}

function catalogFromDb(taxonomy: StoreTaxonomy, products: StoreProduct[]): Pick<StoreCatalog, 'categories' | 'series' | 'levels' | 'products'> {
  // S6 (2026-08-30): Okul Serisi store'dan kaldirildi — urunu olmayan okul-serisi
  // kategorisi filtrede de "yakinda" kartinda da gorunmez; okul sayfasindan ulasilir.
  const visibleCategories = taxonomy.categories.filter(
    (category) => category.slug !== 'okul-serisi' || products.some((p) => p.categorySlug === 'okul-serisi'),
  );
  return {
    categories: visibleCategories.map((category) => ({
      id: category.slug,
      name: category.name,
      route:
        category.slug === 'okul-serisi'
          ? '/preschool'
          : category.slug === 'atolye-serisi'
            ? '/workshop'
            : category.slug === 'ev-ozel-ders-serisi'
              ? '/home-tutor'
              : undefined,
    })),
    series: taxonomy.series,
    levels: taxonomy.levels,
    products: products.map((product) => ({
      id: product.id,
      category: product.categorySlug || '',
      name: product.title,
      slug: product.slug,
      description: product.description,
      price: product.isFree ? undefined : money(product.price),
      image: product.image,
      videoUrl: product.videoUrl,
      alt: product.alt,
      seriesSlug: product.seriesSlug,
      seriesName: product.seriesName,
      levelSlug: product.levelSlug,
      levelName: product.levelName,
      purchaseMode: product.purchaseMode,
      isFree: product.isFree,
      hasPhysical: product.hasPhysical,
    })),
  };
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function StorePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = readFilters(await searchParams);
  const [content, taxonomy, dbProducts, catalog, storeConfig] = await Promise.all([
    loadWoodyPageContent(PAGE_KEY, locale),
    loadDbStoreTaxonomy(locale),
    // TUM urunler (filtresiz) — filtreleme + faceting client-side WoodyStoreShowcase'te
    loadDbStoreProducts(locale),
    loadPageContent<StoreCatalog>('store-products', locale),
    loadPageContent<Record<string, any>>('store', locale),
  ]);
  const fallbackProducts = dbProducts.length ? [] : await loadWoodyProducts('store-products', locale);
  const merged = content ?? { key: PAGE_KEY, title: PAGE_KEY };
  const dbCatalog = dbProducts.length || taxonomy.categories.length ? catalogFromDb(taxonomy, dbProducts) : null;
  const storeCatalog = asStoreCatalog(content, dbCatalog ?? catalog ?? { products: fallbackProducts as any });
  // DB page_store eksik olabilir (orn. tr quoteForm icermiyor) -> config store.json kopyasindan tamamla
  storeCatalog.quoteForm = storeCatalog.quoteForm ?? storeConfig?.quoteForm;
  // ui store-products.json'da tanimli; DB/dbCatalog eksik anahtarlari oradan tamamla
  storeCatalog.ui = { ...((catalog as any)?.ui ?? {}), ...(storeConfig?.ui ?? {}), ...(storeCatalog.ui ?? {}) };
  storeCatalog.quoteWhatsApp = storeCatalog.quoteWhatsApp ?? storeConfig?.quoteWhatsApp;
  storeCatalog.quoteMessage = storeCatalog.quoteMessage ?? storeConfig?.quoteMessage;
  // S3 (2026-08-30): online satilan urunlerde fiyat gorunur; teklif-bazlilarda gizli kalir
  if (Array.isArray(storeCatalog.products)) {
    storeCatalog.products = storeCatalog.products.map((p: any) =>
      p.purchaseMode === 'online' && !p.isFree ? p : { ...p, price: undefined },
    );
  }
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
        data={woodyStoreListingGraph({ locale, pathname: PATHNAME, content: merged, items: schemaProducts.map((p: any) => ({ ...p, price: undefined })) })}
      />
      <WoodyStoreShowcase catalog={storeCatalog} locale={locale} filters={filters} />
      {showCart && dbProducts.length ? <WoodyStoreClient products={dbProducts} locale={locale} ui={storeCatalog.ui} /> : null}
    </>
  );
}
