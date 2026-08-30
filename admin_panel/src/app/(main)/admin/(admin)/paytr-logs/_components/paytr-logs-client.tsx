'use client';

// PayTR callback log ekrani (REVIZE 2026-08-30) — QE paytr-logs ekraninin portu.
// PayTR bildirim trafigi SSH'siz izlenir: her deneme (hash_mismatch dahil) burada gorunur.

import * as React from 'react';
import { ChevronLeft, ChevronRight, RefreshCcw, ShieldAlert } from 'lucide-react';
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
type StatsResponse = { outcomes: Array<{ outcome: string; count: number }> };

const OUTCOMES = ['processed', 'duplicate', 'hash_mismatch', 'order_not_found', 'feature_disabled', 'received'] as const;

const OUTCOME_TONE: Record<string, string> = {
  processed: 'bg-emerald-500/15 text-emerald-500',
  duplicate: 'bg-amber-500/15 text-amber-600',
  hash_mismatch: 'bg-red-500/15 text-red-500',
  order_not_found: 'bg-red-500/15 text-red-500',
  feature_disabled: 'bg-slate-500/15 text-slate-500',
  received: 'bg-sky-500/15 text-sky-500',
};

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (outcome !== 'all') params.set('outcome', outcome);
      const [logs, statsRes] = await Promise.all([
        apiGet<LogsResponse>(`/admin/paytr/callback-logs?${params.toString()}`),
        apiGet<StatsResponse>('/admin/paytr/callback-logs/stats'),
      ]);
      setData(logs);
      setStats(statsRes);
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
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase mb-1">Toplam</p>
            <p className="font-serif text-3xl text-gm-gold">{total}</p>
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

      {/* Outcome istatistikleri */}
      {stats?.outcomes.length ? (
        <div className="flex flex-wrap gap-3">
          {stats.outcomes.map((item) => (
            <button
              key={item.outcome}
              type="button"
              onClick={() => {
                setOutcome((prev) => (prev === item.outcome ? 'all' : item.outcome));
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-2 text-[11px] font-bold tracking-wide uppercase border transition',
                outcome === item.outcome
                  ? 'border-gm-gold text-gm-gold'
                  : 'border-gm-border-soft text-gm-muted hover:border-gm-gold/50',
              )}
            >
              {item.outcome} · {item.count}
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
                <SelectValue placeholder="Sonuç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm sonuçlar</SelectItem>
                {OUTCOMES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
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
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>merchant_oid</TableHead>
                  <TableHead>PayTR durumu</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Sonuç</TableHead>
                  <TableHead>Detay</TableHead>
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
                      <TableCell className="text-xs">{row.status || '—'}</TableCell>
                      <TableCell className="text-xs">{row.total_amount != null ? `${row.total_amount} TL` : '—'}</TableCell>
                      <TableCell>
                        <Badge className={cn('font-mono text-[10px]', OUTCOME_TONE[row.outcome] || 'bg-slate-500/15 text-slate-500')}>
                          {row.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs" title={row.detail || ''}>
                        {row.detail || '—'}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
