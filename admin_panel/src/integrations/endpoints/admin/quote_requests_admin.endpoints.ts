import { baseApi } from '@/integrations/baseApi';
import type {
  QuoteRequestPatchBody,
  QuoteRequestsListQuery,
  QuoteRequestsListResp,
  QuoteRequestView,
} from '@/integrations/shared';
import { normalizeQuoteRequest, normalizeQuoteRequestsList } from '@/integrations/shared';

const BASE = '/admin/quote-requests';

export const quoteRequestsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listQuoteRequestsAdmin: b.query<QuoteRequestsListResp, QuoteRequestsListQuery | void>({
      query: (params) => ({
        url: BASE,
        method: 'GET',
        params: params
          ? {
              ...params,
              status: params.status === 'all' ? undefined : params.status,
            }
          : undefined,
      }),
      transformResponse: normalizeQuoteRequestsList,
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((item) => ({ type: 'QuoteRequest' as const, id: item.id })),
              { type: 'QuoteRequests' as const, id: 'LIST' },
            ]
          : [{ type: 'QuoteRequests' as const, id: 'LIST' }],
    }),

    getQuoteRequestAdmin: b.query<QuoteRequestView, { id: string }>({
      query: ({ id }) => ({ url: `${BASE}/${encodeURIComponent(id)}`, method: 'GET' }),
      transformResponse: normalizeQuoteRequest,
      providesTags: (_r, _e, arg) => [{ type: 'QuoteRequest' as const, id: arg.id }],
    }),

    updateQuoteRequestAdmin: b.mutation<QuoteRequestView, { id: string; body: QuoteRequestPatchBody }>({
      query: ({ id, body }) => ({
        url: `${BASE}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: normalizeQuoteRequest,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'QuoteRequest' as const, id: arg.id },
        { type: 'QuoteRequests' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListQuoteRequestsAdminQuery,
  useGetQuoteRequestAdminQuery,
  useUpdateQuoteRequestAdminMutation,
} = quoteRequestsAdminApi;
