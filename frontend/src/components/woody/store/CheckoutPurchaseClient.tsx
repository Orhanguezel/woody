'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck, ShoppingCart } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import {
  reportAddPaymentInfo,
  reportBeginCheckout,
  storePendingOrder,
} from '@/lib/ecommerce-events';

import type { StoreProduct, StoreUiCopy } from './types';

/**
 * Tek urunlu satin alma akisi (REVIZE 2026-08-30):
 * form -> POST /checkout/orders -> POST /checkout/orders/:id/paytr/initiate -> PayTR iframe.
 */

type Step = 'form' | 'iframe';

function money(value: number) {
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value)} TL`;
}

const INPUT_CLS =
  'w-full rounded-lg border border-[#eadfce] bg-white px-3.5 py-2.5 text-[14px] text-[#24333f] outline-none transition focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/20';

export default function CheckoutPurchaseClient({
  product,
  locale,
  ui,
  quoteWhatsApp,
  quoteMessage,
}: {
  product: StoreProduct;
  locale: string;
  ui: StoreUiCopy;
  quoteWhatsApp?: string;
  quoteMessage?: string;
}) {
  const [step, setStep] = useState<Step>('form');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    terms: false,
    kvkk: false,
  });

  const total = useMemo(() => product.price * quantity, [product.price, quantity]);
  const needsShipping = Boolean(product.hasPhysical);

  // GA4: satin alma akisina giris (sayfa basina bir kez)
  useEffect(() => {
    reportBeginCheckout({
      currency: 'TRY',
      value: product.price,
      items: [{ item_id: String(product.id), item_name: product.title, price: product.price, quantity: 1 }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Mini school ogrenci setleri: "en az 3 adet" bilgilendirmesi (S9)
  const minOrderHint =
    product.categorySlug === 'atolye-serisi' && product.seriesSlug === 'ogrenci'
      ? ui.minOrderNote1
      : undefined;

  const set = (key: keyof typeof form) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const orderRes = await fetch('/api/v1/checkout/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-locale': locale },
        body: JSON.stringify({
          items: [{ product_id: product.id, quantity }],
          customer: {
            email: form.email,
            name: form.name,
            phone: form.phone,
            city: form.city,
            address: form.address,
          },
          shipping: needsShipping
            ? {
                name: form.name,
                phone: form.phone,
                address: form.address,
                city: form.city,
                district: form.district,
                postalCode: form.postalCode,
                country: 'TR',
              }
            : undefined,
        }),
      });
      if (!orderRes.ok) throw new Error('order_failed');
      const order = (await orderRes.json()) as { id: string };

      const payRes = await fetch(`/api/v1/checkout/orders/${encodeURIComponent(order.id)}/paytr/initiate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      if (payRes.status === 503) {
        // Odeme servisi henuz acik degil — siparis alindi, WhatsApp yedegi goster
        setPaymentUnavailable(true);
        return;
      }
      if (!payRes.ok) throw new Error('paytr_failed');
      const pay = (await payRes.json()) as { iframeUrl?: string };
      if (!pay.iframeUrl) throw new Error('paytr_failed');

      // GA4: purchase olayi sonuc sayfasinda bu kayitla zenginlesir
      const ecommerce = {
        currency: 'TRY',
        value: total,
        items: [{ item_id: String(product.id), item_name: product.title, price: product.price, quantity }],
      };
      storePendingOrder(order.id, ecommerce);
      reportAddPaymentInfo(ecommerce);

      setIframeUrl(pay.iframeUrl);
      setStep('iframe');
    } catch {
      setError(ui.checkoutFailed || '');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff9ee] pb-14 pt-28 text-[#24333f] lg:pt-32">
      <div className="container max-w-[960px]">
        <Link
          href={`/${locale}/store`}
          className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] transition hover:text-[#b85c0e] ${FOCUS_RING}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {ui.checkoutReturnToStore || ui.back || ''}
        </Link>

        {step === 'iframe' ? (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
            <iframe
              src={iframeUrl}
              title="PayTR"
              className="h-[80vh] min-h-[640px] w-full border-0"
              allow="payment"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
            {/* Form */}
            <form
              onSubmit={submit}
              className="rounded-2xl bg-white p-6 shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] md:p-8"
            >
              <h1 className="font-display text-2xl font-black">{product.title}</h1>
              {product.description ? (
                <p className="mt-1 text-sm text-[#68727b]">{product.description}</p>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.name}</span>
                  <input required value={form.name} onChange={(e) => set('name')(e.target.value)} className={INPUT_CLS} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.email}</span>
                  <input required type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} className={INPUT_CLS} autoComplete="email" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.phone}</span>
                  <input required type="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} className={INPUT_CLS} autoComplete="tel" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.quantity}</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                    className={INPUT_CLS}
                  />
                </label>
              </div>
              {minOrderHint ? (
                <p className="mt-2 text-[12px] font-semibold text-[#0c8f74]">{minOrderHint}</p>
              ) : null}

              {needsShipping ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.address}</span>
                    <input required value={form.address} onChange={(e) => set('address')(e.target.value)} className={INPUT_CLS} autoComplete="street-address" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.city}</span>
                    <input required value={form.city} onChange={(e) => set('city')(e.target.value)} className={INPUT_CLS} autoComplete="address-level1" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.district}</span>
                    <input value={form.district} onChange={(e) => set('district')(e.target.value)} className={INPUT_CLS} autoComplete="address-level2" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.postalCode}</span>
                    <input value={form.postalCode} onChange={(e) => set('postalCode')(e.target.value)} className={INPUT_CLS} autoComplete="postal-code" />
                  </label>
                </div>
              ) : null}

              {ui.termsContract || ui.termsInfo ? (
                <label className="mt-5 flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
                  <input
                    required
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => set('terms')(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#f58220]"
                  />
                  <span>
                    <Link
                      href={`/${locale}/on-bilgilendirme`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold underline ${FOCUS_RING}`}
                    >
                      {ui.termsInfo || ''}
                    </Link>
                    {' '}
                    <Link
                      href={`/${locale}/mesafeli-satis`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold underline ${FOCUS_RING}`}
                    >
                      {ui.termsContract || ''}
                    </Link>
                    {' '}
                    {ui.termsAccept || ''}
                  </span>
                </label>
              ) : null}

              {ui.termsKvkkAccept ? (
                <label className="mt-5 flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
                  <input
                    required
                    type="checkbox"
                    checked={form.kvkk}
                    onChange={(e) => set('kvkk')(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#f58220]"
                  />
                  <span>
                    <Link
                      href={`/${locale}/kvkk`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold underline ${FOCUS_RING}`}
                    >
                      {ui.termsKvkk || ''}
                    </Link>
                    {' '}
                    {ui.termsKvkkAccept}
                  </span>
                </label>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              {paymentUnavailable && quoteWhatsApp ? (
                <div className="mt-4 rounded-lg bg-[#eef6f3] px-4 py-3" role="alert">
                  <p className="text-[13px] font-semibold text-[#0c8f74]">{ui.checkoutFailed}</p>
                  <a
                    href={`https://wa.me/${quoteWhatsApp}?text=${encodeURIComponent((quoteMessage || '').replace(/\{\{product\}\}/g, product.title))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#0c8f74] px-4 py-2 text-[13px] font-black text-white transition hover:bg-[#0a7a63] ${FOCUS_RING}`}
                  >
                    WhatsApp
                  </a>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f58220] px-5 py-3 text-[15px] font-black text-white transition hover:bg-[#d96f12] disabled:opacity-60 ${FOCUS_RING}`}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ShoppingCart className="h-5 w-5" aria-hidden />}
                {busy ? ui.checkoutBusy : ui.payWithPaytr || ui.buyNow || ''}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#9a8a74]">
                <ShieldCheck className="h-4 w-4 text-[#0c8f74]" aria-hidden />
                PayTR · 256-bit SSL
              </p>
            </form>

            {/* Ozet */}
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
              {product.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-linear-to-br from-[#fff3e0] to-[#eef6f3]">
                  <Image src={product.image} alt={product.alt || product.title} fill sizes="340px" className="object-contain p-3" />
                </div>
              ) : null}
              <div className="mt-4 flex items-center justify-between text-[14px] font-semibold text-[#5f6871]">
                <span className="line-clamp-1">{product.title}</span>
                <span>× {quantity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#f0dcb6]/60 pt-3">
                <span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.total}</span>
                <span className="font-display text-[24px] font-black text-[#d96f12]">{money(total)}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
