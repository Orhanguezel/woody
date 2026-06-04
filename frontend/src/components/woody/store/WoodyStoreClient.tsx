'use client';

import * as React from 'react';
import Image from 'next/image';
import { CheckCircle2, CreditCard, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { FOCUS_RING } from '@/lib/a11y';

import type { StoreProduct } from './types';

type CartLine = {
  product: StoreProduct;
  quantity: number;
};

type CheckoutResponse = {
  id: string;
  total: string;
};

type IyzicoResponse = {
  checkoutFormContent?: string;
  error?: { message?: string };
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
}

function inputValue(form: HTMLFormElement, name: string) {
  const data = new FormData(form);
  return String(data.get(name) ?? '').trim();
}

export default function WoodyStoreClient({
  products,
  locale,
}: {
  products: StoreProduct[];
  locale: string;
}) {
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [checkoutHtml, setCheckoutHtml] = React.useState('');

  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  function add(product: StoreProduct) {
    setMessage('');
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(99, line.quantity + 1) }
            : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function change(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: Math.max(0, Math.min(99, line.quantity + delta)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setCheckoutHtml('');

    if (!cart.length) {
      setMessage('Sepet boş.');
      return;
    }

    const form = event.currentTarget;
    setBusy(true);
    try {
      const orderRes = await fetch('/api/v1/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-locale': locale },
        body: JSON.stringify({
          customer: {
            name: inputValue(form, 'name'),
            email: inputValue(form, 'email'),
            phone: inputValue(form, 'phone'),
            city: inputValue(form, 'city'),
            address: inputValue(form, 'address'),
          },
          notes: inputValue(form, 'notes'),
          items: cart.map((line) => ({
            product_id: line.product.id,
            quantity: line.quantity,
          })),
        }),
      });

      if (!orderRes.ok) throw new Error('Sipariş oluşturulamadı.');
      const order = (await orderRes.json()) as CheckoutResponse;

      const iyzicoRes = await fetch(`/api/v1/checkout/orders/${order.id}/iyzipay/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const iyzico = (await iyzicoRes.json()) as IyzicoResponse;
      if (!iyzicoRes.ok || !iyzico.checkoutFormContent) {
        setMessage(
          iyzico.error?.message === 'iyzico_feature_disabled'
            ? 'Sipariş alındı. Iyzipay şu anda env ile kapalı.'
            : 'Sipariş alındı, ödeme formu başlatılamadı.',
        );
        setCart([]);
        return;
      }
      setCheckoutHtml(iyzico.checkoutFormContent);
      setMessage(`Sipariş oluşturuldu: ${order.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout tamamlanamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-[var(--gm-border-soft)] bg-[var(--gm-bg)] py-16 lg:py-20">
      <div className="container grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-5 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-5 shadow-[var(--gm-shadow-soft)]"
            >
              {product.image ? (
                <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-md bg-[var(--gm-bg-deep)]">
                  <Image
                    src={product.image}
                    alt={product.alt || product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h2 className="text-xl font-semibold text-[var(--gm-text)]">{product.title}</h2>
              {product.description ? (
                <p className="mt-3 min-h-14 leading-7 text-[var(--gm-text-dim)]">
                  {product.description}
                </p>
              ) : null}
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-[var(--gm-text)]">
                  {money(product.price, product.currency)}
                </p>
                <button
                  type="button"
                  onClick={() => add(product)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--gm-primary)] px-4 py-2 font-semibold text-[var(--gm-surface)] ${FOCUS_RING}`}
                  aria-label={`${product.title} — sepete ekle`}
                >
                  <ShoppingCart className="size-4" aria-hidden />
                  Sepete ekle
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-5 shadow-[var(--gm-shadow-card)]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-[var(--gm-primary)]" aria-hidden />
            <h2 className="text-xl font-semibold text-[var(--gm-text)]">Sepet</h2>
          </div>

          <div className="mt-5 space-y-3">
            {cart.length ? (
              cart.map((line) => (
                <div
                  key={line.product.id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-[var(--gm-border-soft)] p-3"
                >
                  <div>
                    <p className="font-medium text-[var(--gm-text)]">{line.product.title}</p>
                    <p className="text-sm text-[var(--gm-text-dim)]">
                      {money(line.product.price * line.quantity, line.product.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => change(line.product.id, -1)}
                      className={`grid size-8 place-items-center rounded-md border border-[var(--gm-border)] ${FOCUS_RING}`}
                      aria-label="Azalt"
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => change(line.product.id, 1)}
                      className={`grid size-8 place-items-center rounded-md border border-[var(--gm-border)] ${FOCUS_RING}`}
                      aria-label="Artır"
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => change(line.product.id, -99)}
                      className={`grid size-8 place-items-center rounded-md border border-[var(--gm-border)] ${FOCUS_RING}`}
                      aria-label="Kaldır"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-[var(--gm-border)] p-5 text-sm text-[var(--gm-text-dim)]">
                Sepete ürün ekleyerek checkout formunu aç.
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--gm-border-soft)] pt-4">
            <span className="font-semibold text-[var(--gm-text)]">Toplam</span>
            <span className="text-xl font-bold text-[var(--gm-text)]">{money(total, 'TRY')}</span>
          </div>

          <form className="mt-5 space-y-3" onSubmit={submit}>
            <input name="name" required placeholder="Ad Soyad" aria-label="Ad Soyad" className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <input name="email" required type="email" placeholder="E-posta" aria-label="E-posta" className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <input name="phone" placeholder="Telefon" aria-label="Telefon" className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <input name="city" placeholder="Şehir" aria-label="Şehir" className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <textarea name="address" required placeholder="Adres" aria-label="Adres" rows={3} className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <textarea name="notes" placeholder="Sipariş notu" aria-label="Sipariş notu" rows={2} className={`w-full rounded-md border border-[var(--gm-border)] bg-transparent px-3 py-2 ${FOCUS_RING}`} />
            <button
              type="submit"
              disabled={busy || !cart.length}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--gm-secondary)] px-5 py-3 font-semibold text-[var(--gm-surface)] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
            >
              <CreditCard className="size-4" aria-hidden />
              {busy ? 'Hazırlanıyor' : 'Iyzipay ile öde'}
            </button>
          </form>

          {message ? (
            <p className="mt-4 flex gap-2 rounded-md border border-[var(--gm-border-soft)] p-3 text-sm text-[var(--gm-text-dim)]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
              <span>{message}</span>
            </p>
          ) : null}
          {checkoutHtml ? (
            <div className="mt-5" dangerouslySetInnerHTML={{ __html: checkoutHtml }} />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
