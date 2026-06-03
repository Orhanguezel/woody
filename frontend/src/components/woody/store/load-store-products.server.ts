import 'server-only';

import { getPublicApiBaseUrl } from '@/lib/site-config';
import type { StoreProduct } from './types';

type ApiProduct = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  image_url?: string | null;
  alt?: string | null;
  price?: string | number;
  stock_quantity?: number;
  product_code?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

function toPrice(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(row: unknown): StoreProduct | null {
  const product = row as ApiProduct;
  const id = String(product.id || '').trim();
  const title = String(product.title || '').trim();
  if (!id || !title) return null;
  return {
    id,
    title,
    slug: String(product.slug || id),
    description: String(product.description || '') || undefined,
    image: product.image_url || undefined,
    alt: product.alt || title,
    price: toPrice(product.price),
    currency: 'TRY',
    stock_quantity: product.stock_quantity,
    product_code: product.product_code || undefined,
    meta_title: product.meta_title || undefined,
    meta_description: product.meta_description || undefined,
  };
}

function apiBase() {
  return getPublicApiBaseUrl().replace(/\/+$/, '');
}

export async function loadDbStoreProducts(locale: string): Promise<StoreProduct[]> {
  try {
    const res = await fetch(`${apiBase()}/store/products?locale=${encodeURIComponent(locale)}`, {
      next: { revalidate: 60, tags: ['store_products'] },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows)) return [];
    return rows.map(normalizeProduct).filter((item): item is StoreProduct => Boolean(item));
  } catch {
    return [];
  }
}

export async function loadDbStoreProduct(slug: string, locale: string): Promise<StoreProduct | null> {
  try {
    const res = await fetch(
      `${apiBase()}/store/products/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 60, tags: ['store_products', `store_product_${slug}`] } },
    );
    if (!res.ok) return null;
    return normalizeProduct(await res.json());
  } catch {
    return null;
  }
}
