import type { FetchArgs } from "@reduxjs/toolkit/query";

import { baseApi } from "@/integrations/baseApi";
import type {
  GscEntityIndexArgs,
  GscEntityIndexResp,
  GscEntityInspectArgs,
  GscIndexItem,
  GscStatusResp,
} from "@/integrations/shared";
import { SEARCH_CONSOLE_ADMIN_BASE } from "@/integrations/shared";

export const searchConsoleAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    gscStatus: build.query<GscStatusResp, void>({
      query: (): FetchArgs => ({ url: `${SEARCH_CONSOLE_ADMIN_BASE}/status` }),
    }),
    gscEntityIndex: build.query<GscEntityIndexResp, GscEntityIndexArgs>({
      query: (params): FetchArgs => ({
        url: `${SEARCH_CONSOLE_ADMIN_BASE}/entity-index`,
        params,
      }),
      providesTags: ["Settings"],
    }),
    gscEntityInspect: build.mutation<GscIndexItem, GscEntityInspectArgs>({
      query: (body): FetchArgs => ({
        url: `${SEARCH_CONSOLE_ADMIN_BASE}/entity-inspect`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: true,
});

export const { useGscStatusQuery, useGscEntityIndexQuery, useGscEntityInspectMutation } = searchConsoleAdminApi;
