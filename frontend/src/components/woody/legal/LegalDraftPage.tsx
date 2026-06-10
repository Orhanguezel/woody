import type { WoodyPageContent } from '@/components/woody/content-loader.server';

export default function LegalDraftPage({ content }: { content: WoodyPageContent }) {
  return (
    <main className="min-h-screen bg-white px-6 py-32 text-gray-900">
      <article className="mx-auto max-w-3xl">
        {content.eyebrow ? (
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gm-primary)]">
            {content.eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[38px] font-black leading-tight md:text-[52px]">{content.title}</h1>
        {content.description ? (
          <p className="mt-5 text-[16px] leading-8 text-gray-600">{content.description}</p>
        ) : null}
        <div className="mt-10 space-y-6">
          {(content.sections ?? []).map((section) => (
            <section key={section.title || section.description}>
              {section.title ? <h2 className="text-[22px] font-black">{section.title}</h2> : null}
              {section.description ? <p className="mt-2 text-[15px] leading-7 text-gray-600">{section.description}</p> : null}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
