import Image from 'next/image';
import { Award, CheckCircle2 } from 'lucide-react';

import type { WoodyPageContent } from '../content-loader.server';
import { CERTIFICATE_IMAGES, WHY_WOODY_BG_IMAGES, getWhyItems } from '../home/home-copy';

export default function WoodyWhyCambridge({
  content,
  locale,
}: {
  content: WoodyPageContent | null;
  locale: string;
}) {
  const items = getWhyItems(content);
  const title =
    content?.title ||
    (locale === 'tr'
      ? 'Woody ile Cambridge English Sertifika Sistemine Geçiş'
      : 'Transition to the Cambridge English Certificate System with Woody');
  const description =
    content?.description ||
    (locale === 'tr'
      ? 'Woody Academy, okul öncesi İngilizce deneyimini uluslararası ölçekte takip edilebilir bir sertifika yolculuğuna bağlar.'
      : 'Woody Academy connects preschool English learning to an internationally trackable certificate journey.');

  return (
    <section className="relative overflow-hidden border-y border-[var(--gm-border-soft)] bg-[var(--gm-bg)] py-16 lg:py-24">
      <Image
        src={WHY_WOODY_BG_IMAGES[0]}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none -z-0 object-cover opacity-10"
      />
      <div className="container grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-primary)]">
            <Award className="size-4" aria-hidden />
            Cambridge English
          </p>
          <h2 className="mt-4 text-balance font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1] text-[var(--gm-text)]">
            {title}
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--gm-text-dim)]">{description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article key={item.title} className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-5 shadow-[var(--gm-shadow-soft)]">
                <CheckCircle2 className="mb-4 size-5 text-[var(--gm-primary)]" aria-hidden />
                <h3 className="font-bold text-[var(--gm-text)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--gm-text-dim)]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="flex flex-col justify-center">
          <div className="rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-6 shadow-[var(--gm-shadow-card)]">
            <div className="relative mx-auto aspect-[4/3] max-w-[420px] overflow-hidden rounded-lg bg-[var(--gm-bg-deep)]">
              <Image
                src={WHY_WOODY_BG_IMAGES[1]}
                alt={title}
                fill
                sizes="420px"
                className="object-cover"
              />
            </div>
            <div className="mt-6 grid gap-3">
              {CERTIFICATE_IMAGES.map((certificate) => (
                <div key={certificate.src} className="relative min-h-20 overflow-hidden rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-bg-deep)]">
                  <Image
                    src={certificate.src}
                    alt={certificate.alt}
                    fill
                    sizes="360px"
                    className="object-contain p-3"
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
