// =============================================================
// FILE: src/integrations/endpoints/admin/schools_admin.endpoints.ts
// Woody school admin RTK Query endpoints
// =============================================================

import { baseApi } from '@/integrations/baseApi';
import type {
  DigitalAssetUpsertBody,
  DigitalAssetView,
  SchoolContentAccessView,
  SchoolUpsertBody,
  SchoolUserCreateBody,
  SchoolUserView,
  SchoolView,
} from '@/integrations/shared';
import {
  normalizeDigitalAsset,
  normalizeSchool,
  normalizeSchoolContentAccess,
  normalizeSchoolUser,
} from '@/integrations/shared';

const SCHOOLS_BASE = '/admin/schools';
const ASSETS_BASE = '/admin/digital-assets';

export const schoolsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listSchoolsAdmin: b.query<SchoolView[], void>({
      query: () => ({ url: SCHOOLS_BASE, method: 'GET' }),
      transformResponse: (res: unknown) => (Array.isArray(res) ? res.map(normalizeSchool) : []),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((school) => ({ type: 'School' as const, id: school.id })),
              { type: 'Schools' as const, id: 'LIST' },
            ]
          : [{ type: 'Schools' as const, id: 'LIST' }],
    }),

    createSchoolAdmin: b.mutation<{ id: string }, SchoolUpsertBody>({
      query: (body) => ({ url: SCHOOLS_BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Schools' as const, id: 'LIST' }],
    }),

    updateSchoolAdmin: b.mutation<{ success: boolean }, { id: string; body: SchoolUpsertBody }>({
      query: ({ id, body }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'School' as const, id: arg.id },
        { type: 'Schools' as const, id: 'LIST' },
      ],
    }),

    deleteSchoolAdmin: b.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `${SCHOOLS_BASE}/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Schools' as const, id: 'LIST' }],
    }),

    listSchoolUsersAdmin: b.query<SchoolUserView[], { schoolId: string }>({
      query: ({ schoolId }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/users`,
        method: 'GET',
      }),
      transformResponse: (res: unknown) => (Array.isArray(res) ? res.map(normalizeSchoolUser) : []),
      providesTags: (_r, _e, arg) => [{ type: 'SchoolUsers' as const, id: arg.schoolId }],
    }),

    addSchoolUserAdmin: b.mutation<
      { success: boolean },
      { schoolId: string; body: SchoolUserCreateBody }
    >({
      query: ({ schoolId, body }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/users`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'SchoolUsers' as const, id: arg.schoolId }],
    }),

    removeSchoolUserAdmin: b.mutation<{ success: boolean }, { schoolId: string; userId: string }>({
      query: ({ schoolId, userId }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/users/${encodeURIComponent(userId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'SchoolUsers' as const, id: arg.schoolId }],
    }),

    listDigitalAssetsAdmin: b.query<DigitalAssetView[], void>({
      query: () => ({ url: ASSETS_BASE, method: 'GET' }),
      transformResponse: (res: unknown) => (Array.isArray(res) ? res.map(normalizeDigitalAsset) : []),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((asset) => ({ type: 'DigitalAsset' as const, id: asset.id })),
              { type: 'DigitalAssets' as const, id: 'LIST' },
            ]
          : [{ type: 'DigitalAssets' as const, id: 'LIST' }],
    }),

    createDigitalAssetAdmin: b.mutation<{ id: string }, DigitalAssetUpsertBody>({
      query: (body) => ({ url: ASSETS_BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'DigitalAssets' as const, id: 'LIST' }],
    }),

    updateDigitalAssetAdmin: b.mutation<
      { success: boolean },
      { id: string; body: DigitalAssetUpsertBody }
    >({
      query: ({ id, body }) => ({
        url: `${ASSETS_BASE}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DigitalAsset' as const, id: arg.id },
        { type: 'DigitalAssets' as const, id: 'LIST' },
      ],
    }),

    deleteDigitalAssetAdmin: b.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `${ASSETS_BASE}/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'DigitalAssets' as const, id: 'LIST' }],
    }),

    listSchoolContentAccessAdmin: b.query<SchoolContentAccessView[], { schoolId: string }>({
      query: ({ schoolId }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/content-access`,
        method: 'GET',
      }),
      transformResponse: (res: unknown) =>
        Array.isArray(res) ? res.map(normalizeSchoolContentAccess) : [],
      providesTags: (_r, _e, arg) => [{ type: 'SchoolContentAccess' as const, id: arg.schoolId }],
    }),

    grantSchoolContentAccessAdmin: b.mutation<
      { success: boolean },
      { schoolId: string; digitalAssetId: string }
    >({
      query: ({ schoolId, digitalAssetId }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/content-access`,
        method: 'POST',
        body: { digital_asset_id: digitalAssetId },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'SchoolContentAccess' as const, id: arg.schoolId },
      ],
    }),

    revokeSchoolContentAccessAdmin: b.mutation<
      { success: boolean },
      { schoolId: string; digitalAssetId: string }
    >({
      query: ({ schoolId, digitalAssetId }) => ({
        url: `${SCHOOLS_BASE}/${encodeURIComponent(schoolId)}/content-access/${encodeURIComponent(
          digitalAssetId,
        )}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'SchoolContentAccess' as const, id: arg.schoolId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListSchoolsAdminQuery,
  useCreateSchoolAdminMutation,
  useUpdateSchoolAdminMutation,
  useDeleteSchoolAdminMutation,
  useListSchoolUsersAdminQuery,
  useAddSchoolUserAdminMutation,
  useRemoveSchoolUserAdminMutation,
  useListDigitalAssetsAdminQuery,
  useCreateDigitalAssetAdminMutation,
  useUpdateDigitalAssetAdminMutation,
  useDeleteDigitalAssetAdminMutation,
  useListSchoolContentAccessAdminQuery,
  useGrantSchoolContentAccessAdminMutation,
  useRevokeSchoolContentAccessAdminMutation,
} = schoolsAdminApi;
