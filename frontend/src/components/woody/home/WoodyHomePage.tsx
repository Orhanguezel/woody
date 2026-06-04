import React from 'react';

import type { WoodyPageContent } from '../content-loader.server';
import WoodySetZigzag from '../sets/WoodySetZigzag';
import WoodyWhyCambridge from '../why-woody/WoodyWhyCambridge';
import WoodyNewsCarousel from '../news/WoodyNewsCarousel';
import WoodyHomeHero from './WoodyHomeHero';
import CertificationSection from './CertificationSection';
import WoodyGrayBanner from './WoodyGrayBanner';
import { getNewsItems, getSetCards } from './home-copy';
import type { HomeSection } from '@/components/containers/home/fetchHomeLayout.server';

const DEFAULT_SECTION_KEYS = [
  'WoodyHomeHero',
  'WoodyGrayBanner',
  'WoodySetZigzag',
  'CertificationSection',
  'WoodyWhyCambridge',
  'WoodyNewsCarousel',
] as const;

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
    WoodyGrayBanner: <WoodyGrayBanner locale={locale} />,
    WoodySetZigzag: <WoodySetZigzag cards={setCards} locale={locale} />,
    CertificationSection: <CertificationSection locale={locale} />,
    WoodyWhyCambridge: <WoodyWhyCambridge content={whyContent} locale={locale} />,
    WoodyNewsCarousel: <WoodyNewsCarousel items={news} locale={locale} />,
  };
  const configuredKeys = layout?.map((section) => section.component_key).filter((key) => key in renderers) ?? [];
  const sectionKeys = configuredKeys.length ? configuredKeys : [...DEFAULT_SECTION_KEYS];

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)]">
      {sectionKeys.map((key) => (
        <React.Fragment key={key}>{renderers[key]}</React.Fragment>
      ))}
    </main>
  );
}
