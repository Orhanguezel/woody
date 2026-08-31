'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight, GraduationCap, MessageCircle, Play, ShoppingCart, X } from 'lucide-react';

import { localizePath } from '@/integrations/shared';
import { tUi } from '@/i18n/staticUi';
import { FOCUS_RING } from '@/lib/a11y';
import { WhatsAppLink } from '@/components/common/WhatsAppLink';
import WoodyPageLogoHeader from '@/components/woody/WoodyPageLogoHeader';
import QuoteRequestForm, { type QuoteFormCopy } from '@/components/woody/quote/QuoteRequestForm';
import type { WaitlistFormCopy } from '@/components/woody/waitlist/WaitlistSignupForm';
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
  videoUrl?: string;
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

// Musteri revizyonu (2026-08-31, PDF s.1): urunler her seri kendi basligi altinda
// ayrilir. Sira DB'den gelir (categories.display_order) — dile bagli DEGIL, admin
// panelden degistirilebilir. Mini School once, Ev & Ozel Ders sonra.

// "En az 3 adet" notlari yalnizca Mini School bolumunun altinda cikar (PDF s.2).
// DIKKAT: kategori slug'i DILE GORE degisir (tr atolye-serisi / en workshop-series /
// de workshop-reihe). Yeni bir dile kategori cevirisi eklendiginde slug'i buraya da ekle.
const MIN_ORDER_NOTE_SLUGS = new Set(['atolye-serisi', 'workshop-series', 'workshop-reihe']);

function quoteText(message: string | undefined, product?: string) {
  const text = message || '';
  return text.replace(/\{\{product\}\}/g, product || '');
}

// Bir urunun verilen filtre kombinasyonuyla eslesip eslesmedigi (AND semantigi).
// Filtre CUBUGU kaldirildi (PDF/WhatsApp: "ustteki yazilar cok kalabalik yapiyor")
// ama /store?category=... gibi mevcut derin baglantilar calismaya devam etsin diye
// filtreleme mantigi korunuyor.
function matchesFilters(product: StoreCatalogProduct, f: StoreProductFilters): boolean {
  if (f.category && product.category !== f.category) return false;
  if (f.series && product.seriesSlug !== f.series) return false;
  if (f.level && product.levelSlug !== f.level) return false;
  if (f.isFree !== undefined && Boolean(product.isFree) !== f.isFree) return false;
  return true;
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
  // S4 (2026-08-30): "Urun Videosu" 9:16 modal durumu
  const [productVideo, setProductVideo] = useState<{ url: string; title: string } | null>(null);

  const ui: StoreUiCopy = catalog.ui ?? {};
  const categories = catalog.categories ?? [];
  const products = catalog.products ?? [];
  const quoteCta = ui.quoteCta || '';
  const freeCta = ui.freeWatch || '';

  const visible = products.filter((product) => matchesFilters(product, filters));

  // Kategori bazli gruplama — DB sirasiyla (categories dizisi display_order'a gore
  // gelir), bos grup uretmez. Taksonomide olmayan bir kategori varsa sona eklenir.
  const orderedSlugs = categories.map((category) => category.id);
  const productSlugs = Array.from(new Set(visible.map((product) => product.category).filter(Boolean)));
  const groupSlugs = [
    ...orderedSlugs.filter((slug) => productSlugs.includes(slug)),
    ...productSlugs.filter((slug) => !orderedSlugs.includes(slug)),
  ];
  const groups = groupSlugs.map((slug) => ({
    slug,
    category: categories.find((item) => item.id === slug),
    items: visible.filter((product) => product.category === slug),
  }));

  // GUVENLIK AGI: kategorisi cozulemeyen urun (o dilde category_i18n cevirisi yoksa
  // API bos categorySlug doner) gruplama yuzunden KAYBOLMASIN — bassiz bir blokta
  // yine de listelenir. EN'de Mini School boyle dusmustu (2026-08-31).
  const ungrouped = visible.filter((product) => !product.category);

  const minOrderNotes = [ui.minOrderNote1, ui.minOrderNote2, ui.minOrderNote3].filter(Boolean);

  function ProductCard({ product }: { product: StoreCatalogProduct }) {
    const category = categories.find((item) => item.id === product.category);
    const media = product.image ? (
      <Image
        src={product.image}
        alt={product.alt || product.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 260px"
        className="object-contain transition duration-500 group-hover:scale-105"
      />
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <GraduationCap className="h-9 w-9 text-[#f58220]" aria-hidden />
        <span className="px-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#b58a4f]">
          {category?.name || ''}
        </span>
      </div>
    );
    const mediaCls =
      'relative block aspect-[4/3] overflow-hidden bg-linear-to-br from-[#fff3e0] to-[#eef6f3] p-2 sm:p-3';

    return (
      <article
        className="group flex min-h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] transition hover:-translate-y-1 hover:shadow-[0_20px_58px_rgba(49,64,79,0.15)]"
        data-testid={`store-product-${product.id}`}
      >
        {product.slug ? (
          <Link href={`/${locale}/store/${product.slug}`} className={mediaCls} aria-label={product.name}>
            {media}
          </Link>
        ) : (
          <div className={mediaCls}>{media}</div>
        )}

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <h3 className="line-clamp-2 font-display text-[13px] font-black leading-tight text-[#24333f] sm:text-lg">
            {product.slug ? (
              <Link href={`/${locale}/store/${product.slug}`} className={`transition hover:text-[#d96f12] ${FOCUS_RING}`}>
                {product.name}
              </Link>
            ) : (
              product.name
            )}
          </h3>
          {/* Aciklama dar mobil izgarada gizli — kartlar yan yana sigsin (PDF s.1) */}
          {product.description ? (
            <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-[#68727b] sm:block">
              {product.description}
            </p>
          ) : null}

          {product.levelName ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10px] font-bold text-[#0c8f74]">
                {product.levelName}
              </span>
            </div>
          ) : null}

          {/* S3/S4 (2026-08-30): online urun = fiyat + Urun Videosu + Simdi Satin Al */}
          {product.purchaseMode === 'online' && !product.isFree && product.price ? (
            <div className="mt-auto pt-3 sm:pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-[16px] font-black text-[#d96f12] sm:text-[22px]">
                  {product.price}
                </span>
                {product.videoUrl ? (
                  <button
                    type="button"
                    onClick={() => setProductVideo({ url: product.videoUrl!, title: product.name })}
                    className={`hidden items-center gap-1.5 rounded-full border border-[#eadfce] bg-white px-3 py-2 text-[12px] font-black text-[#5f6871] transition hover:border-[#f58220] hover:text-[#d96f12] sm:inline-flex ${FOCUS_RING}`}
                    data-testid={`store-video-btn-${product.id}`}
                  >
                    <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
                    {ui.productVideo || ''}
                  </button>
                ) : null}
              </div>
              <Link
                href={`/${locale}/store/checkout?product=${encodeURIComponent(String(product.slug || product.id))}`}
                className={`mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#f58220] px-2 py-2 text-[11px] font-black text-white transition hover:bg-[#d96f12] sm:mt-3 sm:px-3 sm:py-2.5 sm:text-[13px] ${FOCUS_RING}`}
                data-testid={`store-buy-btn-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
                {ui.buyNow || ''}
              </Link>
            </div>
          ) : (
            <div className="mt-auto flex flex-wrap gap-2 pt-3 sm:pt-5">
              {product.isFree && product.slug ? (
                <Link
                  href={`/${locale}/store/${product.slug}`}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f58220] px-3 py-2.5 text-[12px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
                >
                  {freeCta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : (
                <WhatsAppLink
                  phone={catalog.quoteWhatsApp}
                  text={quoteText(catalog.quoteMessage, product.name)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f58220] px-3 py-2.5 text-[12px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
                  data-testid={`store-quote-btn-${product.id}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {quoteCta}
                </WhatsAppLink>
              )}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="bg-white text-[#24333f]">
      <WoodyPageLogoHeader title="Woody Store" locale={locale} logoSrc={STORE_LOGO} logoAlt="Woody Store" />

      {ui.heroSubtitle ? (
        <div className="mx-auto max-w-[820px] px-6 pt-4 text-center">
          <p className="text-base font-semibold leading-7 text-[#5f6871] md:text-lg">{ui.heroSubtitle}</p>
          {ui.ageCta ? (
            <Link
              href={localizePath(locale as never, '/level-finder')}
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0c8f74] px-5 py-2.5 text-[13px] font-black text-white transition hover:bg-[#0a7a63] ${FOCUS_RING}`}
            >
              <GraduationCap className="h-4 w-4" aria-hidden />
              {ui.ageCta}
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Bolumler — her seri kendi basligi altinda (PDF s.1: "mini school ve ozel ders
          ayirt edilmiyor, iki baslik halinde koyalim"). Filtre cubugu kaldirildi. */}
      {groups.length ? (
        groups.map((group) => (
          <section key={group.slug} className="container max-w-[1100px] pt-8 lg:pt-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-black leading-tight text-[#24333f] md:text-3xl">
                {group.category?.name || group.slug}
              </h2>
              <span className="rounded-full bg-[#0c8f74]/10 px-3 py-1 text-[12px] font-black text-[#0c8f74]">
                {group.items.length} {tUi(locale, 'products')}
              </span>
            </div>
            <div className="mt-2 h-[3px] w-24 rounded-full bg-[#f58220]" />
            {group.category?.description ? (
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5f6871]">
                {group.category.description}
              </p>
            ) : null}

            {/* Mobilde de yan yana (PDF s.1: "mobilde alt alta duruyor, hepsi yan yana olursa iyi olur") */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
              {group.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* "En az 3 adet" bilgileri Mini School bolumunun ALTINDA (PDF s.2) */}
            {MIN_ORDER_NOTE_SLUGS.has(group.slug) && minOrderNotes.length ? (
              <div className="mt-6 grid gap-4 rounded-2xl bg-white px-5 py-5 shadow-[0_10px_30px_rgba(49,64,79,0.06)] ring-1 ring-[#f2e9d8] md:grid-cols-3">
                {minOrderNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0c8f74]" aria-hidden />
                    <p className="text-[13px] font-semibold leading-6 text-[#5f6871]">{note}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {group.category?.route ? (
              <div className="mt-5">
                <Link
                  href={localizePath(locale as never, group.category.route)}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-black text-[#0c8f74] ring-1 ring-[#eadfce] transition hover:ring-[#0c8f74] ${FOCUS_RING}`}
                >
                  {ui.goToSeries || ''}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : null}
          </section>
        ))
      ) : null}

      {ungrouped.length ? (
        <section className="container max-w-[1100px] pt-8 lg:pt-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
            {ungrouped.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {!groups.length && !ungrouped.length ? (
        <section className="container max-w-[1100px] py-14">
          <p className="text-center font-display text-xl font-black text-[#24333f]">{ui.comingSoon || ''}</p>
        </section>
      ) : null}

      <div className="pb-14" />

      <QuoteRequestForm copy={catalog.quoteForm} source="store" />

      {/* S4 (2026-08-30): Urun Videosu — 9:16 dikey modal */}
      {productVideo ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setProductVideo(null)}
            className={`absolute right-6 top-6 z-[10001] text-white/80 transition hover:text-white ${FOCUS_RING}`}
            aria-label={ui.back || 'X'}
          >
            <X className="size-9" aria-hidden />
          </button>
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-[80vw] truncate text-[16px] font-bold text-white">{productVideo.title}</p>
            <div className="aspect-[9/16] h-[80vh] max-w-full">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={productVideo.url} controls autoPlay playsInline className="size-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
