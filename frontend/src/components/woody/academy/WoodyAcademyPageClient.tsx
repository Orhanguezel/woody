import Image from 'next/image';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';
import { ChevronLeft, Headphones, MessageCircle, PenLine, Check, BookOpen, ArrowRight, Star } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

import type { WoodyPageContent, WoodySection } from '../content-loader.server';

const ACADEMY_LOGO =
  '/assets/woody/woody-academy-logo.png';
const STUDENT_IMAGE =
  '/media/woody/reference/dbzvnesg_Little%20girl%20at%20home%20holding%20a%20certificate%20mock-up.png';
const TEACHER_IMAGE =
  '/media/woody/reference/7wnfbfu1_ChatGPT%20Image%2016%20Nis%202026%2013_04_02.png';

const skillCards = [
  { labelTr: 'Dinleme', labelEn: 'Listening', icon: Headphones, bgClass: 'bg-info/10', iconClass: 'text-info' },
  { labelTr: 'Konuşma', labelEn: 'Speaking', icon: MessageCircle, bgClass: 'bg-gold-100', iconClass: 'text-brand-primary-light' },
  { labelTr: 'Okuma', labelEn: 'Reading', icon: BookOpen, bgClass: 'bg-success/10', iconClass: 'text-success' },
  { labelTr: 'Yazma', labelEn: 'Writing', icon: PenLine, bgClass: 'bg-error/10', iconClass: 'text-error' },
] as const;

const FEATURE_ACCENT = [
  { border: 'border-info/20', icon: 'text-info' },
  { border: 'border-brand-primary-light/20', icon: 'text-brand-primary-light' },
  { border: 'border-success/20', icon: 'text-success' },
  { border: 'border-error/20', icon: 'text-error' },
] as const;

function sectionAt(content: WoodyPageContent, index: number): WoodySection {
  return content.sections?.[index] ?? {};
}

function splitSentences(text?: string) {
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function FeatureGrid({ features, variant }: { features: string[]; variant: 'check' | 'star' }) {
  const Icon = variant === 'check' ? Check : Star;
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
      {features.map((feature, index) => {
        const accent = FEATURE_ACCENT[index % FEATURE_ACCENT.length];
        return (
          <div key={feature} className={`rounded-xl border bg-white p-6 shadow-sm ${accent.border}`}>
            <Icon className={`mb-3 size-6 ${accent.icon}`} aria-hidden />
            <p className="text-[15px] font-medium leading-relaxed text-gray-700">{feature}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function WoodyAcademyPageClient({
  content,
  locale,
}: {
  content: WoodyPageContent;
  locale: string;
}) {
  const student = sectionAt(content, 0);
  const teacher = sectionAt(content, 1);
  const studentSentences = splitSentences(student.description);
  const teacherSentences = splitSentences(teacher.description);
  const studentModel = student.items?.[0];
  const studentCertificate = student.items?.[1];
  const teacherTraining = teacher.items?.[0];
  const teacherAdvantage = teacher.items?.[1];
  const backLabel = tUi(locale, 'BACK');

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mt-[72px] bg-white py-8 md:py-10">
        <div className="mx-auto flex max-w-[600px] items-center justify-center px-6">
          <Image
            src={ACADEMY_LOGO}
            alt={content.title}
            width={750}
            height={492}
            priority
            className="h-auto w-full max-w-[450px] object-contain"
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pt-2 md:px-16 lg:px-20">
        <Link
          href={`/${locale}`}
          className={`inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-gray-600 transition hover:text-black ${FOCUS_RING}`}
        >
          <ChevronLeft className="size-5" aria-hidden />
          {backLabel}
        </Link>
      </div>

      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16 lg:px-20">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="text-[32px] font-bold leading-tight text-text-secondary md:text-[42px] lg:text-[48px]">
              {student.eyebrow}
            </h2>
            <h3 className="text-[32px] font-bold leading-tight text-text-secondary md:text-[42px] lg:text-[48px]">
              {student.title}
            </h3>
            <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-info to-success" />
          </div>

          <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-lg lg:h-[550px]">
                <Image src={STUDENT_IMAGE} alt={student.title || content.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>

            <div className="w-full space-y-6 lg:w-1/2">
              {studentSentences.slice(0, 3).map((sentence) => (
                <p key={sentence} className="text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                  {sentence}
                </p>
              ))}
              <div className="pt-4">
                <h3 className="mb-4 text-[22px] font-bold text-text-secondary md:text-[26px]">
                  {tUi(locale, 'Cambridge Certification Journey')}
                </h3>
                <p className="mb-4 text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                  {studentSentences[3]}
                </p>
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {skillCards.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <div key={skill.labelEn} className={`flex items-center gap-2 rounded-lg px-4 py-3 ${skill.bgClass}`}>
                        <Icon className={`size-5 ${skill.iconClass}`} aria-hidden />
                        <span className="text-[15px] font-medium text-gray-700">{tUi(locale, skill.labelEn)}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                  {studentSentences.slice(4).join(' ')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-12 lg:mt-16">
            {studentModel ? (
              <div className="mx-auto max-w-[1100px] text-center">
                <h3 className="mb-5 text-[24px] font-bold text-text-secondary md:text-[28px]">{studentModel.title}</h3>
                <p className="mx-auto max-w-[900px] text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                  {studentModel.description}
                </p>
                <FeatureGrid features={studentModel.features ?? []} variant="check" />
              </div>
            ) : null}

            {studentCertificate ? (
              <div className="mx-auto max-w-[1000px] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
                <h3 className="mb-5 text-center text-[24px] font-bold text-text-secondary md:text-[28px]">{studentCertificate.title}</h3>
                <p className="text-center text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                  {studentCertificate.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16 lg:px-20">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="text-[32px] font-bold leading-tight text-text-secondary md:text-[42px] lg:text-[48px]">
              {teacher.eyebrow}
            </h2>
            <h3 className="text-[32px] font-bold leading-tight text-text-secondary md:text-[42px] lg:text-[48px]">
              {teacher.title}
            </h3>
            <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-brand-primary-light to-error" />
          </div>

          <div className="mb-12 flex flex-col items-start gap-12 lg:flex-row-reverse lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-lg lg:h-[550px]">
                <Image src={TEACHER_IMAGE} alt={teacher.title || content.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>

            <div className="w-full space-y-6 lg:w-1/2">
              {teacherSentences.slice(0, 3).map((sentence) => (
                <p key={sentence} className="text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                  {sentence}
                </p>
              ))}
              {teacherTraining ? (
                <div className="pt-4">
                  <h3 className="mb-4 text-[22px] font-bold text-text-secondary md:text-[26px]">{teacherTraining.title}</h3>
                  <p className="mb-5 text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
                    {teacherTraining.description}
                  </p>
                  <ul className="space-y-3">
                    {(teacherTraining.features ?? []).map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-[15px] text-gray-700 md:text-[16px]">
                        <ArrowRight className="mt-1 size-4 shrink-0 text-info" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-auto max-w-[1100px] space-y-10">
            {teacherAdvantage ? (
              <>
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md md:p-10">
                  <h3 className="mb-5 text-[24px] font-bold text-text-secondary md:text-[28px]">
                    {tUi(locale, 'Certification Process')}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-gray-700 md:text-[17px]">{teacherAdvantage.description}</p>
                </div>
                <div>
                  <h3 className="mb-6 text-center text-[24px] font-bold text-text-secondary md:text-[28px]">{teacherAdvantage.title}</h3>
                  <FeatureGrid features={teacherAdvantage.features ?? []} variant="star" />
                </div>
              </>
            ) : null}
            <div className="rounded-2xl border border-brand-primary-light/30 bg-white p-8 shadow-sm md:p-10">
              <p className="text-center text-[16px] leading-relaxed text-gray-800 md:text-[17px]">
                {tUi(locale, 'The Woody Academy teacher program includes all teachers in a structured development process and supports it with an internationally recognized Cambridge TKT certificate.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
