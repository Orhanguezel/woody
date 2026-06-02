'use client';

import * as React from 'react';
import { Plus, RefreshCcw, Save, Trash2, Pencil, AlertCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useCreateSubscriptionPlanAdminMutation,
  useDeleteSubscriptionPlanAdminMutation,
  useListSubscriptionPlansAdminQuery,
  useUpdateSubscriptionPlanAdminMutation,
} from '@/integrations/hooks';
import type {
  SubscriptionPlanAdmin,
  SubscriptionPlanAdminPayload,
  SubscriptionPlanAdminUpdatePayload,
  SubscriptionPlanPeriod,
} from '@/integrations/shared';

type PlanFormValues = {
  code: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  currency: string;
  period: SubscriptionPlanPeriod;
  trial_days: string;
  price_minor: string;
  features: string;
  is_active: boolean;
  display_order: string;
};

const PERIODS: SubscriptionPlanPeriod[] = ['monthly', 'yearly', 'lifetime'];

const FIELD_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm transition-all';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

function emptyForm(): PlanFormValues {
  return {
    code: '',
    name_tr: '',
    name_en: '',
    description_tr: '',
    description_en: '',
    currency: 'TRY',
    period: 'monthly',
    trial_days: '0',
    price_minor: '0',
    features: '',
    is_active: true,
    display_order: '0',
  };
}

function toPayload(v: PlanFormValues): SubscriptionPlanAdminPayload {
  return {
    code: v.code.trim(),
    name_tr: v.name_tr.trim(),
    name_en: v.name_en.trim(),
    description_tr: v.description_tr.trim() || null,
    description_en: v.description_en.trim() || null,
    currency: v.currency.trim() || 'TRY',
    period: v.period,
    trial_days: Number(v.trial_days || 0),
    price_minor: Number(v.price_minor || 0),
    features: v.features
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
    is_active: v.is_active ? 1 : 0,
    display_order: Number(v.display_order || 0),
  };
}

function toPatchPayload(v: PlanFormValues): SubscriptionPlanAdminUpdatePayload {
  return {
    ...toPayload(v),
    code: v.code.trim(),
  };
}

function hydrateForm(row: SubscriptionPlanAdmin): PlanFormValues {
  return {
    code: row.code,
    name_tr: row.name_tr,
    name_en: row.name_en,
    description_tr: row.description_tr || '',
    description_en: row.description_en || '',
    currency: row.currency,
    period: row.period,
    trial_days: String(row.trial_days || 0),
    price_minor: String(row.price_minor || 0),
    features: Array.isArray(row.features)
      ? row.features.join(', ')
      : typeof row.features === 'string'
        ? row.features
        : '',
    is_active: Boolean(row.is_active),
    display_order: String(row.display_order || 0),
  };
}

function formatPriceMinor(value: string) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '-';
  return `${(n / 100).toFixed(2)} TL`;
}

export default function AdminSubscriptionPlansClient() {
  const t = useAdminT('admin.subscriptionPlans');
  const list = useListSubscriptionPlansAdminQuery({ limit: 200 });
  const [createPlan] = useCreateSubscriptionPlanAdminMutation();
  const [updatePlan] = useUpdateSubscriptionPlanAdminMutation();
  const [deletePlan] = useDeleteSubscriptionPlanAdminMutation();

  const [form, setForm] = React.useState<PlanFormValues>(emptyForm);
  const [editingId, setEditingId] = React.useState<string>('');

  const plans = list.data?.data ?? [];

  function setField<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(row: SubscriptionPlanAdmin) {
    setEditingId(row.id);
    setForm(hydrateForm(row));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm());
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!form.code.trim() || !form.name_tr.trim() || !form.name_en.trim()) {
        toast.error(t('toasts.required', null, 'Kod ve isimler zorunludur.'));
        return;
      }
      if (!editingId) {
        await createPlan(toPayload(form)).unwrap();
        toast.success(t('toasts.created', null, 'Plan oluşturuldu.'));
      } else {
        await updatePlan({ id: editingId, body: toPatchPayload(form) }).unwrap();
        toast.success(t('toasts.updated', null, 'Plan güncellendi.'));
      }
      resetForm();
    } catch (err) {
      toast.error(t('toasts.saveFailed', null, 'Plan kaydedilemedi.'));
      console.error(err);
    }
  }

  async function removePlan(id: string) {
    if (!window.confirm(t('confirms.delete', null, 'Bu plan silinsin mi? Bu işlem geri alınamaz.'))) return;
    try {
      await deletePlan({ id }).unwrap();
      toast.success(t('toasts.deleted', null, 'Plan silindi.'));
      if (editingId === id) resetForm();
    } catch {
      toast.error(t('toasts.deleteFailed', null, 'Plan silinemedi. Kullanımda olabilir.'));
    }
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('header.badge', null, 'Abonelik Planları')}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title', null, 'Abonelik Planları')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {t('description', null, 'Planları ekleyin, güncelleyin ve arşivleyin.')}
          </p>
        </div>

        <div className="flex items-center gap-6 bg-gm-surface/20 px-8 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <div className="text-center sm:text-right min-w-[80px]">
            <p className="text-[10px] font-bold text-gm-muted tracking-widest uppercase mb-1">
              {t('summary.total_label', null, 'Toplam')}
            </p>
            <p className="font-serif text-3xl text-gm-gold">{plans.length}</p>
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

      {/* Form Card */}
      <Card className="bg-gm-bg-deep/50 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {editingId
                ? t('form.editTitle', null, 'Planı düzenle')
                : t('form.newTitle', null, 'Yeni plan')}
            </span>
          </div>

          <form className="grid gap-6 md:grid-cols-3" onSubmit={onSubmit}>
            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.code', null, 'Kod')}</Label>
              <Input className={FIELD_CLS} value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="gold_monthly" />
            </div>
            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.nameTr', null, 'İsim (TR)')}</Label>
              <Input className={FIELD_CLS} value={form.name_tr} onChange={(e) => setField('name_tr', e.target.value)} placeholder="Aylık Abonelik" />
            </div>
            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.nameEn', null, 'İsim (EN)')}</Label>
              <Input className={FIELD_CLS} value={form.name_en} onChange={(e) => setField('name_en', e.target.value)} placeholder="Monthly Plan" />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className={LABEL_CLS}>{t('form.descTr', null, 'Açıklama (TR)')}</Label>
              <Textarea rows={2} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" value={form.description_tr} onChange={(e) => setField('description_tr', e.target.value)} />
            </div>
            <div className="space-y-3 md:col-span-1">
              <Label className={LABEL_CLS}>{t('form.descEn', null, 'Açıklama (EN)')}</Label>
              <Textarea rows={2} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" value={form.description_en} onChange={(e) => setField('description_en', e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.currency', null, 'Para birimi')}</Label>
              <Input className={FIELD_CLS} value={form.currency} onChange={(e) => setField('currency', e.target.value.toUpperCase())} />
            </div>

            <div className="space-y-3">
              <Label className={cn(LABEL_CLS, 'block')}>{t('form.period', null, 'Periyot')}</Label>
              <Select value={form.period} onValueChange={(v) => setField('period', v as SubscriptionPlanPeriod)}>
                <SelectTrigger className={FIELD_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(`periods.${p}`, null, p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.priceMinor', null, 'Fiyat (kuruş)')}</Label>
              <Input className={FIELD_CLS} type="number" value={form.price_minor} onChange={(e) => setField('price_minor', e.target.value)} placeholder="1999" />
              <p className="text-[10px] text-gm-muted italic ml-1">
                {t('form.priceHint', null, 'Görünüm')}: {formatPriceMinor(form.price_minor)}
              </p>
            </div>

            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.trialDays', null, 'Deneme günü')}</Label>
              <Input className={FIELD_CLS} type="number" value={form.trial_days} onChange={(e) => setField('trial_days', e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.displayOrder', null, 'Sıra')}</Label>
              <Input className={FIELD_CLS} type="number" value={form.display_order} onChange={(e) => setField('display_order', e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label className={LABEL_CLS}>{t('form.features', null, 'Özellikler (virgülle)')}</Label>
              <Input className={FIELD_CLS} value={form.features} onChange={(e) => setField('features', e.target.value)} placeholder="chat, voice, ai" />
            </div>

            <div className="flex items-center gap-3 pt-9">
              <Checkbox id="is_active" checked={form.is_active} onCheckedChange={(value) => setField('is_active', Boolean(value))} />
              <Label htmlFor="is_active" className="text-sm text-gm-text">{t('form.active', null, 'Aktif')}</Label>
            </div>

            <div className="md:col-span-3 flex flex-wrap gap-4 pt-2">
              <Button type="submit" className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]">
                <Save className="mr-2 size-4" />
                {editingId ? t('actions.update', null, 'Planı güncelle') : t('actions.create', null, 'Plan oluştur')}
              </Button>

              {editingId ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
                >
                  <Plus className="mr-2 size-4" />
                  {t('actions.new', null, 'Yeni')}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.code', null, 'Kod')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.name', null, 'İsim')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.period', null, 'Periyot')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.price', null, 'Fiyat')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-center text-gm-muted">{t('table.status', null, 'Durum')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actions', null, 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isFetching && plans.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-gm-border-soft">
                    <TableCell className="py-6 px-8"><Skeleton className="h-6 w-28 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-6 w-20 bg-gm-surface/20 mx-auto" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-8 w-20 bg-gm-surface/20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="py-6 px-8"><Skeleton className="h-10 w-20 ml-auto bg-gm-surface/20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('table.empty', null, 'Plan bulunamadı.')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gm-gold/10 flex items-center justify-center text-gm-gold shadow-inner border border-gm-gold/20">
                          <Tag size={16} />
                        </div>
                        <span className="font-mono text-[11px] font-bold tracking-widest text-gm-gold opacity-80">{plan.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{plan.name_tr}</div>
                      <div className="text-[10px] text-gm-muted font-mono opacity-50 tracking-tighter">{plan.name_en}</div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gm-muted">{t(`periods.${plan.period}`, null, plan.period)}</span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="font-serif text-lg text-gm-text font-bold">{(Number(plan.price_minor || 0) / 100).toFixed(2)} {plan.currency}</span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border transition-all',
                        plan.is_active ? 'bg-gm-success/10 text-gm-success border-gm-success/20' : 'bg-gm-surface/40 text-gm-muted border-gm-border-soft'
                      )}>
                        <div className={cn('w-1 h-1 rounded-full', plan.is_active ? 'bg-gm-success' : 'bg-gm-muted')} />
                        {plan.is_active ? t('statuses.active', null, 'Aktif') : t('statuses.inactive', null, 'Pasif')}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(plan)} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-all">
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removePlan(plan.id)} className="rounded-full hover:bg-gm-error/10 hover:text-gm-error transition-all">
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
