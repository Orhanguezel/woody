// =============================================================
// FILE: src/integrations/endpoints/admin/blog_admin.endpoints.ts
// Blog admin RTK Query endpoints
// =============================================================

import { baseApi } from '@/integrations/baseApi';
import type { BlogListQuery, BlogPostAdminView, BlogPostUpsertBody } from '@/integrations/shared';
import { normalizeBlogPostAdmin, toBlogListParams } from '@/integrations/shared';

const BASE = '/admin/blog';

export const blogAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listBlogPostsAdmin: b.query<BlogPostAdminView[], BlogListQuery | undefined>({
      query: (params) => ({ url: BASE, method: 'GET', params: toBlogListParams(params) }),
      transformResponse: (res: unknown) =>
        Array.isArray(res) ? res.map(normalizeBlogPostAdmin) : [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((post) => ({ type: 'BlogPost' as const, id: post.id })),
              { type: 'BlogPosts' as const, id: 'LIST' },
            ]
          : [{ type: 'BlogPosts' as const, id: 'LIST' }],
    }),

    getBlogPostAdmin: b.query<BlogPostAdminView, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'GET',
        params: locale ? { locale } : {},
      }),
      transformResponse: normalizeBlogPostAdmin,
      providesTags: (_r, _e, arg) => [{ type: 'BlogPost' as const, id: arg.id }],
    }),

    createBlogPostAdmin: b.mutation<BlogPostAdminView, BlogPostUpsertBody>({
      query: (body) => ({ url: BASE, method: 'POST', body }),
      transformResponse: normalizeBlogPostAdmin,
      invalidatesTags: [{ type: 'BlogPosts' as const, id: 'LIST' }],
    }),

    updateBlogPostAdmin: b.mutation<
      BlogPostAdminView,
      { id: string; body: Partial<BlogPostUpsertBody> }
    >({
      query: ({ id, body }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: normalizeBlogPostAdmin,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'BlogPost' as const, id: arg.id },
        { type: 'BlogPosts' as const, id: 'LIST' },
      ],
    }),

    deleteBlogPostAdmin: b.mutation<void, { id: string; locale?: string }>({
      query: ({ id, locale }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'DELETE',
        params: locale ? { locale } : {},
      }),
      invalidatesTags: [{ type: 'BlogPosts' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListBlogPostsAdminQuery,
  useGetBlogPostAdminQuery,
  useCreateBlogPostAdminMutation,
  useUpdateBlogPostAdminMutation,
  useDeleteBlogPostAdminMutation,
} = blogAdminApi;
