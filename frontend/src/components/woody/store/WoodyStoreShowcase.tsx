'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, GraduationCap, MessageCircle } from 'lucide-react';

import { localizePath } from '@/integrations/shared';
import { tUi } from '@/i18n/staticUi';
import { FOCUS_RING } from '@/lib/a11y';
import { WhatsAppLink } from '@/components/common/WhatsAppLink';
import WoodyPageLogoHeader from '@/components/woody/WoodyPageLogoHeader';
import QuoteRequestForm, { type QuoteFormCopy } from '@/components/woody/quote/QuoteRequestForm';
import WaitlistSignupForm, { type WaitlistFormCopy } from '@/components/woody/waitlist/WaitlistSignupForm';
import type { StoreProductFilters, StoreTaxonomyItem, StoreUiCopy } from './types';

export type StoreCatalogCategory = {
  id: string;
  name: string;
  description?: string;
  route?: string;
  color?: string;
};

export type StoreCatalogProduct = {
  id: string | number;
  category: string;
  name: string;
  slug?: string;
  description?: string;
  price?: string;
  image?: string;
  alt?: string;
  seriesSlug?: string;
  seriesName?: string;
  levelSlug?: string;
  levelName?: string;
  purchaseMode?: 'online' | 'quote';
  isFree?: boolean;
  hasPhysical?: boolean;
};

export type StoreCatalog = {
  ui?: StoreUiCopy;
  quoteWhatsApp?: string;
  quoteMessage?: string;
  primaryCTA?: string;
  showQuoteButtons?: boolean;
  quoteForm?: QuoteFormCopy;
  waitlistForm?: WaitlistFormCopy;
  categories?: StoreCatalogCategory[];
  products?: StoreCatalogProduct[];
  series?: StoreTaxonomyItem[];
  levels?: StoreTaxonomyItem[];
  hasFreeProducts?: boolean;
};

const STORE_LOGO = '/assets/woody/woody-store-logo.png';

const comingSoonImage =
  '/media/woody/reference/ga68xbh7_Paragraf%20metniniz%20(4).png';

function quoteText(message: string | undefined, product?: string) {
  const text = message || '';
  return text.replace(/\{\{product\}\}/g, product || '');
}

function filterHref(locale: string, filters: StoreProductFilters, patch: StoreProductFilters) {
  const params = new URLSearchParams();
  const next = { ...filters, ...patch };
  if (next.category) params.set('category', next.category);
  if (next.series) params.set('series', next.series);
  if (next.level) params.set('level', next.level);
  if (next.isFree !== undefined) params.set('isFree', next.isFree ? '1' : '0');
  const query = params.toString();
  return `/${locale}/store${query ? `?${query}` : ''}`;
}

const PILL_BASE =
  'rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-[0.04em] ring-1 transition';
const PILL_ON = 'bg-[#f58220] text-white ring-[#f58220] shadow-[0_8px_22px_rgba(245,130,32,0.28)]';
const PILL_OFF = 'bg-white text-[#5f6871] ring-[#eadfce] hover:ring-[#f58220] hover:text-[#d96f12]';

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${PILL_BASE} ${active ? PILL_ON : PILL_OFF} ${FOCUS_RING}`}>
      {children}
    </Link>
  );
}

export default function WoodyStoreShowcase({
  catalog,
  locale,
  filters = {},
}: {
  catalog: StoreCatalog;
  locale: string;
  filters?: StoreProductFilters;
}) {
  const categories = catalog.categories ?? [];
  const products = catalog.products ?? [];
  const series = catalog.series ?? [];
  const levels = catalog.levels ?? [];

  const ui = catalog.ui ?? {};
  const quoteLabel = String(catalog.primaryCTA || '').trim();
  const quoteCta = quoteLabel || ui.quoteCta || '';
  const onlineCta = ui.addToCart || '';
  const freeCta = ui.freeWatch || '';

  const hasActiveFilter = Boolean(
    filters.category || filters.series || filters.level || filters.isFree !== undefined,
  );
  const activeCategory = filters.category
    ? categories.find((category) => category.id === filters.category)
    : undefined;
  const activeSeries = filters.series ? series.find((item) => item.slug === filters.series) : undefined;
  const activeLevel = filters.level ? levels.find((item) => item.slug === filters.level) : undefined;

  // Aktif filtre adi (rozet) — kategori > seri > seviye > ucretsiz onceligiyle
  const activeLabel =
    activeCategory?.name ||
    activeSeries?.name ||
    activeLevel?.name ||
    (filters.isFree ? ui.free : '') ||
    '';

  // Bos kategoriler yalnizca filtresiz "tumu" gorunumunde gosterilir (yakinda + bekleme listesi)
  const comingSoonCategories = !hasActiveFilter
    ? categories.filter((category) => !products.some((product) => product.category === category.id))
    : [];

  return (
    <main className="bg-[#fff9ee] text-[#24333f]">
      <WoodyPageLogoHeader
        title="Woody Store"
        locale={locale}
        logoSrc={STORE_LOGO}
        logoAlt="Woody Store"
        badge={
          activeLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f58220]/12 px-4 py-2 text-sm font-black text-[#d96f12] ring-1 ring-[#f58220]/30">
              {activeLabel}
            </span>
          ) : null
        }
      />

      {ui.heroSubtitle ? (
        <div className="mx-auto max-w-[820px] px-6 pt-4 text-center">
          <p className="text-base font-semibold leading-7 text-[#5f6871] md:text-lg">{ui.heroSubtitle}</p>
        </div>
      ) : null}

      {/* Filtre cubugu — kategoriler (birincil) + seri/seviye/ucretsiz (ikincil) */}
      <section className="container max-w-[1100px] pt-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <FilterPill href={`/${locale}/store`} active={!hasActiveFilter}>
            {ui.all || ''}
          </FilterPill>
          {categories.map((category) => (
            <FilterPill
              key={category.id}
              href={filterHref(locale, {}, { category: category.id })}
              active={filters.category === category.id}
            >
              {category.name}
            </FilterPill>
          ))}
        </div>

        {series.length || levels.length || (catalog.hasFreeProducts && ui.free) ? (
          <div className="mt-3 flex flex-col flex-wrap items-center justify-center gap-3 border-t border-[#f0dcb6]/60 pt-4 sm:flex-row">
            {series.length ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9a8a74]">
                  {tUi(locale, 'Series')}
                </span>
                {series.map((item) => (
                  <FilterPill
                    key={`series-${item.id}`}
                    href={filterHref(locale, filters, { series: filters.series === item.slug ? undefined : item.slug })}
                    active={filters.series === item.slug}
                  >
                    {item.name}
                  </FilterPill>
                ))}
              </div>
            ) : null}
            {levels.length ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9a8a74]">
                  {tUi(locale, 'Level')}
                </span>
                {levels.map((item) => (
                  <FilterPill
                    key={`level-${item.id}`}
                    href={filterHref(locale, filters, { level: filters.level === item.slug ? undefined : item.slug })}
                    active={filters.level === item.slug}
                  >
                    {item.name}
                  </FilterPill>
                ))}
              </div>
            ) : null}
            {catalog.hasFreeProducts && ui.free ? (
              <FilterPill
                href={filterHref(locale, filters, { isFree: filters.isFree ? undefined : true })}
                active={filters.isFree === true}
              >
                {ui.free}
              </FilterPill>
            ) : null}
          </div>
        ) : null}

        {/* Sonuç sayacı + filtreleri temizle */}
        {products.length || hasActiveFilter ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[13px] font-bold text-[#68727b]">
            <span>
              {products.length} {tUi(locale, 'products')}
            </span>
            {hasActiveFilter ? (
              <Link
                href={`/${locale}/store`}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[#d96f12] underline-offset-2 transition hover:underline ${FOCUS_RING}`}
              >
                {tUi(locale, 'Clear filters')}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Aktif kategori baglami — not + seriye git linki */}
      {activeCategory ? (
        <section className="container max-w-[1100px] pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-black leading-tight text-[#24333f] md:text-4xl">
                {activeCategory.name}
              </h2>
              <div className="mt-3 h-[3px] w-24 rounded-full bg-[#f58220]" />
              {activeCategory.id === 'okul-serisi' ? (
                <div className="mt-4 space-y-1">
                  {ui.classroomNote ? (
                    <p className="text-sm font-semibold text-[#5f6871]">{ui.classroomNote}</p>
                  ) : null}
                  {ui.teacherSetNote ? (
                    <p className="text-xs text-[#9a8a74]">{ui.teacherSetNote}</p>
                  ) : null}
                </div>
              ) : activeCategory.description ? (
                <p className="mt-4 max-w-2xl text-sm font-semibold text-[#5f6871]">{activeCategory.description}</p>
              ) : null}
            </div>
            {activeCategory.route ? (
              <Link
                href={localizePath(locale as any, activeCategory.route)}
                className={`inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-black text-[#0c8f74] ring-1 ring-[#eadfce] transition hover:ring-[#0c8f74] ${FOCUS_RING}`}
              >
                {ui.goToSeries || ''}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Urun listesi — tek birlesik izgara (filtreye gore) */}
      <section className="container max-w-[1100px] py-10 lg:py-12">
        {products.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const category = categories.find((item) => item.id === product.category);
              return (
                <article
                  key={product.id}
                  className="group flex min-h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] transition hover:-translate-y-1 hover:shadow-[0_20px_58px_rgba(49,64,79,0.15)]"
                  data-testid={`store-product-${product.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-linear-to-br from-[#fff3e0] to-[#eef6f3] p-3">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 260px"
                        className="object-contain transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                        <GraduationCap className="h-9 w-9 text-[#f58220]" aria-hidden />
                        <span className="px-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#b58a4f]">
                          {category?.name || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
                      {category ? <span className="text-[#f58220]">{category.name}</span> : null}
                      {product.isFree ? (
                        <span className="rounded-full bg-[#0c8f74]/10 px-2 py-0.5 text-[#0c8f74]">{ui.free || ''}</span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 line-clamp-2 font-display text-lg font-black leading-tight text-[#24333f]">
                      {product.name}
                    </h3>
                    {product.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68727b]">{product.description}</p>
                    ) : null}

                    {product.seriesName || product.levelName ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.seriesName ? (
                          <span className="rounded-full bg-[#fff3e0] px-2 py-1 text-[10px] font-bold text-[#9a6a1f]">
                            {product.seriesName}
                          </span>
                        ) : null}
                        {product.levelName ? (
                          <span className="rounded-full bg-[#eef6f3] px-2 py-1 text-[10px] font-bold text-[#0c8f74]">
                            {product.levelName}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {product.purchaseMode === 'quote' ? (
                        <WhatsAppLink
                          phone={catalog.quoteWhatsApp}
                          text={quoteText(catalog.quoteMessage, product.name)}
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f58220] px-3 py-2.5 text-[12px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
                          data-testid={`store-quote-btn-${product.id}`}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden />
                          {quoteCta}
                        </WhatsAppLink>
                      ) : product.slug ? (
                        <Link
                          href={`/${locale}/store/${product.slug}`}
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f58220] px-3 py-2.5 text-[12px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
                        >
                          {product.isFree ? freeCta : onlineCta}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      ) : null}
                      {catalog.quoteForm?.linkLabel ? (
                        <a
                          href="#quote-form"
                          className={`inline-flex items-center justify-center rounded-full border border-[#eadfce] px-3 py-2.5 text-[12px] font-black text-[#5f6871] transition hover:border-[#f58220] hover:text-[#d96f12] ${FOCUS_RING}`}
                        >
                          {catalog.quoteForm.linkLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // Filtre sonucu bos — yakinda + bekleme listesi
          <div className="mx-auto flex max-w-[560px] flex-col items-center justify-center rounded-2xl bg-white px-6 py-10 text-center shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce]">
            <div className="relative mb-5 aspect-[500/281] w-full max-w-[420px] overflow-hidden rounded-xl">
              <Image src={comingSoonImage} alt={ui.comingSoon || ''} fill sizes="420px" className="object-cover" />
            </div>
            <p className="font-display text-xl font-black text-[#24333f]">{ui.comingSoon || ''}</p>
            <WaitlistSignupForm
              copy={catalog.waitlistForm}
              productKey={activeCategory?.id || 'store'}
              locale={locale}
            />
          </div>
        )}
      </section>

      {/* Yakinda olan kategoriler (yalnizca filtresiz gorunumde) */}
      {comingSoonCategories.length ? (
        <section className="container max-w-[1100px] pb-14">
          <div className="grid gap-6 md:grid-cols-2">
            {comingSoonCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce]"
                data-testid={`store-category-${category.id}`}
              >
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#f58220]">
                  {category.name}
                </span>
                <div className="relative my-4 aspect-[500/281] w-full max-w-[380px] overflow-hidden rounded-xl">
                  <Image src={comingSoonImage} alt={ui.comingSoon || ''} fill sizes="380px" className="object-cover" />
                </div>
                <p className="font-display text-lg font-black text-[#24333f]">{ui.comingSoon || ''}</p>
                <WaitlistSignupForm copy={catalog.waitlistForm} productKey={category.id} locale={locale} />
                {category.route ? (
                  <Link
                    href={localizePath(locale as any, category.route)}
                    className={`mt-4 inline-flex items-center gap-1.5 text-[13px] font-black text-[#0c8f74] transition hover:text-[#0a7a63] ${FOCUS_RING}`}
                  >
                    {ui.goToSeries || ''}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <QuoteRequestForm copy={catalog.quoteForm} source="store" />
    </main>
  );
}
