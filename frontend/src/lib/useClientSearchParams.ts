'use client';

// =============================================================
// SSR-guvenli arama parametresi okuma (2026-08-30 lang refactor).
// next/navigation useSearchParams'in aksine Suspense ISTEMEZ ve CSR bailout
// URETMEZ: prerender/ilk render'da bos doner, mount'ta gercek degerle gunceller.
// Eski mimaride layout'taki genel Suspense bu bailout'lari yutuyordu; o Suspense
// kaldirilinca (soft-404 fix) useSearchParams kullanan her bilesen prerender'i
// kiriyordu. Buradaki tum kullanim alanlari (paylasilan URL, dil linki, redirect
// parametresi, progress bar) mount-sonrasi deger ile ayni davranisi verir.
// =============================================================
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const EMPTY = new URLSearchParams();

export function useClientSearchParams(): URLSearchParams {
  const pathname = usePathname();
  const [params, setParams] = useState<URLSearchParams>(EMPTY);

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  return params;
}
