'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RotateCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { cartActions, cartTotal, useCart } from '@/features/cart/cart.store';
import { tokenStore } from '@/integrations/rtk/token';
import { FOCUS_RING } from '@/lib/a11y';
import { captureCommerceAttribution } from '@/lib/commerce-attribution';
import { reportAddPaymentInfo, reportBeginCheckout, storePendingOrder } from '@/lib/ecommerce-events';
import { storeAssurance } from './assurance';
import { checkoutHref, money } from './CartPageClient';
import type { PurchasableProduct } from './checkout-copy.server';
import type { StoreUiCopy } from './types';

/**
 * Sepet checkout'u (2026-09-26): üyelik zorunlu → teslimat + fatura → sipariş →
 * PayTR iframe. Eski tek ürünlük ?product=<slug> bağlantıları ürünü sepete ekler.
 */

type Step = 'form' | 'iframe';
type InvoiceType = 'individual' | 'corporate';
type SavedAddress = {
  invoiceType: InvoiceType | null;
  name: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  identityNumber: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
};

const INPUT_CLS =
  'w-full rounded-lg border border-[#eadfce] bg-white px-3.5 py-2.5 text-[14px] text-[#24333f] outline-none transition focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/20';
const LABEL_CLS = 'mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]';

const EMPTY_ADDRESS = { name: '', phone: '', address: '', city: '', district: '', postalCode: '' };

function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  return token ? { authorization: `Bearer ${token}` } : {};
}

const ERROR_KEYS: Record<string, keyof StoreUiCopy> = {
  shipping_address_required: 'errorShippingAddress',
  billing_address_required: 'errorBillingAddress',
  billing_name_required: 'errorBillingName',
  billing_identity_invalid: 'errorBillingIdentity',
  billing_company_required: 'errorBillingCompany',
  billing_tax_number_invalid: 'errorBillingTaxNumber',
};

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  autoComplete,
  className,
  inputMode,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  className?: string;
  inputMode?: 'numeric' | 'tel' | 'email' | 'text';
  hint?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className={LABEL_CLS}>{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLS}
        autoComplete={autoComplete}
      />
      {hint ? <span className="mt-1 block text-[11px] font-semibold text-[#9a8a74]">{hint}</span> : null}
    </label>
  );
}

export default function CheckoutCartClient({
  locale,
  ui,
  catalog,
  legacyProductSlug,
  quoteWhatsApp,
}: {
  locale: string;
  ui: StoreUiCopy;
  catalog: Record<string, PurchasableProduct>;
  legacyProductSlug?: string;
  quoteWhatsApp?: string;
}) {
  const router = useRouter();
  const items = useCart();
  const { isAuthenticated, isReady, user } = useAuthStore();
  const [step, setStep] = useState<Step>('form');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [email, setEmail] = useState('');
  const [shipping, setShipping] = useState(EMPTY_ADDRESS);
  const [billing, setBilling] = useState({
    ...EMPTY_ADDRESS,
    sameAsShipping: true,
    invoiceType: 'individual' as InvoiceType,
    identityNumber: '',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
  });
  const [saveAddresses, setSaveAddresses] = useState(true);
  const [terms, setTerms] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const prefilled = useRef(false);
  const tracked = useRef(false);

  const lines = useMemo(() => items.filter((item) => catalog[item.productId]), [items, catalog]);
  const needsShipping = lines.some((item) => catalog[item.productId]?.hasPhysical);
  const total = cartTotal(lines);
  const assurance = storeAssurance(locale);
  const loginHref = checkoutHref(locale, false);

  // Eski "Şimdi Satın Al" bağlantısı: ürünü sepete koy, adresi sadeleştir.
  useEffect(() => {
    if (!legacyProductSlug) return;
    const product = Object.values(catalog).find((entry) => entry.slug === legacyProductSlug || entry.productId === legacyProductSlug);
    if (product && !items.some((item) => item.productId === product.productId)) {
      cartActions.add({
        productId: product.productId,
        slug: product.slug,
        title: product.title,
        image: product.image,
        unitPrice: product.unitPrice,
        minQuantity: product.minQuantity,
        quantity: product.minQuantity,
      });
    }
    router.replace(`/${locale}/store/checkout`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyProductSlug]);

  useEffect(() => {
    cartActions.sync(catalog);
  }, [catalog]);

  // Üyelik zorunlu: giriş yoksa login'e, dönüşte buraya.
  useEffect(() => {
    if (legacyProductSlug) return;
    if (isReady && !isAuthenticated) router.replace(loginHref);
  }, [isReady, isAuthenticated, legacyProductSlug, loginHref, router]);

  // Kayıtlı adres + hesap bilgisiyle formu doldur (bir kez).
  useEffect(() => {
    if (!isAuthenticated || prefilled.current) return;
    prefilled.current = true;
    setEmail(String(user?.email ?? ''));
    void (async () => {
      try {
        const res = await fetch('/api/v1/checkout/addresses', { credentials: 'include', headers: authHeaders() });
        if (!res.ok) return;
        const data = (await res.json()) as {
          account?: { email?: string; name?: string; phone?: string };
          shipping?: SavedAddress | null;
          billing?: SavedAddress | null;
        };
        if (data.account?.email) setEmail(data.account.email);
        const base = { ...EMPTY_ADDRESS, name: data.account?.name || '', phone: data.account?.phone || '' };
        const s = data.shipping;
        setShipping(s ? { name: s.name || base.name, phone: s.phone || base.phone, address: s.address, city: s.city, district: s.district, postalCode: s.postalCode } : base);
        const b = data.billing;
        if (b) {
          const same = Boolean(s) && b.address === s?.address && b.city === s?.city && b.district === s?.district && b.name === s?.name;
          setBilling((prev) => ({
            ...prev,
            sameAsShipping: same,
            invoiceType: b.invoiceType === 'corporate' ? 'corporate' : 'individual',
            name: b.name,
            phone: b.phone,
            address: b.address,
            city: b.city,
            district: b.district,
            postalCode: b.postalCode,
            identityNumber: b.identityNumber,
            companyName: b.companyName,
            taxOffice: b.taxOffice,
            taxNumber: b.taxNumber,
          }));
        } else {
          setBilling((prev) => ({ ...prev, name: base.name, phone: base.phone }));
        }
      } catch {
        // Doldurma opsiyonel.
      }
    })();
  }, [isAuthenticated, user]);

  // GA4 begin_checkout (sepet görünür olunca bir kez)
  useEffect(() => {
    if (tracked.current || !isAuthenticated || lines.length === 0) return;
    tracked.current = true;
    reportBeginCheckout({
      currency: 'TRY',
      value: total,
      items: lines.map((item) => ({ item_id: item.productId, item_name: item.title, price: item.unitPrice, quantity: item.quantity })),
    });
  }, [isAuthenticated, lines, total]);

  const setShip = (key: keyof typeof EMPTY_ADDRESS) => (value: string) => setShipping((prev) => ({ ...prev, [key]: value }));
  const setBill = (key: keyof typeof billing) => (value: string | boolean) => setBilling((prev) => ({ ...prev, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || lines.length === 0) return;
    setError('');
    setBusy(true);
    try {
      const billingSame = needsShipping && billing.sameAsShipping;
      const orderRes = await fetch('/api/v1/checkout/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-locale': locale, ...authHeaders() },
        body: JSON.stringify({
          items: lines.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
          shipping: needsShipping ? { ...shipping, country: 'TR' } : undefined,
          billing: {
            sameAsShipping: billingSame,
            invoiceType: billing.invoiceType,
            identityNumber: billing.identityNumber,
            companyName: billing.companyName,
            taxOffice: billing.taxOffice,
            taxNumber: billing.taxNumber,
            ...(billingSame
              ? {}
              : {
                  name: billing.name,
                  phone: billing.phone,
                  address: billing.address,
                  city: billing.city,
                  district: billing.district,
                  postalCode: billing.postalCode,
                  country: 'TR',
                }),
          },
          saveAddresses,
          attribution: captureCommerceAttribution(),
        }),
      });
      if (orderRes.status === 401) {
        router.replace(loginHref);
        return;
      }
      if (!orderRes.ok) {
        const body = (await orderRes.json().catch(() => ({}))) as { error?: { message?: string } };
        const key = ERROR_KEYS[String(body?.error?.message ?? '')];
        setError((key && ui[key]) || ui.checkoutFailed || '');
        return;
      }
      const order = (await orderRes.json()) as { id: string };

      const payRes = await fetch(`/api/v1/checkout/orders/${encodeURIComponent(order.id)}/paytr/initiate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ locale }),
      });
      if (payRes.status === 503) {
        setPaymentUnavailable(true);
        return;
      }
      if (!payRes.ok) throw new Error('paytr_failed');
      const pay = (await payRes.json()) as { iframeUrl?: string };
      if (!pay.iframeUrl) throw new Error('paytr_failed');

      const ecommerce = {
        currency: 'TRY',
        value: total,
        items: lines.map((item) => ({ item_id: item.productId, item_name: item.title, price: item.unitPrice, quantity: item.quantity })),
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

  if (!isReady || !isAuthenticated || legacyProductSlug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff9ee] pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-[#f58220]" aria-label={ui.loading || ''} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff9ee] pb-14 pt-28 text-[#24333f] lg:pt-32">
      <div className="container max-w-[1040px]">
        <Link
          href={`/${locale}/cart`}
          className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] transition hover:text-[#b85c0e] ${FOCUS_RING}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {ui.cartTitle || ui.back || ''}
        </Link>

        {lines.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
            <p className="text-[15px] font-semibold text-[#5f6871]">{ui.cartEmpty || ''}</p>
            <Link href={`/${locale}/store`} className={`mt-4 inline-flex rounded-full bg-[#f58220] px-5 py-2.5 text-[14px] font-black text-white ${FOCUS_RING}`}>
              {ui.goToStore || ui.checkoutReturnToStore || ''}
            </Link>
          </div>
        ) : step === 'iframe' ? (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
            <iframe src={iframeUrl} title="PayTR" className="h-[80vh] min-h-[640px] w-full border-0" allow="payment" />
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
            <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] md:p-8" data-testid="checkout-form">
              <h1 className="font-display text-2xl font-black">{ui.contactInfo || ''}</h1>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL_CLS}>{ui.email}</span>
                  <input value={email} readOnly className={`${INPUT_CLS} bg-[#faf6ef] text-[#68727b]`} />
                </label>
                {!needsShipping ? (
                  <Field label={ui.phone} value={billing.phone} onChange={setBill('phone')} required type="tel" autoComplete="tel" />
                ) : null}
              </div>

              {needsShipping ? (
                <fieldset className="mt-7">
                  <legend className="font-display text-xl font-black">{ui.shippingAddress || ''}</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={ui.name} value={shipping.name} onChange={setShip('name')} required autoComplete="shipping name" />
                    <Field label={ui.phone} value={shipping.phone} onChange={setShip('phone')} required type="tel" autoComplete="shipping tel" />
                    <Field label={ui.address} value={shipping.address} onChange={setShip('address')} required autoComplete="shipping street-address" className="sm:col-span-2" />
                    <Field label={ui.city} value={shipping.city} onChange={setShip('city')} required autoComplete="shipping address-level1" />
                    <Field label={ui.district} value={shipping.district} onChange={setShip('district')} autoComplete="shipping address-level2" />
                    <Field label={ui.postalCode} value={shipping.postalCode} onChange={setShip('postalCode')} autoComplete="shipping postal-code" inputMode="numeric" />
                  </div>
                </fieldset>
              ) : null}

              <fieldset className="mt-7">
                <legend className="font-display text-xl font-black">{ui.billingAddress || ''}</legend>
                <div className="mt-3 flex flex-wrap gap-4 text-[14px] font-bold" role="radiogroup" aria-label={ui.invoiceType || ''}>
                  {(['individual', 'corporate'] as const).map((type) => (
                    <label key={type} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="invoiceType"
                        checked={billing.invoiceType === type}
                        onChange={() => setBill('invoiceType')(type)}
                        className="h-4 w-4 accent-[#f58220]"
                      />
                      {type === 'individual' ? ui.invoiceIndividual : ui.invoiceCorporate}
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {billing.invoiceType === 'individual' ? (
                    <Field
                      label={ui.identityNumber}
                      value={billing.identityNumber}
                      onChange={setBill('identityNumber')}
                      inputMode="numeric"
                      hint={ui.identityHint}
                      className="sm:col-span-2"
                    />
                  ) : (
                    <>
                      <Field label={ui.companyName} value={billing.companyName} onChange={setBill('companyName')} required autoComplete="organization" className="sm:col-span-2" />
                      <Field label={ui.taxOffice} value={billing.taxOffice} onChange={setBill('taxOffice')} required />
                      <Field label={ui.taxNumber} value={billing.taxNumber} onChange={setBill('taxNumber')} required inputMode="numeric" />
                    </>
                  )}
                </div>

                {needsShipping ? (
                  <label className="mt-4 flex items-center gap-2.5 text-[14px] font-semibold text-[#5f6871]">
                    <input
                      type="checkbox"
                      checked={billing.sameAsShipping}
                      onChange={(event) => setBill('sameAsShipping')(event.target.checked)}
                      className="h-4 w-4 accent-[#f58220]"
                    />
                    {ui.billingSameAsShipping}
                  </label>
                ) : null}

                {!needsShipping || !billing.sameAsShipping ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={ui.name} value={billing.name} onChange={setBill('name')} required={billing.invoiceType === 'individual'} autoComplete="billing name" />
                    {needsShipping ? (
                      <Field label={ui.phone} value={billing.phone} onChange={setBill('phone')} type="tel" autoComplete="billing tel" />
                    ) : null}
                    <Field label={ui.address} value={billing.address} onChange={setBill('address')} required autoComplete="billing street-address" className="sm:col-span-2" />
                    <Field label={ui.city} value={billing.city} onChange={setBill('city')} required autoComplete="billing address-level1" />
                    <Field label={ui.district} value={billing.district} onChange={setBill('district')} autoComplete="billing address-level2" />
                    <Field label={ui.postalCode} value={billing.postalCode} onChange={setBill('postalCode')} autoComplete="billing postal-code" inputMode="numeric" />
                  </div>
                ) : null}
              </fieldset>

              <label className="mt-5 flex items-center gap-2.5 text-[13px] font-semibold text-[#5f6871]">
                <input type="checkbox" checked={saveAddresses} onChange={(event) => setSaveAddresses(event.target.checked)} className="h-4 w-4 accent-[#f58220]" />
                {ui.saveAddresses}
              </label>

              {ui.termsContract || ui.termsInfo ? (
                <label className="mt-5 flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
                  <input required type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-[#f58220]" />
                  <span>
                    <Link href={`/${locale}/on-bilgilendirme`} target="_blank" rel="noopener noreferrer" className={`font-bold underline ${FOCUS_RING}`}>
                      {ui.termsInfo || ''}
                    </Link>{' '}
                    <Link href={`/${locale}/mesafeli-satis`} target="_blank" rel="noopener noreferrer" className={`font-bold underline ${FOCUS_RING}`}>
                      {ui.termsContract || ''}
                    </Link>{' '}
                    {ui.termsAccept || ''}
                  </span>
                </label>
              ) : null}

              {ui.termsKvkkAccept ? (
                <label className="mt-4 flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
                  <input required type="checkbox" checked={kvkk} onChange={(event) => setKvkk(event.target.checked)} className="mt-1 h-4 w-4 accent-[#f58220]" />
                  <span>
                    {ui.termsKvkk ? (
                      <>
                        <Link href={`/${locale}/kvkk`} target="_blank" rel="noopener noreferrer" className={`font-bold underline ${FOCUS_RING}`}>
                          {ui.termsKvkk}
                        </Link>{' '}
                      </>
                    ) : null}
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
                    href={`https://wa.me/${quoteWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#0c8f74] px-4 py-2 text-[13px] font-black text-white ${FOCUS_RING}`}
                  >
                    WhatsApp
                  </a>
                </div>
              ) : null}

              <div className="mt-6 grid gap-2 rounded-xl bg-[#fff9ee] p-4 text-[12px] font-semibold text-[#5f6871] ring-1 ring-[#f0dcb6]/70">
                <Link href={`/${locale}/teslimat-ve-kargo`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 transition hover:text-[#d96f12] ${FOCUS_RING}`}>
                  <Truck className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
                  {assurance.shipping}
                </Link>
                <Link href={`/${locale}/iade-cayma`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 transition hover:text-[#d96f12] ${FOCUS_RING}`}>
                  <RotateCcw className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
                  {assurance.returns}
                </Link>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#0c8f74]" aria-hidden />
                  {assurance.payment} · 256-bit SSL
                </span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f58220] px-5 py-3 text-[15px] font-black text-white transition hover:bg-[#d96f12] disabled:opacity-60 ${FOCUS_RING}`}
                data-testid="checkout-pay"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ShoppingCart className="h-5 w-5" aria-hidden />}
                {busy ? ui.checkoutBusy : ui.payWithPaytr || ui.buyNow || ''}
              </button>
            </form>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
              <p className="text-[13px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.orderSummary || ''}</p>
              <ul className="mt-3 space-y-3">
                {lines.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#fff3e0]">
                      {item.image ? <Image src={item.image} alt="" aria-hidden fill sizes="48px" className="object-contain p-0.5" /> : null}
                    </div>
                    <span className="line-clamp-2 flex-1 text-[13px] font-semibold text-[#5f6871]">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-[13px] font-black">{money(item.unitPrice * item.quantity, locale)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-[#f0dcb6]/60 pt-3">
                <span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{ui.total}</span>
                <span className="font-display text-[24px] font-black text-[#d96f12]">{money(total, locale)}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
