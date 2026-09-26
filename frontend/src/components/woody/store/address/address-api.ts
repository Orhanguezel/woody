'use client';

import { tokenStore } from '@/integrations/rtk/token';

export type InvoiceType = 'individual' | 'corporate';

export type BookAddress = {
  id: string;
  title: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  invoiceType: InvoiceType;
  identityNumber: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export type AddressDraft = Omit<BookAddress, 'id'>;

export type GeoSuggestion = {
  label: string;
  address: string;
  neighbourhood: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type Account = { email: string; name: string; phone: string };

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

function headers(json = false): Record<string, string> {
  const token = tokenStore.get();
  return { ...(json ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, { credentials: 'include', ...init, headers: { ...headers(Boolean(init.body)), ...(init.headers as Record<string, string> | undefined) } });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new ApiError(String(body?.error?.message || `http_${res.status}`), res.status);
  }
  return (await res.json()) as T;
}

export const addressApi = {
  list: () => request<{ account: Account; addresses: BookAddress[] }>('/checkout/address-book'),
  create: (draft: AddressDraft) =>
    request<{ id: string; addresses: BookAddress[] }>('/checkout/address-book', { method: 'POST', body: JSON.stringify(draft) }),
  update: (id: string, draft: AddressDraft) =>
    request<{ id: string; addresses: BookAddress[] }>(`/checkout/address-book/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(draft) }),
  remove: (id: string) => request<{ addresses: BookAddress[] }>(`/checkout/address-book/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  search: (q: string, signal?: AbortSignal) =>
    request<{ results: GeoSuggestion[] }>(`/geo/search?q=${encodeURIComponent(q)}`, { signal }),
  reverse: (lat: number, lon: number) =>
    request<{ results: GeoSuggestion[] }>(`/geo/reverse?lat=${lat}&lon=${lon}`),
};

export function emptyDraft(account?: Partial<Account>): AddressDraft {
  return {
    title: '',
    name: account?.name || '',
    phone: account?.phone || '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    country: 'TR',
    latitude: null,
    longitude: null,
    invoiceType: 'individual',
    identityNumber: '',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    isDefaultShipping: false,
    isDefaultBilling: false,
  };
}
