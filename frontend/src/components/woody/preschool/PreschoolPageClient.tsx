'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ChevronRight, LibraryBig, Play, ShoppingBag, Target, X } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyCard, WoodyPageContent, WoodySection } from '../content-loader.server';

const HERO_VIDEO =
  '/media/woody/reference/uplopykh_194136173ef7.mp4';
const COMING_SOON_IMAGE =
  '/media/woody/reference/kg4rjgb3_Paragraf%20metniniz%20(4).png';
const DIGITAL_BANNER_IMAGE =
  '/media/woody/reference/y0tliapf_freepik_ultra-high-detail-cinemat_2769441228.png';

const LEVEL_UNDERLINE = ['bg-level-basic', 'bg-level-junior', 'bg-level-senior', 'bg-level-pro'] as const;

const LEVEL_MEDIA = [
  {
    name: 'Basic Level',
    tag: 'BASIC',
    image: '/media/woody/reference/3jgyyil9_1.png',
    student: '/media/woody/reference/3lhuchbm_Basic%20o%CC%88g%CC%86renci.mp4',
    teacher: '/media/woody/reference/a8v04k8o_Basic%20teachet.mp4',
  },
  {
    name: 'Junior Level',
    tag: 'JUNIOR',
    image: '/media/woody/reference/h5x59v59_3.png',
    student: '/media/woody/reference/che2qlij_jun%C4%B1or%20o%CC%88g%CC%86renci.mp4',
    teacher: '/media/woody/reference/icoq32rz_jun%C4%B1or%20ogretmen.mp4',
  },
  {
    name: 'Senior Level',
    tag: 'SENIOR',
    image: '/media/woody/reference/m4z26p5k_2.png',
    student: '/media/woody/reference/wmelrnc8_senior%20o%CC%88g%CC%86renci..mp4',
    teacher: '/media/woody/reference/2om7n0iq_senior%20teacher.mp4',
  },
  {
    name: 'PRO Level',
    tag: 'PRO',
    image:
      '/media/woody/reference/6qg348xf_Preschool%20Basic%20(297%20x%20210%20mm)%20(Instagram%20Go%CC%88nderisi%20(45)).png',
  },
] as const;

const EXPLORE_ICONS = [Target, LibraryBig, ShoppingBag] as const;
const EXPLORE_IMAGES = [
  '/media/woody/reference/onplu2u5_Seviye%20Bulucu%20sembolu%CC%88.png',
  '/media/woody/reference/5dxwajw5_Ads%C4%B1z%20tasar%C4%B1m%20(44).png',
  '/media/woody/reference/myf0t3nv_Gemini_Generated_Image_ip9cg9ip9cg9ip9c.png',
] as const;

function localizedHref(locale: string, href?: string) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href)) return href;
  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

function findSection(content: WoodyPageContent, index: number): WoodySection {
  return content.sections?.[index] ?? {};
}

function splitNotice(description: string) {
  const marker = 'Woody Preschool';
  const at = description.indexOf(marker);
  if (at <= 0) return { intro: description, notice: '' };
  return {
    intro: description.slice(0, at).trim(),
    notice: description.slice(at).trim(),
  };
}

export default function PreschoolPageClient({
  content,
  locale,
}: {
  content: WoodyPageContent;
  locale: string;
}) {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroOpen, setHeroOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<(typeof LEVEL_MEDIA)[number] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const video = heroVideoRef.current;
      if (!video) return;
      video.currentTime = 2;
      video.play().catch(() => {});
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const setSection = findSection(content, 0);
  const levelsSection = findSection(content, 1);
  const exploreSection = findSection(content, 2);
  const { intro, notice } = splitNotice(setSection.description || '');
  const levels = useMemo(
    () =>
      LEVEL_MEDIA.map((media) => ({
        ...media,
        copy: levelsSection.items?.find((item) => item.title === media.name),
      })),
    [levelsSection.items],
  );

  const teacherSet = locale === 'tr' ? 'Öğretmen Seti' : 'Teacher Set';
  const studentSet = locale === 'tr' ? 'Öğrenci Seti' : 'Student Set';
  const videoWatch = locale === 'tr' ? 'Video İzle' : 'Watch Video';
  const quote = locale === 'tr' ? 'Fiyat Teklifi Al' : 'Get a Quote';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative mt-[72px] h-[50vh] min-h-[400px] overflow-hidden">
        <video ref={heroVideoRef} muted playsInline loop className="absolute inset-0 size-full object-cover">
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="font-display text-[60px] font-black uppercase leading-none tracking-[0.1em] text-white drop-shadow-2xl md:text-[90px] lg:text-[120px]">
            {content.hero?.title || content.title}
          </h1>
          <button
            type="button"
            onClick={() => setHeroOpen(true)}
            className={`mt-6 flex size-[70px] items-center justify-center rounded-full border-2 border-white/70 bg-transparent transition hover:scale-110 hover:border-white ${FOCUS_RING}`}
            aria-label={locale === 'tr' ? 'Preschool videosunu oynat' : 'Play Preschool video'}
          >
            <Play className="ml-1 size-7 text-white" fill="currentColor" aria-hidden />
          </button>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-lg md:text-lg">
            {content.hero?.description || content.description}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1440 120" className="block h-16 w-full text-white md:h-24" preserveAspectRatio="none" aria-hidden>
            <path
              fill="currentColor"
              d="M0 40c120 38 240 56 360 54 143-2 230-50 360-50 137 0 244 54 378 56 106 1 214-28 342-72v92H0Z"
            />
          </svg>
        </div>
      </section>

      <section className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 py-4 shadow-md">
        <div className="mx-auto max-w-[1400px] px-6">
          <h2 className="text-center font-display text-[24px] font-bold tracking-[0.15em] text-white drop-shadow md:text-[32px]">
            {content.eyebrow}
          </h2>
        </div>
      </section>

      <section className="bg-white py-6">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <p className="text-[16px] font-medium text-gray-700 md:text-[18px]">{intro || setSection.title}</p>
        </div>
      </section>

      <section className="bg-gray-50 py-10 md:py-14">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            {[teacherSet, studentSet].map((label) => (
              <div key={label} className="w-full flex-1">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Image
                    src={COMING_SOON_IMAGE}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-[center_15%]"
                  />
                </div>
                <p className="mt-4 text-center text-[18px] font-bold tracking-wide text-gray-800 md:text-[22px]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {notice ? (
            <div className="mt-8 rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-[13px] leading-[1.7] text-gray-700 md:text-[14px]">
                <span className="mr-1.5 text-[18px] font-bold text-red-500">!</span>
                {notice}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Link href={`/${locale}/digital-content`} className={`group block w-full no-underline ${FOCUS_RING}`}>
          <div className="relative h-[400px] w-full overflow-hidden md:h-[500px] lg:h-[600px]">
            <Image src={DIGITAL_BANNER_IMAGE} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute left-8 top-8 max-w-[380px] md:left-12 md:top-12 md:max-w-[420px] lg:left-16 lg:top-16">
              <div className="rounded-xl bg-white/90 px-6 py-5 backdrop-blur-sm md:px-7 md:py-6">
                <h2 className="text-[22px] font-semibold leading-tight text-gray-900 md:text-[28px]">
                  {locale === 'tr' ? 'Woody Dijital İçerikler' : 'Woody Digital Content'}
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-gray-700 md:text-[14px]">
                  {locale === 'tr'
                    ? 'Movieland, Storyland ve Musicland ile öğrenme süreci video, hikaye ve müzikle zenginleşir.'
                    : 'Movieland, Storyland and Musicland enrich learning with video, stories and music.'}
                </p>
                <span className="mt-4 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white md:text-[14px]">
                  {locale === 'tr' ? 'Dijital dünyaya gitmek için tıklayın' : 'Open the digital world'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="mb-12 text-center text-[28px] font-light tracking-wide text-gray-900 md:text-[36px]">
            {levelsSection.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {levels.map((level, index) => (
              <article key={level.name} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl">
                  <Image src={level.image} alt={level.copy?.title || level.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={`flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-gray-900 shadow-lg transition hover:bg-gray-100 md:text-[14px] ${FOCUS_RING}`}
                    >
                      <Play className="size-4" fill="currentColor" aria-hidden />
                      {videoWatch}
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="relative inline-block text-[16px] font-semibold text-gray-800 md:text-[18px]">
                    {level.copy?.title || level.name}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full ${LEVEL_UNDERLINE[index % LEVEL_UNDERLINE.length]}`}
                    />
                  </h3>
                  <p className="mb-3 mt-1 text-[13px] text-gray-500">{level.copy?.description}</p>
                  <a
                    href={`https://wa.me/905331570373?text=${encodeURIComponent(
                      locale === 'tr'
                        ? `Merhaba, ${level.name} hakkında fiyat teklifi almak istiyorum.`
                        : `Hello, I would like to get a quote for ${level.name}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-green-600 md:text-[14px] ${FOCUS_RING}`}
                  >
                    {quote}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {(exploreSection.items ?? []).map((item: WoodyCard, index) => {
              const Icon = EXPLORE_ICONS[index % EXPLORE_ICONS.length] || BookOpen;
              return (
                <Link
                  key={item.title}
                  href={localizedHref(locale, item.href)}
                  className={`group text-center no-underline ${FOCUS_RING}`}
                >
                  <div className="mx-auto mb-5 size-20 overflow-hidden rounded-2xl">
                    <Image
                      src={EXPLORE_IMAGES[index % EXPLORE_IMAGES.length]}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-[500px] rounded-2xl bg-white p-6">
            <button
              type="button"
              onClick={() => setSelectedLevel(null)}
              className={`absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 ${FOCUS_RING}`}
              aria-label={locale === 'tr' ? 'Kapat' : 'Close'}
            >
              <X className="size-6" aria-hidden />
            </button>
            <h3 className="mb-2 text-center text-[20px] font-bold text-gray-900 md:text-[24px]">
              {selectedLevel.name}
            </h3>
            {selectedLevel.name === 'PRO Level' ? (
              <p className="py-6 text-center text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                {locale === 'tr' ? "PRO seviyesi için Woody Academy'de eğitim verilir." : 'PRO level training is delivered in Woody Academy.'}
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {[
                  { label: teacherSet, url: selectedLevel.teacher, tone: 'blue' },
                  { label: studentSet, url: selectedLevel.student, tone: 'green' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => option.url && (setVideoUrl(option.url), setSelectedLevel(null))}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                      option.tone === 'blue'
                        ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                        : 'border-green-200 bg-green-50 hover:bg-green-100'
                    } ${FOCUS_RING}`}
                  >
                    <span className="font-semibold text-gray-900">{option.label}</span>
                    <ChevronRight className="size-5 text-gray-700" aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {(heroOpen || videoUrl) ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => {
              setHeroOpen(false);
              setVideoUrl(null);
            }}
            className={`absolute right-6 top-6 z-[10001] text-white/80 transition hover:text-white ${FOCUS_RING}`}
            aria-label={locale === 'tr' ? 'Videoyu kapat' : 'Close video'}
          >
            <X className="size-9" aria-hidden />
          </button>
          <div className={videoUrl ? 'flex h-full w-full items-center justify-center' : 'aspect-video w-full max-w-[1000px]'}>
            <video
              src={videoUrl || HERO_VIDEO}
              controls
              autoPlay
              className={videoUrl ? 'max-h-full max-w-full' : 'size-full rounded-lg'}
              style={videoUrl ? { aspectRatio: '9 / 16', width: 'auto', height: '100%' } : undefined}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
