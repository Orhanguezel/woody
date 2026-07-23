import { MetadataRoute } from 'next';
import { getPublicSiteOrigin } from '@/lib/site-config';
import {
  WOODY_DEFAULT_LOCALE,
  WOODY_LOCALES,
  WOODY_PAGE_ROUTES,
} from '@/components/woody/routes';
import { loadDbBlogPosts } from '@/components/woody/blog-db-loader.server';
import { loadDbStoreProducts } from '@/components/woody/store/load-store-products.server';

// Sitemap blog verisini canli API'den (DB i18n) ceker; build aninda backend her zaman
// erisilebilir olmayabilir -> statik uretimde blog bos kalir. Runtime'da uret + 1s ISR cache.
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE_URL = getPublicSiteOrigin();
type WoodyLocale = (typeof WOODY_LOCALES)[number];

const LEGACY_STATIC_PAGES = [
  '/faqs',
  '/contact',
  // Yasal sayfalar — kanonik TR-slug'lar (EN-slug'lar /gizlilik vb.'ye 301 redirect).
  '/kvkk',
  '/gizlilik',
  '/cerez-politikasi',
  '/kullanim-sartlari',
] as const;

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
  // Ceviri-farkinda: verilirse URL + hreflang yalniz bu dillerde uretilir.
  // Verilmezse statik sayfa/urun gibi tum dillerde var sayilir (eski davranis).
  locales?: readonly WoodyLocale[];
};

function routeLocales(route: SitemapRoute): readonly WoodyLocale[] {
  if (route.locales) return route.locales;
  return route.trOnly ? [WOODY_DEFAULT_LOCALE] : WOODY_LOCALES;
}

function buildAlternates(route: SitemapRoute): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  const locales = routeLocales(route);
  for (const loc of locales) {
    languages[loc] = `${BASE_URL}/${loc}${route.pathByLocale?.[loc] ?? route.path}`;
  }
  // x-default: varsa default (tr), yoksa mevcut ilk dil
  const xdef = locales.includes(WOODY_DEFAULT_LOCALE) ? WOODY_DEFAULT_LOCALE : locales[0];
  if (xdef) {
    languages['x-default'] = `${BASE_URL}/${xdef}${route.pathByLocale?.[xdef] ?? route.path}`;
  }
  return { languages };
}

async function blogRoutes(): Promise<SitemapRoute[]> {
  // DB i18n tabanli: her dil icin yalniz O DILDE cevirisi olan yazilar doner
  // (backend blog_posts_i18n inner-join). Boylece cevirisi olmayan dil sitemap'e girmez.
  const postsByLocale = await Promise.all(
    WOODY_LOCALES.map(async (locale) => ({
      locale,
      // API limit ust siniri 50; >50 yazi olursa burada sayfalama gerekir
      posts: await loadDbBlogPosts(locale, undefined, 50),
    })),
  );
  const byId = new Map<string, SitemapRoute>();
  const localesWithPosts = new Set<WoodyLocale>();

  for (const { locale, posts } of postsByLocale) {
    if (posts.length > 0) localesWithPosts.add(locale);
    for (const post of posts) {
      const key = post.id || post.slug;
      if (!key || !post.slug) continue;
      const existing = byId.get(key) ?? {
        path: `/blog/${post.slug}`,
        priority: 0.65,
        lastModified: post.updated_at || post.created_at,
        pathByLocale: {},
        locales: [] as WoodyLocale[],
      };
      existing.pathByLocale = {
        ...(existing.pathByLocale ?? {}),
        [locale]: `/blog/${post.slug}`,
      };
      existing.locales = [...((existing.locales as WoodyLocale[]) ?? []), locale];
      if (locale === WOODY_DEFAULT_LOCALE) existing.path = `/blog/${post.slug}`;
      byId.set(key, existing);
    }
  }

  // Kategori sayfalari yalniz cevirili yazisi olan dillerde anlamli (yoksa bos/ince liste)
  const categoryLocales = WOODY_LOCALES.filter((l) => localesWithPosts.has(l));
  const categoryRoutes: SitemapRoute[] = WOODY_BLOG_CATEGORIES.map((category) => ({
    path: `/blog/category/${category}`,
    priority: 0.62,
    locales: categoryLocales,
  }));

  return [...categoryRoutes, ...Array.from(byId.values())];
}

async function storeProductRoutes(): Promise<SitemapRoute[]> {
  // Gercek DB urunleri (gercek slug) — store sayfasiyla ayni kaynak. Onceden config'ten
  // okunuyordu; config'te slug yok -> normalizeCard slug=id yapip /store/2 gibi REDIRECT
  // eden numerik URL'ler sitemap'e giriyordu (GSC "Yonlendirmeli sayfa"). Duzeltildi.
  const products = await loadDbStoreProducts(WOODY_DEFAULT_LOCALE);
  return products
    .filter((product) => product.slug && !/^\d+$/.test(String(product.slug)))
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
    ...(await blogRoutes()),
    ...(await storeProductRoutes()),
    ...LEGACY_STATIC_PAGES.map((path) => ({ path, trOnly: false, priority: 0.55 })),
  ];

  return routes.flatMap((route) =>
    routeLocales(route).map((locale) => ({
      url: `${BASE_URL}/${locale}${route.pathByLocale?.[locale] ?? route.path}`,
      lastModified: route.lastModified ?? now,
      changeFrequency: 'weekly' as const,
      priority: route.priority,
      alternates: buildAlternates(route),
    })),
  );
}
