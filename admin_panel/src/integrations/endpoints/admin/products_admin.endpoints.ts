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
} = productsAdminApi;
