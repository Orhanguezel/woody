import { notFound, permanentRedirect } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyStoreClient from '@/components/woody/store/WoodyStoreClient';
import WoodyStoreProductDetail from '@/components/woody/store/WoodyStoreProductDetail';
import { findWoodyStoreProduct, loadWoodyPageContent, loadWoodyProducts } from '@/components/woody/content-loader.server';
import { loadDbStoreProduct, loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
import { loadPageContent } from '@/config/pages/loader';
import type { StoreProduct } from '@/components/woody/store/types';
import type { StoreUiCopy } from '@/components/woody/store/types';
import { WOODY_LOCALES } from '@/components/woody/routes';
import { woodyMetadata, woodyProductGraph } from '@/components/woody/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = 'force-dynamic';

const legacyStoreSlugRedirects: Record<string, string> = {
  '1': 'basic-level-set-ogrenci-seti-0001',
  '2': 'junior-level-set-ogrenci-seti-0002',
  '3': 'senior-level-set-ogrenci-seti-0003',
  '7': 'atolye-basic-0007',
  '8': 'atolye-junior-0008',
  '9': 'atolye-senior-0009',
  '10': 'atolye-pro-000a',
  '13': 'home-basic-000d',
  '14': 'home-junior-000e',
  '15': 'home-senior-000f',
  '16': 'home-pro-0010',
};

function ProductSeoSummary({ product, locale }: { product: StoreProduct; locale: string }) {
  const isTr = locale.toLowerCase().startsWith('tr');
  const series = product.seriesName || product.categoryName || (isTr ? 'Woody eğitim serisi' : 'Woody learning series');
  const level = product.levelName || (isTr ? 'kurumun ihtiyacına göre seçilen seviye' : 'the level selected for the institution');
  const contents = product.contents?.length
    ? product.contents
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((content) => content.title)
        .filter(Boolean)
        .slice(0, 6)
    : [];
  const contentList = contents.join(', ');

  if (!isTr) {
    return (
      <section className="bg-white px-6 pb-16">
        <div className="mx-auto max-w-4xl rounded-lg border border-gray-100 bg-gray-50 p-6 text-gray-700 md:p-8">
          <h2 className="text-2xl font-black text-gray-900">Product information</h2>
          <p className="mt-4 leading-8">
            {product.title} is listed as part of the {series}. The page is designed for schools,
            teachers, and institutional buyers who need to evaluate the learning set before requesting a
            quote. Woody and Friends store pages do not publish a fixed online price unless a product is
            explicitly configured for online purchase; the catalogue is quote based so the final scope can
            match class size, level, delivery needs, and implementation model.
          </p>
          <p className="mt-4 leading-8">
            This set belongs to {level}. The product description, visual material, and content list help
            decision makers understand whether the set is suitable for preschool classrooms, small group
            workshops, or individual tutoring. Institutions can use this page to compare the set with
            other Woody levels and then request a tailored proposal from the contact or store form.
          </p>
          <p className="mt-4 leading-8">
            {contentList
              ? `Visible included materials include ${contentList}. `
              : ''}
            The goal is to present a clear educational overview rather than a generic ecommerce product
            page. When pricing data, stock rules, or online checkout are added later, structured product
            offers can be enabled separately without changing the quote based catalogue promise.
          </p>
          <p className="mt-4 leading-8">
            For search engines and AI crawlers, this section keeps the product name, intended use, level,
            purchase model, and contact path visible in server-rendered HTML. That makes the page easier
            to understand even when client-side JavaScript is not executed, while preserving the existing
            no-price catalogue policy.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-6 pb-16">
      <div className="mx-auto max-w-4xl rounded-lg border border-gray-100 bg-gray-50 p-6 text-gray-700 md:p-8">
        <h2 className="text-2xl font-black text-gray-900">Ürün bilgisi</h2>
        <p className="mt-4 leading-8">
          {product.title}, {series} içinde yer alan teklif bazlı bir Woody and Friends ürünüdür.
          Bu sayfa okul yöneticileri, öğretmenler ve kurum satın alma ekipleri ürünün kapsamını
          fiyat bilgisi olmadan değerlendirebilsin diye hazırlanmıştır. Mağaza sabit sepet fiyatı
          yerine sınıf mevcudu, seviye, fiziksel materyal ihtiyacı, dijital erişim ve uygulama
          modeline göre teklif akışı kullanır.
        </p>
        <p className="mt-4 leading-8">
          Ürün {level} için konumlandırılmıştır. Açıklama, görsel ve içerik listesi; anaokulu
          sınıfları, küçük grup atölyeleri veya bireysel özel ders kullanımı arasında doğru seçimi
          yapmaya yardımcı olur. Kurumlar bu sayfayı diğer Woody seviyeleriyle karşılaştırma,
          öğretmen uygulamasını planlama ve mağaza ya da iletişim formu üzerinden özel teklif isteme
          amacıyla kullanabilir.
        </p>
        <p className="mt-4 leading-8">
          {contentList
            ? `Görünen içerik başlıkları arasında ${contentList} bulunur. `
            : ''}
          Amaç klasik bir e-ticaret ürün sayfası yerine eğitim kararını destekleyen net bir katalog
          açıklaması sunmaktır. İleride fiyat, stok ve çevrim içi ödeme verileri eklendiğinde Product
          ve Offer şemaları ayrıca etkinleştirilebilir; mevcut durumda sayfa geçersiz fiyat şeması
          üretmeden ürünü anlaşılır biçimde tanıtır.
        </p>
        <p className="mt-4 leading-8">
          Arama motorları ve yapay zeka tarayıcıları için ürün adı, kullanım amacı, seviye bilgisi,
          teklif modeli ve iletişim yolu sunucu tarafında görünür tutulur. Böylece JavaScript
          çalıştırmayan botlar da sayfanın hangi eğitim setini anlattığını, kimler için uygun olduğunu
          ve kurumun fiyat bilgisini neden teklif sürecinde verdiğini açık biçimde okuyabilir.
        </p>
      </div>
    </section>
  );
}

async function redirectNumericStoreSlug(slug: string, locale: string) {
  if (!/^\d+$/.test(slug)) return;
  const legacyTarget = legacyStoreSlugRedirects[slug];
  if (legacyTarget) permanentRedirect(`/${locale}/store/${legacyTarget}`);
  const index = Number(slug) - 1;
  if (!Number.isInteger(index) || index < 0) return;
  const products = await loadDbStoreProducts(locale);
  const target = products[index];
  if (target?.slug) permanentRedirect(`/${locale}/store/${target.slug}`);
}

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
  await redirectNumericStoreSlug(slug, locale);
  const [dbItem, storeContent, storeProductsConfig] = await Promise.all([
    loadDbStoreProduct(slug, locale),
    loadWoodyPageContent('store', locale),
    loadPageContent<Record<string, any>>('store-products', locale),
  ]);
  const item = dbItem ?? (await findWoodyStoreProduct(slug, locale));
  if (!item) notFound();
  if (item.slug && item.slug !== slug) {
    permanentRedirect(`/${locale}/store/${item.slug}`);
  }
  const pathname = `/store/${item.slug || slug}`;
  const raw = (storeContent?.raw ?? {}) as Record<string, unknown>;
  const rawUi = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;
  // ui etiketleri store-products.json'da tanimli; DB eksiklerini oradan tamamla
  const ui = { ...(storeProductsConfig?.ui ?? {}), ...(rawUi ?? {}) } as StoreUiCopy;
  // Sepet/checkout yalniz showCart aciksa render edilir (teklif-bazli magazada kapali);
  // aksi halde detay sayfasinda bos/bozuk sepet + fiyat gorunuyordu.
  const showCart = Boolean(raw.showCart);
  return (
    <>
      <JsonLd id="woody-store-product" data={woodyProductGraph({ locale, pathname, item })} />
      {dbItem ? (
        <>
          <WoodyStoreProductDetail product={{ ...dbItem, price: undefined as any }} locale={locale} ui={ui} />
          <ProductSeoSummary product={dbItem} locale={locale} />
        </>
      ) : null}
      {showCart && dbItem ? <div id="checkout"><WoodyStoreClient products={[dbItem]} locale={locale} ui={ui} /></div> : null}
    </>
  );
}
