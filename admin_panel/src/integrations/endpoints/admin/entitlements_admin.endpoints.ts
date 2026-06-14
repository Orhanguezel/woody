import { baseApi } from '@/integrations/baseApi';

export type EntitlementAdminView = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  productId: string;
  productTitle: string | null;
  orderId: string | null;
  source: 'purchase' | 'manual' | 'free';
  status: 'active' | 'expired' | 'revoked';
  startsAt: string | null;
  expiresAt: string | null;
  remainingDays: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type EntitlementsListResponse = {
  data: EntitlementAdminView[];
  total: number;
  limit: number;
  offset: number;
};

export type EntitlementsListQuery = {
  userId?: string;
  productId?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableStr(value: unknown) {
  const s = toStr(value);
  return s || null;
}

function normalizeEntitlement(raw: unknown): EntitlementAdminView {
  const r = (raw ?? {}) as Record<string, unknown>;
  const source = toStr(r.source);
  const status = toStr(r.status);
  return {
    id: toStr(r.id),
    userId: toStr(r.userId),
    userEmail: toNullableStr(r.userEmail),
    userName: toNullableStr(r.userName),
    productId: toStr(r.productId),
    productTitle: toNullableStr(r.productTitle),
    orderId: toNullableStr(r.orderId),
    source: source === 'manual' || source === 'free' ? source : 'purchase',
    status: status === 'expired' || status === 'revoked' ? status : 'active',
    startsAt: toNullableStr(r.startsAt),
    expiresAt: toNullableStr(r.expiresAt),
    remainingDays: r.remainingDays == null ? null : Number(r.remainingDays) || 0,
    createdAt: toNullableStr(r.createdAt),
    updatedAt: toNullableStr(r.updatedAt),
  };
}

function normalizeList(raw: unknown): EntitlementsListResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = Array.isArray(r.data) ? r.data.map(normalizeEntitlement) : [];
  return {
    data,
    total: Number(r.total) || data.length,
    limit: Number(r.limit) || data.length || 50,
    offset: Number(r.offset) || 0,
  };
}

export const entitlementsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listEntitlementsAdmin: b.query<EntitlementsListResponse, EntitlementsListQuery | void>({
      query: (params) => ({ url: '/admin/entitlements', method: 'GET', params: params ?? undefined }),
      transformResponse: normalizeList,
      providesTags: [{ type: 'Products' as const, id: 'ENTITLEMENTS' }],
    }),
    createEntitlementAdmin: b.mutation<
      { ok: boolean },
      { userId: string; productId: string; days?: number | null }
    >({
      query: (body) => ({ url: '/admin/entitlements', method: 'POST', body }),
      invalidatesTags: [{ type: 'Products' as const, id: 'ENTITLEMENTS' }],
    }),
    updateEntitlementAdmin: b.mutation<
      { ok: boolean },
      { id: string; body: { days?: number; status?: string; revoke?: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `/admin/entitlements/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Products' as const, id: 'ENTITLEMENTS' }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListEntitlementsAdminQuery,
  useCreateEntitlementAdminMutation,
  useUpdateEntitlementAdminMutation,
} = entitlementsAdminApi;
