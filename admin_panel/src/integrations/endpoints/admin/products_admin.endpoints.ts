// =============================================================
// FILE: src/integrations/endpoints/admin/products_admin.endpoints.ts
// Product admin RTK Query endpoints
// =============================================================

import { baseApi } from '@/integrations/baseApi';
import type {
  ProductAdminView,
  ProductCategoryOption,
  ProductsListQuery,
  ProductSubcategoryOption,
  ProductUpsertBody,
} from '@/integrations/shared';
import {
  normalizeProductAdmin,
  normalizeProductCategoryOption,
  normalizeProductSubcategoryOption,
  toProductsListParams,
} from '@/integrations/shared';

const BASE = '/admin/products';

export type CatalogTaxonomyAdminView = {
  id: string;
  code: string;
  display_order: number;
  is_active: boolean;
  rank?: number;
  locale?: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type CatalogTaxonomyUpsertBody = {
  code?: string;
  display_order?: number;
  rank?: number;
  is_active?: boolean | 0 | 1;
  locale?: string;
  name?: string;
  slug?: string;
  description?: string | null;
};

export type ProductContentAdminView = {
  id: string;
  productId: string;
  kind: 'digital' | 'physical';
  mediaType: 'video' | 'pdf' | 'audio' | 'image' | 'other' | null;
  storageAssetId: string | null;
  externalUrl: string | null;
  isPreview: boolean;
  displayOrder: number;
  isActive: boolean;
  locale: string;
  title: string;
  description: string | null;
};

export type ProductContentUpsertBody = {
  kind?: 'digital' | 'physical';
  media_type?: 'video' | 'pdf' | 'audio' | 'image' | 'other' | null;
  storage_asset_id?: string | null;
  external_url?: string | null;
  is_preview?: boolean | 0 | 1;
  display_order?: number;
  is_active?: boolean | 0 | 1;
  locale?: string;
  title?: string;
  description?: string | null;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toBool(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function normalizeTaxonomy(raw: unknown): CatalogTaxonomyAdminView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    code: toStr(r.code),
    display_order: Number(r.display_order) || 0,
    is_active: toBool(r.is_active),
    rank: r.rank == null ? undefined : Number(r.rank) || 0,
    locale: toStr(r.locale || 'tr') || 'tr',
    name: toStr(r.name),
    slug: toStr(r.slug),
    description: toStr(r.description) || null,
  };
}

function normalizeContent(raw: unknown): ProductContentAdminView {
  const r = (raw ?? {}) as Record<string, unknown>;
  const kind = toStr(r.kind) === 'physical' ? 'physical' : 'digital';
  const media = toStr(r.mediaType);
  return {
    id: toStr(r.id),
    productId: toStr(r.productId),
    kind,
    mediaType: ['video', 'pdf', 'audio', 'image', 'other'].includes(media) ? (media as any) : null,
    storageAssetId: toStr(r.storageAssetId) || null,
    externalUrl: toStr(r.externalUrl) || null,
    isPreview: toBool(r.isPreview),
    displayOrder: Number(r.displayOrder) || 0,
    isActive: toBool(r.isActive),
    locale: toStr(r.locale || 'tr') || 'tr',
    title: toStr(r.title),
    description: toStr(r.description) || null,
  };
}

export const productsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listProductsAdmin: b.query<ProductAdminView[], ProductsListQuery | undefined>({
      query: (params) => ({
        url: BASE,
        method: 'GET',
        params: params ? toProductsListParams(params) : { item_type: 'product' },
      }),
      transformResponse: (res: unknown) =>
        Array.isArray(res) ? res.map(normalizeProductAdmin) : [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((product) => ({ type: 'Product' as const, id: product.id })),
              { type: 'Products' as const, id: 'LIST' },
            ]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    getProductAdmin: b.query<ProductAdminView, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'GET',
        params: { item_type: 'product', ...(locale ? { locale } : {}) },
      }),
      transformResponse: normalizeProductAdmin,
      providesTags: (_r, _e, arg) => [{ type: 'Product' as const, id: arg.id }],
    }),

    createProductAdmin: b.mutation<ProductAdminView, ProductUpsertBody>({
      query: (body) => ({ url: BASE, method: 'POST', body: { ...body, item_type: 'product' } }),
      transformResponse: normalizeProductAdmin,
      invalidatesTags: [{ type: 'Products' as const, id: 'LIST' }],
    }),

    updateProductAdmin: b.mutation<
      ProductAdminView,
      { id: string; body: Partial<ProductUpsertBody> }
    >({
      query: ({ id, body }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body: { ...body, item_type: 'product' },
      }),
      transformResponse: normalizeProductAdmin,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Product' as const, id: arg.id },
        { type: 'Products' as const, id: 'LIST' },
      ],
    }),

    deleteProductAdmin: b.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `${BASE}/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Products' as const, id: 'LIST' }],
    }),

    listProductCategoriesAdmin: b.query<ProductCategoryOption[], { locale?: string } | undefined>({
      query: (params) => ({
        url: `${BASE}/categories`,
        method: 'GET',
        params: { locale: params?.locale ?? 'tr', module_key: 'store', is_active: 1 },
      }),
      transformResponse: (res: unknown) =>
        Array.isArray(res) ? res.map(normalizeProductCategoryOption) : [],
      providesTags: [{ type: 'Categories' as const, id: 'PRODUCT_OPTIONS' }],
    }),

    listProductSubcategoriesAdmin: b.query<
      ProductSubcategoryOption[],
      { categoryId?: string; locale?: string } | undefined
    >({
      query: (params) => ({
        url: `${BASE}/subcategories`,
        method: 'GET',
        params: {
          locale: params?.locale ?? 'tr',
          is_active: 1,
          ...(params?.categoryId ? { category_id: params.categoryId } : {}),
        },
      }),
      transformResponse: (res: unknown) =>
        Array.isArray(res) ? res.map(normalizeProductSubcategoryOption) : [],
      providesTags: [{ type: 'SubCategories' as const, id: 'PRODUCT_OPTIONS' }],
    }),

    listSeriesAdmin: b.query<CatalogTaxonomyAdminView[], { locale?: string } | undefined>({
      query: (params) => ({ url: '/admin/series', method: 'GET', params }),
      transformResponse: (res: unknown) => Array.isArray(res) ? res.map(normalizeTaxonomy) : [],
      providesTags: [{ type: 'Products' as const, id: 'SERIES' }],
    }),

    getSeriesAdmin: b.query<CatalogTaxonomyAdminView, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({ url: `/admin/series/${encodeURIComponent(id)}`, method: 'GET', params: { locale } }),
      transformResponse: normalizeTaxonomy,
      providesTags: (_r, _e, arg) => [{ type: 'Products' as const, id: `SERIES-${arg.id}` }],
    }),

    createSeriesAdmin: b.mutation<CatalogTaxonomyAdminView, CatalogTaxonomyUpsertBody>({
      query: (body) => ({ url: '/admin/series', method: 'POST', body }),
      invalidatesTags: [{ type: 'Products' as const, id: 'SERIES' }],
    }),

    updateSeriesAdmin: b.mutation<CatalogTaxonomyAdminView, { id: string; body: CatalogTaxonomyUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/series/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Products' as const, id: 'SERIES' }, { type: 'Products' as const, id: `SERIES-${arg.id}` }],
    }),

    deleteSeriesAdmin: b.mutation<{ ok: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/series/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Products' as const, id: 'SERIES' }],
    }),

    listLevelsAdmin: b.query<CatalogTaxonomyAdminView[], { locale?: string } | undefined>({
      query: (params) => ({ url: '/admin/levels', method: 'GET', params }),
      transformResponse: (res: unknown) => Array.isArray(res) ? res.map(normalizeTaxonomy) : [],
      providesTags: [{ type: 'Products' as const, id: 'LEVELS' }],
    }),

    getLevelAdmin: b.query<CatalogTaxonomyAdminView, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({ url: `/admin/levels/${encodeURIComponent(id)}`, method: 'GET', params: { locale } }),
      transformResponse: normalizeTaxonomy,
      providesTags: (_r, _e, arg) => [{ type: 'Products' as const, id: `LEVEL-${arg.id}` }],
    }),

    createLevelAdmin: b.mutation<CatalogTaxonomyAdminView, CatalogTaxonomyUpsertBody>({
      query: (body) => ({ url: '/admin/levels', method: 'POST', body }),
      invalidatesTags: [{ type: 'Products' as const, id: 'LEVELS' }],
    }),

    updateLevelAdmin: b.mutation<CatalogTaxonomyAdminView, { id: string; body: CatalogTaxonomyUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/levels/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Products' as const, id: 'LEVELS' }, { type: 'Products' as const, id: `LEVEL-${arg.id}` }],
    }),

    deleteLevelAdmin: b.mutation<{ ok: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/levels/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Products' as const, id: 'LEVELS' }],
    }),

    listProductContentsAdmin: b.query<ProductContentAdminView[], { productId: string; locale?: string }>({
      query: ({ productId, locale }) => ({
        url: `${BASE}/${encodeURIComponent(productId)}/contents`,
        method: 'GET',
        params: { locale },
      }),
      transformResponse: (res: unknown) => Array.isArray(res) ? res.map(normalizeContent) : [],
      providesTags: (_r, _e, arg) => [{ type: 'Product' as const, id: `${arg.productId}-contents` }],
    }),

    createProductContentAdmin: b.mutation<{ id: string; productId: string }, { productId: string; body: ProductContentUpsertBody }>({
      query: ({ productId, body }) => ({ url: `${BASE}/${encodeURIComponent(productId)}/contents`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Product' as const, id: `${arg.productId}-contents` }],
    }),

    updateProductContentAdmin: b.mutation<{ ok: boolean }, { productId: string; contentId: string; body: ProductContentUpsertBody }>({
      query: ({ productId, contentId, body }) => ({
        url: `${BASE}/${encodeURIComponent(productId)}/contents/${encodeURIComponent(contentId)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Product' as const, id: `${arg.productId}-contents` }],
    }),

    deleteProductContentAdmin: b.mutation<{ ok: boolean }, { productId: string; contentId: string }>({
      query: ({ productId, contentId }) => ({
        url: `${BASE}/${encodeURIComponent(productId)}/contents/${encodeURIComponent(contentId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Product' as const, id: `${arg.productId}-contents` }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListProductsAdminQuery,
  useGetProductAdminQuery,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
  useDeleteProductAdminMutation,
  useListProductCategoriesAdminQuery,
  useListProductSubcategoriesAdminQuery,
  useListSeriesAdminQuery,
  useGetSeriesAdminQuery,
  useCreateSeriesAdminMutation,
  useUpdateSeriesAdminMutation,
  useDeleteSeriesAdminMutation,
  useListLevelsAdminQuery,
  useGetLevelAdminQuery,
  useCreateLevelAdminMutation,
  useUpdateLevelAdminMutation,
  useDeleteLevelAdminMutation,
  useListProductContentsAdminQuery,
  useCreateProductContentAdminMutation,
  useUpdateProductContentAdminMutation,
  useDeleteProductContentAdminMutation,
} = productsAdminApi;
