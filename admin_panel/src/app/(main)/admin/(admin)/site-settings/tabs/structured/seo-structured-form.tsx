// =============================================================
// FILE: src/components/admin/site-settings/structured/SeoStructuredForm.tsx
// guezelwebdesign – Site Settings (SEO) Structured Form (NO MODAL)
// - Used by /admin/site-settings/[id].tsx via renderStructured
// - Uses AdminImageUploadField for OG image upload helper
// =============================================================

"use client";

import type React from "react";
import { useMemo } from "react";

import { AdminImageUploadField } from "@/app/(main)/admin/_components/common/AdminImageUploadField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTranslations } from "@/i18n";
import type { SettingValue } from "@/integrations/shared";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

/* ----------------------------- types ----------------------------- */

export type SeoStructured = {
  site_name?: string;
  title_default?: string;
  title_template?: string;
  description?: string;

  open_graph?: {
    type?: "website" | "article" | "product";
    images?: string[];
  };

  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player";
    site?: string;
    creator?: string;
  };

  robots?: {
    noindex?: boolean;
    index?: boolean;
    follow?: boolean;
  };
};

export type SeoStructuredFormProps = {
  settingKey: string;
  locale: string;
  value: SettingValue;
  setValue: (next: any) => void;
  disabled?: boolean;
};

/* ----------------------------- helpers ----------------------------- */

function coerceSettingValue(input: any): any {
  if (input === null || input === undefined) return input;
  if (typeof input === "object") return input;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return input;

    const looksJson = (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"));

    if (!looksJson) return input;

    try {
      return JSON.parse(s);
    } catch {
      return input;
    }
  }

  return input;
}

function normalizeSeo(obj: any): SeoStructured {
  const o = obj && typeof obj === "object" ? obj : {};
  const images = Array.isArray(o?.open_graph?.images) ? o.open_graph.images : [];

  return {
    site_name: String(o.site_name ?? ""),
    title_default: String(o.title_default ?? ""),
    title_template: String(o.title_template ?? ""),
    description: String(o.description ?? ""),

    open_graph: {
      type: (o?.open_graph?.type ?? "website") as any,
      images: images.map((x: any) => String(x ?? "")).filter(Boolean),
    },

    twitter: {
      card: (o?.twitter?.card ?? "summary_large_image") as any,
      site: String(o?.twitter?.site ?? ""),
      creator: String(o?.twitter?.creator ?? ""),
    },

    robots: {
      noindex: Boolean(o?.robots?.noindex),
      index: o?.robots?.index !== false, // default true
      follow: o?.robots?.follow !== false, // default true
    },
  };
}

function uniqStrings(arr: string[]) {
  return Array.from(new Set(arr.map((x) => String(x || "").trim()).filter(Boolean)));
}

/* ----------------------------- component ----------------------------- */

export const SeoStructuredForm: React.FC<SeoStructuredFormProps> = ({
  settingKey,
  locale,
  value,
  setValue,
  disabled,
}) => {
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const t = useAdminTranslations(adminLocale || undefined);

  const v = useMemo(() => normalizeSeo(coerceSettingValue(value)), [value]);

  const set = (patch: Partial<SeoStructured>) => {
    setValue({
      ...v,
      ...patch,
    });
  };

  const ogImagesText = (v.open_graph?.images || []).join("\n");

  const setOpenGraph = (patch: Partial<NonNullable<SeoStructured["open_graph"]>>) => {
    set({
      open_graph: {
        ...(v.open_graph || {}),
        ...patch,
      },
    });
  };

  const setTwitter = (patch: Partial<NonNullable<SeoStructured["twitter"]>>) => {
    set({
      twitter: {
        ...(v.twitter || {}),
        ...patch,
      },
    });
  };

  const setRobots = (patch: Partial<NonNullable<SeoStructured["robots"]>>) => {
    set({
      robots: {
        ...(v.robots || {}),
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Alert variant="default" className="py-2">
        <AlertDescription className="space-y-1 text-sm">
          <p>{t("admin.siteSettings.structured.title")}</p>
          <p>{t("admin.siteSettings.structured.robotsNote", { field: "noindex" })}</p>
        </AlertDescription>
      </Alert>

      {/* Optional helper upload */}
      <div>
        <AdminImageUploadField
          label={t("admin.siteSettings.structured.ogImageUpload")}
          folder="seo"
          bucket="public"
          metadata={{
            module_key: "seo",
            locale: String(locale),
            key: String(settingKey),
          }}
          value={(v.open_graph?.images && v.open_graph.images[0]) || ""}
          onChange={(url) => {
            const merged = uniqStrings([url, ...(v.open_graph?.images || [])]);
            setOpenGraph({ images: merged });
          }}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-site-name"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.siteName")}
          </Label>
          <Input
            id="seo-site-name"
            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
            value={v.site_name || ""}
            onChange={(e) => set({ site_name: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-title-default"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.titleDefault")}
          </Label>
          <Input
            id="seo-title-default"
            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
            value={v.title_default || ""}
            onChange={(e) => set({ title_default: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-title-template"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.titleTemplate")}
          </Label>
          <Input
            id="seo-title-template"
            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
            value={v.title_template || ""}
            onChange={(e) => set({ title_template: e.target.value })}
            placeholder={t("admin.siteSettings.structured.titleTemplatePlaceholder")}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2 md:col-span-12">
          <Label
            htmlFor="seo-description"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.description")}
          </Label>
          <Textarea
            id="seo-description"
            rows={3}
            value={v.description || ""}
            onChange={(e) => set({ description: e.target.value })}
            disabled={disabled}
            className="bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-og-type"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.ogType")}
          </Label>
          <Select
            value={v.open_graph?.type || "website"}
            onValueChange={(value) => setOpenGraph({ type: value as any })}
            disabled={disabled}
          >
            <SelectTrigger id="seo-og-type" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">website</SelectItem>
              <SelectItem value="article">article</SelectItem>
              <SelectItem value="product">product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-8">
          <Label
            htmlFor="seo-og-images"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.ogImages")}
          </Label>
          <Textarea
            id="seo-og-images"
            rows={5}
            value={ogImagesText}
            onChange={(e) => {
              const images = uniqStrings(
                e.target.value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
              );
              setOpenGraph({ images });
            }}
            placeholder={t("admin.siteSettings.structured.ogImagesPlaceholder")}
            disabled={disabled}
            className="font-mono bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-twitter-card"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.twitterCard")}
          </Label>
          <Select
            value={v.twitter?.card || "summary_large_image"}
            onValueChange={(value) => setTwitter({ card: value as any })}
            disabled={disabled}
          >
            <SelectTrigger id="seo-twitter-card" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="app">app</SelectItem>
              <SelectItem value="player">player</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gm-muted">
            {t("admin.siteSettings.structured.twitterCardRecommended", { card: "summary_large_image" })}
          </p>
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-twitter-site"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.twitterSite")}
          </Label>
          <Input
            id="seo-twitter-site"
            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
            value={v.twitter?.site || ""}
            onChange={(e) => setTwitter({ site: e.target.value })}
            placeholder={t("admin.siteSettings.structured.twitterSitePlaceholder")}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label
            htmlFor="seo-twitter-creator"
            className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block"
          >
            {t("admin.siteSettings.structured.twitterCreator")}
          </Label>
          <Input
            id="seo-twitter-creator"
            className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
            value={v.twitter?.creator || ""}
            onChange={(e) => setTwitter({ creator: e.target.value })}
            placeholder={t("admin.siteSettings.structured.twitterCreatorPlaceholder")}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2 md:col-span-12">
          <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
            {t("admin.siteSettings.structured.robots")}
          </Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seo-robots-noindex"
                checked={Boolean(v.robots?.noindex)}
                onCheckedChange={(checked) => setRobots({ noindex: !!checked })}
                disabled={disabled}
              />
              <Label htmlFor="seo-robots-noindex" className="text-xs text-gm-text">
                {t("admin.siteSettings.structured.noindex")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seo-robots-index"
                checked={v.robots?.index !== false}
                onCheckedChange={(checked) => setRobots({ index: !!checked })}
                disabled={disabled}
              />
              <Label htmlFor="seo-robots-index" className="text-xs text-gm-text">
                {t("admin.siteSettings.structured.index")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seo-robots-follow"
                checked={v.robots?.follow !== false}
                onCheckedChange={(checked) => setRobots({ follow: !!checked })}
                disabled={disabled}
              />
              <Label htmlFor="seo-robots-follow" className="text-xs text-gm-text">
                {t("admin.siteSettings.structured.follow")}
              </Label>
            </div>
          </div>

          <p className="text-xs text-gm-muted">
            {t("admin.siteSettings.structured.robotsRecommendation", {
              noindex: "noindex=false",
              index: "index=true",
              follow: "follow=true",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

SeoStructuredForm.displayName = "SeoStructuredForm";
