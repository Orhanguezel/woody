// =============================================================
// FILE: src/integrations/endpoints/admin/user-activity-admin.endpoints.ts
// Kullanici aktivitesi — GET /admin/users/:id/activity
// Backend: backend/src/modules/userActivity/router.ts
// =============================================================

import { baseApi } from '@/integrations/baseApi';
import type { UserActivity, UserActivityRange } from '@/integrations/shared';
import { normalizeUserActivity } from '@/integrations/shared';

export const userActivityAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getUserActivityAdmin: b.query<UserActivity, { id: string; range?: UserActivityRange }>({
      query: ({ id, range }) => ({
        url: `/admin/users/${id}/activity`,
        params: range ? { range } : undefined,
      }),
      transformResponse: (res: unknown) => normalizeUserActivity(res),
      providesTags: (_r, _e, arg) => [{ type: 'Users' as const, id: `ACTIVITY-${arg.id}` }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetUserActivityAdminQuery } = userActivityAdminApi;
