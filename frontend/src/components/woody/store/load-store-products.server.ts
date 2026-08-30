import 'server-only';

import { getPublicApiBaseUrl } from '@/lib/site-config';
import type {
  StoreProduct,
  StoreProductContent,
  StoreProductFilters,
  StoreTaxonomy,
  StoreTaxonomyItem,
} from './types';

type ApiProduct = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  videoUrl?: string | null;
  video_url?: string | null;
  alt?: string | null;
  price?: string | number;
  categorySlug?: string | null;
  categoryName?: string | null;
  seriesSlug?: string | null;
  seriesName?: string | null;
  levelSlug?: string | null;
  levelName?: string | null;
  levelRank?: number | null;
  purchaseMode?: 'online' | 'quote';
  isFree?: boolean | number;
  accessDurationDays?: number | null;
  hasPhysical?: boolean | number;
  stock_quantity?: number;
  stockQuantity?: number;
  product_code?: string | null;
  productCode?: string | null;
  meta_title?: string | null;
  metaTitle?: string | null;
  meta_description?: string | null;
  metaDescription?: string | null;
  contents?: unknown[];
};

function toPrice(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toBool(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function toNullableNum(value: unknown) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeContent(row: unknown): StoreProductContent | null {
  const content = row as Record<string, unknown>;
  const id = String(content.id || '').trim();
  const title = String(content.title || '').trim();
  if (!id || !title) return null;
  const kind = content.kind === 'physical' ? 'physical' : 'digital';
  const mediaType = String(content.mediaType || '').trim();
  return {
    id,
    kind,
    mediaType: ['video', 'pdf', 'audio', 'image', 'other'].includes(mediaType)
      ? (mediaType as StoreProductContent['mediaType'])
      : null,
    title,
    description: String(content.description || '') || undefined,
    isPreview: toBool(content.isPreview),
    displayOrder: Number(content.displayOrder) || 0,
  };
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
    image: product.imageUrl || product.image_url || undefined,
    videoUrl: product.videoUrl || product.video_url || undefined,
    alt: product.alt || title,
    price: toPrice(product.price),
    currency: 'TRY',
    categorySlug: product.categorySlug || undefined,
    categoryName: product.categoryName || undefined,
    seriesSlug: product.seriesSlug || undefined,
    seriesName: product.seriesName || undefined,
    levelSlug: product.levelSlug || undefined,
    levelName: product.levelName || undefined,
    levelRank: toNullableNum(product.levelRank),
    purchaseMode: product.purchaseMode === 'quote' ? 'quote' : 'online',
    isFree: toBool(product.isFree),
    accessDurationDays: toNullableNum(product.accessDurationDays),
    hasPhysical: toBool(product.hasPhysical),
    stock_quantity: product.stockQuantity ?? product.stock_quantity,
    product_code: product.productCode || product.product_code || undefined,
    meta_title: product.metaTitle || product.meta_title || undefined,
    meta_description: product.metaDescription || product.meta_description || undefined,
    contents: Array.isArray(product.contents)
      ? product.contents.map(normalizeContent).filter((item): item is StoreProductContent => Boolean(item))
      : undefined,
  };
}

function normalizeTaxonomyItem(row: unknown): StoreTaxonomyItem | null {
  const item = row as Record<string, unknown>;
  const id = String(item.id || '').trim();
  const slug = String(item.slug || '').trim();
  const name = String(item.name || '').trim();
  if (!id || !slug || !name) return null;
  return {
    id,
    code: String(item.code || '') || undefined,
    slug,
    name,
    order: Number(item.order) || 0,
    rank: item.rank == null ? undefined : Number(item.rank) || 0,
  };
}

function apiBase() {
  return getPublicApiBaseUrl().replace(/\/+$/, '');
}

function productsUrl(locale: string, filters?: StoreProductFilters) {
  const params = new URLSearchParams({ locale });
  if (filters?.category) params.set('category', filters.category);
  if (filters?.series) params.set('series', filters.series);
  if (filters?.level) params.set('level', filters.level);
  if (filters?.isFree !== undefined) params.set('isFree', filters.isFree ? '1' : '0');
  return `${apiBase()}/store/products?${params.toString()}`;
}

export async function loadDbStoreTaxonomy(locale: string): Promise<StoreTaxonomy> {
  try {
    const res = await fetch(`${apiBase()}/catalog/taxonomy?locale=${encodeURIComponent(locale)}`, {
      next: { revalidate: 60, tags: ['store_taxonomy'] },
    });
    if (!res.ok) throw new Error('taxonomy_fetch_failed');
    const raw = (await res.json()) as Record<string, unknown>;
    return {
      categories: Array.isArray(raw.categories)
        ? raw.categories.map(normalizeTaxonomyItem).filter((item): item is StoreTaxonomyItem => Boolean(item))
        : [],
      series: Array.isArray(raw.series)
        ? raw.series.map(normalizeTaxonomyItem).filter((item): item is StoreTaxonomyItem => Boolean(item))
        : [],
      levels: Array.isArray(raw.levels)
        ? raw.levels.map(normalizeTaxonomyItem).filter((item): item is StoreTaxonomyItem => Boolean(item))
        : [],
    };
  } catch {
    return { categories: [], series: [], levels: [] };
  }
}

export async function loadDbStoreProducts(locale: string, filters?: StoreProductFilters): Promise<StoreProduct[]> {
  try {
    const res = await fetch(productsUrl(locale, filters), {
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
