// =============================================================
// FILE: src/integrations/shared/dashboard.types.ts
// Woody admin dashboard tipleri.
//
// Onceki surum sablonun randevu/danisman modelini tasiyordu (bookings,
// slots, resources, consultants...). Woody bir e-ticaret + okul icerik
// platformu — siparis, teklif talebi, iletisim mesaji, katalog olculur.
// Backend karsiligi: backend/src/modules/dashboard/router.ts
// =============================================================

export type DashboardRangeKey = '7d' | '30d' | '90d';

export type DashboardTotals = {
  // --- akis metrikleri (secili araliga gore) ---
  revenue_paid: number;
  orders_total: number;
  orders_paid: number;
  orders_pending: number;
  orders_failed: number;
  orders_refunded: number;
  refund_amount: number;
  quotes_total: number;
  quotes_new: number;
  quotes_won: number;
  messages_total: number;
  messages_new: number;
  // --- stok metrikleri (her zaman toplam) ---
  users_total: number;
  schools_total: number;
  products_active: number;
  blog_published: number;
  waitlist_total: number;
  quotes_open: number;
  messages_open: number;
};

export type DashboardRevenuePoint = {
  bucket: string;
  revenue: number;
  orders: number;
};

export type DashboardRecentOrder = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
};

export type DashboardRecentQuote = {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  student_count: number;
  level: string;
  city: string | null;
  status: string;
  created_at: string;
};

export type DashboardRecentMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  status: string;
  created_at: string;
};

export type DashboardTopProduct = {
  product_id: string;
  product_title: string;
  qty: number;
  revenue: number;
};

export type DashboardAnalytics = {
  range: DashboardRangeKey;
  fromYmd: string;
  toYmdExclusive: string;
  totals: DashboardTotals;
  revenueTrend: DashboardRevenuePoint[];
  recentOrders: DashboardRecentOrder[];
  recentQuotes: DashboardRecentQuote[];
  recentMessages: DashboardRecentMessage[];
  topProducts: DashboardTopProduct[];
};

// ---- normalizasyon ------------------------------------------
// Backend her alani doldurur; yine de eksik/bozuk yanitta ekranin
// cokmemesi icin savunmaci varsayilanlar uygulanir.

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

const EMPTY_TOTALS: DashboardTotals = {
  revenue_paid: 0,
  orders_total: 0,
  orders_paid: 0,
  orders_pending: 0,
  orders_failed: 0,
  orders_refunded: 0,
  refund_amount: 0,
  quotes_total: 0,
  quotes_new: 0,
  quotes_won: 0,
  messages_total: 0,
  messages_new: 0,
  users_total: 0,
  schools_total: 0,
  products_active: 0,
  blog_published: 0,
  waitlist_total: 0,
  quotes_open: 0,
  messages_open: 0,
};

export function normalizeDashboardAnalytics(raw: unknown): DashboardAnalytics {
  const o = (raw ?? {}) as Record<string, unknown>;
  const rawTotals = (o.totals ?? {}) as Record<string, unknown>;

  const totals: DashboardTotals = { ...EMPTY_TOTALS };
  (Object.keys(EMPTY_TOTALS) as Array<keyof DashboardTotals>).forEach((k) => {
    totals[k] = n(rawTotals[k]);
  });

  const range = o.range === '7d' || o.range === '90d' ? o.range : '30d';

  return {
    range,
    fromYmd: s(o.fromYmd),
    toYmdExclusive: s(o.toYmdExclusive),
    totals,
    revenueTrend: arr(o.revenueTrend).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return { bucket: s(x.bucket), revenue: n(x.revenue), orders: n(x.orders) };
    }),
    recentOrders: arr(o.recentOrders).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        id: s(x.id),
        order_number: s(x.order_number),
        total: n(x.total),
        status: s(x.status),
        payment_status: s(x.payment_status),
        customer_name: sOrNull(x.customer_name),
        customer_email: sOrNull(x.customer_email),
        created_at: s(x.created_at),
      };
    }),
    recentQuotes: arr(o.recentQuotes).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        id: s(x.id),
        org_name: s(x.org_name),
        contact_name: s(x.contact_name),
        email: s(x.email),
        phone: sOrNull(x.phone),
        student_count: n(x.student_count),
        level: s(x.level),
        city: sOrNull(x.city),
        status: s(x.status),
        created_at: s(x.created_at),
      };
    }),
    recentMessages: arr(o.recentMessages).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        id: s(x.id),
        name: s(x.name),
        email: s(x.email),
        phone: sOrNull(x.phone),
        subject: sOrNull(x.subject),
        status: s(x.status),
        created_at: s(x.created_at),
      };
    }),
    topProducts: arr(o.topProducts).map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        product_id: s(x.product_id),
        product_title: s(x.product_title),
        qty: n(x.qty),
        revenue: n(x.revenue),
      };
    }),
  };
}
