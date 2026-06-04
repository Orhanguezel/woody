'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { WoodyNewsItem } from '../home/home-copy';
import { NEWS_IMAGES, localizeHomeHref } from '../home/home-copy';

export default function WoodyNewsCarousel({
  items,
  locale,
}: {
  items: WoodyNewsItem[];
  locale: string;
}) {
  if (!items.length) return null;

  return (
    <section className="bg-[var(--gm-surface)] py-16 lg:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-primary)]">
              {locale === 'tr' ? 'Woody Yenilikler' : 'Woody News'}
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1] text-[var(--gm-text)]">
              {locale === 'tr' ? 'Woody dünyasından haberler' : 'News from the Woody world'}
            </h2>
          </div>
        </div>

        <Carousel opts={{ align: 'start', loop: items.length > 2 }} className="px-0 md:px-10">
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={item.title} className="md:basis-1/2 xl:basis-1/3">
                <article className="h-full overflow-hidden rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-bg)] shadow-[var(--gm-shadow-soft)]">
                  <div className="relative aspect-[16/10] bg-[var(--gm-bg-deep)]">
                    <Image
                      src={item.image || NEWS_IMAGES[index % NEWS_IMAGES.length]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    {item.date ? (
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gm-muted)]">
                        <CalendarDays className="size-4" aria-hidden />
                        {item.date}
                      </p>
                    ) : null}
                    <h3 className="mt-3 text-xl font-bold text-[var(--gm-text)]">{item.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--gm-text-dim)]">{item.summary}</p>
                    <Link
                      href={localizeHomeHref(locale, item.href || '/blog')}
                      className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-[var(--gm-primary)]"
                    >
                      {locale === 'tr' ? 'Devamını oku' : 'Read more'}
                    </Link>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden border-[var(--gm-border)] bg-[var(--gm-bg)] text-[var(--gm-text)] md:inline-flex" />
          <CarouselNext className="hidden border-[var(--gm-border)] bg-[var(--gm-bg)] text-[var(--gm-text)] md:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
