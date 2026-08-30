// =============================================================
// FILE: src/app/(main)/admin/(admin)/site-settings/tabs/seo-settings-tab.tsx
// SEO Ayarları — Sayfa-bazlı inline düzenleme + canlı önizleme
// Bereketfide pattern (sade kart-liste + collapsible + SERP/OG preview)
// =============================================================

"use client";

import React, { useMemo, useState } from "react";

import { ChevronDown, ChevronUp, Globe, Save } from "lucide-react";
import { toast } from "sonner";
import {
  WOODY_SEO_LOCALES,
  WOODY_SEO_PAGE_CATALOG,
  normalizeWoodyPageSeoConfig,
  type WoodyPageSeoConfig,
  type WoodySeoPageDefinition,
} from "@shared/shared-types/woody-seo-catalog";

import { AdminImageUploadField } from "@/app/(main)/admin/_components/common/AdminImageUploadField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTranslations } from "@/i18n";
import {
  useGetSiteSettingAdminByKeyQuery,
  useCreateAssetAdminMutation,
  useUpdateSiteSettingAdminMutation,
} from "@/integrations/hooks";
import { useContentLocales } from "@/app/(main)/admin/_components/common/useContentLocales";
import { getDefaultSiteNameForSeo, getPublicSiteHostname } from "@/lib/admin-brand";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

const PAGE_KEYS = WOODY_SEO_PAGE_CATALOG;

function coerce(v: any): any {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

function extractRawPages(raw: any): Record<string, unknown> {
  const obj = coerce(raw?.value ?? raw) ?? {};
  return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
}

function extractPages(raw: any): Record<string, WoodyPageSeoConfig> {
  const obj = extractRawPages(raw);
  const result: Record<string, WoodyPageSeoConfig> = {};
  for (const cfg of PAGE_KEYS) {
    result[cfg.key] = normalizeWoodyPageSeoConfig(obj[cfg.key], cfg);
  }
  return result;
}

export type SeoSettingsTabProps = {
  locale: string;
  onLocaleChange: (locale: string) => void;
  settingPrefix?: string;
};

export const SeoSettingsTab: React.FC<SeoSettingsTabProps> = ({
  locale,
  onLocaleChange,
  settingPrefix,
}) => {
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const t = useAdminTranslations(adminLocale || undefined);
  const fullKey = `${settingPrefix || ""}seo_pages`;

  const { data, isLoading, isFetching, refetch } = useGetSiteSettingAdminByKeyQuery(
    { key: fullKey, locale },
    { refetchOnMountOrArgChange: true },
  );
  const { codes: contentLocales, loading: localesLoading } = useContentLocales();

  const [updateSetting, { isLoading: isSaving }] = useUpdateSiteSettingAdminMutation();
  const [createAsset] = useCreateAssetAdminMutation();
  const [isMaterializing, setIsMaterializing] = useState(false);
  const busy = isLoading || isFetching || isSaving || isMaterializing;

  const previewDomain = useMemo(() => getPublicSiteHostname(), []);
  const publicSiteOrigin = useMemo(() => `https://${previewDomain}`, [previewDomain]);
  const defaultSiteLabel = useMemo(() => getDefaultSiteNameForSeo(), []);

  const serverPages = useMemo(() => extractPages(data), [data]);
  const [localPages, setLocalPages] = useState<Record<string, WoodyPageSeoConfig> | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(["home"]));

  React.useEffect(() => {
    if (data) setLocalPages(extractPages(data));
  }, [data]);

  const pages = localPages ?? serverPages;

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpandedKeys(new Set(PAGE_KEYS.map((c) => c.key)));
  const collapseAll = () => setExpandedKeys(new Set());

  const updatePage = (key: string, patch: Partial<WoodyPageSeoConfig>) => {
    setLocalPages((prev) => {
      const base = prev ?? serverPages;
      return { ...base, [key]: { ...base[key], ...patch } };
    });
  };

  const updateOg = (key: string, patch: Partial<WoodyPageSeoConfig["og"]>) => {
    setLocalPages((prev) => {
      const base = prev ?? serverPages;
      return {
        ...base,
        [key]: {
          ...base[key],
          og: { ...base[key].og, ...patch },
        },
      };
    });
  };

  const handleSave = async () => {
    if (!localPages) return;
    setIsMaterializing(true);
    try {
      const mergedPages = { ...extractRawPages(data), ...localPages };
      await updateSetting({
        key: fullKey,
        locale,
        value: mergedPages as any,
      }).unwrap();
      await fetch("/api/revalidate-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, indexNow: true }),
      }).catch(() => null);

      const materializedPages = { ...mergedPages } as Record<string, unknown>;
      for (const definition of currentDefinitions) {
        const config = normalizeWoodyPageSeoConfig(localPages[definition.key], definition);
        if (config.og.mode !== "generated") continue;

        const response = await fetch(
          `${publicSiteOrigin}/og/${encodeURIComponent(locale)}/${encodeURIComponent(definition.key)}?v=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error(`${definition.key} OG görseli üretilemedi`);
        const blob = await response.blob();
        const file = new File([blob], `${definition.key}.png`, { type: "image/png" });
        const asset = await createAsset({
          file,
          bucket: "public",
          folder: `seo/og/${locale}`,
          metadata: {
            module_key: "seo",
            kind: "generated-og",
            page: definition.key,
            locale,
          },
        }).unwrap();
        const generatedImage = String(asset?.url || "").trim();
        if (!generatedImage) throw new Error(`${definition.key} storage URL alınamadı`);
        materializedPages[definition.key] = {
          ...config,
          og: { ...config.og, generated_image: generatedImage },
        };
      }

      await updateSetting({
        key: fullKey,
        locale,
        value: materializedPages as any,
      }).unwrap();
      setLocalPages(extractPages({ value: materializedPages }));
      toast.success(t("admin.siteSettings.seo.inline.saved", {}, "SEO ayarları kaydedildi"));
      await refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || t("admin.siteSettings.seo.inline.saveError", {}, "Kayıt hatası"));
    } finally {
      setIsMaterializing(false);
    }
  };

  const isDirty = localPages && JSON.stringify(localPages) !== JSON.stringify(serverPages);
  const currentDefinitions = PAGE_KEYS.filter((page) => !page.trOnly || locale === "tr");
  const localeOptions = contentLocales.filter((code) =>
    WOODY_SEO_LOCALES.includes(code as (typeof WOODY_SEO_LOCALES)[number]),
  );
  const absoluteAssetUrl = (value: string) => {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${publicSiteOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardHeader className="bg-gm-surface/40 p-8 border-b border-gm-border-soft gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="font-serif text-2xl text-gm-text">
              {t("admin.siteSettings.seo.inline.title", null, "SEO Ayarları")}
            </CardTitle>
            <CardDescription className="text-gm-muted font-serif italic opacity-80">
              {t(
                "admin.siteSettings.seo.inline.description",
                null,
                "Her sayfa için title, description, OG görseli ve indexleme ayarı.",
              )}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Select value={locale} onValueChange={onLocaleChange} disabled={busy || localesLoading}>
                <SelectTrigger className="h-10 rounded-2xl border-gm-gold/30 bg-gm-gold/5 text-gm-gold uppercase">
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  {localeOptions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isDirty && (
              <Badge
                variant="outline"
                className="border-gm-warning/30 bg-gm-warning/10 text-gm-warning px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm animate-pulse"
              >
                {t("admin.siteSettings.seo.inline.dirty", null, "Kaydedilmedi")}
              </Badge>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={busy || !isDirty}
              className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-light h-10 px-6 text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:shadow-none ml-2"
            >
              <Save className="mr-2 size-4" />
              {t("admin.siteSettings.seo.inline.save", null, "Kaydet")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {busy && !localPages && (
          <div className="flex justify-center py-10 opacity-50 animate-pulse">
            <Badge
              variant="outline"
              className="border-gm-border-soft bg-gm-surface text-gm-muted px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              {t("admin.siteSettings.seo.inline.loading", null, "Yükleniyor...")}
            </Badge>
          </div>
        )}

        <div className="flex gap-3 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={expandAll}
            className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text h-10 px-5 text-[10px] font-bold tracking-widest uppercase transition-all"
          >
            <ChevronDown className="mr-2 size-3.5" />
            {t("admin.siteSettings.seo.inline.expandAll", null, "Tümünü Aç")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={collapseAll}
            className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text h-10 px-5 text-[10px] font-bold tracking-widest uppercase transition-all"
          >
            <ChevronUp className="mr-2 size-3.5" />
            {t("admin.siteSettings.seo.inline.collapseAll", null, "Tümünü Kapat")}
          </Button>
        </div>

        <div className="space-y-4">
        {currentDefinitions.map((cfg) => {
            const page = pages[cfg.key] || normalizeWoodyPageSeoConfig({}, cfg);
            const isExpanded = expandedKeys.has(cfg.key);
            const pageLabel = t(`admin.siteSettings.seo.pageLabels.${cfg.key}`, null, cfg.key);

            return (
              <div
                key={cfg.key}
                className={cn(
                  "rounded-[24px] border transition-all duration-300 overflow-hidden",
                  isExpanded
                    ? "border-gm-gold/30 bg-gm-surface/30 shadow-lg"
                    : "border-gm-border-soft bg-gm-surface/10 hover:bg-gm-surface/20",
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none"
                  onClick={() => toggleExpand(cfg.key)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex items-center justify-center size-10 rounded-full transition-colors",
                        isExpanded
                          ? "bg-gm-gold/10 text-gm-gold border border-gm-gold/20"
                          : "bg-gm-surface/40 text-gm-muted border border-gm-border-soft",
                      )}
                    >
                      <Globe className="size-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "font-serif text-lg transition-colors",
                            isExpanded ? "text-gm-gold" : "text-gm-text",
                          )}
                        >
                          {pageLabel}
                        </span>
                        <code className="text-[10px] text-gm-muted/70 font-mono tracking-wide bg-gm-bg-deep px-2 py-0.5 rounded-lg border border-gm-border-soft/50">
                          {cfg.path}
                        </code>
                        {page.no_index && (
                          <Badge
                            variant="outline"
                            className="border-gm-error/30 bg-gm-error/10 text-gm-error px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                          >
                            noindex
                          </Badge>
                        )}
                      </div>
                      {!isExpanded && page.title && (
                        <p className="mt-1.5 text-xs text-gm-muted truncate max-w-xl font-serif italic opacity-80">
                          {page.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center size-8 rounded-full transition-colors",
                      isExpanded ? "bg-gm-gold/10" : "bg-gm-surface/40 hover:bg-gm-gold/10",
                    )}
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-gm-gold" />
                    ) : (
                      <ChevronDown className="size-4 text-gm-muted transition-colors" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gm-border-soft p-6 bg-gm-bg-deep/30">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
                      {/* Sol: Form */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                            {t("admin.siteSettings.seo.inline.fieldTitle", null, "Başlık (title)")}
                          </Label>
                          <Input
                            value={page.title}
                            onChange={(e) => updatePage(cfg.key, { title: e.target.value })}
                            disabled={busy}
                            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm font-serif text-gm-text transition-all"
                            placeholder={t(
                              "admin.siteSettings.seo.inline.placeholderTitle",
                              null,
                              `${defaultSiteLabel} — ...`,
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase">
                              {t("admin.siteSettings.seo.inline.fieldDescription", null, "Açıklama (description)")}
                            </Label>
                            <span
                              className={cn(
                                "text-[10px] font-mono",
                                page.description.length > 160 ? "text-gm-warning" : "text-gm-muted/60",
                              )}
                            >
                              {page.description.length} / 160
                            </span>
                          </div>
                          <Textarea
                            value={page.description}
                            onChange={(e) => updatePage(cfg.key, { description: e.target.value })}
                            disabled={busy}
                            rows={3}
                            className="text-sm bg-gm-bg-deep border-gm-border-soft rounded-2xl p-4 focus:ring-gm-gold/50 focus:border-gm-gold/50 font-serif leading-relaxed text-gm-text transition-all resize-y"
                            placeholder={t(
                              "admin.siteSettings.seo.inline.placeholderDescription",
                              null,
                              "Sayfanın kısa özeti — ideal 140-160 karakter.",
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="ml-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                            {t("admin.siteSettings.seo.inline.fieldKeywords", null, "Anahtar kelimeler")}
                          </Label>
                          <Input
                            value={page.keywords}
                            onChange={(e) => updatePage(cfg.key, { keywords: e.target.value })}
                            disabled={busy}
                            className="h-12 rounded-2xl border-gm-border-soft bg-gm-bg-deep text-sm text-gm-text"
                            placeholder="okul öncesi İngilizce, çocuklar için İngilizce"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="ml-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                            {t("admin.siteSettings.seo.inline.fieldCanonical", null, "Canonical yol (opsiyonel)")}
                          </Label>
                          <Input
                            value={page.canonical_path}
                            onChange={(e) => updatePage(cfg.key, { canonical_path: e.target.value })}
                            disabled={busy || cfg.dynamic}
                            className="h-12 rounded-2xl border-gm-border-soft bg-gm-bg-deep font-mono text-sm text-gm-text"
                            placeholder={cfg.path}
                          />
                        </div>

                        <div className="space-y-5 rounded-3xl border border-gm-border-soft bg-gm-surface/20 p-5">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                              {t("admin.siteSettings.seo.inline.ogMode", null, "OG görsel modu")}
                            </Label>
                            <Select
                              value={page.og.mode}
                              onValueChange={(value: "generated" | "custom" | "content") =>
                                updateOg(cfg.key, { mode: value })
                              }
                              disabled={busy}
                            >
                              <SelectTrigger className="h-12 rounded-2xl border-gm-border-soft bg-gm-bg-deep">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="generated">Otomatik markalı görsel</SelectItem>
                                <SelectItem value="custom">Özel 1200×630 görsel</SelectItem>
                                {cfg.dynamic ? <SelectItem value="content">İçerik görseli + otomatik fallback</SelectItem> : null}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                                OG başlığı
                              </Label>
                              <Input
                                value={page.og.title}
                                onChange={(e) => updateOg(cfg.key, { title: e.target.value })}
                                disabled={busy}
                                className="h-11 rounded-2xl border-gm-border-soft bg-gm-bg-deep text-sm"
                                placeholder={page.title || "SEO başlığını kullan"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                                OG üst etiketi
                              </Label>
                              <Input
                                value={page.og.eyebrow}
                                onChange={(e) => updateOg(cfg.key, { eyebrow: e.target.value })}
                                disabled={busy}
                                className="h-11 rounded-2xl border-gm-border-soft bg-gm-bg-deep text-sm"
                                placeholder="Woody and Friends"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                              OG açıklaması
                            </Label>
                            <Textarea
                              value={page.og.description}
                              onChange={(e) => updateOg(cfg.key, { description: e.target.value })}
                              disabled={busy}
                              rows={2}
                              className="rounded-2xl border-gm-border-soft bg-gm-bg-deep text-sm"
                              placeholder={page.description || "SEO açıklamasını kullan"}
                            />
                          </div>

                          {page.og.mode === "custom" ? (
                            <AdminImageUploadField
                              label={t("admin.siteSettings.seo.inline.ogImage", null, "OG Görsel (1200×630)")}
                              helperText="JPG, PNG veya WebP; önerilen ölçü tam 1200×630."
                              folder={`seo/${cfg.key}/${locale}`}
                              bucket="public"
                              metadata={{ module_key: "seo", page: cfg.key, locale }}
                              value={page.og.custom_image}
                              onChange={(url) => updateOg(cfg.key, { custom_image: url })}
                              disabled={busy}
                              requiredDimensions={{ width: 1200, height: 630 }}
                            />
                          ) : null}

                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gm-muted">
                              OG alternatif metni
                            </Label>
                            <Input
                              value={page.og.alt}
                              onChange={(e) => updateOg(cfg.key, { alt: e.target.value })}
                              disabled={busy}
                              className="h-11 rounded-2xl border-gm-border-soft bg-gm-bg-deep text-sm"
                              placeholder={page.og.title || page.title}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gm-surface/20 border border-gm-border-soft rounded-2xl p-4">
                          <Switch
                            checked={page.no_index}
                            onCheckedChange={(v) => updatePage(cfg.key, { no_index: v })}
                            disabled={busy}
                            className="data-[state=checked]:bg-gm-error"
                          />
                          <Label className="text-sm font-serif text-gm-text">
                            {t(
                              "admin.siteSettings.seo.inline.noindex",
                              null,
                              "Bu sayfayı arama motorlarından gizle (noindex)",
                            )}
                          </Label>
                        </div>
                      </div>

                      {/* Sağ: Önizlemeler */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                            {t("admin.siteSettings.seo.inline.googlePreview", null, "Google Önizleme")}
                          </Label>
                          <div className="serp-preview-google rounded-[20px] border border-gm-border-soft p-5 shadow-inner">
                            <div className="space-y-1.5">
                              <p className="serp-preview-google__url truncate font-sans text-[11px]">
                                {previewDomain} › {locale}
                                {cfg.path === "/" ? "" : cfg.path}
                              </p>
                              <p className="serp-preview-google__title cursor-pointer truncate font-sans text-[18px] hover:underline">
                                {page.title || t("admin.siteSettings.seo.inline.siteName", null, defaultSiteLabel)}
                              </p>
                              <p className="serp-preview-google__desc line-clamp-2 font-sans text-[13px] leading-snug">
                                {page.description ||
                                  t("admin.siteSettings.seo.inline.noDescription", null, "Henüz açıklama girilmedi.")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                            {t("admin.siteSettings.seo.inline.socialPreview", null, "Sosyal Medya Önizleme")}
                          </Label>
                          <div className="overflow-hidden rounded-[20px] border border-gm-border-soft bg-gm-bg-deep shadow-inner flex flex-col">
                            <div className="aspect-[1.91/1] bg-gm-surface/50 border-b border-gm-border-soft relative flex items-center justify-center">
                              {page.og.mode === "custom" && page.og.custom_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={absoluteAssetUrl(page.og.custom_image)}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : page.og.mode === "generated" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                src={absoluteAssetUrl(
                                  page.og.generated_image || `/og/${locale}/${cfg.key}`,
                                )}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              ) : (
                                <div className="text-center space-y-2 opacity-50">
                                  <Globe className="size-8 mx-auto text-gm-muted" />
                                  <span className="block text-[10px] font-bold text-gm-muted uppercase tracking-widest">
                                    {t("admin.siteSettings.seo.inline.noOgImage", null, "OG görsel yok")}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 space-y-1 bg-gm-surface/20 backdrop-blur-sm">
                              <p className="text-[10px] text-gm-muted font-bold uppercase tracking-widest">
                                {previewDomain}
                              </p>
                              <p className="text-sm font-semibold text-gm-text truncate">
                                {page.title || t("admin.siteSettings.seo.inline.siteName", null, defaultSiteLabel)}
                              </p>
                              <p className="text-xs text-gm-muted/80 line-clamp-2 leading-relaxed">
                                {page.description ||
                                  t("admin.siteSettings.seo.inline.noDescription", null, "Henüz açıklama girilmedi.")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isDirty && (
          <div className="flex justify-end pt-6 border-t border-gm-border-soft">
            <Button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-light h-12 px-8 text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              <Save className="mr-2 size-4" />
              {t("admin.siteSettings.seo.inline.saveAll", null, "Tümünü Kaydet")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
