'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { cartActions, cartTotal, useCart } from '@/features/cart/cart.store';
import { FOCUS_RING } from '@/lib/a11y';
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
  const total = cartTotal(available);

  return (
    <main className="min-h-screen bg-[#fff9ee] pb-14 pt-28 text-[#24333f] lg:pt-32">
      <div className="container max-w-[960px]">
        <Link
          href={`/${locale}/store`}
          className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] transition hover:text-[#b85c0e] ${FOCUS_RING}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {ui.continueShopping || ui.checkoutReturnToStore || ''}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-black">{ui.cartTitle || ui.cart || ''}</h1>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
            <ShoppingCart className="mx-auto h-10 w-10 text-[#f58220]" aria-hidden />
            <p className="mt-3 text-[15px] font-semibold text-[#5f6871]">{ui.cartEmpty || ''}</p>
            <Link
              href={`/${locale}/store`}
              className={`mt-5 inline-flex items-center justify-center rounded-full bg-[#f58220] px-5 py-2.5 text-[14px] font-black text-white transition hover:bg-[#d96f12] ${FOCUS_RING}`}
            >
              {ui.goToStore || ui.checkoutReturnToStore || ''}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
            <ul className="space-y-3" data-testid="cart-lines">
              {[...available, ...unavailable].map((item) => {
                const isAvailable = Boolean(catalog[item.productId]);
                return (
                  <li
                    key={item.productId}
                    className={`flex gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce] ${isAvailable ? '' : 'opacity-60'}`}
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#fff3e0]">
                      {item.image ? <Image src={item.image} alt="" aria-hidden fill sizes="80px" className="object-contain p-1" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/${locale}/store/${item.slug}`} className={`line-clamp-2 font-black ${FOCUS_RING}`}>
                        {item.title}
                      </Link>
                      {isAvailable ? (
                        <p className="mt-1 text-[13px] font-semibold text-[#68727b]">{money(item.unitPrice, locale)}</p>
                      ) : (
                        <p className="mt-1 text-[13px] font-semibold text-red-700">{ui.cartUnavailableItems || ''}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        {isAvailable ? (
                          <div className="inline-flex items-center rounded-full ring-1 ring-[#eadfce]">
                            <button
                              type="button"
                              aria-label="-"
                              disabled={item.quantity <= item.minQuantity}
                              onClick={() => cartActions.setQuantity(item.productId, item.quantity - 1)}
                              className={`p-2 disabled:opacity-40 ${FOCUS_RING}`}
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden />
                            </button>
                            <span className="min-w-8 text-center text-[14px] font-black" aria-live="polite">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="+"
                              onClick={() => cartActions.setQuantity(item.productId, item.quantity + 1)}
                              className={`p-2 ${FOCUS_RING}`}
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
                      {item.minQuantity > 1 && isAvailable ? (
                        <p className="mt-1 text-[11px] font-semibold text-[#0c8f74]">
                          {(ui.minQuantityBadge || '').replace(/\{\{count\}\}/g, String(item.minQuantity))}
                        </p>
                      ) : null}
                    </div>
                    {isAvailable ? (
                      <p className="shrink-0 font-display text-[16px] font-black text-[#d96f12]">
                        {money(item.unitPrice * item.quantity, locale)}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
              <p className="text-[13px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.orderSummary || ''}</p>
              <div className="mt-3 flex items-center justify-between border-t border-[#f0dcb6]/60 pt-3">
                <span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.total || ''}</span>
                <span className="font-display text-[24px] font-black text-[#d96f12]" data-testid="cart-total">{money(total, locale)}</span>
              </div>
              <Link
                href={checkoutHref(locale, isReady && isAuthenticated)}
                aria-disabled={available.length === 0}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f58220] px-5 py-3 text-[15px] font-black text-white transition hover:bg-[#d96f12] aria-disabled:pointer-events-none aria-disabled:opacity-50 ${FOCUS_RING}`}
                data-testid="cart-checkout"
              >
                {isReady && !isAuthenticated ? <LockKeyhole className="h-4 w-4" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
                {isReady && !isAuthenticated ? ui.loginToCheckout || ui.proceedToCheckout || '' : ui.proceedToCheckout || ''}
              </Link>
              {isReady && !isAuthenticated && ui.checkoutLoginNote ? (
                <p className="mt-3 text-[12px] font-semibold leading-5 text-[#68727b]">{ui.checkoutLoginNote}</p>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
