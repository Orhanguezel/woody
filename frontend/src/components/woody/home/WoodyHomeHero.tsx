import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Sparkles } from 'lucide-react';

import type { WoodyPageContent } from '../content-loader.server';
import { HERO_BG, WOODY_CHARACTER_IMAGE, localizeHomeHref } from './home-copy';

const HERO_VIDEO = '/uploads/woody-content/hero-woody-robot.mp4';

export default function WoodyHomeHero({ content, locale }: { content: WoodyPageContent; locale: string }) {
  const hero = content.hero;
  const title = hero?.title || content.title;
  const description = hero?.description || hero?.subtitle || content.description;

  return (
    <section
      className="relative min-h-[calc(100vh-24px)] overflow-hidden border-b border-[var(--gm-border-soft)] bg-[var(--gm-bg)]"
      style={{
        backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(--gm-bg) 88%, transparent) 0%, color-mix(in srgb, var(--gm-bg) 68%, transparent) 46%, color-mix(in srgb, var(--gm-bg) 18%, transparent) 100%), url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container grid min-h-[calc(100vh-24px)] items-center gap-10 py-28 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)] lg:py-32">
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/82 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--gm-primary)] shadow-[var(--gm-shadow-soft)]">
            <Sparkles className="size-4" aria-hidden />
            {hero?.eyebrow || content.eyebrow || 'Woody World'}
          </p>
          <h1 className="mt-6 text-balance font-display text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.9] text-[var(--gm-text)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--gm-text-dim)] md:text-xl">
              {description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {hero?.primaryCTA ? (
              <Link
                href={localizeHomeHref(locale, hero.primaryHref || '/preschool')}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--gm-primary)] px-6 py-3 font-bold text-[var(--gm-surface)] shadow-[var(--gm-shadow-card)] transition hover:-translate-y-0.5"
              >
                {hero.primaryCTA}
              </Link>
            ) : null}
            {hero?.secondaryCTA ? (
              <Link
                href={localizeHomeHref(locale, hero.secondaryHref || '/contact')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--gm-border)] bg-[var(--gm-surface)]/75 px-6 py-3 font-bold text-[var(--gm-text)] backdrop-blur"
              >
                <PlayCircle className="size-5 text-[var(--gm-primary)]" aria-hidden />
                {hero.secondaryCTA}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[520px] lg:mr-0">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/74 shadow-[var(--gm-shadow-card)]">
            <Image
              src={WOODY_CHARACTER_IMAGE}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-contain p-8"
            />
            <a
              href={HERO_VIDEO}
              className="absolute inset-x-0 bottom-6 mx-auto inline-flex w-max items-center gap-2 rounded-full bg-[var(--gm-primary)] px-5 py-3 text-sm font-bold text-[var(--gm-surface)] shadow-[var(--gm-shadow-card)] transition hover:-translate-y-0.5"
            >
              <PlayCircle className="size-5" aria-hidden />
              {locale === 'tr' ? 'Tanıtım videosu' : 'Promo video'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
