'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/features/auth/auth.store';
import { FOCUS_RING } from '@/lib/a11y';
import type { StoreUiCopy } from '../types';
import AddressBook from './AddressBook';
import { addressApi, type Account, type BookAddress } from './address-api';

/** Üye paneli: kayıtlı adresleri görüntüle, ekle, düzenle, sil (checkout ile aynı defter). */
export default function AccountAddressesClient({ locale, ui }: { locale: string; ui: StoreUiCopy }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuthStore();
  const [account, setAccount] = useState<Account | undefined>();
  const [addresses, setAddresses] = useState<BookAddress[] | null>(null);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(`/${locale}/login?next=${encodeURIComponent(`/${locale}/me/addresses`)}`);
    }
  }, [isReady, isAuthenticated, locale, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void addressApi
      .list()
      .then((data) => {
        setAccount(data.account);
        setAddresses(data.addresses);
      })
      .catch(() => setAddresses([]));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#fff9ee] pb-16 pt-28 text-[#24333f] lg:pt-32">
      <div className="container max-w-[880px]">
        <Link href={`/${locale}/me`} className={`inline-flex items-center gap-1.5 text-[13px] font-black text-[#d96f12] hover:text-[#b85c0e] ${FOCUS_RING}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {ui.back || ''}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-black">{ui.addressBook}</h1>
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_14px_42px_rgba(49,64,79,0.08)] ring-1 ring-[#eadfce] md:p-7">
          {addresses === null ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#f58220]" aria-label={ui.loading || ''} />
          ) : (
            <AddressBook ui={ui} account={account} addresses={addresses} onAddressesChange={setAddresses} showInvoiceSummary name="accountAddress" testId="account-book" />
          )}
        </div>
      </div>
    </div>
  );
}
