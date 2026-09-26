'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ShoppingCart } from 'lucide-react';

import { cartActions, type CartItem } from '@/features/cart/cart.store';
import { FOCUS_RING } from '@/lib/a11y';
import { reportAddToCart } from '@/lib/ecommerce-events';

type Props = {
  item: Omit<CartItem, 'quantity'>;
  locale: string;
  label: string;
  addedLabel?: string;
  viewCartLabel?: string;
  /** true: sepete ekler ve sepete geçer ("Satın al"); false: sayfada kalır. */
  goToCart?: boolean;
  className: string;
  testId?: string;
};

/**
 * Ürünü sepete ekler (en az ürünün minimum adedi kadar) ve GA4 add_to_cart atar.
 * Satın alma sepetten başlar; üyelik kontrolü checkout'ta yapılır.
 */
export default function AddToCartButton({ item, locale, label, addedLabel, viewCartLabel, goToCart, className, testId }: Props) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const cartHref = `/${locale}/cart`;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 4000);
    return () => window.clearTimeout(timer);
  }, [added]);

  function add() {
    cartActions.add({ ...item, quantity: item.minQuantity });
    reportAddToCart({
      currency: 'TRY',
      value: item.unitPrice * item.minQuantity,
      items: [{ item_id: item.productId, item_name: item.title, price: item.unitPrice, quantity: item.minQuantity }],
    });
    if (goToCart) router.push(cartHref);
    else setAdded(true);
  }

  if (added && !goToCart) {
    return (
      <Link href={cartHref} className={`${className} ${FOCUS_RING}`} data-testid={testId ? `${testId}-view` : undefined}>
        <Check className="h-4 w-4" aria-hidden />
        <span>{addedLabel || label}</span>
        {viewCartLabel ? <span className="underline">{viewCartLabel}</span> : null}
      </Link>
    );
  }

  return (
    <button type="button" onClick={add} className={`${className} ${FOCUS_RING}`} data-testid={testId}>
      <ShoppingCart className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
