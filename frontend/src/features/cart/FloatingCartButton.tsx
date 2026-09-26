'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

import { cartCount, useCart } from '@/features/cart/cart.store';
import { FOCUS_RING } from '@/lib/a11y';

// Yalnız erişilebilirlik etiketi; görünür metin sayıdır.
const LABELS: Record<string, string> = {
  tr: 'Sepet', en: 'Cart', de: 'Warenkorb', fr: 'Panier', es: 'Carrito', it: 'Carrello',
  nl: 'Winkelwagen', 'pt-br': 'Carrinho', ru: 'Корзина', ar: 'السلة',
};

/**
 * Sepette ürün varken sağ altta görünen sepet kısayolu. Header'dan bağımsızdır;
 * sepet ve checkout sayfalarında gizlenir.
 */
export default function FloatingCartButton({ locale }: { locale: string }) {
  const items = useCart();
  const pathname = usePathname() || '';
  const count = cartCount(items);
  if (!count || /\/(cart|store\/checkout)(\/|$)/.test(pathname)) return null;
  const label = LABELS[locale] || LABELS.en;
  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={`${label} (${count})`}
      className={`fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f58220] text-white shadow-[0_10px_28px_rgba(245,130,32,0.45)] transition hover:bg-[#d96f12] ${FOCUS_RING}`}
      data-testid="floating-cart"
    >
      <ShoppingCart className="h-6 w-6" aria-hidden />
      <span className="absolute -right-1 -top-1 min-w-6 rounded-full bg-[#24333f] px-1.5 text-center text-[12px] font-black leading-6">
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  );
}
