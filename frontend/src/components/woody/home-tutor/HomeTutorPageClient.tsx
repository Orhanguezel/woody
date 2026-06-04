'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, LibraryBig, Play, ShoppingBag, Target, X } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyCard, WoodyPageContent } from '../content-loader.server';

const HERO_VIDEO = '/media/woody/reference/iztyqa5u_Rexy%20and%20egg%20(4).mp4';
const COMING_SOON_IMAGE =
  '/media/woody/reference/kg4rjgb3_Paragraf%20metniniz%20(4).png';
const LEVEL_COMING_SOON_IMAGE =
  '/media/woody/reference/b5pl9rqg_Paragraf%20metniniz%20(4).png';
const LEVEL_UNDERLINE = ['bg-level-basic', 'bg-level-junior', 'bg-level-senior', 'bg-level-pro'] as const;
const EXPLORE_IMAGES = [
  '/media/woody/reference/onplu2u5_Seviye%20Bulucu%20sembolu%CC%88.png',
  '/media/woody/reference/5dxwajw5_Ads%C4%B1z%20tasar%C4%B1m%20(44).png',
  '/media/woody/reference/myf0t3nv_Gemini_Generated_Image_ip9cg9ip9cg9ip9c.png',
] as const;
const EXPLORE_ICONS = [Target, LibraryBig, ShoppingBag] as const;

function localizedHref(locale: string, href?: string) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href)) return href;
  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

export default function HomeTutorPageClient({
  content,
  locale,
}: {
  content: WoodyPageContent;
  locale: string;
}) {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const levelsSection = content.sections?.[0];
  const exploreSection = content.sections?.[1];

  useEffect(() => {
    heroVideoRef.current?.play().catch(() => {});
  }, []);

  const teacherSet = locale === 'tr' ? 'Öğretmen Seti' : 'Teacher Set';
  const studentSet = locale === 'tr' ? 'Öğrenci Seti' : 'Student Set';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative mt-[72px] h-[50vh] min-h-[400px] overflow-hidden">
        <video ref={heroVideoRef} muted playsInline loop autoPlay className="absolute inset-0 size-full object-cover">
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="font-display text-[54px] font-black uppercase leading-none tracking-[0.1em] text-white drop-shadow-2xl md:text-[84px] lg:text-[112px]">
            {content.hero?.title || content.title}
          </h1>
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className={`mt-6 flex size-[70px] items-center justify-center rounded-full border-2 border-white/70 bg-transparent transition hover:scale-110 hover:border-white ${FOCUS_RING}`}
            aria-label={locale === 'tr' ? 'Home Tutor videosunu oynat' : 'Play Home Tutor video'}
          >
            <Play className="ml-1 size-7 text-white" fill="currentColor" aria-hidden />
          </button>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-lg md:text-lg">
            {content.hero?.description || content.description}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1440 120" className="block h-16 w-full text-white md:h-24" preserveAspectRatio="none" aria-hidden>
            <path fill="currentColor" d="M0 40c120 38 240 56 360 54 143-2 230-50 360-50 137 0 244 54 378 56 106 1 214-28 342-72v92H0Z" />
          </svg>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400 py-4 shadow-md">
        <div className="mx-auto max-w-[1400px] px-6">
          <h2 className="text-center font-display text-[24px] font-bold tracking-[0.15em] text-white drop-shadow md:text-[32px]">
            {content.eyebrow}
          </h2>
        </div>
      </section>

      <section className="bg-gray-50 py-10 md:py-14">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            {[teacherSet, studentSet].map((label) => (
              <div key={label} className="w-full flex-1">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Image src={COMING_SOON_IMAGE} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_15%]" />
                </div>
                <p className="mt-4 text-center text-[18px] font-bold tracking-wide text-gray-800 md:text-[22px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="mb-12 text-center text-[28px] font-light tracking-wide text-gray-900 md:text-[36px]">
            {levelsSection?.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {(levelsSection?.items ?? []).map((level, index) => (
              <article key={level.title} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
                  <Image src={LEVEL_COMING_SOON_IMAGE} alt={level.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="relative inline-block text-[16px] font-semibold text-gray-800 md:text-[18px]">
                    {level.title}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full ${LEVEL_UNDERLINE[index % LEVEL_UNDERLINE.length]}`}
                    />
                  </h3>
                  <p className="mt-1 text-[13px] text-gray-500">{level.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {(exploreSection?.items ?? []).map((item: WoodyCard, index) => {
              const Icon = EXPLORE_ICONS[index % EXPLORE_ICONS.length] || BookOpen;
              return (
                <Link key={item.title} href={localizedHref(locale, item.href)} className={`group text-center no-underline ${FOCUS_RING}`}>
                  <div className="mx-auto mb-5 size-20 overflow-hidden rounded-2xl">
                    <Image src={EXPLORE_IMAGES[index % EXPLORE_IMAGES.length]} alt={item.title} width={96} height={96} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <Icon className="sr-only" aria-hidden />
                  <h3 className="mb-3 text-[19px] font-semibold tracking-tight text-gray-900">{item.title}</h3>
                  <p className="px-3 text-[14px] leading-relaxed text-gray-500">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {showVideo ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className={`absolute right-6 top-6 z-[10001] text-white/80 transition hover:text-white ${FOCUS_RING}`}
            aria-label={locale === 'tr' ? 'Videoyu kapat' : 'Close video'}
          >
            <X className="size-9" aria-hidden />
          </button>
          <div className="aspect-video w-full max-w-[1000px]">
            <video src={HERO_VIDEO} controls autoPlay className="size-full rounded-lg" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
