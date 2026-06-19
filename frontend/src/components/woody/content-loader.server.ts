import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadPageContent } from '@/config/pages/loader';
import { fetchSetting } from '@/i18n/server';
import { injectAppName } from '@/lib/page-copy';
import { getPublicAppName } from '@/lib/site-config';

type JsonObject = Record<string, unknown>;

export type WoodyFaqItem = {
  question: string;
  answer: string;
};

export type WoodyCard = {
  title: string;
  description?: string;
  href?: string;
  image?: string;
  video?: string;
  fitImage?: boolean;
  price?: string | number;
  currency?: string;
  features?: string[];
  badge?: string;
  slug?: string;
  level?: string;
  product?: string;
  cta?: string;
};

export type WoodySection = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: WoodyCard[];
};

export type WoodyPageContent = {
  key: string;
  title: string;
  description?: string;
  eyebrow?: string;
  image?: string;
  imageAlt?: string;
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: string;
    primaryHref?: string;
    secondaryCTA?: string;
    secondaryHref?: string;
    image?: string;
    imageAlt?: string;
  };
  sections?: WoodySection[];
  cards?: WoodyCard[];
  products?: WoodyCard[];
  faq?: WoodyFaqItem[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: JsonObject;
  localBusiness?: JsonObject;
  raw?: JsonObject;
};

const PAGES_DIR = path.join(process.cwd(), 'src', 'config', 'pages');

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function present<T>(value: T | null | undefined): value is T {
  return value != null;
}

function asString(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString).filter(Boolean) : [];
}

function appInject(value: string) {
  return injectAppName(value, getPublicAppName());
}

function normalizeCard(raw: unknown): WoodyCard | null {
  if (!isRecord(raw)) return null;
  const title = appInject(asString(raw.title) || asString(raw.name));
  if (!title) return null;

  return {
    title,
    description: appInject(asString(raw.description) || asString(raw.summary)),
    href: asString(raw.href) || asString(raw.url),
    image: asString(raw.image) || asString(raw.imageUrl),
    video: asString(raw.video) || asString(raw.videoUrl),
    fitImage: raw.fitImage === true,
    price: typeof raw.price === 'number' || typeof raw.price === 'string' ? raw.price : undefined,
    currency: asString(raw.currency) || asString(raw.priceCurrency),
    features: asStringArray(raw.features),
    badge: appInject(asString(raw.badge)),
    slug: asString(raw.slug) || asString(raw.id),
    level: asString(raw.level),
    product: asString(raw.product),
    cta: appInject(asString(raw.cta)),
  };
}

function normalizeFaq(raw: unknown): WoodyFaqItem | null {
  if (!isRecord(raw)) return null;
  const question = appInject(asString(raw.question) || asString(raw.q));
  const answer = appInject(asString(raw.answer) || asString(raw.a));
  return question && answer ? { question, answer } : null;
}

function normalizeSection(raw: unknown): WoodySection | null {
  if (!isRecord(raw)) return null;
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeCard).filter(present) : [];
  const section: WoodySection = {
    eyebrow: appInject(asString(raw.eyebrow)),
    title: appInject(asString(raw.title)),
    description: appInject(asString(raw.description)),
    items,
  };
  return section.title || section.description || section.items?.length ? section : null;
}

function pickLocaleBranch(raw: unknown, locale: string): JsonObject {
  if (!isRecord(raw)) return {};
  const normalized = locale.toLowerCase();
  const short = normalized.split('-')[0] || normalized;
  const branch = raw[normalized] ?? raw[short] ?? raw.en ?? raw.tr;
  return isRecord(branch) ? branch : raw;
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const text = await readFile(filePath, 'utf8');
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function readPageJson(key: string, locale: string): Promise<JsonObject | null> {
  const dbRaw = await readPageSettingJson(key, locale);

  // Config JSON (ayni key) — her zaman yukle ki DB eksik olsa da fallback olsun
  let configJson: JsonObject | null = null;
  const fromLoader = await loadPageContent<unknown>(key, locale, { injectAppName: false });
  if (isRecord(fromLoader)) {
    configJson = key === 'home' ? await mergeHomeBannerSetting(fromLoader, locale) : fromLoader;
  } else {
    const candidates = [
      path.join(PAGES_DIR, locale, `${key}.json`),
      path.join(PAGES_DIR, locale.split('-')[0] || locale, `${key}.json`),
      path.join(PAGES_DIR, `${key}.json`),
    ];
    for (const filePath of candidates) {
      const raw = await readJsonFile(filePath);
      if (raw) { configJson = pickLocaleBranch(raw, locale); break; }
    }
  }

  // DB varsa: config TABAN + DB OVERRIDE (shallow). Boylece DB'de olmayan ust-duzey
  // anahtarlar (quoteForm, pageUi, ui ...) config'ten gelir; admin'in DB'de ezdigi alanlar korunur.
  if (dbRaw) {
    return isRecord(configJson) ? { ...configJson, ...dbRaw } : dbRaw;
  }
  return configJson;
}

async function readPageSettingJson(key: string, locale: string): Promise<JsonObject | null> {
  const settingKey = key.startsWith('page_') ? key : `page_${key}`;
  if (!['page_store', 'page_preschool', 'page_workshop'].includes(settingKey)) return null;

  const row = await fetchSetting(settingKey, locale, { revalidate: 60 });
  const value = row?.value;
  if (isRecord(value)) return value;
  return null;
}

async function mergeHomeBannerSetting(raw: JsonObject, locale: string): Promise<JsonObject> {
  const row = await fetchSetting('home_banner', locale, { revalidate: 60 });
  const value = row?.value;
  if (!isRecord(value)) return raw;

  const bannerItems = Array.isArray(value.items)
    ? value.items.map(asString).filter(Boolean)
    : Array.isArray(value.bannerItems)
      ? value.bannerItems.map(asString).filter(Boolean)
      : [];

  return bannerItems.length ? { ...raw, bannerItems } : raw;
}

export async function loadWoodyPageContent(key: string, locale: string): Promise<WoodyPageContent | null> {
  const raw = await readPageJson(key, locale);
  if (!raw) return null;

  const hero = isRecord(raw.hero) ? raw.hero : raw;
  const title = appInject(
    asString(raw.title) || asString(hero.title) || asString(raw.name) || asString(raw.pageTitle),
  );
  if (!title) return null;

  const productsRaw = raw.products ?? raw.items;

  return {
    key,
    title,
    description: appInject(
      asString(raw.description) || asString(hero.description) || asString(hero.subtitle),
    ),
    eyebrow: appInject(asString(raw.eyebrow) || asString(hero.eyebrow)),
    image: asString(raw.image) || asString(raw.imageUrl),
    imageAlt: appInject(asString(raw.imageAlt)),
    hero: {
      eyebrow: appInject(asString(hero.eyebrow)),
      title: appInject(asString(hero.title) || title),
      subtitle: appInject(asString(hero.subtitle)),
      description: appInject(asString(hero.description)),
      primaryCTA: appInject(asString(hero.primaryCTA) || asString(hero.primaryCta)),
      primaryHref: asString(hero.primaryHref) || asString(hero.primaryUrl),
      secondaryCTA: appInject(asString(hero.secondaryCTA) || asString(hero.secondaryCta)),
      secondaryHref: asString(hero.secondaryHref) || asString(hero.secondaryUrl),
      image: asString(hero.image) || asString(hero.imageUrl),
      imageAlt: appInject(asString(hero.imageAlt)),
    },
    sections: Array.isArray(raw.sections) ? raw.sections.map(normalizeSection).filter(present) : [],
    cards: Array.isArray(raw.cards) ? raw.cards.map(normalizeCard).filter(present) : [],
    products: Array.isArray(productsRaw) ? productsRaw.map(normalizeCard).filter(present) : [],
    faq: Array.isArray(raw.faq) ? raw.faq.map(normalizeFaq).filter(present) : [],
    seo: isRecord(raw.seo)
      ? {
          title: appInject(asString(raw.seo.title)),
          description: appInject(asString(raw.seo.description)),
          image: asString(raw.seo.image) || asString(raw.seo.ogImage),
        }
      : undefined,
    jsonLd: isRecord(raw.jsonLd) ? raw.jsonLd : undefined,
    localBusiness: isRecord(raw.localBusiness) ? raw.localBusiness : undefined,
    raw,
  };
}

export async function loadWoodyProducts(
  fileKey: 'store-products' | 'digital-products',
  locale: string,
): Promise<WoodyCard[]> {
  const raw = await readPageJson(fileKey, locale);
  if (!raw) return [];
  const list = Array.isArray(raw.products) ? raw.products : Array.isArray(raw.items) ? raw.items : [];
  return list.map(normalizeCard).filter(present);
}

export async function findWoodyStoreProduct(slug: string, locale: string): Promise<WoodyCard | null> {
  const products = await loadWoodyProducts('store-products', locale);
  return products.find((item) => item.slug === slug) ?? null;
}

export async function findWoodyDigitalProduct(
  level: string,
  product: string,
  locale: string,
): Promise<WoodyCard | null> {
  const products = await loadWoodyProducts('digital-products', locale);
  return products.find((item) => item.level === level && item.product === product) ?? null;
}
