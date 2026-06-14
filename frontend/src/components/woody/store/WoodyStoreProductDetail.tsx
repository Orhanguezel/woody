'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LockKeyhole, PlayCircle, ShoppingCart, Truck } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import type { StoreProduct, StoreUiCopy } from './types';

type LibraryItem = {
  productId?: string;
  expiresAt?: string | null;
  remainingDays?: number | null;
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
}

function remainingText(item: LibraryItem | null, ui: StoreUiCopy) {
  if (!item) return '';
  if (item.remainingDays == null) return ui.unlimitedAccess || '';
  return (ui.remainingDays || '').replace('{{days}}', String(item.remainingDays));
}

export default function WoodyStoreProductDetail({
  product,
  locale,
  ui = {},
}: {
  product: StoreProduct;
  locale: string;
  ui?: StoreUiCopy;
}) {
  const [libraryItem, setLibraryItem] = React.useState<LibraryItem | null>(null);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/me/library', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (cancelled || !payload) return;
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.data)
              ? payload.data
              : [];
        const match = rows.find((item: LibraryItem) => item.productId === product.id);
        setLibraryItem(match ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  React.useEffect(() => {
    if (!product.isFree || libraryItem) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('free') === '1') void addFreeToLibrary();
  }, [libraryItem, product.isFree]);

  const hasAccess = Boolean(libraryItem);

  async function addFreeToLibrary() {
    setMessage('');
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/me/library/free/${product.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) {
        const next = `/${locale}/store/${product.slug}?free=1`;
        window.location.href = `/${locale}/login?next=${encodeURIComponent(next)}`;
        return;
      }
      if (!res.ok) throw new Error('free_add_failed');
      setLibraryItem({ productId: product.id, remainingDays: null, expiresAt: null });
      setMessage(ui.freeAdded || '');
    } catch {
      setMessage(ui.freeAddFailed || '');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-white pt-28 text-gray-900">
      <section className="container grid gap-10 pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.alt || product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain"
            />
          ) : null}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {product.seriesName ? <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{product.seriesName}</span> : null}
            {product.levelName ? <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{product.levelName}</span> : null}
            {product.isFree ? <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{ui.free || ''}</span> : null}
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">{product.title}</h1>
          {product.description ? (
            <p className="mt-5 text-lg leading-8 text-gray-600">{product.description}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {!product.isFree && product.purchaseMode !== 'quote' ? (
              <p className="text-2xl font-black">{money(product.price, product.currency)}</p>
            ) : null}
            {product.purchaseMode === 'online' ? (
              product.isFree ? (
                <button
                  type="button"
                  onClick={addFreeToLibrary}
                  disabled={busy}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md bg-brand-primary px-5 py-3 font-bold text-white disabled:opacity-60 ${FOCUS_RING}`}
                >
                  <PlayCircle className="size-4" aria-hidden />
                  {busy ? (ui.freeAdding || '') : (ui.freeWatch || '')}
                </button>
              ) : (
                <Link
                  href="#checkout"
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md bg-brand-primary px-5 py-3 font-bold text-white ${FOCUS_RING}`}
                >
                  <ShoppingCart className="size-4" aria-hidden />
                  {ui.addToCart || ''}
                </Link>
              )
            ) : (
              <Link
                href={`/${locale}/store`}
                className={`inline-flex min-h-12 items-center rounded-md bg-brand-primary px-5 py-3 font-bold text-white ${FOCUS_RING}`}
              >
                {ui.requestQuote || ''}
              </Link>
            )}
          </div>

          {product.hasPhysical ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
              <Truck className="size-4" aria-hidden />
              {ui.physicalShippingNote || ''}
            </p>
          ) : null}
          {libraryItem ? (
            <p className="mt-4 text-sm font-semibold text-green-700">{remainingText(libraryItem, ui)}</p>
          ) : null}
          {message ? <p className="mt-4 text-sm font-semibold text-gray-700">{message}</p> : null}
        </div>
      </section>

      {product.contents?.length ? (
        <section className="border-y border-gray-100 bg-gray-50 py-12">
          <div className="container">
            <h2 className="text-2xl font-black">{ui.contents || ''}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {product.contents.map((content) => {
                const canOpen = content.kind === 'digital' && (hasAccess || content.isPreview);
                return (
                  <article key={content.id} className="rounded-lg border border-gray-100 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold uppercase">
                            {content.kind === 'physical' ? (ui.physical || '') : content.mediaType || ui.digital || ''}
                          </span>
                          {content.isPreview ? (
                            <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700">
                              {ui.preview || ''}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-lg font-bold">{content.title}</h3>
                        {content.description ? <p className="mt-2 text-sm leading-6 text-gray-600">{content.description}</p> : null}
                      </div>
                      {canOpen ? (
                        <Link
                          href={`/${locale}/me/contents/${content.id}?${new URLSearchParams({
                            title: content.title,
                            mediaType: content.mediaType || '',
                          }).toString()}`}
                          className={`inline-flex shrink-0 items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-bold text-white ${FOCUS_RING}`}
                        >
                          <PlayCircle className="size-4" aria-hidden />
                          {ui.open || ''}
                        </Link>
                      ) : content.kind === 'physical' ? null : (
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-bold text-gray-500">
                          <LockKeyhole className="size-4" aria-hidden />
                          {ui.locked || ''}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
