'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, ShoppingCart, Trash2, Truck } from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { cartActions, cartCount, cartTotal, useCart } from '@/features/cart/cart.store';
import { FOCUS_RING } from '@/lib/a11y';
import { reportAddToCart } from '@/lib/ecommerce-events';
import { assuranceHrefs, storeAssurance } from './assurance';
import CheckoutSteps from './CheckoutSteps';
import type { PurchasableProduct } from './checkout-copy.server';
import type { StoreUiCopy } from './types';

export function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : locale, {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Giriş yoksa login'e, dönüşte checkout'a. */
export function checkoutHref(locale: string, authenticated: boolean) {
  const checkout = `/${locale}/store/checkout`;
  return authenticated ? checkout : `/${locale}/login?next=${encodeURIComponent(checkout)}`;
}

export function stepLabels(ui: StoreUiCopy) {
  return [ui.stepCart, ui.stepAccount, ui.stepAddress, ui.stepPayment];
}

export function TrustList({ locale, ui }: { locale: string; ui: StoreUiCopy }) {
  const assurance = storeAssurance(locale);
  const hrefs = assuranceHrefs(locale);
  return (
    <div className="space-y-2.5 text-[12px] font-semibold text-[#5f6871]">
      <p className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
        {assurance.payment} · 256-bit SSL
      </p>
      <Link href={hrefs.returns} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 hover:text-[#d96f12] ${FOCUS_RING}`}>
        <RotateCcw className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
        {assurance.returns}
      </Link>
      <Link href={hrefs.shipping} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 hover:text-[#d96f12] ${FOCUS_RING}`}>
        <Truck className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
        {assurance.shipping}
      </Link>
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {ui.acceptedCards ? <span className="mr-1 text-[11px] text-[#9a8a74]">{ui.acceptedCards}</span> : null}
        {['VISA', 'MASTERCARD', 'TROY'].map((brand) => (
          <span key={brand} className="rounded-md bg-[#f4efe6] px-2 py-0.5 text-[10px] font-black tracking-wider text-[#24333f]">{brand}</span>
        ))}
      </div>
    </div>
  );
}

export default function CartPageClient({
  locale,
  ui,
  catalog,
}: {
  locale: string;
  ui: StoreUiCopy;
  catalog: Record<string, PurchasableProduct>;
}) {
  const items = useCart();
  const { isAuthenticated, isReady } = useAuthStore();

  // Fiyat/başlık/min adet sunucudaki güncel üründen gelir.
  useEffect(() => {
    cartActions.sync(catalog);
  }, [catalog]);

  const available = useMemo(() => items.filter((item) => catalog[item.productId]), [items, catalog]);
  const unavailable = useMemo(() => items.filter((item) => !catalog[item.productId]), [items, catalog]);
  const suggestions = useMemo(
    () => Object.values(catalog).filter((product) => !items.some((item) => item.productId === product.productId)).slice(0, 3),
    [catalog, items],
  );
  const total = cartTotal(available);
  const count = cartCount(available);
  const loggedOut = isReady && !isAuthenticated;
  const ctaLabel = loggedOut ? ui.loginToCheckout || ui.proceedToCheckout : ui.proceedToCheckout;
  const countLabel = (ui.itemsCount || '{{count}}').replace(/\{\{count\}\}/g, String(count));

  function addSuggestion(product: PurchasableProduct) {
    cartActions.add({
      productId: product.productId,
      slug: product.slug,
      title: product.title,
      image: product.image,
      unitPrice: product.unitPrice,
      minQuantity: product.minQuantity,
    });
    reportAddToCart({
      currency: 'TRY',
      value: product.unitPrice * product.minQuantity,
      items: [{ item_id: product.productId, item_name: product.title, price: product.unitPrice, quantity: product.minQuantity }],
    });
  }

  const suggestionBlock = suggestions.length ? (
    <section className="mt-10">
      <h2 className="font-display text-xl font-black">{ui.youMayAlsoLike}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {suggestions.map((product) => (
          <article key={product.productId} className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-[#eadfce]">
            <Link href={`/${locale}/store/${product.slug}`} className={`relative block aspect-[4/3] overflow-hidden rounded-xl bg-linear-to-br from-[#fff3e0] to-[#eef6f3] ${FOCUS_RING}`}>
              {product.image ? <Image src={product.image} alt={product.title} fill sizes="(max-width:640px) 90vw, 280px" className="object-contain p-2" /> : null}
            </Link>
            {product.seriesName ? <p className="mt-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#0c8f74]">{product.seriesName}</p> : null}
            <p className="mt-1 line-clamp-2 flex-1 text-[14px] font-black">{product.title}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-display text-[16px] font-black text-[#d96f12]">{money(product.unitPrice, locale)}</span>
              <button
                type="button"
                onClick={() => addSuggestion(product)}
                className={`inline-flex items-center gap-1.5 rounded-full bg-[#fff3e6] px-3 py-1.5 text-[12px] font-black text-[#d96f12] ring-1 ring-[#f58220]/40 hover:bg-[#f58220] hover:text-white ${FOCUS_RING}`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {ui.addToCart}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <div className="min-h-screen bg-[#fff9ee] pb-28 pt-28 text-[#24333f] lg:pb-16 lg:pt-32">
      <div className="container max-w-[1120px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${locale}/store`}
            className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] transition hover:text-[#b85c0e] ${FOCUS_RING}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {ui.continueShopping || ui.checkoutReturnToStore || ''}
          </Link>
          <CheckoutSteps labels={stepLabels(ui)} current={0} ariaLabel={ui.checkoutStepsLabel} />
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-black md:text-4xl">
            {ui.cartTitle || ui.cart || ''}
            {count ? <span className="ml-3 align-middle text-[15px] font-bold text-[#9a8a74]">{countLabel}</span> : null}
          </h1>
          {items.length ? (
            <button type="button" onClick={() => cartActions.clear()} className={`text-[13px] font-bold text-[#9a8a74] underline-offset-2 hover:text-red-700 hover:underline ${FOCUS_RING}`}>
              {ui.clearCart}
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <>
            <div className="mt-6 rounded-3xl bg-white px-6 py-14 text-center shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce]">
              <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3e6]">
                <ShoppingBag className="h-10 w-10 text-[#f58220]" aria-hidden />
              </span>
              <p className="mt-5 font-display text-xl font-black">{ui.cartEmpty || ''}</p>
              <Link
                href={`/${locale}/store`}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#f58220] px-6 py-3 text-[14px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
              >
                {ui.goToStore || ui.checkoutReturnToStore || ''}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            {suggestionBlock}
          </>
        ) : (
          <>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
              <ul className="space-y-4" data-testid="cart-lines">
                {[...available, ...unavailable].map((item) => {
                  const product = catalog[item.productId];
                  return (
                    <li
                      key={item.productId}
                      className={`grid grid-cols-[88px_1fr] gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(49,64,79,0.06)] ring-1 ring-[#eadfce] sm:grid-cols-[112px_1fr_auto] sm:p-5 ${product ? '' : 'opacity-60'}`}
                    >
                      <Link href={`/${locale}/store/${item.slug}`} className={`relative block h-[88px] w-[88px] overflow-hidden rounded-xl bg-linear-to-br from-[#fff3e0] to-[#eef6f3] sm:h-28 sm:w-28 ${FOCUS_RING}`}>
                        {item.image ? <Image src={item.image} alt={item.title} fill sizes="112px" className="object-contain p-1.5" /> : null}
                      </Link>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          {product?.seriesName ? <span className="rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0c8f74]">{product.seriesName}</span> : null}
                          {product?.levelName ? <span className="rounded-full bg-[#fff1e2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#d96f12]">{product.levelName}</span> : null}
                        </div>
                        <Link href={`/${locale}/store/${item.slug}`} className={`mt-1.5 line-clamp-2 block text-[15px] font-black leading-snug hover:text-[#d96f12] ${FOCUS_RING}`}>
                          {item.title}
                        </Link>
                        {product ? (
                          <p className="mt-1 text-[13px] font-semibold text-[#68727b]">{money(item.unitPrice, locale)}</p>
                        ) : (
                          <p className="mt-1 text-[13px] font-semibold text-red-700">{ui.cartUnavailableItems || ''}</p>
                        )}
                        {item.minQuantity > 1 && product ? (
                          <p className="mt-1 text-[11px] font-semibold text-[#0c8f74]">
                            {(ui.minQuantityBadge || '').replace(/\{\{count\}\}/g, String(item.minQuantity))}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {product ? (
                            <div className="inline-flex items-center rounded-full bg-[#fff9ee] ring-1 ring-[#eadfce]">
                              <button
                                type="button"
                                aria-label="-"
                                disabled={item.quantity <= item.minQuantity}
                                onClick={() => cartActions.setQuantity(item.productId, item.quantity - 1)}
                                className={`rounded-full p-2 hover:bg-white disabled:opacity-40 ${FOCUS_RING}`}
                              >
                                <Minus className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              <span className="min-w-9 text-center text-[14px] font-black" aria-live="polite">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="+"
                                onClick={() => cartActions.setQuantity(item.productId, item.quantity + 1)}
                                className={`rounded-full p-2 hover:bg-white ${FOCUS_RING}`}
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => cartActions.remove(item.productId)}
                            className={`inline-flex items-center gap-1 text-[12px] font-bold text-[#9a8a74] hover:text-red-700 ${FOCUS_RING}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            {ui.removeItem || ''}
                          </button>
                        </div>
                      </div>
                      {product ? (
                        <p className="col-span-2 text-right font-display text-[18px] font-black text-[#24333f] sm:col-span-1 sm:self-center">
                          {money(item.unitPrice * item.quantity, locale)}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <aside className="h-fit space-y-5 rounded-3xl bg-white p-6 shadow-[0_18px_48px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] lg:sticky lg:top-28">
                <p className="text-[13px] font-black uppercase tracking-[0.1em] text-[#9a8a74]">{ui.orderSummary || ''}</p>
                <div className="space-y-2 text-[14px]">
                  {available.map((item) => (
                    <div key={item.productId} className="flex justify-between gap-3 text-[#5f6871]">
                      <span className="line-clamp-1">{item.title} × {item.quantity}</span>
                      <span className="shrink-0 font-semibold">{money(item.unitPrice * item.quantity, locale)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[#f0dcb6]/70 pt-4">
                  <span className="text-[13px] font-black uppercase tracking-[0.1em] text-[#9a8a74]">{ui.total || ''}</span>
                  <span className="font-display text-[28px] font-black text-[#d96f12]" data-testid="cart-total">{money(total, locale)}</span>
                </div>
                <Link
                  href={checkoutHref(locale, isReady && isAuthenticated)}
                  aria-disabled={available.length === 0}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f58220] px-5 py-3.5 text-[15px] font-black text-white shadow-[0_10px_24px_rgba(245,130,32,0.35)] transition hover:bg-[#d96f12] aria-disabled:pointer-events-none aria-disabled:opacity-50 ${FOCUS_RING}`}
                  data-testid="cart-checkout"
                >
                  {loggedOut ? <LockKeyhole className="h-4 w-4" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
                  {ctaLabel || ''}
                </Link>
                {loggedOut && ui.checkoutLoginNote ? (
                  <p className="rounded-xl bg-[#fff9ee] p-3 text-[12px] font-semibold leading-5 text-[#68727b] ring-1 ring-[#f0dcb6]/70">{ui.checkoutLoginNote}</p>
                ) : null}
                <TrustList locale={locale} ui={ui} />
              </aside>
            </div>
            {suggestionBlock}

            {/* Mobil: altta sabit toplam + ödeme */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfce] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#9a8a74]">{ui.total}</p>
                  <p className="font-display text-[20px] font-black text-[#d96f12]">{money(total, locale)}</p>
                </div>
                <Link
                  href={checkoutHref(locale, isReady && isAuthenticated)}
                  aria-disabled={available.length === 0}
                  className={`inline-flex items-center gap-2 rounded-full bg-[#f58220] px-5 py-3 text-[14px] font-black text-white aria-disabled:pointer-events-none aria-disabled:opacity-50 ${FOCUS_RING}`}
                >
                  {loggedOut ? <LockKeyhole className="h-4 w-4" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
                  {ctaLabel || ''}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
