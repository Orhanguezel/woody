'use client';

import {
  Plus,
  RefreshCcw,
  Trash2,
  Pencil,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  MousePointerClick,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListBannersAdminQuery,
  useUpdateBannerAdminMutation,
  useDeleteBannerAdminMutation,
} from '@/integrations/hooks';

export default function AdminBannersClient() {
  const t = useAdminT('admin.banners');
  const query = useListBannersAdminQuery(undefined);
  const [update] = useUpdateBannerAdminMutation();
  const [remove] = useDeleteBannerAdminMutation();

  const items = query.data ?? [];
  const total = items.length;

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await update({ id, body: { is_active: !current } }).unwrap();
      toast.success(t('toasts.statusUpdated', null, 'Durum güncellendi.'));
    } catch {
      toast.error(t('toasts.updateFailed', null, 'Güncelleme başarısız.'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirms.delete', null, 'Bu banner silinsin mi?'))) return;
    try {
      await remove(id).unwrap();
      toast.success(t('toasts.deleted', null, 'Banner silindi.'));
    } catch {
      toast.error(t('toasts.deleteFailed', null, 'Silme başarısız.'));
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('header.badge', null, 'Reklam & Tanıtım')}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title', null, 'Bannerlar')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {t('description', null, 'Web ve mobil için reklam ve tanıtım bannerlarını yönetin.')}
          </p>
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
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
            >
              <RefreshCcw className={cn('mr-2 size-4', query.isFetching && 'animate-spin')} />
              {t('actions.refresh', null, 'Yenile')}
            </Button>
          </div>
          <Button asChild className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]">
            <Link href="/admin/banners/new">
              <Plus className="mr-2 size-4" />
              {t('actions.new', null, 'Yeni Banner')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.active', null, 'Aktif')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.banner', null, 'Banner')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.placement', null, 'Konum')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.stats', null, 'İstatistik')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.schedule', null, 'Zamanlama')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actions', null, 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8"><Skeleton className="h-6 w-10 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-12 w-48 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-24 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-28 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-24 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6 px-8"><Skeleton className="h-8 w-20 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('table.empty', null, 'Banner bulunamadı.')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                    <TableCell className="py-6 px-8">
                      <Switch checked={item.is_active} onCheckedChange={() => handleToggleActive(item.id, item.is_active)} />
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 overflow-hidden rounded-xl border border-gm-border-soft bg-gm-bg-deep shrink-0">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt={item.code} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gm-muted/50">
                              <ImageIcon className="size-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{item.title_tr || item.code}</div>
                          <div className="flex items-center gap-2 text-[10px] text-gm-muted font-mono opacity-60 tracking-tighter">
                            <span>{item.code}</span>
                            {item.locale !== '*' && (
                              <span className="px-2 py-0.5 rounded-full border border-gm-border-soft bg-gm-surface/40 uppercase">{item.locale}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-gm-gold/20 bg-gm-gold/10 text-gm-gold">
                        {item.placement.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-gm-muted">
                          <Eye className="size-3.5 text-gm-info" />
                          <span>{item.view_count.toLocaleString()} {t('stats.views', null, 'görüntüleme')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gm-muted">
                          <MousePointerClick className="size-3.5 text-gm-success" />
                          <span>{item.click_count.toLocaleString()} {t('stats.clicks', null, 'tıklama')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-[10px] font-mono text-gm-muted tracking-tighter opacity-80">
                      {item.starts_at ? (
                        <div className="space-y-0.5">
                          <div className="text-gm-success">S: {format(new Date(item.starts_at), 'dd MMM yy')}</div>
                          {item.ends_at && <div className="text-gm-error">E: {format(new Date(item.ends_at), 'dd MMM yy')}</div>}
                        </div>
                      ) : (
                        <span className="italic opacity-60">{t('table.noSchedule', null, 'Zamanlama yok')}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        {item.link_url && (
                          <Button asChild size="icon" variant="ghost" className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all">
                            <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        )}
                        <Button asChild size="icon" variant="ghost" className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all">
                          <Link href={`/admin/banners/${item.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full hover:bg-gm-error/10 hover:text-gm-error transition-all"
                          onClick={() => handleDelete(item.id)}
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
  );
}
