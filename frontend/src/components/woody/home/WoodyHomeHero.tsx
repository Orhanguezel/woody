'use client';

import { Play, X } from 'lucide-react';
import { tUi } from '@/i18n/staticUi';

import { useEffect, useRef, useState } from 'react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyPageContent } from '../content-loader.server';

const HERO_VIDEO =
  '/media/woody/reference/gthig3ye_woody%20and%20robo%20(4).mp4#t=16';
const FALLBACK_HERO_VIDEO =
  '/media/woody/reference/gthig3ye_woody%20and%20robo%20(4).mp4#t=16';

export default function WoodyHomeHero({ content, locale }: { content: WoodyPageContent; locale: string }) {
  const hero = content.hero;
  const title = hero?.title || content.title;
  const description = hero?.description || hero?.subtitle || content.description;
  const [showVideo, setShowVideo] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    video.currentTime = 16;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="relative flex h-[85vh] min-h-[620px] w-full items-center justify-center overflow-hidden md:h-[90vh]">
      <div className="absolute inset-0 bg-black">
        <video
          ref={bgVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/assets/woody/sections/hero-poster.webp"
          className="size-full object-cover"
          aria-hidden
        >
          <source src={HERO_VIDEO} type="video/mp4" />
          <source src={FALLBACK_HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="mb-6 text-[48px] font-bold leading-[1.1] tracking-wide text-white md:text-[64px] lg:text-[80px]"
          style={{
            textShadow: '2px 4px 12px rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-display), var(--font-sans), sans-serif',
          }}
        >
          {title}
        </h1>

        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className={`group mb-6 flex size-[70px] cursor-pointer items-center justify-center rounded-full border-2 border-white/70 bg-transparent transition-all duration-300 hover:scale-110 hover:border-white ${FOCUS_RING}`}
          aria-label={tUi(locale, 'Play intro video')}
        >
          <Play size={26} className="ml-1 text-white/80 group-hover:text-white" fill="white" fillOpacity={0.8} />
        </button>

        {description ? (
          <p
            className="max-w-3xl px-4 text-base leading-relaxed text-white/95 md:text-lg"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="woodyHeroMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a8b3c1" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#e8eaed" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="75%" stopColor="#c5cdd6" stopOpacity="1" />
              <stop offset="100%" stopColor="#9ba5b0" stopOpacity="0.9" />
            </linearGradient>
            <filter id="woodyHeroGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0 30C360 0 720 0 1080 30C1260 45 1350 52.5 1440 60"
            stroke="url(#woodyHeroMetal)"
            strokeWidth="12"
            fill="none"
            filter="url(#woodyHeroGlow)"
            opacity="0.95"
          />
          <path d="M0 60L0 30C360 0 720 0 1080 30C1260 45 1350 52.5 1440 60L1440 60L0 60Z" fill="white" />
        </svg>
      </div>

      {showVideo ? (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className={`absolute right-6 top-6 z-[1110] bg-transparent text-white/80 transition-colors hover:text-white ${FOCUS_RING}`}
            aria-label={tUi(locale, 'Close video')}
          >
            <X size={36} />
          </button>
          <div className="aspect-video w-full max-w-[1100px]">
            <video autoPlay controls className="size-full rounded-lg" src={HERO_VIDEO} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
