import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import type { WoodyCard } from '../content-loader.server';
import { HERO_BG, localizeHomeHref } from '../home/home-copy';

function ctaFor(index: number, locale: string) {
  if (locale === 'tr') {
    return ['Okul Serisini İncele', 'Atölye Serisini İncele', 'Ev Serisini İncele'][index] || 'İncele';
  }
  return ['Explore School Series', 'Explore Workshop Series', 'Explore Home Series'][index] || 'Explore';
}

export default function WoodySetZigzag({
  cards,
  locale,
}: {
  cards: WoodyCard[];
  locale: string;
}) {
  if (!cards.length) return null;

  return (
    <section className="bg-[var(--gm-surface)] py-16 lg:py-24">
      <div className="container">
        <div className="mb-12 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-primary)]">
            {locale === 'tr' ? 'Set seçimi' : 'Choose your set'}
          </p>
          <h2 className="mt-3 text-balance font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1] text-[var(--gm-text)]">
            {locale === 'tr' ? 'Kurumunuz için doğru seriyi seçin' : 'Choose the right series for your institution'}
          </h2>
        </div>

        <div className="space-y-10">
          {cards.map((card, index) => {
            const image = card.image || HERO_BG;
            const reverse = index % 2 === 1;
            return (
              <article
                key={`${card.title}-${index}`}
                className="grid overflow-hidden rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-bg)] shadow-[var(--gm-shadow-soft)] lg:grid-cols-2"
              >
                <div className={`relative min-h-[280px] bg-[var(--gm-bg-deep)] ${reverse ? 'lg:order-2' : ''}`}>
                  <Image
                    src={image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 md:p-10 lg:p-14">
                  {card.badge ? (
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gm-primary)]">
                      {card.badge}
                    </p>
                  ) : null}
                  <h3 className="mt-3 text-3xl font-bold text-[var(--gm-text)]">{card.title}</h3>
                  {card.description ? (
                    <p className="mt-4 text-base leading-8 text-[var(--gm-text-dim)]">{card.description}</p>
                  ) : null}
                  {card.features?.length ? (
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {card.features.slice(0, 6).map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm text-[var(--gm-text-dim)]">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={localizeHomeHref(locale, card.href || '/preschool')}
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-[var(--gm-gold-deep)] px-5 py-3 font-bold text-[var(--gm-surface)] shadow-[var(--gm-shadow-soft)] transition hover:-translate-y-0.5"
                  >
                    {ctaFor(index, locale)}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
