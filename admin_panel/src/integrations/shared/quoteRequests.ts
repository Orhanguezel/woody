export type QuoteRequestStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
export type QuoteRequestLevel = 'basic' | 'junior' | 'senior' | 'mixed';

export type QuoteRequestView = {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  student_count: number;
  level: QuoteRequestLevel;
  city: string | null;
  district: string | null;
  message: string | null;
  status: QuoteRequestStatus;
  source: string;
  created_at: string | null;
  updated_at: string | null;
};

export type QuoteRequestsListResp = {
  data: QuoteRequestView[];
  total: number;
  limit: number;
  offset: number;
};

export type QuoteRequestsListQuery = {
  status?: QuoteRequestStatus | 'all';
  q?: string;
  limit?: number;
  offset?: number;
};

export type QuoteRequestPatchBody = {
  status?: QuoteRequestStatus;
  message?: string | null;
};

function str(value: unknown) {
  return typeof value === 'string' ? value : String(value ?? '');
}

function nullableStr(value: unknown) {
  const s = str(value).trim();
  return s || null;
}

export function normalizeQuoteRequest(value: unknown): QuoteRequestView {
  const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  return {
    id: str(row.id),
    org_name: str(row.org_name),
    contact_name: str(row.contact_name),
    email: str(row.email),
    phone: nullableStr(row.phone),
    student_count: Number(row.student_count) || 0,
    level: (['basic', 'junior', 'senior', 'mixed'].includes(str(row.level)) ? str(row.level) : 'mixed') as QuoteRequestLevel,
    city: nullableStr(row.city),
    district: nullableStr(row.district),
    message: nullableStr(row.message),
    status: (['new', 'contacted', 'quoted', 'won', 'lost'].includes(str(row.status)) ? str(row.status) : 'new') as QuoteRequestStatus,
    source: str(row.source) || 'website',
    created_at: nullableStr(row.created_at),
    updated_at: nullableStr(row.updated_at),
  };
}

export function normalizeQuoteRequestsList(value: unknown): QuoteRequestsListResp {
  const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const data = Array.isArray(row.data) ? row.data.map(normalizeQuoteRequest) : [];
  return {
    data,
    total: Number(row.total) || data.length,
    limit: Number(row.limit) || data.length,
    offset: Number(row.offset) || 0,
  };
}
