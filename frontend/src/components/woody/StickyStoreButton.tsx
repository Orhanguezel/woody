'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FOCUS_RING } from '@/lib/a11y';
import { useLocaleShort } from '@/i18n';
import { localizePath } from '@/integrations/shared';

export default function StickyStoreButton({ locale: localeProp }: { locale?: string }) {
  const locale = useLocaleShort(localeProp);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => setShow(window.innerWidth <= 768 && window.scrollY > 300);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const label = locale === 'tr' ? 'Woody Store mağazası' : 'Woody Store shop';

  return (
    <Link
      href={localizePath(locale, '/store')}
      aria-label={label}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-28 left-4 z-[899] flex min-h-11 items-center gap-2 rounded-xl bg-[var(--gm-primary)] px-4 py-2.5 text-[13px] font-semibold text-white no-underline shadow-[var(--gm-shadow-card)] transition-all duration-300 active:translate-y-[1px] active:scale-95 md:hidden ${FOCUS_RING} ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ShoppingBag size={18} strokeWidth={2.5} aria-hidden />
      <span>Woody Store</span>
    </Link>
  );
}
