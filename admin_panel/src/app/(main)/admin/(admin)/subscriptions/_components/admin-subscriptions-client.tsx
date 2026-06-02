'use client';

import * as React from 'react';
import {
  RefreshCcw,
  Search,
  Undo2,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import type { TranslateFn } from '@/i18n';
import {
  useListSubscriptionsAdminQuery,
  useRefundSubscriptionAdminMutation,
} from '@/integrations/hooks';
import type { AdminSubscriptionStatus } from '@/integrations/shared';

type StatusFilter = AdminSubscriptionStatus | 'all';

const STATUSES: StatusFilter[] = ['all', 'pending', 'active', 'cancelled', 'expired', 'grace_period', 'past_due'];

function fmtDate(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('tr-TR');
}

function moneyFromMinor(amount: number, currency: string) {
  const n = Number(amount || 0) / 100;
  if (!Number.isFinite(n)) return `${currency}`;
  return `${n.toFixed(2)} ${currency}`;
}

function resolvePlanName(item: { plan_name_tr: string | null; plan_name_en: string | null; plan_code: string | null }) {
  return item.plan_name_tr || item.plan_name_en || item.plan_code || '-';
}

function resolveUser(item: { user_full_name: string | null; user_email: string | null; user_id: string }) {
  return item.user_full_name || item.user_email || item.user_id;
}

function statusLabel(t: TranslateFn, status: StatusFilter) {
  return status === 'all' ? t('statuses.all') : t(`statuses.${status}` as string);
}

// active → success, cancelled/expired/past_due → error, diğer → warning
function statusTone(status: AdminSubscriptionStatus) {
  if (status === 'active') return 'success' as const;
  if (status === 'cancelled' || status === 'expired' || status === 'past_due') return 'error' as const;
  return 'warning' as const;
}

export default function AdminSubscriptionsClient() {
  const t = useAdminT('admin.subscriptions');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const list = useListSubscriptionsAdminQuery({
    limit,
    offset,
    status: status === 'all' ? undefined : status,
    q: search || undefined,
  });

  const [refund, refundState] = useRefundSubscriptionAdminMutation();

  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  async function doRefund(id: string) {
    const reason = window.prompt(t('actions.refundReasonPrompt'));
    if (reason === null) return;
    try {
      await refund({ id, body: { reason: reason.trim() } }).unwrap();
      toast.success(t('toasts.refundSuccess'));
    } catch {
      toast.error(t('toasts.refundFailed'));
    }
  }

  function doSearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('header.badge', null, 'Abonelik Kayıtları')}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">{t('description')}</p>
        </div>

        <div className="flex items-center gap-6 bg-gm-surface/20 px-8 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <div className="text-center sm:text-right min-w-[80px]">
            <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase mb-1">
              {t('summary.total_label', null, 'Toplam')}
            </p>
            <p className="font-serif text-3xl text-gm-gold">{total}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => list.refetch()}
            disabled={list.isFetching}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', list.isFetching && 'animate-spin')} />
            {t('actions.refresh', null, 'Yenile')}
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-end">
          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">
              {t('filters.search')}
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/50" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder={t('filters.searchPlaceholder')}
                className="pl-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1 block">
              {t('filters.status')}
            </Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(t, s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.user')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.plan')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.status')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.provider')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.price')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.started')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.ends')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isFetching && rows.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-32 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-8 w-24 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-28 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-28 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6 px-8"><Skeleton className="h-10 w-24 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('table.noRecords')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((item) => {
                  const tone = statusTone(item.status);
                  return (
                    <TableRow key={item.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-muted/60 group-hover:border-gm-gold/50 transition-all shadow-inner">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{resolveUser(item)}</div>
                            <div className="text-[10px] text-gm-muted font-mono opacity-50 tracking-tighter">{item.user_phone || '-'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="font-serif text-base text-gm-text">{resolvePlanName(item)}</span>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <div className={cn(
                          'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border transition-all',
                          tone === 'success' ? 'bg-gm-success/10 text-gm-success border-gm-success/20' :
                          tone === 'error' ? 'bg-gm-error/10 text-gm-error border-gm-error/20' :
                          'bg-gm-warning/10 text-gm-warning border-gm-warning/20'
                        )}>
                          <div className={cn(
                            'w-1 h-1 rounded-full',
                            tone === 'success' ? 'bg-gm-success' : tone === 'error' ? 'bg-gm-error' : 'bg-gm-warning'
                          )} />
                          {statusLabel(t, item.status)}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border bg-gm-surface/40 border-gm-border-soft text-gm-muted">
                          <CreditCard size={10} className="opacity-60" />
                          {item.provider}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <span className="font-serif text-base text-gm-text font-bold">{moneyFromMinor(item.price_minor, item.currency)}</span>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <div className="text-[10px] text-gm-muted font-mono flex items-center justify-center gap-2 tracking-tighter opacity-70">
                          <Calendar size={12} className="text-gm-gold/60" />
                          {fmtDate(item.started_at)}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <div className="text-[10px] text-gm-muted font-mono flex items-center justify-center gap-2 tracking-tighter opacity-70">
                          <Calendar size={12} className="text-gm-gold/60" />
                          {fmtDate(item.ends_at)}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => doRefund(item.id)}
                          disabled={refundState.isLoading || item.status === 'cancelled'}
                          className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all font-bold tracking-widest uppercase text-[10px] opacity-40 group-hover:opacity-100 disabled:opacity-20"
                        >
                          <Undo2 className="mr-2 size-4" />
                          {t('actions.refund')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
        <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
          {t('pagination.page', { page, totalPages })}
        </div>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            disabled={!hasPrev || list.isFetching}
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold transition-all font-bold tracking-widest uppercase text-[10px] border border-transparent hover:border-gm-gold/20 disabled:opacity-30"
          >
            <ChevronLeft className="mr-2 size-4" />
            {t('pagination.prev')}
          </Button>
          <Button
            variant="ghost"
            disabled={!hasNext || list.isFetching}
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-full px-8 h-12 hover:bg-gm-gold/10 hover:text-gm-gold transition-all font-bold tracking-widest uppercase text-[10px] border border-transparent hover:border-gm-gold/20 disabled:opacity-30"
          >
            {t('pagination.next')}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
