// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/components/ChatSettingsPanel.tsx
// Chat & AI Support Settings Panel — gm standart kabuk
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListSiteSettingsAdminQuery,
  useBulkUpsertSiteSettingsAdminMutation,
  useUpdateSiteSettingAdminMutation,
} from '@/integrations/hooks';
import type { SiteSettingRow, UpsertSettingBody, ValueType } from '@/integrations/shared';

const CARD = 'bg-gm-surface/20 border-gm-border-soft rounded-[28px] backdrop-blur-sm shadow-xl';
const SECTION_TITLE = 'text-[11px] font-bold tracking-[0.2em] uppercase text-gm-gold';
const FIELD = 'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 focus:ring-gm-gold/50 text-sm';
const FIELD_MONO = 'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 focus:ring-gm-gold/50 font-mono text-xs';
const LABEL = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';
const SUBLABEL = 'text-[10px] font-bold text-gm-muted tracking-widest uppercase ml-1';
const TOGGLE_ROW = 'flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-4';
const PROVIDER_BOX = 'space-y-3 rounded-2xl border border-gm-border-soft bg-gm-surface/20 p-5';

// ─── Setting keys ────────────────────────────────────────────

const CHAT_KEYS = [
  'chat_ai_enabled',
  'chat_widget_enabled',
  'chat_ai_default_provider',
  'chat_ai_provider_order',
  'chat_ai_system_prompt',
  'chat_ai_offer_url',
  'chat_ai_groq_api_key',
  'chat_ai_groq_model',
  'chat_ai_groq_api_base',
  'chat_ai_xai_api_key',
  'chat_ai_xai_model',
  'chat_ai_xai_api_base',
  'chat_ai_openai_api_key',
  'chat_ai_openai_model',
  'chat_ai_openai_api_base',
  'chat_ai_anthropic_api_key',
  'chat_ai_anthropic_model',
] as const;

type ChatKey = (typeof CHAT_KEYS)[number];

const CHAT_BOOL_KEYS = new Set<ChatKey>(['chat_ai_enabled', 'chat_widget_enabled']);

type ChatSettingsModel = Record<ChatKey, string>;

const defaults: ChatSettingsModel = {
  chat_ai_enabled: 'true',
  chat_widget_enabled: 'true',
  chat_ai_default_provider: 'auto',
  chat_ai_provider_order: 'grok,openai,anthropic',
  chat_ai_system_prompt: '',
  chat_ai_offer_url: '',
  chat_ai_groq_api_key: '',
  chat_ai_groq_model: 'llama-3.3-70b-versatile',
  chat_ai_groq_api_base: 'https://api.groq.com/openai/v1',
  chat_ai_xai_api_key: '',
  chat_ai_xai_model: 'grok-2-latest',
  chat_ai_xai_api_base: 'https://api.x.ai/v1',
  chat_ai_openai_api_key: '',
  chat_ai_openai_model: 'gpt-4o-mini',
  chat_ai_openai_api_base: 'https://api.openai.com/v1',
  chat_ai_anthropic_api_key: '',
  chat_ai_anthropic_model: 'claude-3-5-haiku-latest',
};

// ─── Helpers ─────────────────────────────────────────────────

const toBoolish = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
  }
  return false;
};

const boolToDb = (b: boolean): 'true' | 'false' => (b ? 'true' : 'false');

// ─── API Key Input (mask/unmask) ─────────────────────────────

function ApiKeyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(FIELD_MONO, 'pr-10')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gm-muted hover:text-gm-gold transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────

export default function ChatSettingsPanel() {
  const t = useAdminT('admin.chat');
  const { localeOptions, defaultLocaleFromDb, coerceLocale } = useAdminLocales();
  const { data: rows, isLoading, isFetching } = useListSiteSettingsAdminQuery(undefined);
  const [bulkUpsert, { isLoading: saving }] = useBulkUpsertSiteSettingsAdminMutation();
  const [updateSetting, updateState] = useUpdateSiteSettingAdminMutation();

  const [model, setModel] = React.useState<ChatSettingsModel>(defaults);
  const [welcomeByLocale, setWelcomeByLocale] = React.useState<Record<string, string>>({});
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!rows || initialized) return;

    const m: ChatSettingsModel = { ...defaults };

    for (const item of rows as SiteSettingRow[]) {
      const rawKey = String(item.key ?? '').trim();
      if (rawKey === 'chat_ai_welcome_message') continue;
      const k = rawKey as ChatKey;
      if (!CHAT_KEYS.includes(k)) continue;

      const v: unknown = item.value;

      if (CHAT_BOOL_KEYS.has(k)) {
        m[k] = boolToDb(toBoolish(v));
      } else {
        m[k] = v == null ? '' : String(v);
      }
    }

    const localeMap: Record<string, string> = {};
    for (const item of rows as SiteSettingRow[]) {
      if (String(item.key ?? '') !== 'chat_ai_welcome_message') continue;
      const locale = coerceLocale(item.locale, defaultLocaleFromDb);
      if (!locale) continue;
      localeMap[locale] = item.value == null ? '' : String(item.value);
    }

    setModel(m);
    setWelcomeByLocale(localeMap);
    setInitialized(true);
  }, [rows, initialized, coerceLocale, defaultLocaleFromDb]);

  const initialLoading = !initialized && (isLoading || isFetching);

  const setDbFlag = (key: ChatKey, v: boolean) => {
    setModel((prev) => ({ ...prev, [key]: boolToDb(v) }));
  };

  const setStr = (key: ChatKey, v: string) => {
    setModel((prev) => ({ ...prev, [key]: v }));
  };

  const handleSave = async () => {
    try {
      const items: UpsertSettingBody[] = (
        Object.entries(model) as Array<[ChatKey, string]>
      ).map(([key, value]) => ({
        key,
        value: CHAT_BOOL_KEYS.has(key) ? (toBoolish(value) ? 'true' : 'false') : value,
        value_type: 'string' as ValueType,
        group: null,
        description: null,
      }));

      await bulkUpsert({ items }).unwrap();
      const localesToSave = localeOptions.length
        ? localeOptions.map((opt) => opt.value)
        : [coerceLocale('', defaultLocaleFromDb)].filter(Boolean);

      await Promise.all(
        localesToSave.map((locale) =>
          updateSetting({
            key: 'chat_ai_welcome_message',
            locale,
            value: String(welcomeByLocale[locale] ?? '').trim(),
          }).unwrap(),
        ),
      );
      toast.success(t('settings.saved'));
    } catch (e) {
      console.error(e);
      toast.error((e as { message?: string })?.message || t('settings.saveError'));
    }
  };

  if (initialLoading) {
    return <div className="py-8 text-sm text-gm-muted italic font-serif opacity-60">{t('settings.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* General */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className={SECTION_TITLE}>{t('settings.generalTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={TOGGLE_ROW}>
            <div>
              <Label className="text-sm font-medium text-gm-text">{t('settings.aiEnabled')}</Label>
              <p className="text-xs text-gm-muted opacity-70">{t('settings.aiEnabledDesc')}</p>
            </div>
            <Switch checked={toBoolish(model.chat_ai_enabled)} onCheckedChange={(v: boolean) => setDbFlag('chat_ai_enabled', v)} />
          </div>

          <div className={TOGGLE_ROW}>
            <div>
              <Label className="text-sm font-medium text-gm-text">{t('settings.widgetEnabled')}</Label>
              <p className="text-xs text-gm-muted opacity-70">{t('settings.widgetEnabledDesc')}</p>
            </div>
            <Switch checked={toBoolish(model.chat_widget_enabled)} onCheckedChange={(v: boolean) => setDbFlag('chat_widget_enabled', v)} />
          </div>

          <div className="space-y-2">
            <Label className={cn(LABEL, 'block')}>{t('settings.defaultProvider')}</Label>
            <Select value={model.chat_ai_default_provider} onValueChange={(v) => setStr('chat_ai_default_provider', v)}>
              <SelectTrigger className={cn(FIELD, 'w-[220px]')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="grok">Grok / Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={LABEL}>{t('settings.providerOrder')}</Label>
            <Input value={model.chat_ai_provider_order} onChange={(e) => setStr('chat_ai_provider_order', e.target.value)} placeholder="grok,openai,anthropic" className={FIELD} />
            <p className="text-xs text-gm-muted opacity-70 ml-1">{t('settings.providerOrderDesc')}</p>
          </div>

          <div className="space-y-2">
            <Label className={LABEL}>{t('settings.offerUrl')}</Label>
            <Input value={model.chat_ai_offer_url} onChange={(e) => setStr('chat_ai_offer_url', e.target.value)} placeholder="https://example.com/{locale}/offer" className={FIELD} />
            <p className="text-xs text-gm-muted opacity-70 ml-1">{t('settings.offerUrlDesc')}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Providers */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className={SECTION_TITLE}>{t('settings.providersTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Groq */}
          <div className={PROVIDER_BOX}>
            <Label className="text-sm font-serif text-gm-text">Groq (Llama)</Label>
            <div className="space-y-2">
              <Label className={SUBLABEL}>API Key</Label>
              <ApiKeyInput value={model.chat_ai_groq_api_key} onChange={(v) => setStr('chat_ai_groq_api_key', v)} placeholder="gsk_..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={SUBLABEL}>Model</Label>
                <Input value={model.chat_ai_groq_model} onChange={(e) => setStr('chat_ai_groq_model', e.target.value)} placeholder="llama-3.3-70b-versatile" className={FIELD_MONO} />
              </div>
              <div className="space-y-2">
                <Label className={SUBLABEL}>API Base</Label>
                <Input value={model.chat_ai_groq_api_base} onChange={(e) => setStr('chat_ai_groq_api_base', e.target.value)} placeholder="https://api.groq.com/openai/v1" className={FIELD_MONO} />
              </div>
            </div>
          </div>

          {/* xAI / Grok */}
          <div className={PROVIDER_BOX}>
            <Label className="text-sm font-serif text-gm-text">xAI / Grok</Label>
            <div className="space-y-2">
              <Label className={SUBLABEL}>API Key</Label>
              <ApiKeyInput value={model.chat_ai_xai_api_key} onChange={(v) => setStr('chat_ai_xai_api_key', v)} placeholder="xai-..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={SUBLABEL}>Model</Label>
                <Input value={model.chat_ai_xai_model} onChange={(e) => setStr('chat_ai_xai_model', e.target.value)} placeholder="grok-2-latest" className={FIELD_MONO} />
              </div>
              <div className="space-y-2">
                <Label className={SUBLABEL}>API Base</Label>
                <Input value={model.chat_ai_xai_api_base} onChange={(e) => setStr('chat_ai_xai_api_base', e.target.value)} placeholder="https://api.x.ai/v1" className={FIELD_MONO} />
              </div>
            </div>
          </div>

          {/* OpenAI */}
          <div className={PROVIDER_BOX}>
            <Label className="text-sm font-serif text-gm-text">OpenAI</Label>
            <div className="space-y-2">
              <Label className={SUBLABEL}>API Key</Label>
              <ApiKeyInput value={model.chat_ai_openai_api_key} onChange={(v) => setStr('chat_ai_openai_api_key', v)} placeholder="sk-..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={SUBLABEL}>Model</Label>
                <Input value={model.chat_ai_openai_model} onChange={(e) => setStr('chat_ai_openai_model', e.target.value)} placeholder="gpt-4o-mini" className={FIELD_MONO} />
              </div>
              <div className="space-y-2">
                <Label className={SUBLABEL}>API Base</Label>
                <Input value={model.chat_ai_openai_api_base} onChange={(e) => setStr('chat_ai_openai_api_base', e.target.value)} placeholder="https://api.openai.com/v1" className={FIELD_MONO} />
              </div>
            </div>
          </div>

          {/* Anthropic */}
          <div className={PROVIDER_BOX}>
            <Label className="text-sm font-serif text-gm-text">Anthropic</Label>
            <div className="space-y-2">
              <Label className={SUBLABEL}>API Key</Label>
              <ApiKeyInput value={model.chat_ai_anthropic_api_key} onChange={(v) => setStr('chat_ai_anthropic_api_key', v)} placeholder="sk-ant-..." />
            </div>
            <div className="space-y-2">
              <Label className={SUBLABEL}>Model</Label>
              <Input value={model.chat_ai_anthropic_model} onChange={(e) => setStr('chat_ai_anthropic_model', e.target.value)} placeholder="claude-3-5-haiku-latest" className={FIELD_MONO} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className={SECTION_TITLE}>{t('settings.systemPromptTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            rows={5}
            value={model.chat_ai_system_prompt}
            onChange={(e) => setStr('chat_ai_system_prompt', e.target.value)}
            placeholder={t('settings.systemPromptPlaceholder')}
            className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
          />
          <p className="text-xs text-gm-muted opacity-70 ml-1">{t('settings.systemPromptDesc')}</p>
        </CardContent>
      </Card>

      {/* Welcome Messages */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className={SECTION_TITLE}>{t('settings.welcomeTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(localeOptions.length ? localeOptions : [{ value: coerceLocale('', defaultLocaleFromDb), label: 'Default' }])
            .filter((opt) => !!opt.value)
            .map((opt) => (
              <div className="space-y-2" key={opt.value}>
                <Label className={LABEL}>{opt.label || opt.value.toUpperCase()}</Label>
                <Textarea
                  rows={2}
                  value={welcomeByLocale[opt.value] ?? ''}
                  onChange={(e) =>
                    setWelcomeByLocale((prev) => ({
                      ...prev,
                      [opt.value]: e.target.value,
                    }))
                  }
                  placeholder={t('settings.welcomePlaceholder')}
                  className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
                />
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || updateState.isLoading} className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]">
          <Save className="mr-2 h-4 w-4" />
          {saving || updateState.isLoading ? t('settings.saving') : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}
