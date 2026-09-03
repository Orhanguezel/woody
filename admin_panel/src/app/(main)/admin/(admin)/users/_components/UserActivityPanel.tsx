'use client';

// =============================================================
// FILE: .../users/_components/UserActivityPanel.tsx
// "Bu kullanici ne yapti, nerede gezdi?"
//
// Veri kaynagi audit_request_logs. Ziyaret edilen sayfa `referer`
// basligindan turetilir; `path` API ucudur, sayfa degil.
// Misafir alisverislerde (woody'de cogunluk) iz, siparis ID'sinin
// gectigi istekten bulunan IP uzerinden geri kazanilir — panel bunu
// "misafir oturumu" olarak etiketler.
// =============================================================

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  Globe,
  Clock,
  Wallet,
  MonitorSmartphone,
  MapPin,
  ShoppingCart,
  AlertCircle,
  UserCheck,
  Fingerprint,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useGetUserActivityAdminQuery } from '@/integrations/hooks';
import type { UserActivityRange } from '@/integrations/shared';

const RANGES: Array<{ key: UserActivityRange; label: string }> = [
  { key: '7d', label: '7 gün' },
  { key: '30d', label: '30 gün' },
  { key: '90d', label: '90 gün' },
  { key: 'all', label: 'Tümü' },
];

const PAYMENT_LABEL: Record<string, string> = {
  paid: 'Ödendi',
  failed: 'Başarısız',
  pending: 'Ödeme bekliyor',
  unpaid: 'Ödenmedi',
  refunded: 'İade edildi',
};

/** Site yollarini insan diline cevirir: /tr/store → "Mağaza". */
function pageTitle(path: string | null): string {
  if (!path) return 'Doğrudan giriş';
  const p = path.replace(/^\/(tr|en|de|fr|es|it|nl|pl|pt-br|ru)(?=\/|$)/, '') || '/';
  if (p === '/' || p === '') return 'Ana sayfa';
  const map: Record<string, string> = {
    '/store': 'Mağaza',
    '/store/checkout': 'Ödeme sayfası',
    '/preschool': 'Okul öncesi',
    '/workshop': 'Atölye',
    '/blog': 'Blog',
    '/contact': 'İletişim',
    '/about': 'Hakkımızda',
    '/woody-academy': 'Woody Academy',
    '/school': 'Okul paneli',
  };
  if (map[p]) return map[p];
  if (p.startsWith('/store/')) return `Ürün: ${p.slice(7)}`;
  if (p.startsWith('/blog/')) return `Blog: ${p.slice(6)}`;
  if (p.startsWith('/admin')) return `Yönetim: ${p}`;
  return p;
}

function fmtDateTime(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function fmtTime(v: string): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function fmtMoney(v: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v || 0);
}

/** Ziyaret suresi — ilk ve son istek arasi. */
function duration(from: string, to: string): string {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return '';
  const sec = Math.round((b - a) / 1000);
  if (sec < 60) return `${sec} sn`;
  const min = Math.floor(sec / 60);
  return min < 60 ? `${min} dk` : `${Math.floor(min / 60)} sa ${min % 60} dk`;
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-5">
      <div className="flex items-center gap-2 text-gm-muted">
        <Icon size={14} className="opacity-60" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className="mt-3 font-serif text-2xl text-gm-text">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-gm-muted opacity-70">{hint}</div> : null}
    </div>
  );
}

export function UserActivityPanel({ userId }: { userId: string }) {
  const [range, setRange] = React.useState<UserActivityRange>('30d');
  const { data, isLoading, isError } = useGetUserActivityAdminQuery({ id: userId, range });

  return (
    <Card className="overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-surface/20 shadow-xl backdrop-blur-sm">
      <CardHeader className="border-b border-gm-border-soft bg-gm-surface/40 p-8 pb-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-3 font-serif text-2xl">
              <Activity className="h-5 w-5 text-gm-gold" /> Kullanıcı Hareketleri
            </CardTitle>
            <CardDescription className="mt-1 font-serif text-sm italic text-gm-muted opacity-70">
              Hangi sayfalarda gezdiği, ne zaman geldiği ve ne yaptığı.
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-gm-border-soft bg-gm-surface/30 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all',
                  range === r.key ? 'bg-gm-gold text-gm-bg' : 'text-gm-muted hover:text-gm-text',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl bg-gm-surface/20" />
            <Skeleton className="h-64 w-full rounded-2xl bg-gm-surface/20" />
          </div>
        ) : isError || !data ? (
          <div className="flex items-center gap-3 rounded-2xl border border-gm-error/20 bg-gm-error/5 px-5 py-4 text-sm text-gm-error">
            <AlertCircle className="size-4" />
            Hareket verileri yüklenemedi.
          </div>
        ) : (
          <>
            {/* Iz nasil bulundu */}
            <div
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm',
                data.resolvedBy === 'none'
                  ? 'border-gm-border-soft bg-gm-surface/30 text-gm-muted'
                  : 'border-gm-gold/25 bg-gm-gold/[0.06] text-gm-text',
              )}
            >
              {data.resolvedBy === 'user_id' ? (
                <UserCheck className="mt-0.5 size-4 shrink-0 text-gm-gold" />
              ) : data.resolvedBy === 'order_ip' ? (
                <Fingerprint className="mt-0.5 size-4 shrink-0 text-gm-gold" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                {data.resolvedBy === 'user_id' ? (
                  <>Hareketler <strong>giriş yapmış oturumdan</strong> eşleştirildi.</>
                ) : data.resolvedBy === 'order_ip' ? (
                  <>
                    Bu kullanıcı hiç giriş yapmamış — hesabı sipariş sırasında açılmış.
                    Hareketler <strong>siparişin geldiği IP adresi</strong> üzerinden eşleştirildi,
                    yani misafir gezintisi de görünüyor.
                    {data.ips.length ? (
                      <span className="ml-1 font-mono text-xs opacity-70">({data.ips.join(', ')})</span>
                    ) : null}
                  </>
                ) : (
                  <>
                    Bu kullanıcı için kayıtlı hareket bulunamadı. Ne giriş yapmış bir oturumu,
                    ne de IP'sine ulaşılabilen bir siparişi var.
                  </>
                )}
              </div>
            </div>

            {/* Ozet */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={Wallet}
                label="Harcama"
                value={fmtMoney(data.summary.total_spend)}
                hint={`${data.summary.orders_count} sipariş`}
              />
              <Stat
                icon={Globe}
                label="Gezilen sayfa"
                value={String(data.summary.pages_visited)}
                hint={`${data.summary.requests} istek`}
              />
              <Stat
                icon={Clock}
                label="Son görülme"
                value={data.summary.last_seen ? fmtTime(data.summary.last_seen) : '—'}
                hint={data.summary.last_seen ? fmtDateTime(data.summary.last_seen) : 'Kayıt yok'}
              />
              <Stat
                icon={Activity}
                label="Aktif gün"
                value={String(data.summary.active_days)}
                hint={data.summary.first_seen ? `İlk: ${fmtDateTime(data.summary.first_seen)}` : undefined}
              />
            </div>

            {/* Gezilen sayfalar */}
            <section>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">
                Nerede gezdi
              </h3>
              {data.pages.length ? (
                <div className="space-y-2">
                  {data.pages.slice(0, 15).map((p) => (
                    <div
                      key={p.page}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-serif text-base text-gm-text">{pageTitle(p.page)}</div>
                        <div className="mt-0.5 truncate font-mono text-[10px] text-gm-muted opacity-60">
                          {p.page}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="rounded-full border border-gm-border-soft bg-gm-surface/40 px-3 py-1 text-[10px] font-bold text-gm-muted">
                          {p.hits} istek
                        </span>
                        <span className="font-mono text-[10px] text-gm-muted opacity-60">
                          {fmtDateTime(p.last_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center font-serif italic text-gm-muted opacity-40">
                  Sayfa gezinme kaydı yok.
                </p>
              )}
            </section>

            {/* Zaman tuneli */}
            <section>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">
                Zaman çizelgesi
              </h3>
              {data.timeline.length ? (
                <div className="ml-3 space-y-5 border-l-2 border-gm-border-soft pl-6">
                  {data.timeline.slice(0, 40).map((v, i) => {
                    const dur = duration(v.started_at, v.ended_at);
                    return (
                      <div key={`${v.started_at}-${i}`} className="relative">
                        <span className="absolute -left-[35px] top-1 size-4 rounded-full border-2 border-gm-gold bg-gm-surface" />
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <span className="font-serif text-base text-gm-text">{pageTitle(v.page)}</span>
                            {dur ? (
                              <span className="ml-3 text-[11px] text-gm-muted opacity-70">{dur} kaldı</span>
                            ) : null}
                          </div>
                          <span className="shrink-0 font-mono text-[10px] text-gm-muted opacity-60">
                            {fmtDateTime(v.started_at)}
                          </span>
                        </div>
                        {v.actions.length ? (
                          <ul className="mt-2 space-y-1">
                            {v.actions.map((a, j) => (
                              <li
                                key={`${a.at}-${j}`}
                                className="flex items-center gap-2 font-mono text-[10px] text-gm-muted"
                              >
                                <span
                                  className={cn(
                                    'rounded px-1.5 py-0.5 font-bold',
                                    a.status >= 400
                                      ? 'bg-gm-error/10 text-gm-error'
                                      : 'bg-gm-success/10 text-gm-success',
                                  )}
                                >
                                  {a.method}
                                </span>
                                <span className="truncate opacity-70">{a.path}</span>
                                <span className="opacity-50">{a.status}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center font-serif italic text-gm-muted opacity-40">
                  Bu aralıkta hareket yok.
                </p>
              )}
            </section>

            {/* Siparisler + cihazlar */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">
                  Siparişleri
                </h3>
                {data.orders.length ? (
                  <div className="space-y-2">
                    {data.orders.map((o) => (
                      <Link
                        key={o.id}
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-5 py-3 transition-colors hover:bg-gm-surface/60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <ShoppingCart size={14} className="shrink-0 text-gm-muted opacity-60" />
                          <div className="min-w-0">
                            <div className="font-serif text-base text-gm-text">{fmtMoney(o.total)}</div>
                            <div className="font-mono text-[10px] text-gm-muted opacity-60">
                              {fmtDateTime(o.created_at)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold',
                            o.payment_status === 'paid'
                              ? 'border-gm-success/20 bg-gm-success/5 text-gm-success'
                              : o.payment_status === 'failed'
                                ? 'border-gm-error/20 bg-gm-error/5 text-gm-error'
                                : 'border-gm-border-soft bg-gm-surface/40 text-gm-muted',
                          )}
                        >
                          {PAYMENT_LABEL[o.payment_status] ?? o.payment_status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center font-serif italic text-gm-muted opacity-40">Sipariş yok.</p>
                )}
              </section>

              <section>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">
                  Cihaz ve konum
                </h3>
                {data.devices.length ? (
                  <div className="space-y-2">
                    {data.devices.slice(0, 5).map((dv, i) => (
                      <div
                        key={`${dv.ip}-${i}`}
                        className="rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-5 py-3"
                        title={dv.user_agent}
                      >
                        <div className="flex items-center gap-2">
                          <MonitorSmartphone size={14} className="text-gm-muted opacity-60" />
                          <span className="font-serif text-base text-gm-text">{dv.label}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[10px] text-gm-muted opacity-60">
                          <span>{dv.ip}</span>
                          {dv.city || dv.country ? (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {[dv.city, dv.country].filter(Boolean).join(', ')}
                            </span>
                          ) : null}
                          <span>{dv.hits} istek</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center font-serif italic text-gm-muted opacity-40">Cihaz kaydı yok.</p>
                )}
              </section>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
