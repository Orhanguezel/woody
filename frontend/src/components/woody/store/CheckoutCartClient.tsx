'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, LockKeyhole, Mail, MapPinned, Receipt } from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { cartActions, cartTotal, useCart } from '@/features/cart/cart.store';
import { tokenStore } from '@/integrations/rtk/token';
import { FOCUS_RING } from '@/lib/a11y';
import { captureCommerceAttribution } from '@/lib/commerce-attribution';
import { reportAddPaymentInfo, reportBeginCheckout, storePendingOrder } from '@/lib/ecommerce-events';
import AddressBook, { invoiceSummary } from './address/AddressBook';
import { addressApi, type Account, type BookAddress } from './address/address-api';
import { checkoutHref, money, stepLabels, TrustList } from './CartPageClient';
import CheckoutSteps from './CheckoutSteps';
import type { PurchasableProduct } from './checkout-copy.server';
import type { StoreUiCopy } from './types';

/**
 * Sepet checkout'u: üyelik zorunlu → kayıtlı adreslerden teslimat + fatura seçimi
 * (haritalı adres ekleme/düzenleme) → sipariş → PayTR iframe.
 * Eski tek ürünlük ?product=<slug> bağlantıları ürünü sepete ekler.
 */

type Step = 'form' | 'iframe';

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

function pick(addresses: BookAddress[], current: string, flag: 'isDefaultShipping' | 'isDefaultBilling') {
  if (current && addresses.some((a) => a.id === current)) return current;
  return (addresses.find((a) => a[flag]) ?? addresses[0])?.id ?? '';
}

function Section({ icon, title, children, testId }: { icon: React.ReactNode; title?: string; children: React.ReactNode; testId?: string }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce] md:p-7" data-testid={testId}>
      <h2 className="flex items-center gap-2.5 font-display text-xl font-black">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3e6] text-[#f58220]">{icon}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
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
  const [account, setAccount] = useState<Account>({ email: '', name: '', phone: '' });
  const [addresses, setAddresses] = useState<BookAddress[]>([]);
  const [loadedBook, setLoadedBook] = useState(false);
  const [shippingId, setShippingId] = useState('');
  const [billingId, setBillingId] = useState('');
  const [billingSame, setBillingSame] = useState(true);
  const [terms, setTerms] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const tracked = useRef(false);

  const lines = useMemo(() => items.filter((item) => catalog[item.productId]), [items, catalog]);
  const needsShipping = lines.some((item) => catalog[item.productId]?.hasPhysical);
  const total = cartTotal(lines);
  const loginHref = checkoutHref(locale, false);
  const shippingEntry = addresses.find((a) => a.id === shippingId);
  const billingEntry = needsShipping && billingSame ? shippingEntry : addresses.find((a) => a.id === billingId);

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

  // Adres defteri + hesap bilgisi.
  useEffect(() => {
    if (!isAuthenticated || loadedBook) return;
    setAccount((prev) => ({ ...prev, email: String(user?.email ?? '') }));
    void (async () => {
      try {
        const data = await addressApi.list();
        setAccount(data.account);
        setAddresses(data.addresses);
      } catch {
        // Liste gelmezse kullanıcı yeni adres ekleyebilir.
      } finally {
        setLoadedBook(true);
      }
    })();
  }, [isAuthenticated, loadedBook, user]);

  useEffect(() => {
    setShippingId((current) => pick(addresses, current, 'isDefaultShipping'));
    setBillingId((current) => pick(addresses, current, 'isDefaultBilling'));
  }, [addresses]);

  // GA4 begin_checkout (bir kez)
  useEffect(() => {
    if (tracked.current || !isAuthenticated || lines.length === 0) return;
    tracked.current = true;
    reportBeginCheckout({
      currency: 'TRY',
      value: total,
      items: lines.map((item) => ({ item_id: item.productId, item_name: item.title, price: item.unitPrice, quantity: item.quantity })),
    });
  }, [isAuthenticated, lines, total]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || lines.length === 0) return;
    setError('');
    if (needsShipping && !shippingEntry) {
      setError(ui.selectShippingAddress || '');
      return;
    }
    if (!billingEntry) {
      setError(ui.selectBillingAddress || '');
      return;
    }
    setBusy(true);
    try {
      const orderRes = await fetch('/api/v1/checkout/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-locale': locale, ...authHeaders() },
        body: JSON.stringify({
          items: lines.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
          shipping: needsShipping && shippingEntry
            ? {
                name: shippingEntry.name,
                phone: shippingEntry.phone,
                address: shippingEntry.address,
                city: shippingEntry.city,
                district: shippingEntry.district,
                postalCode: shippingEntry.postalCode,
                country: shippingEntry.country || 'TR',
              }
            : undefined,
          billing: {
            sameAsShipping: false,
            invoiceType: billingEntry.invoiceType,
            identityNumber: billingEntry.identityNumber,
            companyName: billingEntry.companyName,
            taxOffice: billingEntry.taxOffice,
            taxNumber: billingEntry.taxNumber,
            name: billingEntry.name,
            phone: billingEntry.phone,
            address: billingEntry.address,
            city: billingEntry.city,
            district: billingEntry.district,
            postalCode: billingEntry.postalCode,
            country: billingEntry.country || 'TR',
          },
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
    <main className="min-h-screen bg-[#fff9ee] pb-16 pt-28 text-[#24333f] lg:pt-32">
      <div className="container max-w-[1120px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${locale}/cart`}
            className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] transition hover:text-[#b85c0e] ${FOCUS_RING}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {ui.cartTitle || ui.back || ''}
          </Link>
          <CheckoutSteps labels={stepLabels(ui)} current={step === 'iframe' ? 3 : 2} />
        </div>

        {lines.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce]">
            <p className="text-[15px] font-semibold text-[#5f6871]">{ui.cartEmpty || ''}</p>
            <Link href={`/${locale}/store`} className={`mt-4 inline-flex rounded-full bg-[#f58220] px-5 py-2.5 text-[14px] font-black text-white ${FOCUS_RING}`}>
              {ui.goToStore || ui.checkoutReturnToStore || ''}
            </Link>
          </div>
        ) : step === 'iframe' ? (
          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce]">
            <iframe src={iframeUrl} title="PayTR" className="h-[80vh] min-h-[640px] w-full border-0" allow="payment" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]" data-testid="checkout-form">
            <div className="space-y-6">
              <Section icon={<Mail className="h-4 w-4" aria-hidden />} title={ui.contactInfo}>
                <p className="text-[15px] font-bold">{account.name}</p>
                <p className="text-[14px] text-[#68727b]" data-testid="checkout-email">{account.email}</p>
              </Section>

              {needsShipping ? (
                <Section icon={<MapPinned className="h-4 w-4" aria-hidden />} title={ui.shippingAddress} testId="shipping-section">
                  {loadedBook ? (
                    <AddressBook
                      ui={ui}
                      account={account}
                      addresses={addresses}
                      onAddressesChange={setAddresses}
                      selectedId={shippingId}
                      onSelect={setShippingId}
                      name="shippingAddress"
                      testId="shipping-book"
                    />
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-[#f58220]" aria-hidden />
                  )}
                </Section>
              ) : null}

              <Section icon={<Receipt className="h-4 w-4" aria-hidden />} title={ui.billingAddress} testId="billing-section">
                {needsShipping ? (
                  <label className="mb-4 flex items-center gap-2.5 text-[14px] font-bold text-[#24333f]">
                    <input type="checkbox" checked={billingSame} onChange={(event) => setBillingSame(event.target.checked)} className="h-4 w-4 accent-[#f58220]" />
                    {ui.billingSameAsShipping}
                  </label>
                ) : null}
                {needsShipping && billingSame ? (
                  shippingEntry ? (
                    <p className="rounded-xl bg-[#fff9ee] p-3 text-[13px] font-semibold text-[#5f6871] ring-1 ring-[#f0dcb6]/70">
                      {invoiceSummary(shippingEntry, ui)}
                    </p>
                  ) : null
                ) : loadedBook ? (
                  <AddressBook
                    ui={ui}
                    account={account}
                    addresses={addresses}
                    onAddressesChange={setAddresses}
                    selectedId={billingId}
                    onSelect={setBillingId}
                    showInvoiceSummary
                    name="billingAddress"
                    testId="billing-book"
                  />
                ) : null}
              </Section>

              <div className="rounded-3xl bg-white p-5 ring-1 ring-[#eadfce] md:p-7">
                {ui.termsContract || ui.termsInfo ? (
                  <label className="flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
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
                  <label className="mt-3 flex items-start gap-2.5 text-[13px] leading-6 text-[#5f6871]">
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
              </div>
            </div>

            <aside className="h-fit space-y-5 rounded-3xl bg-white p-6 shadow-[0_18px_48px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] lg:sticky lg:top-28">
              <p className="text-[13px] font-black uppercase tracking-[0.1em] text-[#9a8a74]">{ui.orderSummary || ''}</p>
              <ul className="space-y-3">
                {lines.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-[#fff3e0] to-[#eef6f3]">
                      {item.image ? <Image src={item.image} alt="" aria-hidden fill sizes="56px" className="object-contain p-1" /> : null}
                    </div>
                    <span className="line-clamp-2 flex-1 text-[13px] font-semibold text-[#5f6871]">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-[13px] font-black">{money(item.unitPrice * item.quantity, locale)}</span>
                  </li>
                ))}
              </ul>
              {shippingEntry && needsShipping ? (
                <div className="rounded-xl bg-[#fff9ee] p-3 text-[12px] leading-5 text-[#5f6871] ring-1 ring-[#f0dcb6]/70">
                  <p className="font-black text-[#24333f]">{ui.shippingAddress}</p>
                  <p>{shippingEntry.name} · {[shippingEntry.district, shippingEntry.city].filter(Boolean).join(' / ')}</p>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-[#f0dcb6]/70 pt-4">
                <span className="text-[13px] font-black uppercase tracking-[0.1em] text-[#9a8a74]">{ui.total}</span>
                <span className="font-display text-[28px] font-black text-[#d96f12]">{money(total, locale)}</span>
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              {paymentUnavailable && quoteWhatsApp ? (
                <div className="rounded-lg bg-[#eef6f3] px-4 py-3" role="alert">
                  <p className="text-[13px] font-semibold text-[#0c8f74]">{ui.checkoutFailed}</p>
                  <a href={`https://wa.me/${quoteWhatsApp}`} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-flex rounded-full bg-[#0c8f74] px-4 py-2 text-[13px] font-black text-white ${FOCUS_RING}`}>
                    WhatsApp
                  </a>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f58220] px-5 py-3.5 text-[15px] font-black text-white shadow-[0_10px_24px_rgba(245,130,32,0.35)] transition hover:bg-[#d96f12] disabled:opacity-60 ${FOCUS_RING}`}
                data-testid="checkout-pay"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <LockKeyhole className="h-5 w-5" aria-hidden />}
                {busy ? ui.checkoutBusy : ui.payWithPaytr || ui.buyNow || ''}
              </button>
              <TrustList locale={locale} ui={ui} />
              <Link href={`/${locale}/me/addresses`} className={`flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#9a8a74] hover:text-[#d96f12] ${FOCUS_RING}`}>
                <MapPinned className="h-3.5 w-3.5" aria-hidden />
                {ui.manageAddresses}
              </Link>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
