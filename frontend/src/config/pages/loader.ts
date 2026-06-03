/**
 * Statik sayfa içeriği loader'ı — dil başına klasör (`config/pages/<locale>/<name>.json`).
 *
 * Tek doğruluk kaynağı: her dil kendi klasöründe aynı dosya setini tutar. Yeni dil eklemek =
 * `config/pages/<lang>/` klasörünü oluşturup dosyaları koymak (kod değişmeden bulunur).
 *
 * - `loadPageContent(name, locale)` istenen locale dosyasını yükler; yoksa default (tr)'ye düşer.
 * - `{{appName}}` token'ları derinlemesine enjekte edilir (env `NEXT_PUBLIC_APP_NAME` / site-defaults).
 * - Tüketim: server bileşenleri doğrudan; client bileşenleri server'dan prop ile alır.
 */

import { injectAppName } from '@/lib/page-copy';
import { getPublicAppName } from '@/lib/site-config';

export const DEFAULT_PAGE_LOCALE = 'tr';

/** Aktif statik içerik dilleri (klasör adlarıyla birebir). */
export const PAGE_LOCALES = [
  'tr',
  'en',
  'de',
  'ar',
  'fr',
  'ru',
  'es',
  'it',
  'nl',
  'pt-BR',
] as const;

export type PageLocale = (typeof PAGE_LOCALES)[number];

const PAGE_LOCALE_SET = new Set<string>(PAGE_LOCALES);

/**
 * İstenen locale'i mevcut klasör adına eşler.
 * Bölgesel kod (`pt-BR`) birebir; aksi halde kısa kod (`en-US` → `en`); bulunamazsa default.
 */
export function pickLocale(locale: string | undefined | null): PageLocale {
  if (!locale) return DEFAULT_PAGE_LOCALE;
  const normalized = locale.trim();
  if (PAGE_LOCALE_SET.has(normalized)) return normalized as PageLocale;
  const short = normalized.split('-')[0]?.toLowerCase() ?? '';
  if (PAGE_LOCALE_SET.has(short)) return short as PageLocale;
  return DEFAULT_PAGE_LOCALE;
}

/** Bir JSON ağacındaki tüm string'lere `{{appName}}` token'ını uygular. */
function deepInjectAppName<T>(value: T, appName: string): T {
  if (typeof value === 'string') {
    return injectAppName(value, appName) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepInjectAppName(item, appName)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = deepInjectAppName(val, appName);
    }
    return out as unknown as T;
  }
  return value;
}

async function importPageJson<T>(locale: PageLocale, name: string): Promise<T | null> {
  try {
    const mod = await import(`@/config/pages/${locale}/${name}.json`);
    return (mod.default ?? mod) as T;
  } catch {
    return null;
  }
}

export interface LoadPageOptions {
  /** Token enjeksiyonu için marka adı. Verilmezse `getPublicAppName()` kullanılır. */
  appName?: string;
  /** `{{appName}}` token'larını enjekte et (varsayılan: true). */
  injectAppName?: boolean;
}

/**
 * `config/pages/<locale>/<name>.json` içeriğini yükler.
 * İstenen dil yoksa default (tr) fallback uygulanır; o da yoksa `null` döner.
 */
export async function loadPageContent<T>(
  name: string,
  locale: string | undefined | null,
  options: LoadPageOptions = {},
): Promise<T | null> {
  const requested = pickLocale(locale);
  let data = await importPageJson<T>(requested, name);

  if (data == null && requested !== DEFAULT_PAGE_LOCALE) {
    data = await importPageJson<T>(DEFAULT_PAGE_LOCALE, name);
  }

  if (data == null) return null;

  if (options.injectAppName === false) return data;
  const appName = options.appName ?? getPublicAppName();
  return deepInjectAppName(data, appName);
}

/**
 * `loadPageContent` ile aynıdır ama içerik bulunamazsa verilen `fallback`'i döner.
 */
export async function loadPageContentOr<T>(
  name: string,
  locale: string | undefined | null,
  fallback: T,
  options: LoadPageOptions = {},
): Promise<T> {
  const data = await loadPageContent<T>(name, locale, options);
  return data ?? fallback;
}
