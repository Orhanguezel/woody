import type { Metadata } from 'next';

import AccountAddressesClient from '@/components/woody/store/address/AccountAddressesClient';
import { loadCheckoutCopy } from '@/components/woody/store/checkout-copy.server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { ui } = await loadCheckoutCopy(locale);
  return { title: ui.addressBook || undefined, robots: { index: false, follow: false } };
}

export default async function MemberAddressesPage({ params }: Props) {
  const { locale } = await params;
  const { ui } = await loadCheckoutCopy(locale);
  return <AccountAddressesClient locale={locale} ui={ui} />;
}
