import Link from 'next/link';
import { BookOpen, GraduationCap, Sparkles, Trophy, Users } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

type TocItem = { id: string; title: string };
type LocalSection = {
  id?: string;
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
  list?: string[];
  items?: { title: string; description: string }[];
  table?: {
    columns: string[];
    rows: Array<Record<string, string>>;
  };
  callout?: { title: string; description: string };
  mistakes?: { h: string; p: string }[];
};
export type LocalGuideContent = {
  title: string;
  description?: string;
  hero?: {
    eyebrow?: string;
    title?: string;
    accentTitle?: string;
    description?: string;
    meta?: string[];
  };
  tableOfContents?: TocItem[];
  sections?: LocalSection[];
  faq?: { question: string; answer: string }[];
  relatedBlogs?: { slug: string; title: string }[];
  cta?: { title: string; description: string };
};

const icons = [BookOpen, Users, Sparkles, GraduationCap, Trophy] as const;
const rowKeys = ['age', 'focus', 'weekly', 'output'] as const;

function SectionIcon({ index }: { index: number }) {
  const Icon = icons[index % icons.length];
  return <Icon className="size-6 text-orange-600" aria-hidden />;
}

function renderSection(section: LocalSection, index: number) {
  return (
    <section key={section.id || section.title} id={section.id} className="mb-12 scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <SectionIcon index={index} />
        {section.eyebrow ? (
          <span className="text-sm font-semibold uppercase tracking-wider text-orange-600">{section.eyebrow}</span>
        ) : null}
      </div>
      {section.title ? <h2 className="mb-5 text-3xl font-bold text-gray-900">{section.title}</h2> : null}

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mb-4 leading-relaxed text-gray-700">
          {paragraph}
        </p>
      ))}

      {section.table ? (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-orange-50">
                {section.table.columns.map((column) => (
                  <th key={column} className="border border-gray-200 p-3 text-left font-bold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, rowIndex) => (
                <tr key={`${row.age}-${rowIndex}`} className={rowIndex % 2 === 1 ? 'bg-gray-50' : ''}>
                  {rowKeys.map((key) => (
                    <td key={key} className="border border-gray-200 p-3">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {section.items?.map((item) => (
        <div key={item.title} className="mb-4">
          <h3 className="mb-3 mt-6 text-xl font-bold text-gray-900">{item.title}</h3>
          <p className="leading-relaxed text-gray-700">{item.description}</p>
        </div>
      ))}

      {section.list?.length ? (
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.callout ? (
        <div className="mt-5 rounded-r-lg border-l-4 border-orange-500 bg-orange-50 p-6">
          <p className="mb-2 font-semibold text-gray-800">{section.callout.title}</p>
          <p className="text-gray-700">{section.callout.description}</p>
        </div>
      ) : null}

      {section.mistakes?.length ? (
        <div className="space-y-4">
          {section.mistakes.map((mistake) => (
            <div key={mistake.h} className="rounded-lg border border-red-100 bg-red-50 p-5">
              <h3 className="mb-1 font-bold text-gray-900">{mistake.h}</h3>
              <p className="text-sm leading-relaxed text-gray-700">{mistake.p}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function LocalIstanbulGuide({ content }: { content: LocalGuideContent }) {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative mt-[72px] overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          {content.hero?.eyebrow ? (
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">{content.hero.eyebrow}</p>
          ) : null}
          <h1 className="text-[40px] font-black leading-tight text-gray-950 md:text-[60px]">
            {content.hero?.title || content.title}
            {content.hero?.accentTitle ? <span className="block text-orange-600">{content.hero.accentTitle}</span> : null}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">{content.hero?.description || content.description}</p>
          {content.hero?.meta?.length ? (
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm font-medium text-gray-600">
              {content.hero.meta.map((item) => (
                <span key={item} className="rounded-full border border-orange-100 bg-white px-4 py-2 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-4">
          <aside className="order-2 lg:order-1">
            <div className="sticky top-28 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">İçindekiler</h2>
              <nav className="space-y-2">
                {(content.tableOfContents ?? []).map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={`block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-700 ${FOCUS_RING}`}>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="order-1 max-w-none lg:order-2 lg:col-span-3">
            {(content.sections ?? []).map(renderSection)}

            {content.faq?.length ? (
              <section id="sss" className="mb-12 scroll-mt-24">
                <h2 className="mb-5 text-3xl font-bold text-gray-900">Sık Sorulan Sorular</h2>
                <div className="space-y-4">
                  {content.faq.map((item) => (
                    <details key={item.question} className="group rounded-xl border border-gray-200 bg-white p-6 [&_summary::-webkit-details-marker]:hidden">
                      <summary className={`flex cursor-pointer items-center justify-between text-lg font-bold text-gray-900 ${FOCUS_RING}`}>
                        {item.question}
                        <span className="ml-4 text-2xl text-orange-600 transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-4 leading-relaxed text-gray-700">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            {content.relatedBlogs?.length ? (
              <section className="mt-16 border-t-2 border-gray-100 pt-12">
                <div className="mb-6 flex items-center gap-3">
                  <GraduationCap className="size-6 text-orange-600" aria-hidden />
                  <h2 className="text-2xl font-bold text-gray-900">İlgili Rehberler</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {content.relatedBlogs.map((blog) => (
                    <Link key={blog.slug} href={`/tr/blog/${blog.slug}`} className={`block rounded-xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50 ${FOCUS_RING}`}>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-orange-600">BLOG</p>
                      <h3 className="font-bold text-gray-900">{blog.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </section>

      {content.cta ? (
        <section className="bg-orange-50 px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-950">{content.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-700">{content.cta.description}</p>
            <Link href="/tr/contact" className={`mt-7 inline-flex rounded-md bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700 ${FOCUS_RING}`}>
              Demo Talep Et
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
