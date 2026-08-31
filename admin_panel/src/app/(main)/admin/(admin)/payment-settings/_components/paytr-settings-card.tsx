'use client';

// PayTR magaza ayarlari — .env yerine admin panelden yonetilir.
// Sirlar backend'de sifreli saklanir; bu ekrana yalniz maskeli onizleme doner,
// bos birakilan sir alani MEVCUT degeri korur.

import * as React from 'react';
import { toast } from 'sonner';
import { Check, Copy, KeyRound, RefreshCcw, ShieldAlert, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BASE_URL } from '@/integrations/apiBase';
import { tokenStore } from '@/integrations/core/token';

type FieldSource = 'db' | 'env' | 'none';

type PaytrSettings = {
  enabled: boolean;
  testMode: boolean;
  merchantId: string;
  hasMerchantKey: boolean;
  hasMerchantSalt: boolean;
  merchantKeyPreview: string;
  merchantSaltPreview: string;
  ready: boolean;
  decryptFailed: boolean;
  callbackUrl?: string;
  source: {
    enabled: FieldSource;
    testMode: FieldSource;
    merchantId: FieldSource;
    merchantKey: FieldSource;
    merchantSalt: FieldSource;
  };
};

const FIELD =
  'h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm font-mono text-gm-text transition-all';
const LABEL = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1 block';

function authHeaders(): Record<string, string> {
  const token =
    tokenStore.get() ||
    (typeof window !== 'undefined' ? window.localStorage.getItem('mh_access_token') : null);
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...authHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new Error(`request_failed_${res.status}`);
  return (await res.json()) as T;
}

function SourceBadge({ source }: { source: FieldSource }) {
  if (source === 'db') {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[9px] tracking-widest uppercase">
        Panel
      </Badge>
    );
  }
  if (source === 'env') {
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border-0 text-[9px] tracking-widest uppercase">
        .env
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-500/15 text-slate-500 border-0 text-[9px] tracking-widest uppercase">
      Yok
    </Badge>
  );
}

export default function PaytrSettingsCard() {
  const [data, setData] = React.useState<PaytrSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const [merchantId, setMerchantId] = React.useState('');
  const [merchantKey, setMerchantKey] = React.useState('');
  const [merchantSalt, setMerchantSalt] = React.useState('');
  const [enabled, setEnabled] = React.useState(false);
  const [testMode, setTestMode] = React.useState(true);

  const applyResponse = React.useCallback((next: PaytrSettings) => {
    setData(next);
    setMerchantId(next.merchantId || '');
    setEnabled(Boolean(next.enabled));
    setTestMode(Boolean(next.testMode));
    setMerchantKey('');
    setMerchantSalt('');
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      applyResponse(await apiJson<PaytrSettings>('/admin/paytr/settings'));
    } catch {
      setError('PayTR ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const next = await apiJson<PaytrSettings>('/admin/paytr/settings', {
        method: 'PUT',
        body: JSON.stringify({
          enabled,
          testMode,
          merchantId: merchantId.trim(),
          // Bos gonderilen sir alani sunucuda mevcut degeri korur.
          merchantKey: merchantKey.trim(),
          merchantSalt: merchantSalt.trim(),
        }),
      });
      applyResponse(next);
      toast.success(
        next.ready
          ? `Kaydedildi — PayTR ${next.testMode ? 'TEST' : 'CANLI'} modunda kullanıma hazır.`
          : 'Kaydedildi. Eksik alan var, ödeme hâlâ kapalı.',
      );
    } catch (err: any) {
      toast.error(
        err?.message === 'request_failed_400'
          ? 'Mağaza numarası yalnızca rakam olmalı.'
          : 'Kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  };

  const copyCallback = async () => {
    if (!data?.callbackUrl) return;
    await navigator.clipboard.writeText(data.callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const busy = loading || saving;

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardContent className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-gm-text flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-gm-gold" />
              PayTR
            </h2>
            <p className="text-gm-muted text-[13px] font-serif italic opacity-70">
              Mağaza bilgileri panelden yönetilir; sunucuda şifreli saklanır.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data ? (
              <Badge
                className={cn(
                  'border-0 text-[10px] tracking-widest uppercase px-3 py-1.5',
                  data.ready
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-red-500/15 text-red-500',
                )}
              >
                {data.ready ? (
                  <ShieldCheck className="mr-1.5 size-3.5" />
                ) : (
                  <ShieldAlert className="mr-1.5 size-3.5" />
                )}
                {data.ready ? (data.testMode ? 'Hazır · Test' : 'Hazır · Canlı') : 'Ödeme kapalı'}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={busy}
              className="rounded-full border-gm-border-soft px-6 h-11 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
            >
              <RefreshCcw className={cn('mr-2 size-4', loading && 'animate-spin')} />
              Yenile
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-500/10 px-5 py-3 text-[13px] font-semibold text-red-500">{error}</p>
        ) : null}

        {data?.decryptFailed ? (
          <p className="rounded-2xl bg-amber-500/10 px-5 py-3 text-[13px] font-semibold text-amber-600">
            Kayıtlı sırlar çözülemedi (JWT_SECRET değişmiş olabilir). Merchant Key ve Salt’ı yeniden girin.
          </p>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-5 py-4">
            <div>
              <p className="text-[13px] font-bold text-gm-text">Ödeme açık</p>
              <p className="text-[11px] text-gm-muted opacity-70">Kapalıyken checkout WhatsApp’a düşer.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} disabled={busy} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-5 py-4">
            <div>
              <p className="text-[13px] font-bold text-gm-text">Test modu</p>
              <p className="text-[11px] text-gm-muted opacity-70">
                Canlı moda geçince kapatın — gerçek para çekilir.
              </p>
            </div>
            <Switch checked={testMode} onCheckedChange={setTestMode} disabled={busy} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="paytr_merchant_id" className={LABEL}>
                Mağaza Numarası (Merchant ID)
              </Label>
              {data ? <SourceBadge source={data.source.merchantId} /> : null}
            </div>
            <Input
              id="paytr_merchant_id"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="742589"
              inputMode="numeric"
              disabled={busy}
              className={FIELD}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="paytr_merchant_key" className={LABEL}>
                Merchant Key
              </Label>
              {data ? <SourceBadge source={data.source.merchantKey} /> : null}
            </div>
            <Input
              id="paytr_merchant_key"
              type="password"
              value={merchantKey}
              onChange={(e) => setMerchantKey(e.target.value)}
              placeholder={data?.hasMerchantKey ? `Kayıtlı: ${data.merchantKeyPreview}` : 'PayTR panel → Bilgi'}
              autoComplete="off"
              disabled={busy}
              className={FIELD}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="paytr_merchant_salt" className={LABEL}>
                Merchant Salt
              </Label>
              {data ? <SourceBadge source={data.source.merchantSalt} /> : null}
            </div>
            <Input
              id="paytr_merchant_salt"
              type="password"
              value={merchantSalt}
              onChange={(e) => setMerchantSalt(e.target.value)}
              placeholder={data?.hasMerchantSalt ? `Kayıtlı: ${data.merchantSaltPreview}` : 'PayTR panel → Bilgi'}
              autoComplete="off"
              disabled={busy}
              className={FIELD}
            />
          </div>

          <p className="md:col-span-2 text-[11px] text-gm-muted opacity-70 ml-1">
            Sır alanları boş bırakılırsa kayıtlı değer korunur. Değiştirmek için yeni değeri yazın.
          </p>
        </div>

        {data?.callbackUrl ? (
          <div className="space-y-2">
            <Label className={LABEL}>PayTR paneline girilecek bildirim URL’si</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={data.callbackUrl} className={cn(FIELD, 'text-gm-muted')} />
              <Button
                type="button"
                variant="outline"
                onClick={() => void copyCallback()}
                className="rounded-full border-gm-border-soft h-12 px-5 shrink-0"
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy}
            className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
