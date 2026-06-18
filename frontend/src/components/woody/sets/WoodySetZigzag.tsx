import Image from 'next/image';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyCard, WoodySection } from '../content-loader.server';
import { SET_SERIES_MEDIA, localizeHomeHref } from '../home/home-copy';

function ctaFor(index: number, locale: string) {
  if (locale === 'tr') {
    return ['Okul Serisini İncele', 'Atölye Serisini İncele', 'Ev Serisini İncele'][index] || 'İncele';
  }
  return ['Explore School Series', 'Explore Workshop Series', 'Explore Home Series'][index] || 'Explore';
}

export default function WoodySetZigzag({
  cards,
  intro,
  locale,
}: {
  cards: WoodyCard[];
  intro?: WoodySection;
  locale: string;
}) {
  if (!cards.length) return null;
  const introTitle =
    intro?.title ||
    (tUi(locale, 'Which Woody Set Is Right for You?'));
  const introDescription =
    intro?.description ||
    (tUi(locale, 'Choose the Woody set that best fits your institution or use case. Each set is structured for a different learning context.'));
  const clickLabel = tUi(locale, 'CLICK');

  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-6 md:px-12 lg:px-20">
        <div className="mb-14 pt-10 text-center">
          <h2 className="font-series text-[32px] font-bold leading-tight text-text-secondary md:text-[42px] lg:text-[48px]">
            {introTitle}
          </h2>
          <div className="mx-auto mt-5 h-[3px] w-20 bg-brand-primary-light" />
          <p className="mx-auto mt-5 max-w-[700px] text-[15px] leading-relaxed text-gray-600 md:text-[17px]">
            {introDescription}
          </p>
        </div>

        <div className="space-y-14">
          {cards.map((card, index) => {
            const meta = SET_SERIES_MEDIA[index % SET_SERIES_MEDIA.length];
            const image = card.image || meta.image;
            const reverse = index % 2 === 1;
            const ribbonText =
              locale === 'tr' ? meta.ribbonTr : locale === 'ru' ? meta.ribbonRu : meta.ribbonEn;
            return (
              <Link
                key={`${card.title}-${index}`}
                href={localizeHomeHref(locale, card.href || '/preschool')}
                className={`group relative flex cursor-pointer flex-col items-center gap-10 no-underline lg:gap-16 ${
                  reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } ${FOCUS_RING}`}
              >
                <div className={`relative w-full lg:w-1/2 ${reverse ? 'pr-8 lg:pr-0' : 'pl-8 lg:pl-0'}`}>
                  <div
                    className={`absolute top-1/2 z-0 -translate-y-1/2 ${
                      reverse ? 'right-0 lg:-right-8' : 'left-0 lg:-left-8'
                    }`}
                  >
                    <div
                      className="flex min-h-[280px] min-w-[45px] flex-col items-center justify-center rounded-lg px-3 py-10 font-bold text-white shadow-2xl md:px-4 md:py-12"
                      style={{
                        backgroundColor: meta.accent,
                        writingMode: 'vertical-rl',
                        transform: reverse ? 'none' : 'rotate(180deg)',
                      }}
                    >
                      <span className="mb-3 text-[10px] tracking-[0.3em] md:text-[12px]">{clickLabel}</span>
                      <span className="my-2 h-[2px] w-8 bg-white/60" />
                      <span className="font-series mt-3 whitespace-nowrap text-[12px] font-black tracking-[0.2em] md:text-[15px]">
                        {ribbonText}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src={image}
                      alt={card.title}
                      width={760}
                      height={560}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-auto w-full transition duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  {card.badge ? (
                    <span
                      className="inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition duration-300 group-hover:scale-105"
                      style={{ backgroundColor: meta.accent }}
                    >
                      {card.badge}
                    </span>
                  ) : null}
                  <h3 className="font-series mt-5 text-[30px] font-light leading-tight text-black transition-colors duration-300 group-hover:text-gray-700 md:text-[36px] lg:text-[40px]">
                    {card.title}
                  </h3>
                  <div
                    className="mt-5 h-[3px] w-16 transition-all duration-300 group-hover:w-24"
                    style={{ backgroundColor: meta.accent }}
                  />
                  {card.description ? (
                    <p className="mt-6 text-[15px] leading-[1.8] text-gray-600 transition-colors duration-300 group-hover:text-gray-800 md:text-[16px]">
                      {card.description}
                    </p>
                  ) : null}
                  <span className="sr-only">{intro?.items?.[index]?.cta || ctaFor(index, locale)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
