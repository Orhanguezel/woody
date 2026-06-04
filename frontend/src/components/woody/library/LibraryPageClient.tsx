import Image from 'next/image';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyPageContent } from '../content-loader.server';

const LIBRARY_IMAGE =
  '/media/woody/reference/x7apff07_kling_20260412_%E4%BD%9C%E5%93%81_Ultra_deta_5707_2.png';
const LEVEL_COLORS = ['#2196F3', '#F5C518', '#E91E90'] as const;
const PREVIEW_URL = 'https://bir-app-2.preview.emergentagent.com';

function splitHero(description?: string) {
  if (!description) return [];
  return description
    .split(/(?<=\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function levelName(label?: string) {
  return (label || '').replace(/\s+Level$/i, '') || 'Basic';
}

export default function LibraryPageClient({
  content,
  locale,
}: {
  content: WoodyPageContent;
  locale: string;
}) {
  const levels = content.sections?.[0]?.items ?? [];
  const paragraphs = splitHero(content.hero?.description || content.description);
  const teacherLabel = locale === 'tr' ? 'öğretmen kitaplarını görmek için tıklayın' : 'teacher books';
  const studentLabel = locale === 'tr' ? 'öğrenci kitaplarını görmek için tıklayın' : 'student books';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="pt-[72px]" />

      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] px-6 text-center md:px-12">
          <h1 className="mb-6 text-[36px] font-light leading-tight text-gray-900 md:text-[48px] lg:text-[56px]">
            {content.hero?.title || content.title}
          </h1>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mx-auto mb-4 max-w-[800px] text-[16px] leading-[1.8] text-gray-600 md:text-[18px]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="w-full">
        {levels.map((level, index) => {
          const isLeft = index % 2 === 0;
          const color = LEVEL_COLORS[index % LEVEL_COLORS.length];
          const short = levelName(level.badge);
          return (
            <article
              key={level.title}
              className={`flex min-h-screen w-full flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="relative h-[50vh] w-full md:h-screen md:w-1/2">
                <Image src={LIBRARY_IMAGE} alt={level.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>

              <div className="flex w-full items-center justify-center bg-white p-8 md:w-1/2 md:p-20">
                <div className="max-w-xl">
                  <span className="mb-6 inline-block rounded-full px-5 py-2 text-sm font-bold text-white" style={{ backgroundColor: color }}>
                    {level.badge}
                  </span>
                  <h2 className="mb-5 text-3xl font-light leading-tight text-gray-900 md:text-4xl">
                    {level.title}
                  </h2>
                  <p className="mb-8 text-base leading-relaxed text-gray-600 md:text-lg">{level.description}</p>
                  <div className="flex flex-col gap-4">
                    <a
                      href={PREVIEW_URL}
                      className={`text-base font-medium text-gray-700 underline transition hover:text-gray-900 ${FOCUS_RING}`}
                      style={{
                        textDecorationColor: color,
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      {locale === 'tr' ? `${short} ${teacherLabel}` : `Click to view ${short} ${teacherLabel}`}
                    </a>
                    <a
                      href={PREVIEW_URL}
                      className={`text-base font-medium text-gray-700 underline transition hover:text-gray-900 ${FOCUS_RING}`}
                      style={{
                        textDecorationColor: color,
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      {locale === 'tr' ? `${short} ${studentLabel}` : `Click to view ${short} ${studentLabel}`}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
