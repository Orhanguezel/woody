// =============================================================
// FILE: src/integrations/endpoints/admin/addresses_admin.endpoints.ts
// Admin: sipariş teslimat/fatura adresi düzeltme + üye adres defteri
// Backend: backend/src/modules/checkout/addressRoutes.ts (registerAddressRoutesAdmin)
// =============================================================

import { baseApi } from "@/integrations/baseApi";

export type AdminInvoiceType = "individual" | "corporate";
export type AdminOrderAddressType = "shipping" | "billing";

export type AdminAddressFields = {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  invoiceType: AdminInvoiceType;
  identityNumber: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
};

export type AdminBookAddressFields = AdminAddressFields & {
  title: string;
  latitude: number | null;
  longitude: number | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export type AdminBookAddress = AdminBookAddressFields & { id: string };

export type AdminOrderAddressesResp = {
  customerId: string;
  shipping: AdminAddressFields | null;
  billing: AdminAddressFields | null;
};

const ORDERS = "/admin/orders";
const USERS = "/admin/users";
const BOOK = "/admin/customer-addresses";

const orderAddrTag = (id: string) => ({ type: "Order" as const, id: `ADDR:${id}` });
const userAddrTag = (id: string) => ({ type: "User" as const, id: `ADDR:${id}` });
const ALL_USER_ADDR = { type: "User" as const, id: "ADDR:LIST" };

export const addressesAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getOrderAddressesAdmin: b.query<AdminOrderAddressesResp, { id: string }>({
      query: ({ id }) => ({ url: `${ORDERS}/${encodeURIComponent(id)}/addresses`, method: "GET" }),
      providesTags: (_r, _e, arg) => [orderAddrTag(arg.id)],
    }),

    updateOrderAddressAdmin: b.mutation<
      { ok: boolean },
      { id: string; type: AdminOrderAddressType; body: Partial<AdminAddressFields> }
    >({
      query: ({ id, type, body }) => ({
        url: `${ORDERS}/${encodeURIComponent(id)}/addresses/${type}`,
        method: "PUT",
        body,
      }),
      // Teslimat adresi orders.shipping_* alanlarını da günceller → sipariş detayı da tazelenir.
      invalidatesTags: (_r, _e, arg) => [
        orderAddrTag(arg.id),
        { type: "Order" as const, id: arg.id },
        { type: "Orders" as const, id: "LIST" },
      ],
    }),

    listUserAddressesAdmin: b.query<{ addresses: AdminBookAddress[] }, { userId: string }>({
      query: ({ userId }) => ({ url: `${USERS}/${encodeURIComponent(userId)}/addresses`, method: "GET" }),
      transformResponse: (res: unknown) => {
        const list = (res as { addresses?: unknown })?.addresses;
        return { addresses: Array.isArray(list) ? (list as AdminBookAddress[]) : [] };
      },
      providesTags: (_r, _e, arg) => [userAddrTag(arg.userId), ALL_USER_ADDR],
    }),

    createUserAddressAdmin: b.mutation<
      { addresses: AdminBookAddress[] },
      { userId: string; body: AdminBookAddressFields }
    >({
      query: ({ userId, body }) => ({
        url: `${USERS}/${encodeURIComponent(userId)}/addresses`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [userAddrTag(arg.userId)],
    }),

    // Adres kimliğiyle çalışır; kullanıcı kimliği yalnız önbellek hedefi için (opsiyonel).
    updateCustomerAddressAdmin: b.mutation<
      { ok: boolean },
      { id: string; userId?: string; body: AdminBookAddressFields }
    >({
      query: ({ id, body }) => ({ url: `${BOOK}/${encodeURIComponent(id)}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, arg) => (arg.userId ? [userAddrTag(arg.userId)] : [ALL_USER_ADDR]),
    }),

    deleteCustomerAddressAdmin: b.mutation<{ ok: boolean }, { id: string; userId?: string }>({
      query: ({ id }) => ({ url: `${BOOK}/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, arg) => (arg.userId ? [userAddrTag(arg.userId)] : [ALL_USER_ADDR]),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrderAddressesAdminQuery,
  useUpdateOrderAddressAdminMutation,
  useListUserAddressesAdminQuery,
  useCreateUserAddressAdminMutation,
  useUpdateCustomerAddressAdminMutation,
  useDeleteCustomerAddressAdminMutation,
} = addressesAdminApi;
