// =============================================================
// FILE: src/integrations/shared/products.ts
// Product admin types + normalizers
// =============================================================

export type ProductItemType = 'product' | 'sparepart' | 'bereketfide';

export type ProductAdminView = {
  id: string;
  item_type: ProductItemType;
  category_id: string;
  sub_category_id: string | null;
  category_name: string | null;
  price: number;
  image_url: string | null;
  images: string[];
  storage_asset_id: string | null;
  storage_image_ids: string[];
  is_active: boolean;
  is_featured: boolean;
  order_num: number;
  product_code: string | null;
  stock_quantity: number;
  rating: number;
  review_count: number;
  locale: string;
  title: string;
  slug: string;
  description: string | null;
  alt: string | null;
  tags: string[];
  specifications: Record<string, string> | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
  locale: string;
  module_key: string | null;
};

export type ProductSubcategoryOption = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  locale: string;
};

export type ProductsListQuery = {
  locale?: string;
  q?: string;
  category_id?: string;
  sub_category_id?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
  sort?: 'order_num' | 'price' | 'rating' | 'created_at';
  order?: 'asc' | 'desc';
};

export type ProductUpsertBody = {
  locale?: string;
  item_type?: ProductItemType;
  title: string;
  slug: string;
  description?: string | null;
  alt?: string | null;
  tags?: string[];
  specifications?: Record<string, string>;
  price: number;
  category_id: string;
  sub_category_id?: string | null;
  image_url?: string | null;
  images?: string[];
  storage_asset_id?: string | null;
  storage_image_ids?: string[];
  is_active?: 0 | 1;
  is_featured?: 0 | 1;
  product_code?: string | null;
  stock_quantity?: number;
  order_num?: number;
  meta_title?: string | null;
  meta_description?: string | null;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableStr(value: unknown) {
  const s = toStr(value);
  return s ? s : null;
}

function toNum(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value: unknown) {
  if (typeof value === 'boolean') return value;
  return value === 1 || value === '1' || value === 'true';
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => toStr(item)).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => toStr(item)).filter(Boolean);
    } catch {
      // Comma-separated tags are also accepted for quick admin entry.
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toSpecifications(value: unknown): Record<string, string> | null {
  if (!value) return null;
  const parsed = typeof value === 'string' ? safeJson(value) : value;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
    const cleanKey = toStr(key);
    const cleanVal = toStr(val);
    if (cleanKey && cleanVal) out[cleanKey] = cleanVal;
  }
  return Object.keys(out).length ? out : null;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toItemType(value: unknown): ProductItemType {
  const s = toStr(value);
  if (s === 'sparepart' || s === 'bereketfide') return s;
  return 'product';
}

export function normalizeProductAdmin(raw: unknown): ProductAdminView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    item_type: toItemType(r.item_type),
    category_id: toStr(r.category_id),
    sub_category_id: toNullableStr(r.sub_category_id),
    category_name: toNullableStr(r.category_name),
    price: toNum(r.price),
    image_url: toNullableStr(r.image_url),
    images: toStringArray(r.images),
    storage_asset_id: toNullableStr(r.storage_asset_id),
    storage_image_ids: toStringArray(r.storage_image_ids),
    is_active: toBool(r.is_active),
    is_featured: toBool(r.is_featured),
    order_num: toNum(r.order_num),
    product_code: toNullableStr(r.product_code),
    stock_quantity: toNum(r.stock_quantity),
    rating: toNum(r.rating, 5),
    review_count: toNum(r.review_count),
    locale: toStr(r.locale || 'tr') || 'tr',
    title: toStr(r.title),
    slug: toStr(r.slug),
    description: toNullableStr(r.description),
    alt: toNullableStr(r.alt),
    tags: toStringArray(r.tags),
    specifications: toSpecifications(r.specifications),
    meta_title: toNullableStr(r.meta_title),
    meta_description: toNullableStr(r.meta_description),
    created_at: toNullableStr(r.created_at),
    updated_at: toNullableStr(r.updated_at),
  };
}

export function normalizeProductCategoryOption(raw: unknown): ProductCategoryOption {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    name: toStr(r.name),
    slug: toStr(r.slug),
    locale: toStr(r.locale || 'tr') || 'tr',
    module_key: toNullableStr(r.module_key),
  };
}

export function normalizeProductSubcategoryOption(raw: unknown): ProductSubcategoryOption {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    name: toStr(r.name),
    slug: toStr(r.slug),
    category_id: toStr(r.category_id),
    locale: toStr(r.locale || 'tr') || 'tr',
  };
}

export function toProductsListParams(query: ProductsListQuery): Record<string, unknown> {
  const params: Record<string, unknown> = { item_type: 'product' };
  if (query.locale) params.locale = query.locale;
  if (query.q) params.q = query.q;
  if (query.category_id) params.category_id = query.category_id;
  if (query.sub_category_id) params.sub_category_id = query.sub_category_id;
  if (query.is_active !== undefined) params.is_active = query.is_active ? 1 : 0;
  if (query.limit) params.limit = query.limit;
  if (query.offset) params.offset = query.offset;
  if (query.sort) params.sort = query.sort;
  if (query.order) params.order = query.order;
  return params;
}
