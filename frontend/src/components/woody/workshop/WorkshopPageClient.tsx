'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, LibraryBig, Play, ShoppingBag, X } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import { tUi } from '@/i18n/staticUi';

import type { WoodyCard, WoodyPageContent } from '../content-loader.server';
import { LEVEL_MEDIA, LEVEL_UNDERLINE, type LevelMedia } from '../sets/level-media';

type WorkshopPageUi = {
  teacherSet?: string;
  studentSet?: string;
  playHero?: string;
  closeVideo?: string;
  videoCaption?: string;
  videoWatch?: string;
  buyCta?: string;
};

type WorkshopMedia = {
  contentVideo?: string;
  contentVideoPoster?: string;
  heroVideo?: string;
  heroModalVideo?: string;
};

// Icerik katmani (config/DB) deger vermezse kullanilan notr yedekler.
const FALLBACK_HERO_VIDEO =
  '/media/woody/reference/7ieerlri_1%20kopyas%C4%B1%20kopyas%C4%B1%20(Video)%20(1).mp4';
const FALLBACK_MODAL_VIDEO =
  '/media/woody/reference/g3olv4um_1%20kopyas%C4%B1%20kopyas%C4%B1%20(Video).mp4';
const EXPLORE_IMAGES = [
  '/media/woody/reference/5dxwajw5_Ads%C4%B1z%20tasar%C4%B1m%20(44).png',
  '/media/woody/reference/myf0t3nv_Gemini_Generated_Image_ip9cg9ip9cg9ip9c.png',
] as const;
const EXPLORE_ICONS = [LibraryBig, ShoppingBag] as const;

function localizedHref(locale: string, href?: string) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href)) return href;
  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

function setIntro(description?: string) {
  if (!description) return '';
  const first = description.split('.').slice(0, 2).join('.').trim();
  return first.endsWith('.') ? first : `${first}.`;
}

export default function WorkshopPageClient({
  content,
  locale,
}: {
  content: WoodyPageContent;
  locale: string;
}) {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelMedia | null>(null);
  const [levelVideoUrl, setLevelVideoUrl] = useState<string | null>(null);
  const levelsSection = content.sections?.[0];
  const exploreSection = content.sections?.[1];
  const raw = (content.raw ?? {}) as { pageUi?: WorkshopPageUi; media?: WorkshopMedia };
  const pageUi = raw.pageUi ?? {};
  const media = raw.media ?? {};
  const teacherSetLabel = pageUi.teacherSet?.trim() || tUi(locale, 'Teacher Set');
  const studentSetLabel = pageUi.studentSet?.trim() || tUi(locale, 'Student Set');

  useEffect(() => {
    heroVideoRef.current?.play().catch(() => {});
  }, []);

  const heroVideo = media.heroVideo || FALLBACK_HERO_VIDEO;
  const heroModalVideo = media.heroModalVideo || FALLBACK_MODAL_VIDEO;
  const contentVideo = media.contentVideo || '';
  const levels = (levelsSection?.items ?? []).map((copy, index) => ({
    copy,
    media: LEVEL_MEDIA[index],
  }));

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative mt-[72px] h-[50vh] min-h-[400px] overflow-hidden">
        <video ref={heroVideoRef} muted playsInline loop className="absolute inset-0 size-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="font-display text-[48px] font-black uppercase leading-none tracking-[0.1em] text-white drop-shadow-2xl md:text-[80px] lg:text-[104px]">
            {content.hero?.title || content.title}
          </h1>
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className={`mt-6 flex size-[70px] items-center justify-center rounded-full border-2 border-white/70 bg-transparent transition hover:scale-110 hover:border-white ${FOCUS_RING}`}
            aria-label={pageUi.playHero}
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

      <section className="bg-gradient-to-r from-green-400 via-green-500 to-teal-400 py-4 shadow-md">
        <div className="mx-auto max-w-[1400px] px-6">
          <h2 className="text-center font-display text-[24px] font-bold tracking-[0.15em] text-white drop-shadow md:text-[32px]">
            {content.eyebrow}
          </h2>
        </div>
      </section>

      <section className="bg-white py-6">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <p className="text-[16px] font-medium text-gray-700 md:text-[18px]">
            {setIntro(levelsSection?.description)}
          </p>
        </div>
      </section>

      {contentVideo ? (
        <section className="bg-gray-50 py-10 md:py-14">
          <div className="mx-auto max-w-[1100px] px-6 md:px-12">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-2xl">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={contentVideo}
                  poster={media.contentVideoPoster}
                  controls
                  preload="none"
                  playsInline
                  className="size-full object-cover"
                />
              </div>
              {pageUi.videoCaption ? (
                <p className="mt-4 text-center text-[18px] font-bold tracking-wide text-gray-800 md:text-[22px]">
                  {pageUi.videoCaption}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="mb-12 text-center text-[28px] font-light tracking-wide text-gray-900 md:text-[36px]">
            {levelsSection?.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {levels.map(({ copy, media: levelMedia }, index) => (
              <article key={copy.title} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl">
                  {levelMedia ? (
                    <Image src={levelMedia.image} alt={copy.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : null}
                  {levelMedia?.student || levelMedia?.teacher ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel(levelMedia)}
                        className={`flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-gray-900 shadow-lg transition hover:bg-gray-100 md:text-[14px] ${FOCUS_RING}`}
                      >
                        <Play className="size-4" fill="currentColor" aria-hidden />
                        {pageUi.videoWatch}
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="relative inline-block text-[16px] font-semibold text-gray-800 md:text-[18px]">
                    {copy.title}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full ${LEVEL_UNDERLINE[index % LEVEL_UNDERLINE.length]}`}
                    />
                  </h3>
                  <p className="mb-3 mt-1 text-[13px] text-gray-500">{copy.description}</p>
                  {pageUi.buyCta ? (
                    <Link
                      href={localizedHref(locale, '/store')}
                      className={`inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-orange-600 md:text-[14px] ${FOCUS_RING}`}
                    >
                      <ShoppingBag className="size-4" aria-hidden />
                      {pageUi.buyCta}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-[800px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
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

      {selectedLevel ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => {
              setSelectedLevel(null);
              setLevelVideoUrl(null);
            }}
            className={`absolute right-6 top-6 z-[10001] text-white/80 transition hover:text-white ${FOCUS_RING}`}
            aria-label={pageUi.closeVideo}
          >
            <X className="size-9" aria-hidden />
          </button>
          {levelVideoUrl ? (
            <div className="aspect-[9/16] h-[85vh] max-w-full">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={levelVideoUrl} controls autoPlay playsInline className="size-full rounded-lg object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[20px] font-bold text-white">{selectedLevel.name}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {selectedLevel.teacher ? (
                  <button
                    type="button"
                    onClick={() => setLevelVideoUrl(selectedLevel.teacher ?? null)}
                    className={`rounded-lg bg-white px-5 py-2.5 text-[14px] font-medium text-gray-900 transition hover:bg-gray-100 ${FOCUS_RING}`}
                  >
                    {teacherSetLabel}
                  </button>
                ) : null}
                {selectedLevel.student ? (
                  <button
                    type="button"
                    onClick={() => setLevelVideoUrl(selectedLevel.student ?? null)}
                    className={`rounded-lg bg-white px-5 py-2.5 text-[14px] font-medium text-gray-900 transition hover:bg-gray-100 ${FOCUS_RING}`}
                  >
                    {studentSetLabel}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {showVideo ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className={`absolute right-6 top-6 z-[10001] text-white/80 transition hover:text-white ${FOCUS_RING}`}
            aria-label={pageUi.closeVideo}
          >
            <X className="size-9" aria-hidden />
          </button>
          <div className="aspect-video w-full max-w-[1000px]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={heroModalVideo} controls autoPlay className="size-full rounded-lg" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
