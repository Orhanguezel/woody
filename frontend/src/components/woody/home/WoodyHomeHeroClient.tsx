'use client';

import { useEffect, useRef, useState } from 'react';

import { tUi } from '@/i18n/staticUi';
import { FOCUS_RING } from '@/lib/a11y';

const HERO_VIDEO =
  '/media/woody/reference/gthig3ye_woody%20and%20robo%20(4).mp4#t=16';
const FALLBACK_HERO_VIDEO =
  '/media/woody/reference/gthig3ye_woody%20and%20robo%20(4).mp4#t=16';

export function WoodyHeroBackgroundVideo() {
  const [showBackgroundVideo, setShowBackgroundVideo] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    setShowBackgroundVideo(media.matches);
    const handleChange = (event: MediaQueryListEvent) => setShowBackgroundVideo(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!showBackgroundVideo) return;
    const video = bgVideoRef.current;
    if (!video) return;
    video.currentTime = 16;
    video.play().catch(() => {});
  }, [showBackgroundVideo]);

  if (!showBackgroundVideo) return null;

  return (
    <video
      ref={bgVideoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster="/assets/woody/sections/hero-poster.webp"
      className="absolute inset-0 hidden size-full object-cover md:block"
      aria-hidden
    >
      <source src={HERO_VIDEO} type="video/mp4" />
      <source src={FALLBACK_HERO_VIDEO} type="video/mp4" />
    </video>
  );
}

export function WoodyHeroVideoButton({ locale }: { locale: string }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowVideo(true)}
        className={`group mb-6 flex size-[70px] cursor-pointer items-center justify-center rounded-full border-2 border-white/70 bg-transparent transition-all duration-300 hover:scale-110 hover:border-white ${FOCUS_RING}`}
        aria-label={tUi(locale, 'Play intro video')}
      >
        <svg
          aria-hidden
          className="ml-1 size-[26px] text-white/80 group-hover:text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {showVideo ? (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className={`absolute right-6 top-6 z-[1110] bg-transparent text-white/80 transition-colors hover:text-white ${FOCUS_RING}`}
            aria-label={tUi(locale, 'Close video')}
          >
            <svg aria-hidden className="size-9" fill="none" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
          <div className="aspect-video w-full max-w-[1100px]">
            <video autoPlay controls className="size-full rounded-lg" src={HERO_VIDEO} />
          </div>
        </div>
      ) : null}
    </>
  );
}
