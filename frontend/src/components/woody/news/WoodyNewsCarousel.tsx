'use client';

import { useEffect, useRef, useState } from 'react';
import { tUi } from '@/i18n/staticUi';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyNewsItem } from '../home/home-copy';
import { NEWS_IMAGES } from '../home/home-copy';

export default function WoodyNewsCarousel({
  items,
  title: titleProp,
  locale,
}: {
  items: WoodyNewsItem[];
  title?: string;
  locale: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = window.matchMedia('(min-width: 768px)').matches ? 280 : 260;
      setActiveIndex(Math.max(0, Math.min(items.length - 1, Math.round(container.scrollLeft / cardWidth))));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  if (!items.length) return null;

  const scrollToCard = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = window.matchMedia('(min-width: 768px)').matches ? 280 : 260;
    const nextIndex = (index + items.length) % items.length;
    container.scrollTo({ left: cardWidth * nextIndex, behavior: 'smooth' });
    setActiveIndex(nextIndex);
  };

  const title = titleProp || (tUi(locale, 'Woody News'));
  const previous = tUi(locale, 'Previous update');
  const next = tUi(locale, 'Next update');
  const close = tUi(locale, 'Close video');

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16 md:py-20">
      <div className="mx-auto mb-10 max-w-[1400px] px-6 md:px-12">
        <h2 className="text-center text-[28px] font-bold text-text-secondary md:text-[36px] lg:text-[42px]">
          {title}
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 bg-gradient-to-r from-brand-primary-light to-brand-primary" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <button
          type="button"
          onClick={() => scrollToCard(activeIndex - 1)}
          className={`absolute left-0 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:scale-110 hover:shadow-xl md:flex ${FOCUS_RING}`}
          aria-label={previous}
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => scrollToCard(activeIndex + 1)}
          className={`absolute right-0 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:scale-110 hover:shadow-xl md:flex ${FOCUS_RING}`}
          aria-label={next}
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const image = item.image || NEWS_IMAGES[index % NEWS_IMAGES.length];
            return (
              <button
                type="button"
                key={`${item.title}-${index}`}
                onClick={() => (item.video ? setSelectedVideo(item.video) : scrollToCard(index))}
                className={`w-[240px] shrink-0 snap-center cursor-pointer text-left transition duration-300 ease-out md:w-[260px] ${FOCUS_RING}`}
                style={{
                  transform: isActive ? 'scale(1)' : 'scale(0.88)',
                  opacity: isActive ? 1 : 0.65,
                  zIndex: isActive ? 10 : 1,
                }}
              >
                <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
                  <div className="relative aspect-[3/4] w-full bg-gray-100">
                    {item.video ? (
                      <>
                        <Image
                          src={image}
                          alt={item.title}
                          fill
                          sizes="260px"
                          className={item.fitImage ? 'object-contain p-2' : 'object-cover'}
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-gray-900">
                            <Play className="ml-1 size-7" fill="currentColor" aria-hidden />
                          </span>
                        </span>
                      </>
                    ) : (
                      <Image
                        src={image}
                        alt={item.title}
                        fill
                        sizes="260px"
                        className={item.fitImage ? 'object-contain p-2' : 'object-cover'}
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-text-secondary md:text-[14px]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-gray-600 md:text-[12px]">
                      {item.summary}
                    </p>
                  </div>
                </article>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-2 md:hidden">
          {items.map((item, index) => (
            <button
              key={`${item.title}-dot`}
              type="button"
              onClick={() => scrollToCard(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-brand-primary-light' : 'w-2 bg-gray-300'
              } ${FOCUS_RING}`}
              aria-label={`${title} ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {selectedVideo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className={`absolute -top-12 right-0 text-white transition hover:text-gray-300 ${FOCUS_RING}`}
              aria-label={close}
            >
              <X className="size-8" aria-hidden />
            </button>
            <div className="aspect-[9/16] overflow-hidden rounded-lg bg-black">
              <video src={selectedVideo} controls autoPlay className="size-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
