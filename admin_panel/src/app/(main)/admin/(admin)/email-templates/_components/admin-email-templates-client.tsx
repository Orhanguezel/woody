'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/email-templates/_components/admin-email-templates-client.tsx
// Admin Email Templates List — orders standardi (gm-theme)
// =============================================================

import * as React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { AlertCircle, Code2, Mail, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AdminLocaleSelect } from '@/app/(main)/admin/_components/common/AdminLocaleSelect';
import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteEmailTemplateAdminMutation,
  useListEmailTemplatesAdminQuery,
  useUpdateEmailTemplateAdminMutation,
} from '@/integrations/hooks';
import type {
  EmailTemplateAdminListItemDto,
  EmailTemplateAdminListQueryParams,
} from '@/integrations/shared';
import { cn } from '@/lib/utils';

import { localeShortClient, localeShortClientOr } from '@/i18n/localeShortClient';

type ActiveFilter = 'all' | 'active' | 'inactive';

type Filters = {
  search: string;
  activeFilter: ActiveFilter;
  locale: string;
};

function fmtDate(val: string | Date | null | undefined, locale?: string) {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString(locale || undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(val);
  }
}

function truncate(text: string | null | undefined, max = 60) {
  const t = text || '';
  if (t.length <= max) return t || '-';
  return t.slice(0, max - 1) + '…';
}

function getErrMsg(e: unknown, fallback: string): string {
  const err = e as {
    data?: { error?: { message?: unknown }; message?: unknown };
    message?: unknown;
  };

  const candidates = [err?.data?.error?.message, err?.data?.message, err?.message];
  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) return item;
  }
  return fallback;
}

export default function AdminEmailTemplatesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useAdminT('admin.emailTemplates');

  // Locale management
  const {
    localeOptions,
    defaultLocaleFromDb,
    coerceLocale,
    loading: localesLoading,
  } = useAdminLocales();

  const urlLocale = searchParams.get('locale') || '';
  const initialLocale =
    urlLocale ||
    defaultLocaleFromDb ||
    localeShortClientOr(typeof window !== 'undefined' ? navigator.language : 'de', 'de') ||
    '';

  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    activeFilter: 'all',
    locale: initialLocale,
  });

  React.useEffect(() => {
    if (localesLoading) return;
    setFilters((prev) => {
      const nextLocale = coerceLocale(prev.locale, defaultLocaleFromDb);
      if (nextLocale === prev.locale) return prev;
      return { ...prev, locale: nextLocale };
    });
  }, [coerceLocale, defaultLocaleFromDb, localesLoading]);

  // Update URL when locale changes
  React.useEffect(() => {
    if (!filters.locale) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('locale', filters.locale);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters.locale, router, searchParams]);

  // Build query params
  const queryParams = React.useMemo((): EmailTemplateAdminListQueryParams => {
    const apiLocale = localeShortClient(filters.locale);

    return {
      q: filters.search || undefined,
      is_active:
        filters.activeFilter === 'active'
          ? true
          : filters.activeFilter === 'inactive'
            ? false
            : undefined,
      locale: apiLocale,
      order_by: 'updated_at',
      order_dir: 'desc',
    };
  }, [filters]);

  // RTK Query
  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useListEmailTemplatesAdminQuery(queryParams);

  const [updateTemplate] = useUpdateEmailTemplateAdminMutation();
  const [deleteTemplate] = useDeleteEmailTemplateAdminMutation();

  const total = items.length;
  const dateLocale = localeShortClient(filters.locale) || undefined;

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<EmailTemplateAdminListItemDto | null>(
    null,
  );

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleActiveFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, activeFilter: value as ActiveFilter }));
  };

  const handleLocaleChange = (locale: string) => {
    const coerced = coerceLocale(locale, defaultLocaleFromDb);
    setFilters((prev) => ({ ...prev, locale: coerced }));
  };

  const handleToggleActive = async (item: EmailTemplateAdminListItemDto) => {
    try {
      await updateTemplate({
        id: item.id,
        body: { is_active: !item.is_active },
      }).unwrap();
      toast.success(item.is_active ? t('list.toast.deactivated') : t('list.toast.activated'));
      refetch();
    } catch (err) {
      toast.error(getErrMsg(err, t('common.operationFailed')));
    }
  };

  const handleEdit = (item: EmailTemplateAdminListItemDto) => {
    router.push(`/admin/email-templates/${item.id}`);
  };

  const handleDeleteClick = (item: EmailTemplateAdminListItemDto) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteTemplate({ id: itemToDelete.id }).unwrap();
      toast.success(t('list.toast.deleted'));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrMsg(err, t('common.operationFailed')));
    }
  };

  const busy = isLoading;

  return (
    <>
      <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-gm-gold" />
              <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
                {t('header.badge', null, 'E-posta Şablonları')}
              </span>
            </div>
            <h1 className="font-serif text-4xl text-gm-text">{t('list.title')}</h1>
            <p className="text-gm-muted text-sm font-serif italic opacity-70">{t('list.description')}</p>
          </div>

          <div className="flex items-center gap-4">
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
                onClick={() => refetch()}
                disabled={busy}
                className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
              >
                <RefreshCcw className={cn('mr-2 size-4', isFetching && 'animate-spin')} />
                {t('list.refreshButton', null, 'Yenile')}
              </Button>
            </div>
            <Button
              onClick={() => router.push('/admin/email-templates/new')}
              disabled={busy}
              className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
            >
              <Plus className="mr-2 size-4" />
              {t('list.addButton')}
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
          <CardContent className="p-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-3 md:col-span-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">
                {t('list.filters.searchLabel')}
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/50" />
                <Input
                  placeholder={t('list.filters.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={busy}
                  className="pl-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1 block">
                {t('list.filters.statusLabel')}
              </Label>
              <Select value={filters.activeFilter} onValueChange={handleActiveFilterChange} disabled={busy}>
                <SelectTrigger className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  <SelectItem value="all">{t('list.filters.statusOptions.all')}</SelectItem>
                  <SelectItem value="active">{t('list.filters.statusOptions.active')}</SelectItem>
                  <SelectItem value="inactive">{t('list.filters.statusOptions.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <AdminLocaleSelect
                value={filters.locale}
                onChange={handleLocaleChange}
                options={localeOptions}
                loading={localesLoading}
                disabled={busy}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.headers.templateKey')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.headers.nameSubject')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.headers.variables')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('list.table.headers.active')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('list.table.headers.locale')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('list.table.headers.date')}</TableHead>
                  <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('list.table.headers.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-gm-border-soft">
                      <TableCell className="py-6 px-8"><Skeleton className="h-6 w-28 bg-gm-surface/20" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-10 w-44 bg-gm-surface/20" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-24 bg-gm-surface/20" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-10 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-12 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                      <TableCell className="py-6"><Skeleton className="h-6 w-28 bg-gm-surface/20 mx-auto" /></TableCell>
                      <TableCell className="py-6 px-8"><Skeleton className="h-10 w-24 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <AlertCircle className="w-16 h-16 text-gm-gold/50" />
                        <span className="font-serif italic text-lg text-gm-muted">{t('list.empty')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={`${item.id}-${item.template_key}-${item.locale}`}
                      className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                    >
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gm-gold/10 flex items-center justify-center text-gm-gold shadow-inner border border-gm-gold/20">
                            <Code2 size={16} />
                          </div>
                          <span className="font-mono text-[11px] font-bold tracking-widest text-gm-gold opacity-80">{item.template_key || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{item.template_name || '-'}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gm-muted font-mono opacity-60 tracking-tighter">
                          <Mail className="size-3" />
                          <span>{truncate(item.subject, 40)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        {item.detected_variables && item.detected_variables.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {item.detected_variables.slice(0, 3).map((v) => (
                              <span key={v} className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-gm-surface/50 border border-gm-border-soft text-gm-muted font-mono">
                                {v}
                              </span>
                            ))}
                            {item.detected_variables.length > 3 && (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-gm-surface/50 border border-gm-border-soft text-gm-muted">
                                +{item.detected_variables.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gm-muted opacity-50">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleActive(item)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {item.locale ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-gm-border-soft bg-gm-surface/40 text-gm-muted">
                            {item.locale}
                          </span>
                        ) : (
                          <span className="text-gm-muted opacity-50">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <div className="text-[10px] text-gm-muted font-mono tracking-tighter opacity-70">
                          {fmtDate(item.updated_at, dateLocale)}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            disabled={busy}
                            className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item)}
                            disabled={busy}
                            className="rounded-full hover:bg-gm-error/10 hover:text-gm-error transition-all"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('list.dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('list.dialog.description', {
                template: itemToDelete?.template_key || t('list.dialog.templateFallback'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('list.dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {t('list.dialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
