'use client';

import Link from 'next/link';

import { localizePath } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import WoodyPageLogoHeader from '../WoodyPageLogoHeader';
import { DIGITAL_LEVELS, DIGITAL_SECTIONS, type DigitalContentCopy } from './digital-content-data';

function playClickSound() {
  try {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGG0fPTgjMGHm7A7+OQRQ0PVq3o6qJUFAk+mtv0xG4iBjSJ0/LSfCsF',
    );
    audio.volume = 0.3;
    void audio.play();
  } catch {
    // Optional UI sound.
  }
}

export default function DigitalContentHubClient({
  locale,
  copy,
}: {
  locale: string;
  copy?: DigitalContentCopy;
}) {
  const footnote = copy?.footnote;
  const title = copy?.hero?.title || copy?.ui?.hubTitle || '';
  const description = copy?.hero?.description;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <WoodyPageLogoHeader
        title={title || 'Woody Digital'}
        locale={locale}
        logoSrc="/assets/woody/woody-digital-logo.png"
        logoAlt={title || 'Woody Digital'}
      />

      <section className="w-full bg-white py-8 md:py-10">
        <div className="container max-w-[1100px] text-center">
          {copy?.hero?.eyebrow ? (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gm-primary)]">
              {copy.hero.eyebrow}
            </p>
          ) : null}
          {description ? (
            <p className="mx-auto max-w-3xl text-[16px] font-semibold leading-7 text-gray-600">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="w-full bg-white pb-12 md:pb-16">
        <div className="container max-w-[1280px]">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            {DIGITAL_LEVELS.map((level) => (
              <section key={level.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div
                  className="relative mb-4 overflow-hidden rounded-lg border p-6 text-center"
                  style={{ borderColor: `${level.color}66`, background: `${level.color}12` }}
                >
                  <div
                    className="mx-auto mb-3 h-1 w-16 rounded-full"
                    style={{ backgroundColor: level.color }}
                    aria-hidden
                  />
                  <h2
                    className="font-display text-[34px] font-black tracking-wider"
                    style={{ color: level.color }}
                  >
                    {copy?.levelLabels?.[level.id]?.title || level.name}
                  </h2>
                  <p className="mt-1 text-[13px] font-semibold text-gray-500">
                    {copy?.levelLabels?.[level.id]?.subtitle || level.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {DIGITAL_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isLibrary = section.id === 'library';
                    const isMusicland = section.id === 'musicland';
                    const sectionLabel = copy?.sectionLabels?.[section.id];
                    const color = isLibrary ? '#8E8E8E' : section.color;
                      return (
                        <Link
                          key={section.id}
                          href={localizePath(locale as any, `/digital-content/${level.id}/${section.id}`)}
                          onClick={playClickSound}
                          aria-label={`${copy?.levelLabels?.[level.id]?.title || level.name} ${sectionLabel?.title || section.name}`}
                          className={`group relative min-h-36 rounded-lg border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${isLibrary ? 'grayscale' : ''} ${FOCUS_RING}`}
                          style={{ borderColor: `${color}55` }}
                        >
                          {isLibrary ? (
                            <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-700">
                              {copy?.library?.badge || sectionLabel?.badge}
                            </span>
                          ) : null}
                          <Icon className="h-7 w-7" style={{ color }} strokeWidth={2.5} aria-hidden />
                          <h3 className="mt-3 text-[14px] font-black" style={{ color }}>
                            {sectionLabel?.title || section.name}
                          </h3>
                          <p className="mt-2 text-[12px] leading-5 text-gray-500">
                            {sectionLabel?.description}
                          </p>
                          {isMusicland ? (
                            <span className="mt-3 inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-purple-800">
                              {copy?.ui?.publicBadge}
                            </span>
                          ) : null}
                        </Link>
                      );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-50 py-8">
        <p className="text-center text-[12px] text-gray-500">
          {footnote}
        </p>
      </section>
    </main>
  );
}
