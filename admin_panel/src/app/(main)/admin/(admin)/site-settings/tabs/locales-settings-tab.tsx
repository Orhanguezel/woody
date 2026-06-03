"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/site-settings/tabs/locales-settings-tab.tsx
// Admin — Locales (app_locales + default_locale)
// - GLOBAL (*) settings
// - No bootstrap
// =============================================================

import * as React from "react";

import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { normLocaleTag, useAdminTranslations } from "@/i18n";
import {
  useGetAppLocalesAdminQuery,
  useGetDefaultLocaleAdminQuery,
  useUpdateSiteSettingAdminMutation,
} from "@/integrations/hooks";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

type LocaleRow = {
  code: string;
  label: string;
  is_active: boolean;
};

function toShortLocale(v: unknown): string {
  return normLocaleTag(v);
}

function safeStr(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

function normalizeRows(raw: unknown): LocaleRow[] {
  const arr = Array.isArray(raw) ? raw : [];

  const out: LocaleRow[] = [];
  const seen = new Set<string>();

  for (const item of arr as any[]) {
    const code = toShortLocale(item?.code ?? item);
    if (!code) continue;
    if (seen.has(code)) continue;
    seen.add(code);

    const label = safeStr(item?.label).trim();
    out.push({
      code,
      label: label || code.toUpperCase(),
      is_active: item?.is_active === undefined ? true : Boolean(item?.is_active),
    });
  }

  // default ordering: active first, then alpha
  return out.sort((a, b) => {
    const aa = a.is_active ? 0 : 1;
    const bb = b.is_active ? 0 : 1;
    if (aa !== bb) return aa - bb;
    return a.code.localeCompare(b.code);
  });
}

function upsertDefaultLocale(rows: LocaleRow[], desired: string): string {
  const set = new Set(rows.filter((r) => r.is_active).map((r) => r.code));
  const want = toShortLocale(desired);
  if (want && set.has(want)) return want;
  return rows.find((r) => r.is_active)?.code || "";
}

const TOP_20_LOCALES_PRESET: LocaleRow[] = [
  { code: "de", label: "Deutsch", is_active: true },
  { code: "en", label: "English", is_active: true },
  { code: "tr", label: "Türkçe", is_active: true },

  // common languages (inactive by default)
  { code: "es", label: "Español", is_active: false },
  { code: "fr", label: "Français", is_active: false },
  { code: "it", label: "Italiano", is_active: false },
  { code: "pt", label: "Português", is_active: false },
  { code: "ru", label: "Русский", is_active: false },
  { code: "ar", label: "العربية", is_active: false },
  { code: "hi", label: "हिन्दी", is_active: false },
  { code: "bn", label: "বাংলা", is_active: false },
  { code: "pa", label: "ਪੰਜਾਬੀ", is_active: false },
  { code: "ja", label: "日本語", is_active: false },
  { code: "ko", label: "한국어", is_active: false },
  { code: "zh", label: "中文", is_active: false },
  { code: "id", label: "Bahasa Indonesia", is_active: false },
  { code: "vi", label: "Tiếng Việt", is_active: false },
  { code: "th", label: "ไทย", is_active: false },
  { code: "nl", label: "Nederlands", is_active: false },
  { code: "pl", label: "Polski", is_active: false },
];

export function LocalesSettingsTab() {
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const t = useAdminTranslations(adminLocale || undefined);

  const appLocalesQ = useGetAppLocalesAdminQuery();
  const defaultLocaleQ = useGetDefaultLocaleAdminQuery();
  const [updateSetting, { isLoading: isSaving }] = useUpdateSiteSettingAdminMutation();

  const [rows, setRows] = React.useState<LocaleRow[]>([]);
  const [defaultLocale, setDefaultLocale] = React.useState<string>("");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (touched) return;
    const nextRows = normalizeRows(appLocalesQ.data);
    const nextDefault = upsertDefaultLocale(nextRows, defaultLocaleQ.data || "");
    setRows(nextRows);
    setDefaultLocale(nextDefault);
  }, [appLocalesQ.data, defaultLocaleQ.data, touched]);

  const busy = isSaving || appLocalesQ.isFetching || defaultLocaleQ.isFetching;

  const persist = async (nextRows: LocaleRow[], nextDefault: string) => {
    const def = upsertDefaultLocale(nextRows, nextDefault);

    const payload = nextRows.map((r) => ({
      code: r.code,
      label: r.label,
      is_default: r.code === def,
      is_active: r.is_active,
    }));

    try {
      await updateSetting({ key: "app_locales", locale: "*", value: payload }).unwrap();
      await updateSetting({ key: "default_locale", locale: "*", value: def || "de" }).unwrap();
      toast.success(t("admin.siteSettings.locales.saved"));
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.message || t("admin.siteSettings.locales.saveError");
      toast.error(msg);
      throw err;
    }
  };

  const onToggleActive = async (code: string, val: boolean) => {
    const prevRows = rows;
    const prevDefault = defaultLocale;

    setTouched(true);
    const nextRows = rows.map((r) => (r.code === code ? { ...r, is_active: val } : r));
    const nextDefault = upsertDefaultLocale(nextRows, defaultLocale);
    setRows(nextRows);
    setDefaultLocale(nextDefault);

    try {
      await persist(nextRows, nextDefault);
    } catch {
      setRows(prevRows);
      setDefaultLocale(prevDefault);
      setTouched(false);
    }
  };

  const onDefaultChange = async (code: string) => {
    const prevDefault = defaultLocale;
    setTouched(true);

    const desired = toShortLocale(code);
    const nextDefault = upsertDefaultLocale(rows, desired);
    setDefaultLocale(nextDefault);

    try {
      await persist(rows, nextDefault);
    } catch {
      setDefaultLocale(prevDefault);
      setTouched(false);
    }
  };

  const onPresetDeEnTr = async () => {
    const prevRows = rows;
    const prevDefault = defaultLocale;

    setTouched(true);
    const nextRows: LocaleRow[] = [
      { code: "de", label: "Deutsch", is_active: true },
      { code: "en", label: "English", is_active: true },
      { code: "tr", label: "Türkçe", is_active: true },
    ];
    const nextDefault = upsertDefaultLocale(nextRows, "de");
    setRows(nextRows);
    setDefaultLocale(nextDefault);

    try {
      await persist(nextRows, nextDefault);
    } catch {
      setRows(prevRows);
      setDefaultLocale(prevDefault);
      setTouched(false);
    }
  };

  const onPresetTop20 = async () => {
    const prevRows = rows;
    const prevDefault = defaultLocale;

    setTouched(true);
    const nextRows = TOP_20_LOCALES_PRESET.slice();
    const nextDefault = upsertDefaultLocale(nextRows, defaultLocale || "de");
    setRows(nextRows);
    setDefaultLocale(nextDefault);

    try {
      await persist(nextRows, nextDefault);
    } catch {
      setRows(prevRows);
      setDefaultLocale(prevDefault);
      setTouched(false);
    }
  };

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardHeader className="gap-2 bg-gm-surface/40 p-8 border-b border-gm-border-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="font-serif text-2xl text-gm-text">{t("admin.siteSettings.locales.title")}</CardTitle>
            <CardDescription className="text-gm-muted font-serif italic opacity-80">
              {t("admin.siteSettings.locales.description")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-gm-bg-deep text-gm-text border-gm-border-soft">
              {t("admin.siteSettings.badges.global")}
            </Badge>
            {busy ? (
              <Badge className="border-gm-gold/30 bg-gm-gold/5 text-gm-gold">
                {t("admin.siteSettings.messages.loading")}
              </Badge>
            ) : null}
            <Button
              variant="outline"
              size="icon"
              disabled={busy}
              onClick={async () => {
                try {
                  await Promise.all([appLocalesQ.refetch(), defaultLocaleQ.refetch()]);
                } catch {
                  toast.error(t("admin.siteSettings.messages.error"));
                }
              }}
              title={t("admin.siteSettings.actions.refresh")}
              className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
            >
              <RefreshCcw className={busy ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-8">
        {!rows.length ? (
          <div className="rounded-md border border-gm-border-soft p-4 text-sm text-gm-muted">
            <div className="mb-3">{t("admin.siteSettings.locales.empty")}</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={onPresetDeEnTr}
                disabled={busy}
                className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
              >
                {t("admin.siteSettings.locales.presetDeEnTr")}
              </Button>
              <Button
                variant="outline"
                onClick={onPresetTop20}
                disabled={busy}
                className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
              >
                {t("admin.siteSettings.locales.presetTop20")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                  {t("admin.siteSettings.locales.defaultLabel")}
                </Label>
                <Select value={defaultLocale || ""} onValueChange={onDefaultChange} disabled={busy}>
                  <SelectTrigger className="h-12 bg-gm-bg-deep border-gm-border-soft text-gm-text rounded-2xl focus:ring-gm-gold/50">
                    <SelectValue placeholder={t("admin.siteSettings.locales.defaultPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-gm-bg-deep border-gm-border-soft rounded-2xl">
                    {rows
                      .filter((r) => r.is_active)
                      .map((r) => (
                        <SelectItem
                          key={r.code}
                          value={r.code}
                          className="text-gm-text focus:bg-gm-gold/10 focus:text-gm-gold"
                        >
                          {r.label} ({r.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-start md:justify-end">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={onPresetDeEnTr}
                    disabled={busy}
                    className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
                  >
                    {t("admin.siteSettings.locales.presetDeEnTr")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onPresetTop20}
                    disabled={busy}
                    className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
                  >
                    {t("admin.siteSettings.locales.presetTop20")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gm-border-soft">
              <Table>
                <TableHeader className="bg-gm-surface/40">
                  <TableRow className="border-gm-border-soft">
                    <TableHead className="w-28 text-gm-muted">{t("admin.siteSettings.locales.table.code")}</TableHead>
                    <TableHead className="text-gm-muted">{t("admin.siteSettings.locales.table.label")}</TableHead>
                    <TableHead className="w-28 text-center text-gm-muted">
                      {t("admin.siteSettings.locales.table.active")}
                    </TableHead>
                    <TableHead className="w-28 text-center text-gm-muted">
                      {t("admin.siteSettings.locales.table.default")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.code} className="border-gm-border-soft hover:bg-gm-surface/30">
                      <TableCell className="font-mono text-sm text-gm-text">{r.code}</TableCell>
                      <TableCell className="text-sm text-gm-text">{r.label}</TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex justify-center">
                          <Switch
                            checked={r.is_active}
                            onCheckedChange={(v) => onToggleActive(r.code, Boolean(v))}
                            disabled={busy}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name="default-locale"
                          checked={defaultLocale === r.code}
                          onChange={() => onDefaultChange(r.code)}
                          disabled={busy || !r.is_active}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
