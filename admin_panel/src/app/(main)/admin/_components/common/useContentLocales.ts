'use client';

// =============================================================
// İçerik (blog/ürün) editör ve listelerinde kullanılan dil listesi.
// Kaynak: site_settings.app_locales (admin panelden eklenip çıkarılabilir).
// useAdminLocales'ten FARKI: bölge ekini KIRPMAZ ("pt-br" korunur) — blog/ürün
// i18n TAM locale kodu kullandığı için bu şart.
// =============================================================

import { useMemo } from 'react';
import { useListSiteSettingsAdminQuery } from '@/integrations/hooks';

export const FALLBACK_CONTENT_LOCALES = ['tr', 'en'];

const toFullLocale = (v: unknown): string =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace('_', '-');

export function parseContentLocales(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      return parseContentLocales(JSON.parse(s));
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const x of raw as any[]) {
      const code = toFullLocale(typeof x === 'string' ? x : x?.code);
      const active = typeof x === 'object' && x !== null ? x.is_active !== false : true;
      if (!code || !active || seen.has(code)) continue;
      seen.add(code);
      out.push(code);
    }
    return out;
  }
  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).locales)) {
    return parseContentLocales((raw as any).locales);
  }
  return [];
}

export function useContentLocales(): { codes: string[]; loading: boolean } {
  const { data, isLoading } = useListSiteSettingsAdminQuery({ keys: ['app_locales'] });
  const codes = useMemo(() => {
    const row = (data ?? []).find((r: any) => r.key === 'app_locales');
    const parsed = parseContentLocales(row?.value);
    return parsed.length ? parsed : FALLBACK_CONTENT_LOCALES;
  }, [data]);
  return { codes, loading: isLoading };
}
