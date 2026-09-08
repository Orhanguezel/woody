'use client';

// PayTR callback log ekrani (REVIZE 2026-08-30) — QE paytr-logs ekraninin portu.
// PayTR bildirim trafigi SSH'siz izlenir: her deneme (hash_mismatch dahil) burada gorunur.

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCcw, RotateCcw, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BASE_URL } from '@/integrations/apiBase';
import { tokenStore } from '@/integrations/core/token';

type LogRow = {
  id: string;
  merchant_oid: string | null;
  status: string | null;
  total_amount: string | null;
  source_ip: string | null;
  outcome: string;
  detail: string | null;
  received_at: string;
};

type LogsResponse = { items: LogRow[]; total: number; page: number; limit: number };
type RefundLogRow = {
  id: string;
  order_id: string;
  merchant_oid: string;
  status: 'refunded' | 'partially_refunded';
  amount: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
};
type RefundLogsResponse = { items: RefundLogRow[]; total: number; page: number; limit: number };
type StatsResponse = {
  outcomes: Array<{ outcome: string; count: number }>;
  commerce: {
    realSuccessCount: number;
    realFailedCount: number;
    realRevenue: number;
    refundCount: number;
    refundAmount: number;
    netRevenue: number;
    testSuccessCount: number;
    testFailedCount: number;
    observedSuccessRate: number | null;
    definition: 'latest_processed_callback_per_order';
  };
  generatedAt: string;
};

const OUTCOMES = ['processed', 'duplicate', 'hash_mismatch', 'order_not_found', 'feature_disabled', 'received'] as const;

const OUTCOME_TONE: Record<string, string> = {
  processed: 'bg-emerald-500/15 text-emerald-500',
  duplicate: 'bg-amber-500/15 text-amber-600',
  hash_mismatch: 'bg-red-500/15 text-red-500',
  order_not_found: 'bg-red-500/15 text-red-500',
  feature_disabled: 'bg-slate-500/15 text-slate-500',
  received: 'bg-sky-500/15 text-sky-500',
};

// Ham PayTR sonuc kodlari yerine ne oldugunu anlatan Turkce karsiliklar.
const OUTCOME_LABEL: Record<string, string> = {
  processed: 'İşlendi',
  duplicate: 'Tekrar bildirim',
  hash_mismatch: 'İmza doğrulanamadı',
  order_not_found: 'Sipariş bulunamadı',
  feature_disabled: 'PayTR kapalıydı',
  received: 'Alındı, işlenmedi',
};

const OUTCOME_HELP: Record<string, string> = {
  processed: 'Bildirim doğrulandı ve siparişin ödeme durumu güncellendi. Normal akış.',
  duplicate: 'Aynı bildirim daha önce işlenmişti; tekrar geldiği için yok sayıldı. Zararsız.',
  hash_mismatch: 'GÜVENLİK: Bildirimin imzası tutmadı. Sahte veya bozuk istek — siparişe hiçbir şey yazılmadı.',
  order_not_found: 'Bildirimdeki sipariş referansı veritabanında yok. Silinmiş ya da hiç oluşmamış sipariş.',
  feature_disabled: 'PayTR entegrasyonu kapalıyken bildirim geldi; işlenmedi.',
  received: 'Bildirim alındı ama işlenmedi.',
};

// PayTR'nin kendi durum alani (success/failed).
const PAYTR_STATUS_LABEL: Record<string, string> = {
  success: 'Başarılı',
  failed: 'Başarısız',
};

// "order: <uuid> -> failed" seklindeki ham detayi okunur hale getirir.
function humanDetail(detail: string | null): string {
  if (!detail) return '—';
  const m = detail.match(/^order:\s*([0-9a-f-]+)\s*->\s*(\w+)$/i);
  if (!m) return detail;
  const short = m[1].replace(/-/g, '').slice(0, 8).toUpperCase();
  const outcomes: Record<string, string> = {
    paid: 'ödendi olarak işaretlendi',
    failed: 'başarısız olarak işaretlendi',
    refunded: 'iade edildi olarak işaretlendi',
  };
  return `WD${short}… siparişi ${outcomes[m[2].toLowerCase()] ?? m[2]}`;
}

async function apiGet<T>(path: string): Promise<T> {
  const token = tokenStore.get() ||
    (typeof window !== 'undefined' ? window.localStorage.getItem('mh_access_token') : null);
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`request_failed_${res.status}`);
  return (await res.json()) as T;
}

export default function PaytrLogsClient() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(25);
  const [outcome, setOutcome] = React.useState<string>('all');
  const [data, setData] = React.useState<LogsResponse | null>(null);
  const [stats, setStats] = React.useState<StatsResponse | null>(null);
  const [refunds, setRefunds] = React.useState<RefundLogsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (outcome !== 'all') params.set('outcome', outcome);
      const [logs, statsRes, refundRows] = await Promise.all([
        apiGet<LogsResponse>(`/admin/paytr/callback-logs?${params.toString()}`),
        apiGet<StatsResponse>('/admin/paytr/callback-logs/stats'),
        apiGet<RefundLogsResponse>('/admin/paytr/refund-logs?page=1&limit=10'),
      ]);
      setData(logs);
      setStats(statsRes);
      setRefunds(refundRows);
    } catch {
      setError('Kayıtlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, outcome]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <div className="min-w-0 space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Ödeme Bildirimleri
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">PayTR Kayıtları</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            PayTR sunucu bildirimlerinin denetim izi — doğrulanamayan istekler dahil.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-gm-surface/20 px-8 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <div className="text-center sm:text-right min-w-[80px]">
            <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase mb-1">Kayıtlar</p>
            <p className="font-serif text-2xl text-gm-gold">{total} bildirim · {refunds?.total ?? 0} iade</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', loading && 'animate-spin')} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Sayfa ne anlatiyor — kisa aciklama */}
      <div className="rounded-[24px] border border-gm-border-soft bg-gm-surface/20 px-6 py-5 text-sm leading-relaxed text-gm-muted">
        <p>
          Bir müşteri ödeme yaptığında PayTR bize arka plandan bir <strong className="text-gm-text">bildirim</strong> gönderir;
          siparişin “ödendi” olmasını bu bildirim sağlar. İadeler ise callback olarak gelmediği için ayrı bir
          işlem kaydından izlenir. Bu ekranda iki akış artık birbirinden ayrılmıştır.
        </p>
        <p className="mt-2">
          <strong className="text-gm-text">PayTR Sonucu</strong> ödemenin bankada başarılı olup olmadığını,{' '}
          <strong className="text-gm-text">Bizdeki Sonuç</strong> ise bizim o bildirimle ne yaptığımızı gösterir.
          Rozetlerin üzerine gelince ne anlama geldikleri yazar.
        </p>
      </div>

      {stats?.commerce ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ['Gerçek Başarılı', stats.commerce.realSuccessCount.toLocaleString('tr-TR')],
            ['Gerçek Başarısız', stats.commerce.realFailedCount.toLocaleString('tr-TR')],
            ['Brüt Tahsilat', `${stats.commerce.realRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`],
            ['İade', `${stats.commerce.refundAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`],
            ['Net Tahsilat', `${stats.commerce.netRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`],
            ['Başarı Oranı', stats.commerce.observedSuccessRate == null ? '—' : `%${stats.commerce.observedSuccessRate.toLocaleString('tr-TR')}`],
          ].map(([label, value]) => (
            <Card key={label} className="border-gm-border-soft bg-gm-surface/20">
              <CardContent className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">{label}</p>
                <p className="mt-2 font-serif text-2xl text-gm-text">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-gm-muted">
        Ticari özet, her siparişin en son doğrulanmış PayTR sonucunu kullanır, iadeyi tahsilattan düşer ve test işlemlerini gerçek satıştan ayırır.
        Başarısız ödeme tek başına iletişim izni değildir; yeniden pazarlama yalnız açık izin kaydı bulunan müşteriler için yapılabilir.
      </p>

      <Card className="overflow-hidden border-gm-error/20 bg-gm-error/[0.025]">
        <CardContent className="p-0">
          <div className="flex flex-col justify-between gap-3 border-b border-gm-error/15 px-6 py-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gm-error/10 text-gm-error">
                <RotateCcw className="size-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl text-gm-text">İade İşlemleri</h2>
                <p className="text-xs text-gm-muted">PayTR üzerinden tam veya kısmi iade edilen siparişler.</p>
              </div>
            </div>
            <Badge className="w-fit bg-gm-error/10 text-gm-error">{refunds?.total ?? 0} kayıt</Badge>
          </div>
          <div className="overflow-x-auto">
            {loading && !refunds ? (
              <div className="flex flex-col gap-2 p-6">
                {Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İade Tarihi</TableHead>
                    <TableHead>Sipariş</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds?.items.length ? refunds.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {row.updated_at ? format(new Date(row.updated_at), 'dd.MM.yyyy HH:mm:ss') : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs" title={row.merchant_oid}>{row.merchant_oid}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gm-text">{row.customer_name || '—'}</div>
                        <div className="text-xs text-gm-muted">{row.customer_email || '—'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gm-error/10 text-gm-error">
                          {row.status === 'partially_refunded' ? 'Kısmi iade' : 'Tam iade'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-serif font-semibold text-gm-error">
                        {Number(row.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/orders/${row.order_id}`} aria-label="Siparişi aç">
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-gm-muted">İade kaydı yok.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outcome istatistikleri */}
      {stats?.outcomes.length ? (
        <div className="flex flex-wrap gap-3">
          {stats.outcomes.map((item) => (
            <button
              key={item.outcome}
              type="button"
              title={OUTCOME_HELP[item.outcome] ?? item.outcome}
              onClick={() => {
                setOutcome((prev) => (prev === item.outcome ? 'all' : item.outcome));
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-2 text-[11px] font-bold tracking-wide border transition',
                outcome === item.outcome
                  ? 'border-gm-gold text-gm-gold'
                  : 'border-gm-border-soft text-gm-muted hover:border-gm-gold/50',
              )}
            >
              {OUTCOME_LABEL[item.outcome] ?? item.outcome} · {item.count}
            </button>
          ))}
        </div>
      ) : null}

      <Card className="border-gm-border-soft">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Select
              value={outcome}
              onValueChange={(value) => {
                setOutcome(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Tüm sonuçlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm sonuçlar</SelectItem>
                {OUTCOMES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {OUTCOME_LABEL[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={!hasPrev || loading} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-gm-muted min-w-[60px] text-center">Sayfa {page}</span>
              <Button variant="outline" size="icon" disabled={!hasNext || loading} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {error ? (
            <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500" role="alert">
              <ShieldAlert className="size-4" /> {error}
            </p>
          ) : loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Sipariş Referansı</TableHead>
                  <TableHead>PayTR Sonucu</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Bizdeki Sonuç</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {row.received_at ? format(new Date(row.received_at), 'dd.MM.yyyy HH:mm:ss') : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.merchant_oid || '—'}</TableCell>
                      <TableCell className="text-xs">
                        {row.status ? (PAYTR_STATUS_LABEL[row.status] ?? row.status) : '—'}
                      </TableCell>
                      <TableCell className="text-xs">{row.total_amount != null ? `${row.total_amount} TL` : '—'}</TableCell>
                      <TableCell>
                        <Badge
                          title={OUTCOME_HELP[row.outcome] ?? row.outcome}
                          className={cn('text-[10px] font-semibold', OUTCOME_TONE[row.outcome] || 'bg-slate-500/15 text-slate-500')}
                        >
                          {OUTCOME_LABEL[row.outcome] ?? row.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-xs" title={row.detail || ''}>
                        {humanDetail(row.detail)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.source_ip || '—'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-gm-muted">
                      Kayıt yok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
