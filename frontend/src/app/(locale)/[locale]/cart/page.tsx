import type { Metadata } from 'next';

import CartPageClient from '@/components/woody/store/CartPageClient';
import { loadCheckoutCopy, loadPurchasableProducts } from '@/components/woody/store/checkout-copy.server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { ui } = await loadCheckoutCopy(locale);
  // Kişiye özel sayfa: dizine eklenmez.
  return { title: ui.cartTitle || ui.cart || undefined, robots: { index: false, follow: false } };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const [{ ui }, catalog] = await Promise.all([loadCheckoutCopy(locale), loadPurchasableProducts(locale)]);
  return <CartPageClient locale={locale} ui={ui} catalog={catalog} />;
}
