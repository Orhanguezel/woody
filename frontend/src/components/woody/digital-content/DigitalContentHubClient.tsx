'use client';

import Link from 'next/link';
import { useState } from 'react';

import { localizePath } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import { DIGITAL_LEVELS, DIGITAL_SECTIONS } from './digital-content-data';

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

export default function DigitalContentHubClient({ locale }: { locale: string }) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const isTr = locale === 'tr';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="w-full bg-white py-16 md:py-20">
        <div className="container max-w-[1000px] text-center">
          <h1 className="font-display text-[42px] font-normal leading-tight text-gray-900 md:text-[52px] lg:text-[60px]">
            Welcome to Woody Digital World
          </h1>
        </div>
      </section>

      <section className="w-full bg-white py-12 md:py-16">
        <div className="container max-w-[1100px]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {DIGITAL_LEVELS.map((level) => (
              <div key={level.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedLevel(selectedLevel === level.id ? null : level.id);
                  }}
                  aria-expanded={selectedLevel === level.id}
                  aria-pressed={selectedLevel === level.id}
                  aria-controls={selectedLevel === level.id ? `digital-sections-${level.id}` : undefined}
                  className={`group relative h-[220px] w-full max-w-[320px] cursor-pointer overflow-visible rounded-[28px] border-4 bg-white p-1 transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl active:translate-y-0 active:scale-95 ${FOCUS_RING}`}
                  style={{
                    borderColor: selectedLevel === level.id ? level.color : `${level.color}66`,
                    background: `linear-gradient(135deg, ${level.color}00 0%, ${level.color}40 50%, ${level.color}00 100%)`,
                    boxShadow:
                      selectedLevel === level.id
                        ? `0 14px 40px 0 ${level.color}55, inset 0 0 0 3px ${level.color}30`
                        : `0 8px 32px 0 ${level.color}40, 0 4px 16px 0 ${level.color}30`,
                  }}
                >
                  <div
                    className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[24px] bg-white"
                    style={{
                      border: '3px solid transparent',
                      background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${level.color}, ${level.color}99, ${level.color}) border-box`,
                      boxShadow: `inset 0 0 20px ${level.color}15`,
                    }}
                  >
                    <h2
                      className="mb-2 font-display text-[52px] font-black tracking-wider md:text-[60px]"
                      style={{
                        color: level.color,
                        textShadow: `0 2px 12px ${level.color}50`,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      }}
                    >
                      {level.name}
                    </h2>
                    <p className="text-[18px] font-light md:text-[20px]" style={{ color: `${level.color}CC` }}>
                      {level.subtitle}
                    </p>
                  </div>
                </button>

                {selectedLevel === level.id ? (
                  <div
                    id={`digital-sections-${level.id}`}
                    className="mt-6 grid w-full max-w-[320px] grid-cols-2 gap-4"
                  >
                    {DIGITAL_SECTIONS.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Link
                          key={section.id}
                          href={localizePath(locale as any, `/digital-content/${level.id}/${section.id}`)}
                          onClick={playClickSound}
                          aria-label={`${level.name} ${section.name}`}
                          className={`group relative flex flex-col items-center justify-center rounded-[20px] bg-white p-[3px] transition hover:scale-105 hover:shadow-xl active:scale-95 ${FOCUS_RING}`}
                          style={{
                            background: `linear-gradient(135deg, ${section.color}00 0%, ${section.color}30 50%, ${section.color}00 100%)`,
                          }}
                        >
                          <div
                            className="flex h-full w-full flex-col items-center justify-center rounded-[17px] bg-white p-4"
                            style={{
                              border: '2px solid transparent',
                              background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${section.color}, ${section.color}AA) border-box`,
                              boxShadow: `inset 0 0 15px ${section.color}10`,
                            }}
                          >
                            <Icon className="h-7 w-7" style={{ color: section.color }} strokeWidth={2.5} aria-hidden />
                            <span className="mt-2 text-[12px] font-bold" style={{ color: section.color }}>
                              {section.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-50 py-8">
        <p className="text-center text-[12px] text-gray-500">
          {isTr
            ? "Bu, Mina Yayınevi'nin dijital uygulamasıdır. Tüm hakları saklıdır."
            : 'This is a digital application of Mina Publishing House. All rights reserved.'}
        </p>
      </section>
    </main>
  );
}
