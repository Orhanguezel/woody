import { MetadataRoute } from 'next';
import { getPublicSiteOrigin } from '@/lib/site-config';
import {
  allWoodyDigitalPaths,
  WOODY_DEFAULT_LOCALE,
  WOODY_LOCALES,
  WOODY_PAGE_ROUTES,
} from '@/components/woody/routes';
import { loadFallbackBlogPosts } from '@/components/woody/blog-loader.server';
import { loadWoodyProducts } from '@/components/woody/content-loader.server';

const BASE_URL = getPublicSiteOrigin();
type WoodyLocale = (typeof WOODY_LOCALES)[number];

const LEGACY_STATIC_PAGES = [
  '/faqs',
  '/contact',
  '/terms',
  '/privacy-policy',
  '/cookie-policy',
  '/kvkk',
] as const;

const WOODY_DIGITAL_PAGES = allWoodyDigitalPaths();
const WOODY_BLOG_CATEGORIES = [
  'genel',
  'haber',
  'okul-oncesi',
  'aile',
  'dijital-icerik',
  'ogretmen',
  'okul',
  'etkinlik',
  'mevsimsel',
] as const;

type SitemapRoute = {
  path: string;
  trOnly?: boolean;
  priority: number;
  lastModified?: Date | string;
  pathByLocale?: Partial<Record<WoodyLocale, string>>;
};

function buildAlternates(route: SitemapRoute): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  const locales: readonly WoodyLocale[] = route.trOnly ? [WOODY_DEFAULT_LOCALE] : WOODY_LOCALES;
  for (const loc of locales) {
    languages[loc] = `${BASE_URL}/${loc}${route.pathByLocale?.[loc] ?? route.path}`;
  }
  languages['x-default'] = `${BASE_URL}/${WOODY_DEFAULT_LOCALE}${route.pathByLocale?.[WOODY_DEFAULT_LOCALE] ?? route.path}`;
  return { languages };
}

async function blogRoutes(): Promise<SitemapRoute[]> {
  const postsByLocale = await Promise.all(
    WOODY_LOCALES.map(async (locale) => ({
      locale,
      posts: await loadFallbackBlogPosts(locale),
    })),
  );
  const byId = new Map<string, SitemapRoute>();

  for (const { locale, posts } of postsByLocale) {
    for (const post of posts) {
      const key = post.id || post.slug;
      if (!key || !post.slug) continue;
      const existing = byId.get(key) ?? {
        path: `/blog/${post.slug}`,
        priority: 0.65,
        lastModified: post.updated_at || post.created_at,
        pathByLocale: {},
      };
      existing.pathByLocale = {
        ...(existing.pathByLocale ?? {}),
        [locale]: `/blog/${post.slug}`,
      };
      if (locale === WOODY_DEFAULT_LOCALE) existing.path = `/blog/${post.slug}`;
      byId.set(key, existing);
    }
  }

  const categoryRoutes = WOODY_BLOG_CATEGORIES.map((category) => ({
    path: `/blog/category/${category}`,
    priority: 0.62,
  }));

  return [...categoryRoutes, ...Array.from(byId.values())];
}

async function storeProductRoutes(): Promise<SitemapRoute[]> {
  const products = await loadWoodyProducts('store-products', WOODY_DEFAULT_LOCALE);
  return products
    .filter((product) => product.slug)
    .map((product) => ({
      path: `/store/${product.slug}`,
      priority: 0.72,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: SitemapRoute[] = [
    ...WOODY_PAGE_ROUTES.map((route) => ({
      path: route.path === '/' ? '' : route.path,
      trOnly: Boolean(route.trOnly),
      priority: route.priority ?? 0.7,
    })),
    ...WOODY_DIGITAL_PAGES.map((path) => ({ path, trOnly: false, priority: 0.75 })),
    ...(await blogRoutes()),
    ...(await storeProductRoutes()),
    ...LEGACY_STATIC_PAGES.map((path) => ({ path, trOnly: false, priority: 0.55 })),
  ];

  return routes.flatMap((route) =>
    ((route.trOnly ? [WOODY_DEFAULT_LOCALE] : WOODY_LOCALES) as readonly WoodyLocale[]).map((locale) => ({
      url: `${BASE_URL}/${locale}${route.pathByLocale?.[locale] ?? route.path}`,
      lastModified: route.lastModified ?? now,
      changeFrequency: 'weekly' as const,
      priority: route.priority,
      alternates: buildAlternates(route),
    })),
  );
}
