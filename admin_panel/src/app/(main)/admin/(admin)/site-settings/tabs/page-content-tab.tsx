"use client";

import * as React from "react";

import Link from "next/link";

import { ChevronRight, FileText, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminTranslations } from "@/i18n";
import { useListSiteSettingsAdminQuery, useUpdateSiteSettingAdminMutation } from "@/integrations/hooks";
import type { SettingValue, SiteSetting } from "@/integrations/shared";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

const PAGE_KEYS = ["page_store", "page_preschool", "page_workshop", "home_banner"] as const;

type PageKey = (typeof PAGE_KEYS)[number];

const DEFAULTS_BY_KEY: Record<PageKey, SettingValue> = {
  page_store: {
    title: "Woody Store",
    description: "",
    hero: { title: "Woody Store", description: "", primaryCTA: "", primaryHref: "" },
    showCart: false,
    sections: [],
  },
  page_preschool: {
    title: "Preschool",
    description: "",
    hero: { title: "Preschool", description: "" },
    sections: [],
  },
  page_workshop: {
    title: "Workshop",
    description: "",
    hero: { title: "Workshop", description: "" },
    sections: [],
  },
  home_banner: { items: ["Her Yaş İçin Uygun Setler"] },
};

function isPageKey(key: string): key is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(key);
}

function summariseValue(value: SettingValue | undefined): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, any>;
  const title = record.title || record.hero?.title;
  const sectionCount = Array.isArray(record.sections) ? record.sections.length : 0;
  return [title, sectionCount ? `${sectionCount} bölüm` : ""].filter(Boolean).join(" · ");
}

type RowData = {
  key: PageKey;
  hasValue: boolean;
  editLocale: string;
  value: SettingValue | undefined;
};

function buildRows(rows: SiteSetting[], locale: string): RowData[] {
  const byKey = new Map<PageKey, { local?: SiteSetting; global?: SiteSetting }>();

  for (const row of rows) {
    const key = String(row.key || "");
    if (!isPageKey(key)) continue;
    const entry = byKey.get(key) || {};
    if (row.locale === locale) entry.local = row;
    if (row.locale === "*") entry.global = row;
    byKey.set(key, entry);
  }

  return PAGE_KEYS.map((key) => {
    const entry = byKey.get(key) || {};
    const local = entry.local;
    const global = entry.global;
    return {
      key,
      hasValue: Boolean(local || global),
      editLocale: local ? locale : global ? "*" : locale,
      value: (local?.value ?? global?.value) as SettingValue | undefined,
    };
  });
}

function editHref(key: string, locale: string) {
  return `/admin/site-settings/${encodeURIComponent(key)}?locale=${encodeURIComponent(locale)}`;
}

function errMsg(err: any, fallback: string): string {
  return err?.data?.error?.message || err?.data?.message || err?.message || fallback;
}

export type PageContentTabProps = {
  locale: string;
};

export const PageContentTab: React.FC<PageContentTabProps> = ({ locale }) => {
  const adminLocale = usePreferencesStore((s) => s.adminLocale) || "tr";
  const t = useAdminTranslations(adminLocale || undefined);
  const [updateSetting, { isLoading: isSaving }] = useUpdateSiteSettingAdminMutation();

  const listArgs = React.useMemo(() => ({ locale, keys: [...PAGE_KEYS] as unknown as string[] }), [locale]);
  const listQ = useListSiteSettingsAdminQuery(listArgs as any, { skip: !locale });

  const rows = React.useMemo(() => buildRows((listQ.data ?? []) as SiteSetting[], locale), [listQ.data, locale]);
  const busy = listQ.isLoading || listQ.isFetching || isSaving;
  const hasAnyMissing = rows.some((row) => !row.hasValue);

  const createMissing = async () => {
    try {
      for (const row of rows) {
        if (row.hasValue) continue;
        await updateSetting({
          key: row.key,
          locale,
          value: DEFAULTS_BY_KEY[row.key] as any,
        }).unwrap();
      }
      toast.success("Eksik sayfa içerikleri oluşturuldu.");
      await listQ.refetch();
    } catch (err: any) {
      toast.error(errMsg(err, t("admin.siteSettings.messages.error", {}, "Hata oluştu")));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between rounded-3xl border border-gm-border-soft bg-gm-surface/20 p-6 backdrop-blur-sm">
        <p className="max-w-2xl text-[11px] font-bold uppercase leading-relaxed tracking-[0.1em] text-gm-muted">
          Store, okul, atölye sayfalarının metinleri ve ana sayfa banner maddeleri; CTA, fiyat, bölüm listesi ve
          görünürlük bayrakları bu kayıtlar üzerinden yönetilir.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => listQ.refetch()}
          disabled={busy}
          title={t("admin.common.refresh", null, "Yenile")}
          className="ml-4 h-10 shrink-0 rounded-full border-gm-border-soft px-5 text-[10px] font-bold uppercase tracking-widest transition-all hover:border-gm-gold/30 hover:bg-gm-primary/5 hover:text-gm-gold"
        >
          <RefreshCcw className="mr-2 size-3.5" />
          {t("admin.common.refresh", null, "Yenile")}
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const summary = summariseValue(row.value);
          return (
            <Link
              key={row.key}
              href={row.hasValue ? editHref(row.key, row.editLocale) : "#"}
              prefetch={false}
              className={cn(
                "group flex items-center justify-between gap-4 rounded-[24px] border border-gm-border-soft bg-gm-surface/10 p-5 transition-all duration-300",
                row.hasValue
                  ? "cursor-pointer hover:border-gm-gold/30 hover:bg-gm-surface/30 hover:shadow-lg"
                  : "opacity-60 grayscale",
              )}
              onClick={row.hasValue ? undefined : (event) => event.preventDefault()}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-gm-gold" aria-hidden />
                  <span className="font-serif text-lg text-gm-text transition-colors group-hover:text-gm-gold">
                    {row.key}
                  </span>
                  {!row.hasValue ? (
                    <Badge
                      variant="outline"
                      className="border-gm-border-soft bg-gm-bg-deep text-[9px] uppercase tracking-[0.2em] text-gm-muted"
                    >
                      Boş
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-gm-muted">
                  {row.key === "page_store"
                    ? "Store katalog metinleri, fiyat/CTA ve sepet görünürlüğü"
                    : row.key === "page_preschool"
                      ? "Okul serisi sayfa metinleri ve medya URL alanları"
                    : row.key === "page_workshop"
                      ? "Atölye serisi sayfa metinleri ve medya URL alanları"
                      : "Ana sayfa gri banner maddeleri"}
                </p>
                {summary ? (
                  <p className="mt-3 inline-block truncate rounded-lg border border-gm-gold/10 bg-gm-gold/5 px-3 py-1.5 font-mono text-[11px] text-gm-gold/80">
                    {summary}
                  </p>
                ) : null}
              </div>

              {row.hasValue ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gm-border-soft bg-gm-surface/40 transition-colors group-hover:border-gm-gold/20 group-hover:bg-gm-gold/10">
                  <ChevronRight className="size-4 text-gm-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gm-gold" />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>

      {hasAnyMissing ? (
        <Button
          type="button"
          variant="outline"
          onClick={createMissing}
          disabled={busy}
          className="h-12 w-full rounded-full border-gm-gold/30 px-6 text-[10px] font-bold uppercase tracking-widest text-gm-gold shadow-sm transition-all hover:bg-gm-gold/10 sm:w-auto"
        >
          <Plus className="mr-2 size-4" />
          Eksik sayfa içeriklerini oluştur
        </Button>
      ) : null}
    </div>
  );
};
