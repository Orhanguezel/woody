export const WOODY_LOCALES = ['tr', 'en', 'de', 'ar', 'fr', 'ru', 'es', 'it', 'nl', 'pt-br'] as const;

export const WOODY_DEFAULT_LOCALE = 'tr';

export type WoodyRouteKind = 'page' | 'listing' | 'product' | 'local' | 'blog';

export type WoodyRouteDefinition = {
  key: string;
  path: string;
  kind: WoodyRouteKind;
  trOnly?: boolean;
  priority?: number;
};

export const WOODY_PAGE_ROUTES: WoodyRouteDefinition[] = [
  { key: 'home', path: '/', kind: 'page', priority: 1 },
  { key: 'preschool', path: '/preschool', kind: 'page', priority: 0.9 },
  { key: 'workshop', path: '/workshop', kind: 'page', priority: 0.85 },
  { key: 'home-tutor', path: '/home-tutor', kind: 'page', priority: 0.85 },
  { key: 'woody-academy', path: '/woody-academy', kind: 'page', priority: 0.9 },
  { key: 'library', path: '/library', kind: 'page', priority: 0.85 },
  { key: 'blog', path: '/blog', kind: 'blog', priority: 0.75 },
  { key: 'store', path: '/store', kind: 'listing', priority: 0.8 },
  { key: 'digital-content', path: '/digital-content', kind: 'listing', priority: 0.8 },
  {
    key: 'local-istanbul',
    path: '/lokal/istanbul-anaokulu-ingilizce-egitimi',
    kind: 'local',
    trOnly: true,
    priority: 0.8,
  },
];

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
