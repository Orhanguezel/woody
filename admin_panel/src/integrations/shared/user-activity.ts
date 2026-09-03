// =============================================================
// FILE: src/integrations/shared/user-activity.ts
// Kullanici aktivite tipleri — "ne yapti, nerede gezdi".
// Backend: backend/src/modules/userActivity/router.ts
// =============================================================

export type UserActivityRange = '7d' | '30d' | '90d' | 'all';

/** Izin nasil bulundugu. order_ip = giris yapmamis misafir, siparisten IP ile eslendi. */
export type UserActivityResolvedBy = 'user_id' | 'order_ip' | 'none';

export type UserActivityPage = {
  page: string;
  hits: number;
  first_at: string;
  last_at: string;
};

export type UserActivityAction = {
  at: string;
  method: string;
  path: string;
  status: number;
};

export type UserActivityVisit = {
  page: string | null;
  started_at: string;
  ended_at: string;
  requests: number;
  ip: string;
  actions: UserActivityAction[];
};

export type UserActivityDevice = {
  label: string;
  user_agent: string;
  ip: string;
  hits: number;
  last_at: string;
  country: string | null;
  city: string | null;
};

export type UserActivityOrder = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export type UserActivitySummary = {
  orders_count: number;
  total_spend: number;
  requests: number;
  pages_visited: number;
  first_seen: string | null;
  last_seen: string | null;
  active_days: number;
};

export type UserActivity = {
  user: {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    last_sign_in_at: string | null;
  };
  range: UserActivityRange;
  resolvedBy: UserActivityResolvedBy;
  ips: string[];
  summary: UserActivitySummary;
  pages: UserActivityPage[];
  timeline: UserActivityVisit[];
  devices: UserActivityDevice[];
  orders: UserActivityOrder[];
};

/* ---------------- normalizasyon ---------------- */

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function s(v: unknown): string {
  return v == null ? '' : String(v);
}
function sOrNull(v: unknown): string | null {
  if (v == null) return null;
  const t = String(v).trim();
  return t || null;
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function normalizeUserActivity(raw: unknown): UserActivity {
  const o = (raw ?? {}) as Record<string, unknown>;
  const u = (o.user ?? {}) as Record<string, unknown>;
  const sm = (o.summary ?? {}) as Record<string, unknown>;
  const resolved = s(o.resolvedBy);

  return {
    user: {
      id: s(u.id),
      email: s(u.email),
      full_name: s(u.full_name),
      created_at: s(u.created_at),
      last_sign_in_at: sOrNull(u.last_sign_in_at),
    },
    range: (['7d', '30d', '90d', 'all'] as const).includes(o.range as UserActivityRange)
      ? (o.range as UserActivityRange)
      : '30d',
    resolvedBy:
      resolved === 'user_id' || resolved === 'order_ip' ? (resolved as UserActivityResolvedBy) : 'none',
    ips: arr(o.ips).map(s).filter(Boolean),
    summary: {
      orders_count: n(sm.orders_count),
      total_spend: n(sm.total_spend),
      requests: n(sm.requests),
      pages_visited: n(sm.pages_visited),
      first_seen: sOrNull(sm.first_seen),
      last_seen: sOrNull(sm.last_seen),
      active_days: n(sm.active_days),
    },
    pages: arr(o.pages).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return { page: s(x.page), hits: n(x.hits), first_at: s(x.first_at), last_at: s(x.last_at) };
    }),
    timeline: arr(o.timeline).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        page: sOrNull(x.page),
        started_at: s(x.started_at),
        ended_at: s(x.ended_at),
        requests: n(x.requests),
        ip: s(x.ip),
        actions: arr(x.actions).map((a) => {
          const y = (a ?? {}) as Record<string, unknown>;
          return { at: s(y.at), method: s(y.method), path: s(y.path), status: n(y.status) };
        }),
      };
    }),
    devices: arr(o.devices).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        label: s(x.label),
        user_agent: s(x.user_agent),
        ip: s(x.ip),
        hits: n(x.hits),
        last_at: s(x.last_at),
        country: sOrNull(x.country),
        city: sOrNull(x.city),
      };
    }),
    orders: arr(o.orders).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        id: s(x.id),
        order_number: s(x.order_number),
        total: n(x.total),
        status: s(x.status),
        payment_status: s(x.payment_status),
        created_at: s(x.created_at),
      };
    }),
  };
}
