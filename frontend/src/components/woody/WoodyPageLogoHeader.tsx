'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

type Props = {
  title: string;
  locale: string;
  logoSrc?: string;
  logoAlt?: string;
  badge?: React.ReactNode;
  variant?: 'image' | 'digital';
};

function DigitalLogo({ title }: { title: string }) {
  return (
    <div className="relative mx-auto flex w-full max-w-[450px] items-center justify-center" aria-hidden>
      <div className="relative flex aspect-[750/492] w-full flex-col items-center justify-center">
        <div className="flex items-end justify-center gap-3 md:gap-4">
          <span className="font-display text-[58px] font-black leading-none text-[#f58220] md:text-[74px]">
            Woody
          </span>
          <span className="mb-2 rounded-full bg-[#2196f3] px-4 py-2 font-display text-[24px] font-black leading-none text-white shadow-[0_12px_30px_rgba(33,150,243,0.22)] md:mb-3 md:text-[32px]">
            Digital
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-3 w-12 rounded-full bg-[#f5c518]" />
          <span className="h-3 w-12 rounded-full bg-[#2ecc71]" />
          <span className="h-3 w-12 rounded-full bg-[#e91e90]" />
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export default function WoodyPageLogoHeader({
  title,
  locale,
  logoSrc,
  logoAlt,
  badge,
  variant = 'image',
}: Props) {
  const backLabel = locale === 'tr' ? 'GERİ' : 'BACK';

  return (
    <>
      <section className="mt-[72px] bg-white py-8 md:py-10">
        <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center gap-4 px-6">
          <h1 className="sr-only">{title}</h1>
          {variant === 'digital' ? (
            <DigitalLogo title={title} />
          ) : logoSrc ? (
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
