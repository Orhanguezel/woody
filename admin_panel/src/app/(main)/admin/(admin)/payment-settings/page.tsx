'use client';
// =============================================================
// FILE: src/app/(main)/admin/(admin)/payment-settings/page.tsx
// Ödeme Ayarları — odaklı Iyzipay sayfası. Mantık tekrarı YOK:
// site-settings ile AYNI RTK endpoint'leri (useListSiteSettingsAdminQuery /
// useUpdateSiteSettingAdminMutation), yalnız iyzipay_* anahtarlarına kapsanmış.
// Genel kabuk: woody orders standardı (gm-theme).
// =============================================================

import * as React from 'react';
import { toast } from 'sonner';
import { RefreshCcw, CreditCard } from 'lucide-react';

import { useAdminTranslations } from '@/i18n';
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';
import {
  useListSiteSettingsAdminQuery,
  useUpdateSiteSettingAdminMutation,
} from '@/integrations/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const IYZIPAY_KEYS = ['iyzipay_api_key', 'iyzipay_secret_key', 'iyzipay_base_url'] as const;
type IyziKey = (typeof IYZIPAY_KEYS)[number];
type IyziForm = Record<IyziKey, string>;
const EMPTY_FORM: IyziForm = { iyzipay_api_key: '', iyzipay_secret_key: '', iyzipay_base_url: '' };

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
function toMap(settings?: any) {
  const map = new Map<string, any>();
  if (settings) for (const s of settings) map.set(s.key, s);
  return map;
}

const FIELD = 'h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm font-mono text-gm-text transition-all';
const LABEL = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1 block';

export default function PaymentSettingsPage() {
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const t = useAdminTranslations(adminLocale || undefined);

  const { data: settings, isLoading, isFetching, refetch } = useListSiteSettingsAdminQuery({
    keys: IYZIPAY_KEYS as unknown as string[],
    locale: '*', // GLOBAL
  } as any);
  const [updateSetting, { isLoading: isSaving }] = useUpdateSiteSettingAdminMutation();

  const [form, setForm] = React.useState<IyziForm>(EMPTY_FORM);

  React.useEffect(() => {
    const map = toMap(settings);
    const next: IyziForm = { ...EMPTY_FORM };
    IYZIPAY_KEYS.forEach((k) => {
      next[k] = valueToString(map.get(k)?.value);
    });
    setForm(next);
  }, [settings]);

  const busy = isLoading || isFetching || isSaving;
  const set = (k: IyziKey, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      for (const key of IYZIPAY_KEYS) {
        await updateSetting({ key, value: form[key].trim(), locale: '*' }).unwrap();
      }
      toast.success(t('admin.siteSettings.api.saved', null, 'Kaydedildi'));
      await refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || t('admin.siteSettings.api.saveError', null, 'Kaydedilemedi'),
      );
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Ödeme</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-gm-gold" />
            {t('admin.siteSettings.api.iyzipaySection', null, 'Ödeme Ayarları (Iyzipay)')}
          </h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            {t(
              'admin.siteSettings.api.iyzipayDesc',
              null,
              'Iyzipay ödeme entegrasyonu — global ayardır (locale=*). Sandbox/prod URL’ye dikkat.',
            )}
          </p>
        </div>
        <div className="flex items-center bg-gm-surface/20 px-6 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={busy}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={cn('mr-2 size-4', isFetching && 'animate-spin')} />
            {t('admin.common.refresh', null, 'Yenile')}
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="iyzipay_api_key" className={LABEL}>
                {t('admin.siteSettings.api.iyzipayApiKey', null, 'Iyzipay API Key')}
              </Label>
              <Input
                id="iyzipay_api_key"
                value={form.iyzipay_api_key}
                onChange={(e) => set('iyzipay_api_key', e.target.value)}
                placeholder="API Key"
                disabled={busy}
                className={FIELD}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iyzipay_secret_key" className={LABEL}>
                {t('admin.siteSettings.api.iyzipaySecretKey', null, 'Iyzipay Secret Key')}
              </Label>
              <Input
                id="iyzipay_secret_key"
                type="password"
                value={form.iyzipay_secret_key}
                onChange={(e) => set('iyzipay_secret_key', e.target.value)}
                placeholder="Secret Key"
                disabled={busy}
                className={FIELD}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="iyzipay_base_url" className={LABEL}>
                {t('admin.siteSettings.api.iyzipayBaseUrl', null, 'Iyzipay Base URL')}
              </Label>
              <Input
                id="iyzipay_base_url"
                value={form.iyzipay_base_url}
                onChange={(e) => set('iyzipay_base_url', e.target.value)}
                placeholder="https://sandbox-api.iyzipay.com"
                disabled={busy}
                className={FIELD}
              />
              <p className="text-[11px] text-gm-muted opacity-70 ml-1">
                {t(
                  'admin.siteSettings.api.iyzipayBaseUrlHint',
                  null,
                  'Test: https://sandbox-api.iyzipay.com · Canlı: https://api.iyzipay.com',
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
            >
              {isSaving ? t('admin.common.saving', null, 'Kaydediliyor…') : t('admin.common.save', null, 'Kaydet')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
