import 'server-only';

import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';
import type { StoreUiCopy } from '@/components/woody/store/types';
import { loadPageContent } from '@/config/pages/loader';

export type CheckoutCopy = { ui: StoreUiCopy; quoteWhatsApp?: string; quoteMessage?: string };

/** Mağaza/sepet/checkout metinleri: config store-products.json ui taban, DB page_store.ui üstte. */
export async function loadCheckoutCopy(locale: string): Promise<CheckoutCopy> {
  const [content, storeProducts] = await Promise.all([
    loadWoodyPageContent('store', locale),
    loadPageContent<{ ui?: StoreUiCopy; quoteWhatsApp?: string; quoteMessage?: string }>('store-products', locale),
  ]);
  const raw = (content?.raw ?? {}) as Record<string, unknown>;
  const dbUi = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? (raw.ui as StoreUiCopy) : {};
  return {
    ui: { ...(storeProducts?.ui ?? {}), ...dbUi },
    quoteWhatsApp: (raw.quoteWhatsApp as string) || storeProducts?.quoteWhatsApp,
    quoteMessage: (raw.quoteMessage as string) || storeProducts?.quoteMessage,
  };
}

export type PurchasableProduct = {
  productId: string;
  slug: string;
  title: string;
  image?: string;
  unitPrice: number;
  minQuantity: number;
  hasPhysical: boolean;
  seriesName?: string;
  levelName?: string;
};

/** Online satılan, ücretli ürünler (sepetin geçerli olabileceği tek küme). */
export async function loadPurchasableProducts(locale: string): Promise<Record<string, PurchasableProduct>> {
  const products = await loadDbStoreProducts(locale);
  const out: Record<string, PurchasableProduct> = {};
  for (const product of products) {
    const unitPrice = Number(product.price);
    if (product.purchaseMode !== 'online' || product.isFree || !(unitPrice > 0)) continue;
    out[String(product.id)] = {
      productId: String(product.id),
      slug: String(product.slug || product.id),
      title: product.title,
      image: product.image,
      unitPrice,
      minQuantity: Math.max(1, Number(product.minQuantity) || 1),
      hasPhysical: Boolean(product.hasPhysical),
      seriesName: product.seriesName || product.categoryName || undefined,
      levelName: product.levelName || undefined,
    };
  }
  return out;
}
