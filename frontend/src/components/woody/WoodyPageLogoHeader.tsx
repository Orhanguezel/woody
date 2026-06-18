'use client';

import Image from 'next/image';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

type Props = {
  title: string;
  locale: string;
  logoSrc?: string;
  logoAlt?: string;
  badge?: React.ReactNode;
};

export default function WoodyPageLogoHeader({
  title,
  locale,
  logoSrc,
  logoAlt,
  badge,
}: Props) {
  const backLabel = tUi(locale, 'BACK');

  return (
    <>
      <section className="mt-[72px] bg-white py-8 md:py-10">
        <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center gap-4 px-6">
          <h1 className="sr-only">{title}</h1>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={logoAlt || title}
              width={750}
              height={492}
              priority
              className="h-auto w-full max-w-[450px] object-contain"
            />
          ) : null}
          {badge}
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pt-2 md:px-16 lg:px-20">
        <Link
          href={`/${locale}`}
          className={`inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-gray-600 transition hover:text-black ${FOCUS_RING}`}
        >
          <ChevronLeft className="size-5" aria-hidden />
          {backLabel}
        </Link>
      </div>
    </>
  );
}
