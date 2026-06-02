'use client';

import { Plus, RefreshCcw, Trash2, Pencil, Ticket, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListCampaignsAdminQuery,
  useUpdateCampaignAdminMutation,
  useDeleteCampaignAdminMutation,
} from '@/integrations/hooks';

export default function AdminCampaignsClient() {
  const t = useAdminT('admin.campaigns');
  const query = useListCampaignsAdminQuery(undefined);
  const [update] = useUpdateCampaignAdminMutation();
  const [remove] = useDeleteCampaignAdminMutation();

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
    if (!confirm(t('confirms.delete', null, 'Bu kampanya silinsin mi?'))) return;
    try {
      await remove(id).unwrap();
      toast.success(t('toasts.deleted', null, 'Kampanya silindi.'));
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
              {t('header.badge', null, 'Kampanya & Promosyon')}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title', null, 'Kampanyalar')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {t('description', null, 'İndirim kodlarını, bonus kredileri ve özel teklifleri yönetin.')}
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
            <Link href="/admin/campaigns/new">
              <Plus className="mr-2 size-4" />
              {t('actions.new', null, 'Yeni Kampanya')}
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
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.campaign', null, 'Kampanya')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.typeValue', null, 'Tür & Değer')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.usage', null, 'Kullanım')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.appliesTo', null, 'Kapsam')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actions', null, 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8"><Skeleton className="h-6 w-10 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-12 w-48 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-24 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-28 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-24 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="py-6 px-8"><Skeleton className="h-8 w-20 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('table.empty', null, 'Kampanya bulunamadı.')}</span>
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
                        <div className="w-10 h-10 rounded-full bg-gm-gold/10 flex items-center justify-center text-gm-gold shadow-inner border border-gm-gold/20 shrink-0">
                          <Ticket size={16} />
                        </div>
                        <div>
                          <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{item.name_tr}</div>
                          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-gm-gold opacity-80">{item.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-gm-gold/20 bg-gm-gold/10 text-gm-gold">
                          {item.type.replace('_', ' ')}
                        </span>
                        <div className="font-serif text-lg text-gm-text font-bold">
                          {item.type === 'discount_percentage' && `%${item.value}`}
                          {item.type === 'discount_fixed' && `₺${item.value}`}
                          {item.type === 'bonus_credits' && `${item.value} ${t('values.credits', null, 'Kredi')}`}
                          {item.type === 'free_trial_days' && `${item.value} ${t('values.daysFree', null, 'Gün Ücretsiz')}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[11px] text-gm-muted">
                          <span className="font-bold text-gm-text">{item.used_count}</span>
                          {item.max_uses ? ` / ${item.max_uses}` : ' / ∞'} {t('table.usesSuffix', null, 'kullanım')}
                        </div>
                        {item.max_uses && (
                          <div className="h-1.5 w-24 rounded-full bg-gm-bg-deep overflow-hidden">
                            <div className="h-full bg-gm-gold" style={{ width: `${Math.min(100, (item.used_count / item.max_uses) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="inline-flex px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-gm-border-soft bg-gm-surface/40 text-gm-muted">
                        {item.applies_to.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button asChild size="icon" variant="ghost" className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all">
                          <Link href={`/admin/campaigns/${item.id}`}>
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
