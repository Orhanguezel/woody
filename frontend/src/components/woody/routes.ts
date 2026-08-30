import {
  WOODY_SEO_LOCALES,
  WOODY_STATIC_SEO_PAGES,
} from '@shared/shared-types/woody-seo-catalog';

export const WOODY_LOCALES = WOODY_SEO_LOCALES;

export const WOODY_DEFAULT_LOCALE = 'tr';

export type WoodyRouteKind = 'page' | 'listing' | 'product' | 'local' | 'blog';

export type WoodyRouteDefinition = {
  key: string;
  path: string;
  kind: WoodyRouteKind;
  trOnly?: boolean;
  priority?: number;
};

const PRIORITY_BY_KEY: Record<string, number> = {
  home: 1,
  preschool: 0.9,
  'woody-academy': 0.9,
  workshop: 0.85,
  'home-tutor': 0.85,
  'level-finder': 0.85,
  library: 0.85,
  store: 0.8,
  'digital-content': 0.8,
  'local-istanbul': 0.8,
  'local-ankara': 0.78,
  'local-izmir': 0.78,
  'local-bursa': 0.78,
  blog: 0.75,
  about: 0.7,
  contact: 0.65,
  faqs: 0.65,
};

const ROUTE_KIND_BY_GROUP: Record<string, WoodyRouteKind> = {
  catalog: 'listing',
  content: 'page',
  local: 'local',
};

export const WOODY_PAGE_ROUTES: WoodyRouteDefinition[] = WOODY_STATIC_SEO_PAGES
  .filter((page) => !['legal'].includes(page.group))
  .map((page) => ({
    key: page.key,
    path: page.path,
    kind:
      page.key === 'blog'
        ? 'blog'
        : ROUTE_KIND_BY_GROUP[page.group] || 'page',
    ...(page.trOnly ? { trOnly: true } : {}),
    priority: PRIORITY_BY_KEY[page.key] ?? 0.6,
  }));

export const WOODY_DIGITAL_LEVELS = ['basic', 'junior', 'senior'] as const;
export const WOODY_DIGITAL_PRODUCTS = ['storyland', 'movieland', 'musicland', 'library'] as const;

export function normalizeWoodyLocale(locale: string) {
  const normalized = String(locale || '').trim().toLowerCase().replace('_', '-');
  return WOODY_LOCALES.includes(normalized as any) ? normalized : WOODY_DEFAULT_LOCALE;
}

export function localizedWoodyPath(locale: string, path: string) {
  const loc = normalizeWoodyLocale(locale);
  const p = path === '/' ? '' : path;
  return `/${loc}${p}`;
}

export function digitalProductPath(level: string, product: string) {
  return `/digital-content/${encodeURIComponent(level)}/${encodeURIComponent(product)}`;
}

export function allWoodyStaticPaths() {
  return WOODY_PAGE_ROUTES.map((route) => route.path);
}

export function allWoodyDigitalPaths() {
  return WOODY_DIGITAL_LEVELS.flatMap((level) =>
    WOODY_DIGITAL_PRODUCTS.map((product) => digitalProductPath(level, product)),
  );
}
