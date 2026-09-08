'use client';

// =============================================================
// FILE: src/app/(main)/admin/_components/admin-dashboard-client.tsx
// Woody admin dashboard.
//
// Onceki surum sablondan geliyordu: "Randevu Yogunlugu", "Aktif
// Danismanlar", "Uzmanlik bazli ciro" — woody'de karsiligi olmayan
// metrikler, ustelik backend stub'i sifir donduruyordu. Bu surum
// gercek veriyi gosterir: siparisler, teklif talepleri, gelen
// mesajlar, katalog ve uyeler.
// =============================================================

import * as React from 'react';
import Link from 'next/link';
import {
  RefreshCcw,
  TrendingUp,
  Users,
  Wallet,
  ArrowRight,
  ShoppingCart,
  FileText,
  MessageSquare,
  Package,
  BookOpenText,
  School,
  Mail,
  Inbox,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

import { useGetDashboardSummaryAdminQuery } from '@/integrations/hooks';
import type { DashboardRangeKey } from '@/integrations/shared';

import { useAdminUiCopy } from '@/app/(main)/admin/_components/common/useAdminUiCopy';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { buildAdminSidebarItems } from '@/navigation/sidebar/sidebar-items';

const REVENUE_CHART_CONFIG = {
  revenue: { label: 'Ciro', color: 'var(--gm-gold)' },
} satisfies ChartConfig;

const RANGES: DashboardRangeKey[] = ['7d', '30d', '90d'];

const RANGE_LABEL: Record<DashboardRangeKey, string> = {
  '7d': 'Son 7 gün',
  '30d': 'Son 30 gün',
  '90d': 'Son 90 gün',
};

// /admin/orders ve /admin/paytr-logs ile ayni Turkce karsiliklar.
const PAYMENT_LABEL: Record<string, string> = {
  paid: 'Ödendi',
  failed: 'Başarısız',
  pending: 'Ödeme bekliyor',
  unpaid: 'Ödenmedi',
  refunded: 'İade edildi',
};

const QUOTE_STATUS_LABEL: Record<string, string> = {
  new: 'Yeni',
  contacted: 'Görüşüldü',
  quoted: 'Teklif verildi',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
};

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  new: 'Yeni',
  in_progress: 'İşlemde',
  closed: 'Kapandı',
};

function formatMoney(v: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function formatDate(v: string): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function labelForBucket(v: string): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
}

/** Ust satirdaki buyuk metrik kartlari. */
function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[32px] border border-gm-border-soft bg-gm-surface/20 p-8 backdrop-blur-sm shadow-xl transition-all duration-500 hover:border-gm-gold/30 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-gm-gold transition-all duration-1000 group-hover:opacity-[0.1] group-hover:scale-125">
        <Icon size={84} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gm-border-soft bg-gm-surface/60 shadow-inner">
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">{label}</span>
      </div>
      <div className="mt-6 font-serif text-4xl tracking-tight text-gm-text transition-colors duration-500 group-hover:text-gm-gold">
        {value}
      </div>
      {hint ? <p className="mt-2 text-xs text-gm-muted opacity-70">{hint}</p> : null}
    </Link>
  );
}

/** Bekleyen is sayaci — sifirsa yesil "temiz" rozeti gosterir. */
function InboxTile({
  count,
  label,
  emptyLabel,
  href,
  icon: Icon,
}: {
  count: number;
  label: string;
  emptyLabel: string;
  href: string;
  icon: React.ElementType;
}) {
  const busy = count > 0;
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between rounded-3xl border p-5 transition-all duration-300',
        busy
          ? 'border-gm-gold/40 bg-gm-gold/[0.06] hover:bg-gm-gold/[0.12]'
          : 'border-gm-border-soft bg-gm-surface/30 hover:bg-gm-surface/60',
      )}
    >
      <div className="flex items-center gap-4">
        <Icon size={18} className={busy ? 'text-gm-gold' : 'text-gm-muted opacity-60'} />
        <div>
          <div className="font-serif text-lg text-gm-text">{label}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted mt-1">
            {busy ? `${count} bekleyen` : emptyLabel}
          </div>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-gm-gold opacity-40" />
    </Link>
  );
}

function SectionCard({
  title,
  description,
  href,
  linkLabel,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[40px] border-gm-border-soft bg-gm-surface/20 shadow-xl backdrop-blur-sm">
      <CardHeader className="border-b border-gm-border-soft bg-gm-surface/40 p-8 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-serif text-2xl tracking-tight">{title}</CardTitle>
            <CardDescription className="mt-1 font-serif text-sm italic text-gm-muted opacity-70">
              {description}
            </CardDescription>
          </div>
          {href ? (
            <Link
              href={href}
              className="shrink-0 rounded-full border border-gm-border-soft px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted transition-colors hover:border-gm-gold/40 hover:text-gm-gold"
            >
              {linkLabel ?? 'Tümü'}
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-8">{children}</CardContent>
    </Card>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-12 text-center font-serif text-base italic text-gm-muted opacity-40">{children}</div>
  );
}

export default function AdminDashboardClient() {
  const { copy } = useAdminUiCopy();
  const t = useAdminT();

  const quickLinks = React.useMemo(
    () => buildAdminSidebarItems(copy.nav, t).flatMap((g) => g.items),
    [copy.nav, t],
  );

  const [range, setRange] = React.useState<DashboardRangeKey>('30d');
  const q = useGetDashboardSummaryAdminQuery({ range });

  const d = q.data;
  const totals = d?.totals;
  const loading = q.isLoading;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Baslik + aralik secici */}
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-12 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gm-gold">Genel Bakış</span>
          </div>
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-gm-text">Yönetim Paneli</h1>
          <p className="mt-3 max-w-2xl font-serif text-lg italic leading-relaxed text-gm-muted">
            Siparişler, teklif talepleri ve gelen mesajlar tek ekranda. Rakamlar {RANGE_LABEL[range].toLowerCase()}
            {' '}için; katalog ve üye sayıları toplamdır.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-gm-border-soft bg-gm-surface/30 p-1.5 backdrop-blur-sm">
          {RANGES.map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`rounded-full px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                range === key
                  ? 'bg-gm-gold text-gm-bg shadow-lg shadow-gm-gold/20'
                  : 'text-gm-muted hover:bg-gm-gold/5 hover:text-gm-text'
              }`}
            >
              {key === '7d' ? '7 gün' : key === '30d' ? '30 gün' : '90 gün'}
            </button>
          ))}
          <div className="mx-2 h-5 w-px bg-gm-border-soft" />
          <button
            onClick={() => q.refetch()}
            disabled={q.isFetching}
            title="Yenile"
            className="group rounded-full p-2.5 transition-all hover:bg-gm-gold/10 active:scale-95"
          >
            <RefreshCcw
              className={`size-4 text-gm-gold transition-all ${
                q.isFetching ? 'animate-spin opacity-100' : 'opacity-60 group-hover:opacity-100'
              }`}
            />
          </button>
        </div>
      </div>

      {q.isError ? (
        <div className="flex items-center gap-3 rounded-3xl border border-gm-error/20 bg-gm-error/5 px-6 py-4 text-sm text-gm-error">
          <AlertCircle className="size-4" />
          Özet verileri yüklenemedi. Yenile düğmesini deneyin.
        </div>
      ) : null}

      {/* KPI kartlari */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[32px] bg-gm-surface/20" />
          ))
        ) : (
          <>
            <KpiCard
              label="Ciro"
              value={formatMoney(totals?.revenue_paid ?? 0)}
              hint={`${totals?.orders_paid ?? 0} ödenmiş sipariş`}
              icon={Wallet}
              color="var(--gm-gold)"
              href="/admin/orders"
            />
            <KpiCard
              label="Sipariş"
              value={String(totals?.orders_total ?? 0)}
              hint={
                (totals?.orders_failed ?? 0) > 0
                  ? `${totals?.orders_failed} başarısız ödeme`
                  : 'Başarısız ödeme yok'
              }
              icon={ShoppingCart}
              color="var(--gm-primary)"
              href="/admin/orders"
            />
            <KpiCard
              label="İadeler"
              value={formatMoney(totals?.refund_amount ?? 0)}
              hint={`${totals?.orders_refunded ?? 0} tam iade`}
              icon={RotateCcw}
              color="var(--gm-error)"
              href="/admin/orders?payment_status=refunded"
            />
            <KpiCard
              label="Teklif Talebi"
              value={String(totals?.quotes_total ?? 0)}
              hint={`${totals?.quotes_open ?? 0} yanıt bekliyor`}
              icon={FileText}
              color="var(--gm-info)"
              href="/admin/quote-requests"
            />
            <KpiCard
              label="Gelen Mesaj"
              value={String(totals?.messages_total ?? 0)}
              hint={`${totals?.messages_open ?? 0} okunmamış`}
              icon={MessageSquare}
              color="var(--gm-success)"
              href="/admin/support"
            />
          </>
        )}
      </div>

      {/* Bekleyen isler */}
      <SectionCard
        title="Bekleyen İşler"
        description="Senden aksiyon bekleyen kayıtlar."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <InboxTile
            count={totals?.quotes_open ?? 0}
            label="Teklif talebi"
            emptyLabel="Hepsi yanıtlandı"
            href="/admin/quote-requests"
            icon={FileText}
          />
          <InboxTile
            count={totals?.messages_open ?? 0}
            label="İletişim mesajı"
            emptyLabel="Okunmamış yok"
            href="/admin/support"
            icon={Inbox}
          />
          <InboxTile
            count={totals?.orders_pending ?? 0}
            label="Ödeme bekleyen sipariş"
            emptyLabel="Bekleyen ödeme yok"
            href="/admin/orders"
            icon={ShoppingCart}
          />
        </div>
      </SectionCard>

      {/* Ciro grafigi */}
      <Card className="overflow-hidden rounded-[40px] border-gm-border-soft bg-gm-surface/20 shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-gm-border-soft bg-gm-surface/40 p-10 pb-6">
          <div className="mb-3 flex items-center gap-4">
            <TrendingUp className="h-5 w-5 text-gm-gold" />
            <CardTitle className="font-serif text-3xl tracking-tight">Ciro Akışı</CardTitle>
          </div>
          <CardDescription className="font-serif text-base italic text-gm-muted opacity-70">
            {RANGE_LABEL[range]} içinde ödemesi tamamlanan siparişlerin günlük toplamı.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-8">
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-3xl bg-gm-surface/20" />
          ) : d?.revenueTrend.length ? (
            <ChartContainer config={REVENUE_CHART_CONFIG} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.revenueTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gm-gold)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--gm-gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--gm-border-soft)" />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={labelForBucket}
                    tick={{ fontSize: 10, fill: 'var(--gm-muted)', fontWeight: 600 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₺${v}`}
                    tick={{ fontSize: 10, fill: 'var(--gm-muted)', fontWeight: 600 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(l) => labelForBucket(String(l))}
                        formatter={(v) => formatMoney(Number(v))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--gm-gold)"
                    strokeWidth={4}
                    fill="url(#colorRev)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <EmptyRow>Bu dönemde sipariş yok.</EmptyRow>
          )}
        </CardContent>
      </Card>

      {/* Son siparisler + son teklifler */}
      <div className="grid gap-8 xl:grid-cols-2">
        <SectionCard
          title="Son Siparişler"
          description="En son gelen 8 sipariş."
          href="/admin/orders"
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-gm-surface/20" />
              ))}
            </div>
          ) : d?.recentOrders.length ? (
            <div className="space-y-3">
              {d.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4 transition-colors hover:bg-gm-surface/60"
                >
                  <div className="min-w-0">
                    <div className="truncate font-serif text-base text-gm-text">
                      {o.customer_name || o.customer_email || 'Bilinmeyen müşteri'}
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] tracking-tighter text-gm-muted opacity-60">
                      {o.order_number.slice(0, 10)}… · {formatDate(o.created_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-bold',
                        o.payment_status === 'paid'
                          ? 'border-gm-success/20 bg-gm-success/5 text-gm-success'
                          : o.payment_status === 'failed'
                            ? 'border-gm-error/20 bg-gm-error/5 text-gm-error'
                            : 'border-gm-border-soft bg-gm-surface/40 text-gm-muted',
                      )}
                    >
                      {PAYMENT_LABEL[o.payment_status] ?? o.payment_status}
                    </span>
                    <span className="font-serif text-lg font-bold text-gm-text">{formatMoney(o.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyRow>Henüz sipariş yok.</EmptyRow>
          )}
        </SectionCard>

        <SectionCard
          title="Son Teklif Talepleri"
          description="Okul ve kurumlardan gelen talepler."
          href="/admin/quote-requests"
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-gm-surface/20" />
              ))}
            </div>
          ) : d?.recentQuotes.length ? (
            <div className="space-y-3">
              {d.recentQuotes.map((qr) => (
                <Link
                  key={qr.id}
                  href={`/admin/quote-requests/${qr.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4 transition-colors hover:bg-gm-surface/60"
                >
                  <div className="min-w-0">
                    <div className="truncate font-serif text-base text-gm-text">{qr.org_name}</div>
                    <div className="mt-1 truncate text-[11px] text-gm-muted opacity-70">
                      {qr.contact_name} · {qr.student_count} öğrenci
                      {qr.city ? ` · ${qr.city}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-bold',
                        qr.status === 'new'
                          ? 'border-gm-gold/30 bg-gm-gold/10 text-gm-gold'
                          : qr.status === 'won'
                            ? 'border-gm-success/20 bg-gm-success/5 text-gm-success'
                            : 'border-gm-border-soft bg-gm-surface/40 text-gm-muted',
                      )}
                    >
                      {QUOTE_STATUS_LABEL[qr.status] ?? qr.status}
                    </span>
                    <span className="font-mono text-[10px] text-gm-muted opacity-60">
                      {formatDate(qr.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyRow>Henüz teklif talebi yok.</EmptyRow>
          )}
        </SectionCard>
      </div>

      {/* Gelen mesajlar + cok satanlar */}
      <div className="grid gap-8 xl:grid-cols-2">
        <SectionCard
          title="Gelen Mesajlar"
          description="İletişim formundan gelen son mesajlar."
          href="/admin/support"
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-gm-surface/20" />
              ))}
            </div>
          ) : d?.recentMessages.length ? (
            <div className="space-y-3">
              {d.recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-serif text-base text-gm-text">{m.name || m.email}</div>
                    <div className="mt-1 truncate text-[11px] text-gm-muted opacity-70">
                      {m.subject || 'Konu belirtilmemiş'}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-bold',
                        m.status === 'new'
                          ? 'border-gm-gold/30 bg-gm-gold/10 text-gm-gold'
                          : 'border-gm-border-soft bg-gm-surface/40 text-gm-muted',
                      )}
                    >
                      {MESSAGE_STATUS_LABEL[m.status] ?? m.status}
                    </span>
                    <span className="font-mono text-[10px] text-gm-muted opacity-60">
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow>Henüz mesaj yok.</EmptyRow>
          )}
        </SectionCard>

        <SectionCard
          title="Çok Satan Ürünler"
          description={`${RANGE_LABEL[range]} içinde ödemesi tamamlanan siparişlere göre.`}
          href="/admin/products"
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-gm-surface/20" />
              ))}
            </div>
          ) : d?.topProducts.length ? (
            <div className="space-y-3">
              {d.topProducts.map((p) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Package size={16} className="shrink-0 text-gm-primary opacity-70" />
                    <div className="min-w-0">
                      <div className="truncate font-serif text-base text-gm-text">{p.product_title}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                        {p.qty} adet
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 font-serif text-lg text-gm-gold">{formatMoney(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow>Bu dönemde satış yok.</EmptyRow>
          )}
        </SectionCard>
      </div>

      {/* Katalog + hizli erisim */}
      <div className="grid gap-8 xl:grid-cols-2">
        <SectionCard title="Katalog ve Üyeler" description="Toplam sayılar — seçili dönemden bağımsız.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'Ürün', value: totals?.products_active ?? 0, icon: Package, href: '/admin/products' },
              { label: 'Blog yazısı', value: totals?.blog_published ?? 0, icon: BookOpenText, href: '/admin/blog' },
              { label: 'Okul', value: totals?.schools_total ?? 0, icon: School, href: '/admin/schools' },
              { label: 'Üye', value: totals?.users_total ?? 0, icon: Users, href: '/admin/users' },
              { label: 'Bekleme listesi', value: totals?.waitlist_total ?? 0, icon: Mail, href: '/admin/users' },
              { label: 'Kazanılan teklif', value: totals?.quotes_won ?? 0, icon: FileText, href: '/admin/quote-requests' },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-5 transition-colors hover:border-gm-gold/30 hover:bg-gm-surface/60"
              >
                <s.icon size={16} className="text-gm-muted opacity-60" />
                <div className="mt-3 font-serif text-3xl text-gm-text">{s.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                  {s.label}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Hızlı Erişim" description="Yönetim bölümlerine anında ulaş.">
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className="group flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/40 p-4 transition-all duration-300 hover:border-gm-gold/40 hover:bg-gm-surface/80"
              >
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted transition-colors group-hover:text-gm-gold">
                  {item.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 translate-x-[-10px] text-gm-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
