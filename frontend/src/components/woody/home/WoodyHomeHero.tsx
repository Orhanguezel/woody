import type { WoodyPageContent } from '../content-loader.server';
import { WoodyHeroBackgroundVideo, WoodyHeroVideoButton } from './WoodyHomeHeroClient';

export default function WoodyHomeHero({ content, locale }: { content: WoodyPageContent; locale: string }) {
  const hero = content.hero;
  const title = hero?.title || content.title;
  const description = hero?.description || hero?.subtitle || content.description;

  return (
    <section className="relative flex h-[62vh] min-h-[440px] w-full items-center justify-center overflow-hidden md:h-[90vh] md:min-h-[620px]">
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#4f6f63_0%,#162a2b_46%,#071314_100%)] md:hidden" aria-hidden />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: 'url(/assets/woody/sections/hero-poster.webp)' }}
          aria-hidden
        />
        <WoodyHeroBackgroundVideo />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="mb-5 text-[40px] font-bold leading-[1.08] tracking-wide text-white md:mb-6 md:text-[64px] md:[text-shadow:2px_4px_12px_rgba(0,0,0,0.4)] lg:text-[80px]"
          style={{
            fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          }}
        >
          {title}
        </h1>

        <WoodyHeroVideoButton locale={locale} />

        {description ? (
          <p
            className="max-w-3xl px-4 text-base leading-relaxed text-white/95 md:text-lg md:[text-shadow:0_2px_10px_rgba(0,0,0,0.7)]"
            style={{
              fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
            }}
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

    </section>
  );
}
