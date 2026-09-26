import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import CheckoutCartClient from '@/components/woody/store/CheckoutCartClient';
import CheckoutResultTracker from '@/components/woody/store/CheckoutResultTracker';
import ClearCartOnSuccess from '@/components/woody/store/ClearCartOnSuccess';
import { loadCheckoutCopy, loadPurchasableProducts } from '@/components/woody/store/checkout-copy.server';

export const dynamic = 'force-dynamic';

// Kişiye özel ödeme adımı: dizine eklenmez.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string; order?: string; product?: string }>;
};

export default async function StoreCheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { payment, order, product: productSlug } = await searchParams;
  const { ui, quoteWhatsApp } = await loadCheckoutCopy(locale);

  // Satın alma sepetten yürür (2026-09-26); ?product=<slug> eski bağlantılar ürünü sepete ekler.
  if (!payment) {
    const catalog = await loadPurchasableProducts(locale);
    return (
      <CheckoutCartClient
        locale={locale}
        ui={ui}
        catalog={catalog}
        legacyProductSlug={productSlug}
        quoteWhatsApp={quoteWhatsApp}
      />
    );
  }

  const success = payment === 'success';
  return (
    <main className="bg-[var(--gm-bg)] py-20 text-[var(--gm-text)]">
      {success && order ? <CheckoutResultTracker orderId={order} /> : null}
      {success ? <ClearCartOnSuccess /> : null}
      <div className="container max-w-2xl">
        <div className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-8 shadow-[var(--gm-shadow-card)]">
          <div className="flex items-center gap-3">
            {success ? (
              <CheckCircle2 className="size-8 text-[var(--gm-primary)]" aria-hidden />
            ) : (
              <XCircle className="size-8 text-[var(--gm-error)]" aria-hidden />
            )}
            <h1 className="text-3xl font-semibold">
              {success ? ui.checkoutSuccessTitle : ui.checkoutFailureTitle}
            </h1>
          </div>
          <p className="mt-5 leading-8 text-[var(--gm-text-dim)]">
            {success ? ui.checkoutSuccessDescription : ui.checkoutFailureDescription}
          </p>
          {order ? (
            <p className="mt-4 rounded-md border border-[var(--gm-border-soft)] p-3 font-mono text-sm">
              {order}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {!success ? (
              <Link
                href={`/${locale}/cart`}
                className="inline-flex min-h-11 items-center rounded-md bg-[var(--gm-primary)] px-5 py-3 font-semibold text-[var(--gm-surface)]"
              >
                {ui.buyNow}
              </Link>
            ) : null}
            <Link
              href={`/${locale}/store`}
              className={`${!success ? 'border border-[var(--gm-border)]' : 'bg-[var(--gm-primary)] text-[var(--gm-surface)]'} inline-flex min-h-11 items-center rounded-md px-5 py-3 font-semibold`}
            >
              {ui.checkoutReturnToStore}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
