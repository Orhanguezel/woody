'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  ChevronRight,
  Clock3,
  Inbox,
  Mail,
  RefreshCcw,
  Search,
  Trophy,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListQuoteRequestsAdminQuery } from '@/integrations/hooks';
import type { QuoteRequestStatus } from '@/integrations/shared';
import { cn } from '@/lib/utils';

const STATUSES: Array<QuoteRequestStatus | 'all'> = ['all', 'new', 'contacted', 'quoted', 'won', 'lost'];
const STATUS_LABELS: Record<QuoteRequestStatus | 'all', string> = {
  all: 'Tüm Durumlar',
  new: 'Yeni',
  contacted: 'İletişime Geçildi',
  quoted: 'Teklif Verildi',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
};
const STATUS_STYLES: Record<QuoteRequestStatus, string> = {
  new: 'border-gm-gold/20 bg-gm-gold/5 text-gm-gold',
  contacted: 'border-gm-warning/20 bg-gm-warning/5 text-gm-warning',
  quoted: 'border-gm-primary/20 bg-gm-primary/5 text-gm-primary',
  won: 'border-gm-success/20 bg-gm-success/5 text-gm-success',
  lost: 'border-gm-error/20 bg-gm-error/5 text-gm-error',
};
const STATUS_DOTS: Record<QuoteRequestStatus, string> = {
  new: 'bg-gm-gold',
  contacted: 'bg-gm-warning',
  quoted: 'bg-gm-primary',
  won: 'bg-gm-success',
  lost: 'bg-gm-error',
};

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function QuoteRequestsListClient() {
  const [status, setStatus] = React.useState<QuoteRequestStatus | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const deferredSearch = React.useDeferredValue(search.trim());
  const query = useListQuoteRequestsAdminQuery({ status, q: deferredSearch || undefined, limit: 50, offset: 0 });
  const overviewQuery = useListQuoteRequestsAdminQuery({ status: 'all', limit: 50, offset: 0 });
  const rows = query.data?.data ?? [];
  const overview = overviewQuery.data?.data ?? [];
  const pipelineCount = overview.filter((item) => ['new', 'contacted', 'quoted'].includes(item.status)).length;
  const wonCount = overview.filter((item) => item.status === 'won').length;
  const busy = query.isFetching || overviewQuery.isFetching;

  const refresh = () => {
    query.refetch();
    overviewQuery.refetch();
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">Satış &amp; Başvurular</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Teklif Talepleri</h1>
          <p className="font-serif text-sm italic text-gm-muted opacity-70">Okul serisi fiyat teklifi başvurularını yönetin.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="group relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gm-muted/50 transition-colors group-focus-within:text-gm-gold" />
            <Input
              className="h-12 rounded-2xl border-gm-border-soft bg-gm-surface/40 pl-12 text-sm focus:ring-gm-gold/50"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Kurum, yetkili veya e-posta ara..."
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={busy}
            className="h-12 rounded-full border-gm-border-soft bg-gm-surface/50 px-8 text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm"
          >
            <RefreshCcw className={cn('mr-2 size-4', busy && 'animate-spin')} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <StatCard label="Toplam Talep" value={overviewQuery.data?.total ?? 0} icon={Inbox} accent="gold" />
        <StatCard label="İşlem Bekleyen" value={pipelineCount} icon={Clock3} accent="warning" />
        <StatCard label="Kazanılan" value={wonCount} icon={Trophy} accent="success" />
      </div>

      <Card className="overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-surface/20 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 border-b border-gm-border-soft bg-gm-surface/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-xl text-gm-text">Başvuru Listesi</h2>
            <p className="mt-1 text-xs text-gm-muted">{query.data?.total ?? 0} kayıt gösteriliyor</p>
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as QuoteRequestStatus | 'all')}>
            <SelectTrigger className="h-10 w-full rounded-full border-gm-border-soft bg-gm-surface/50 px-4 text-xs sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((item) => <SelectItem key={item} value={item}>{STATUS_LABELS[item]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Durum</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kurum</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Yetkili</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Öğrenci / Seviye</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">Tarih</TableHead>
                <TableHead className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gm-border-soft">
                    <TableCell className="px-8 py-6"><Skeleton className="h-8 w-28 rounded-full bg-gm-surface/20" /></TableCell>
                    <TableCell colSpan={5} className="py-6"><Skeleton className="h-10 w-full bg-gm-surface/20" /></TableCell>
                  </TableRow>
                ))
              ) : query.isError ? (
                <TableRow><TableCell colSpan={6} className="py-24 text-center text-sm text-destructive">Teklif talepleri yüklenemedi.</TableCell></TableRow>
              ) : rows.length ? (
                rows.map((item) => (
                  <TableRow key={item.id} className="group border-gm-border-soft transition-colors hover:bg-gm-primary/[0.03]">
                    <TableCell className="px-8 py-6">
                      <span className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em]', STATUS_STYLES[item.status])}>
                        <span className={cn('size-1.5 rounded-full', STATUS_DOTS[item.status], item.status === 'new' && 'animate-pulse')} />
                        {STATUS_LABELS[item.status]}
                      </span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-gm-border-soft bg-gm-surface/50 text-gm-muted"><Building2 className="size-4" /></div>
                        <div className="min-w-0">
                          <div className="max-w-52 truncate font-serif text-lg text-gm-text transition-colors group-hover:text-gm-primary">{item.org_name}</div>
                          <div className="mt-1 max-w-52 truncate text-xs text-gm-muted">{item.productTitle || 'Ürün belirtilmedi'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="font-serif text-base text-gm-text">{item.contact_name}</div>
                      <div className="mt-1 flex max-w-48 items-center gap-1 truncate text-[10px] text-gm-muted"><Mail className="size-3 shrink-0" />{item.email}</div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 font-serif text-base text-gm-text"><Users className="size-4 text-gm-gold" />{item.student_count}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{item.level}</div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[10px] text-gm-muted opacity-70"><Calendar className="size-3 text-gm-gold/60" />{formatDate(item.created_at)}</div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-10 rounded-full px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gm-gold/10 hover:text-gm-gold">
                        <Link href={`/admin/quote-requests/${item.id}`}>Talebi Aç<ChevronRight className="ml-2 size-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-28 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-30"><Inbox className="size-16 text-gm-gold/50" /><span className="font-serif text-xl italic text-gm-muted">Kayıt bulunamadı.</span></div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: 'gold' | 'warning' | 'success';
}) {
  const color = accent === 'warning' ? 'text-gm-warning' : accent === 'success' ? 'text-gm-success' : 'text-gm-gold';
  const hover = accent === 'warning' ? 'hover:border-gm-warning/20' : accent === 'success' ? 'hover:border-gm-success/20' : 'hover:border-gm-gold/20';
  return (
    <Card className={cn('group relative overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-bg-deep/40 p-8 shadow-xl backdrop-blur-md transition-all', hover)}>
      <div className="absolute -right-4 -top-4 p-8 opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10"><Icon size={100} className={color} /></div>
      <div className="relative z-10 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">{label}</p>
        <div className={cn('font-serif text-5xl text-gm-text', accent !== 'gold' && color)}>{value}</div>
      </div>
    </Card>
  );
}
