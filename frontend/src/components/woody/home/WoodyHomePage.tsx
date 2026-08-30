import React from 'react';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';

import type { WoodyPageContent } from '../content-loader.server';
import WoodySetZigzag from '../sets/WoodySetZigzag';
import WoodyWhyCambridge from '../why-woody/WoodyWhyCambridge';
import WoodyNewsCarousel from '../news/WoodyNewsCarousel';
import WoodyHomeHero from './WoodyHomeHero';
import CertificationSection from './CertificationSection';
import WoodyGrayBanner from './WoodyGrayBanner';
import { getNewsItems, getSetCards, localizeHomeHref } from './home-copy';
import type { HomeSection } from '@/components/containers/home/fetchHomeLayout.server';

const DEFAULT_SECTION_KEYS = [
  'WoodyHomeHero',
  'WoodyGrayBanner',
  'WoodySetZigzag',
  'WoodyDigitalEntry',
  'WoodyWhyCambridge',
  'CertificationSection',
  'WoodyNewsCarousel',
] as const;

type HomeRaw = {
  digitalEntry?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    cta?: string;
    href?: string;
  };
};

function ZodiacGridSection({
  cards,
  locale,
}: {
  cards: ReturnType<typeof getSetCards>;
  locale: string;
}) {
  if (!cards.length) return null;
  return (
    <section className="bg-[var(--gm-bg)] px-6 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="section-label">
            {tUi(locale, 'FEATURED')}
          </span>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.4rem)] font-light text-[var(--gm-text)]">
            {tUi(locale, 'Explore Woody series')}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.slice(0, 3).map((card) => (
            <Link
              key={card.href || card.title}
              href={localizeHomeHref(locale, card.href || '/preschool')}
              className="group rounded-2xl border border-[var(--gm-border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {card.badge ? (
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gm-gold)]">
                  {card.badge}
                </span>
              ) : null}
              <h3 className="mt-3 font-serif text-2xl text-[var(--gm-text)]">{card.title}</h3>
              {card.description ? (
                <p className="mt-3 text-sm leading-6 text-[var(--gm-text-dim)]">{card.description}</p>
              ) : null}
              <span className="mt-6 inline-block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--gm-muted)] transition group-hover:text-[var(--gm-gold)]">
                {tUi(locale, 'Explore')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WoodyDigitalEntry({ content, locale }: { content: WoodyPageContent; locale: string }) {
  const copy = ((content.raw as HomeRaw | undefined)?.digitalEntry ?? {}) as NonNullable<HomeRaw['digitalEntry']>;
  if (!copy.title && !copy.description) return null;
  return (
    <section className="bg-white px-6 py-14 md:py-18">
      <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-bg)] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div>
          {copy.eyebrow ? (
            <span className="section-label">{copy.eyebrow}</span>
          ) : null}
          <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.2rem)] font-light text-[var(--gm-text)]">
            {copy.title}
          </h2>
          {copy.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--gm-text-dim)]">{copy.description}</p>
          ) : null}
        </div>
        <div className="flex justify-start md:justify-end">
          <Link
            href={localizeHomeHref(locale, copy.href || '/digital-content')}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--gm-primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--gm-primary-dark)]"
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function WoodyHomePage({
  content,
  setPages,
  whyContent,
  newsContent,
  layout,
  locale,
}: {
  content: WoodyPageContent;
  setPages: WoodyPageContent[];
  whyContent: WoodyPageContent | null;
  newsContent: WoodyPageContent | null;
  layout?: HomeSection[];
  locale: string;
}) {
  const setCards = getSetCards(content, setPages);
  const news = getNewsItems(newsContent);
  const renderers: Record<string, React.ReactNode> = {
    WoodyHomeHero: <WoodyHomeHero content={content} locale={locale} />,
    WoodyGrayBanner: <WoodyGrayBanner locale={locale} eyebrow={content?.sections?.[0]?.eyebrow} />,
    ZodiacGridSection: <ZodiacGridSection cards={setCards} locale={locale} />,
    WoodySetZigzag: <WoodySetZigzag cards={setCards} intro={content?.sections?.[0]} locale={locale} />,
    WoodyDigitalEntry: <WoodyDigitalEntry content={content} locale={locale} />,
    CertificationSection: <CertificationSection content={whyContent} locale={locale} />,
    WoodyWhyCambridge: <WoodyWhyCambridge content={whyContent} locale={locale} />,
    WoodyNewsCarousel: <WoodyNewsCarousel items={news} title={newsContent?.title} locale={locale} />,
  };
  const configuredKeys = layout?.map((section) => section.component_key).filter((key) => key in renderers) ?? [];
  const sectionKeys = configuredKeys.length ? configuredKeys : [...DEFAULT_SECTION_KEYS];

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)]">
      {sectionKeys.map((key, index) => (
        <React.Fragment key={key}>
          {index === 0 ? (
            renderers[key]
          ) : (
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 720px' }}>
              {renderers[key]}
            </div>
          )}
        </React.Fragment>
      ))}
    </main>
  );
}
