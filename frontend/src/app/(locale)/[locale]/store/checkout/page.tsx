import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { loadDbStoreProduct } from '@/components/woody/store/load-store-products.server';
import CheckoutPurchaseClient from '@/components/woody/store/CheckoutPurchaseClient';
import CheckoutResultTracker from '@/components/woody/store/CheckoutResultTracker';
import type { StoreUiCopy } from '@/components/woody/store/types';
import { loadPageContent } from '@/config/pages/loader';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string; order?: string; product?: string }>;
};

type CheckoutCopy = { ui: StoreUiCopy; quoteWhatsApp?: string; quoteMessage?: string };

async function loadUi(locale: string): Promise<CheckoutCopy> {
  const [content, storeProducts] = await Promise.all([
    loadWoodyPageContent('store', locale),
    loadPageContent<{ ui?: StoreUiCopy; quoteWhatsApp?: string; quoteMessage?: string }>('store-products', locale),
  ]);
  const raw = (content?.raw ?? {}) as Record<string, unknown>;
  const dbUi = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? (raw.ui as StoreUiCopy) : {};
  // config store-products.json ui taban; DB page_store.ui ustune biner
  return {
    ui: { ...(storeProducts?.ui ?? {}), ...dbUi },
    quoteWhatsApp: (raw.quoteWhatsApp as string) || storeProducts?.quoteWhatsApp,
    quoteMessage: (raw.quoteMessage as string) || storeProducts?.quoteMessage,
  };
}

export default async function StoreCheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { payment, order, product: productSlug } = await searchParams;
  const { ui, quoteWhatsApp, quoteMessage } = await loadUi(locale);

  // Satin alma akisi: /store/checkout?product=<slug> (REVIZE 2026-08-30, PayTR)
  if (productSlug && !payment) {
    const product = await loadDbStoreProduct(productSlug, locale);
    if (product && product.purchaseMode === 'online' && !product.isFree) {
      return (
        <CheckoutPurchaseClient
          product={product}
          locale={locale}
          ui={ui}
          quoteWhatsApp={quoteWhatsApp}
          quoteMessage={quoteMessage}
        />
      );
    }
  }

  const success = payment === 'success';
  return (
    <main className="bg-[var(--gm-bg)] py-20 text-[var(--gm-text)]">
      {success && order ? <CheckoutResultTracker orderId={order} /> : null}
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
          <Link
            href={`/${locale}/store`}
            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-[var(--gm-primary)] px-5 py-3 font-semibold text-[var(--gm-surface)]"
          >
            {ui.checkoutReturnToStore}
          </Link>
        </div>
      </div>
    </main>
  );
}
