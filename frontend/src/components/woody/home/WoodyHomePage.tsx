import type { WoodyPageContent } from '../content-loader.server';
import WoodySetZigzag from '../sets/WoodySetZigzag';
import WoodyWhyCambridge from '../why-woody/WoodyWhyCambridge';
import WoodyNewsCarousel from '../news/WoodyNewsCarousel';
import WoodyHomeHero from './WoodyHomeHero';
import { getNewsItems, getSetCards } from './home-copy';

export default function WoodyHomePage({
  content,
  setPages,
  whyContent,
  newsContent,
  locale,
}: {
  content: WoodyPageContent;
  setPages: WoodyPageContent[];
  whyContent: WoodyPageContent | null;
  newsContent: WoodyPageContent | null;
  locale: string;
}) {
  const setCards = getSetCards(content, setPages);
  const news = getNewsItems(newsContent);

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)]">
      <WoodyHomeHero content={content} locale={locale} />
      <WoodySetZigzag cards={setCards} locale={locale} />
      <WoodyWhyCambridge content={whyContent} locale={locale} />
      <WoodyNewsCarousel items={news} locale={locale} />
    </main>
  );
}
