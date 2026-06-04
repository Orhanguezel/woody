import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyCard, WoodyPageContent } from './content-loader.server';

function cardHref(card: WoodyCard, locale: string) {
  if (card.href?.startsWith('/')) return `/${locale}${card.href}`;
  return card.href || '';
}

function CardGrid({ cards, locale }: { cards: WoodyCard[]; locale: string }) {
  if (!cards.length) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const href = cardHref(card, locale);
        const body = (
          <article className="h-full rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-6 shadow-[var(--gm-shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--gm-shadow-card)]">
            {card.badge ? (
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gm-gold-deep)]">
                {card.badge}
              </p>
            ) : null}
            {card.image ? (
              <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-md bg-[var(--gm-bg-deep)]">
                <Image src={card.image} alt={card.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            ) : null}
            <h3 className="text-xl font-semibold text-[var(--gm-text)]">{card.title}</h3>
            {card.description ? (
              <p className="mt-3 leading-7 text-[var(--gm-text-dim)]">{card.description}</p>
            ) : null}
            {card.features?.length ? (
              <ul className="mt-5 space-y-2">
                {card.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[var(--gm-text-dim)]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {card.price ? (
              <p className="mt-5 text-lg font-bold text-[var(--gm-text)]">
                {card.price} {card.currency}
              </p>
            ) : null}
          </article>
        );

        return href ? (
          <Link key={`${card.title}-${href}`} href={href} className={`block h-full rounded-lg ${FOCUS_RING}`}>
            {body}
          </Link>
        ) : (
          <div key={card.title}>{body}</div>
        );
      })}
    </div>
  );
}

export default function WoodyPage({ content, locale }: { content: WoodyPageContent; locale: string }) {
  const hero = content.hero;
  const cards = [...(content.cards ?? []), ...(content.products ?? [])];

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)]">
      <section className="relative overflow-hidden border-b border-[var(--gm-border-soft)] bg-[linear-gradient(180deg,var(--gm-bg)_0%,var(--gm-surface)_55%,var(--gm-bg-deep)_100%)]">
        <div className="container grid min-h-[72vh] items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:py-24">
          <div>
            {(hero?.eyebrow || content.eyebrow) ? (
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gm-gold-deep)]">
                {hero?.eyebrow || content.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[0.98] text-[var(--gm-text)]">
              {hero?.title || content.title}
            </h1>
            {(hero?.subtitle || hero?.description || content.description) ? (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--gm-text-dim)]">
                {hero?.description || hero?.subtitle || content.description}
              </p>
            ) : null}
            {(hero?.primaryCTA && hero.primaryHref) || (hero?.secondaryCTA && hero.secondaryHref) ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {hero?.primaryCTA && hero.primaryHref ? (
                  <Link
                    href={hero.primaryHref.startsWith('/') ? `/${locale}${hero.primaryHref}` : hero.primaryHref}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--gm-primary)] px-5 py-3 font-semibold text-[var(--gm-surface)] shadow-[var(--gm-shadow-soft)] ${FOCUS_RING}`}
                  >
                    {hero.primaryCTA}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
                {hero?.secondaryCTA && hero.secondaryHref ? (
                  <Link
                    href={hero.secondaryHref.startsWith('/') ? `/${locale}${hero.secondaryHref}` : hero.secondaryHref}
                    className={`inline-flex min-h-11 items-center rounded-md border border-[var(--gm-border)] px-5 py-3 font-semibold text-[var(--gm-text)] ${FOCUS_RING}`}
                  >
                    {hero.secondaryCTA}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
          {hero?.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] shadow-[var(--gm-shadow-card)]">
              <Image
                src={hero.image}
                alt={hero.imageAlt || hero.title || content.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {content.sections?.map((section, index) => (
        <section key={`${section.title}-${index}`} className="border-b border-[var(--gm-border-soft)] py-16 lg:py-20">
          <div className="container">
            {section.eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-gold-deep)]">{section.eyebrow}</p>
            ) : null}
            {section.title ? <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-[var(--gm-text)]">{section.title}</h2> : null}
            {section.description ? <p className="mt-4 max-w-3xl leading-8 text-[var(--gm-text-dim)]">{section.description}</p> : null}
            {section.items?.length ? <div className="mt-8"><CardGrid cards={section.items} locale={locale} /></div> : null}
          </div>
        </section>
      ))}

      {cards.length ? (
        <section className="py-16 lg:py-20">
          <div className="container">
            <CardGrid cards={cards} locale={locale} />
          </div>
        </section>
      ) : null}

      {content.faq?.length ? (
        <section className="border-t border-[var(--gm-border-soft)] bg-[var(--gm-bg-deep)] py-16 lg:py-20">
          <div className="container max-w-4xl">
            <div className="space-y-4">
              {content.faq.map((item) => (
                <details key={item.question} className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-5">
                  <summary className={`cursor-pointer rounded-md font-semibold text-[var(--gm-text)] ${FOCUS_RING}`}>
                    {item.question}
                  </summary>
                  <p className="mt-3 leading-7 text-[var(--gm-text-dim)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
