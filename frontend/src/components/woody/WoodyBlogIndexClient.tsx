'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, Search } from 'lucide-react';

import { localizePath } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import { LayoutSeoBridge } from '@/seo';
import { useLocaleShort } from '@/i18n';
import type { WoodyFallbackBlogPost } from './blog-loader.server';

// Blog breadcrumb logosu (akademi sayfasi deseni — ortalanmis marka logosu + geri linki)
const BLOG_LOGO = '/assets/woody/blog/woody-blog-logo.png';

export type WoodyBlogFaqItem = {
  question: string;
  problem?: string;
  solution?: string;
  answer?: string;
};

const fallbackFaq: WoodyBlogFaqItem[] = [
  {
    question: 'Anaokulu İngilizce eğitim seti neden gereklidir?',
    problem:
      'Anaokullarında İngilizce derslerinin öğretmene göre değişmesi ve standart bir sistemle ilerlememesi kalite farkı oluşturur.',
    solution:
      'Woody sistemi planlı, oyun temelli ve uygulanabilir bir ders akışı sunarak kurumların aynı standartta ilerlemesini destekler.',
  },
  {
    question: 'Oyun temelli İngilizce eğitimi neden etkilidir?',
    problem:
      'Okul öncesinde ezber odaklı dersler çocukların dikkatini hızlıca düşürür ve öğrenmeyi kalıcı hale getirmekte zorlanır.',
    solution:
      'Hikaye, şarkı, hareket ve tekrar içeren etkinlikler dilin doğal biçimde kullanılmasını sağlar.',
  },
];

function formatDate(value: string | undefined, locale: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
}

function categoryLabel(category: string | undefined) {
  if (!category) return 'Woody Blog';
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function WoodyBlogIndexClient({
  activeCategory,
  bannerTitleOverride,
  initialPosts = [],
  faqItems = [],
}: {
  activeCategory?: string;
  bannerTitleOverride?: string;
  forceInitialPosts?: boolean;
  initialPosts?: WoodyFallbackBlogPost[];
  faqItems?: WoodyBlogFaqItem[];
}) {
  const locale = useLocaleShort();
  const backLabel = locale === 'tr' ? 'GERİ' : 'BACK';
  const [openFaq, setOpenFaq] = useState(0);
  const posts = useMemo(() => initialPosts.filter((post) => post?.slug && post?.title), [initialPosts]);
  const visibleFaq = useMemo(() => (faqItems.length > 0 ? faqItems : fallbackFaq).slice(0, 8), [faqItems]);
  const title = bannerTitleOverride || (locale === 'tr' ? 'Okul Öncesi İngilizce Eğitimi Hakkında Her Şey' : 'Everything About Preschool English Education');
  const description =
    locale === 'tr'
      ? 'Anaokulu İngilizce eğitimi, oyun temelli öğrenme, Cambridge hazırlık ve Woody sistemi hakkında kapsamlı rehberler.'
      : 'Guides about preschool English education, play-based learning, Cambridge readiness and the Woody system.';
  const localGuideHref = localizePath(locale as any, '/lokal/istanbul-anaokulu-ingilizce-egitimi');
  const levelFinderHref = localizePath(locale as any, '/level-finder');

  return (
    <>
      <LayoutSeoBridge title={title} description={description} ogImage={posts[0]?.featured_image} noindex={false} />
      <main className="bg-[#fff9ee] text-[#24333f]">
        {/* Breadcrumb / hero — akademi sayfasi deseni: ortalanmis Woody Blog logosu + geri linki */}
        <section className="mt-[72px] bg-white py-8 md:py-10">
          <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center gap-4 px-6">
            <Image
              src={BLOG_LOGO}
              alt={title}
              width={520}
              height={300}
              priority
              className="h-auto w-full max-w-[360px] object-contain"
            />
            {description ? (
              <p className="max-w-2xl text-center text-base font-semibold leading-7 text-[#5f6871]">
                {description}
              </p>
            ) : null}
            {activeCategory ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f58220]/12 px-4 py-2 text-sm font-black text-[#d96f12] ring-1 ring-[#f58220]/30">
                <Search className="h-4 w-4" aria-hidden />
                {categoryLabel(activeCategory)}
              </div>
            ) : null}
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

        <section className="container py-12 lg:py-16">
          <Link
            href={localGuideHref}
            className={`group grid overflow-hidden rounded-lg bg-white shadow-[0_18px_55px_rgba(49,64,79,0.12)] ring-1 ring-[#f2d7a7] transition hover:-translate-y-1 hover:shadow-[0_24px_75px_rgba(49,64,79,0.16)] md:grid-cols-[1.15fr_0.85fr] ${FOCUS_RING}`}
          >
            <div className="p-7 md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f58220]">
                {locale === 'tr' ? 'Kapsamli Rehber' : 'Complete Guide'}
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-[#24333f] md:text-5xl">
                {locale === 'tr'
                  ? 'Anaokulu İngilizce Eğitimi Kapsamlı Rehber'
                  : 'Complete Preschool English Education Guide'}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6871]">
                {locale === 'tr'
                  ? 'Okul öncesi İngilizce sistemini kurmak, öğretmen akışını planlamak ve veliye güven veren bir program sunmak için uzun form rehber.'
                  : 'A long-form guide for building a preschool English system, planning teacher flow and presenting a trusted program to families.'}
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#0c8f74]">
                {locale === 'tr' ? 'Rehberi oku' : 'Read guide'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
            <div className="relative min-h-[260px] bg-[#0c8f74]">
              <Image
                src="https://images.unsplash.com/photo-1560785496-321917f24016?w=1000&q=80"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover mix-blend-luminosity opacity-85"
              />
            </div>
          </Link>
        </section>

        <section className="container pb-14 lg:pb-20">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0c8f74]">
                {locale === 'tr' ? 'Yazilar' : 'Articles'}
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-[#24333f]">
                {locale === 'tr' ? 'Son Blog Yazıları' : 'Latest Blog Posts'}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#68727b]">
              {locale === 'tr'
                ? 'Ders planı, set seçimi, Cambridge hazırlık ve oyun temelli öğrenme başlıkları tek yerde.'
                : 'Lesson planning, set selection, Cambridge readiness and play-based learning in one place.'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={localizePath(locale as any, `/blog/${post.slug}`)}
                className={`group flex min-h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_14px_42px_rgba(49,64,79,0.10)] ring-1 ring-[#eadfce] transition hover:-translate-y-1 hover:shadow-[0_20px_58px_rgba(49,64,79,0.15)] ${FOCUS_RING}`}
              >
                <div className="relative aspect-[4/3] bg-[#f4ead8]">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.featured_image_alt || post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#f58220]">
                    <span>{categoryLabel(post.category)}</span>
                    <span className="text-[#9a8a74]">{formatDate(post.created_at, locale)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black leading-tight text-[#24333f]">{post.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#68727b]">{post.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black text-[#0c8f74]">
                    {locale === 'tr' ? 'Devamını oku' : 'Read more'}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f58220]">FAQ</p>
              <h2 className="mt-3 font-display text-4xl font-black leading-tight text-[#24333f]">
                {locale === 'tr' ? 'Woody Hakkında Sık Sorulanlar' : 'Frequently Asked About Woody'}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#68727b]">
                {locale === 'tr'
                  ? 'Blogdaki ana soruların kısa yanıtları: problem, çözüm ve uygulama odağıyla.'
                  : 'Short answers to key blog questions, with problem, solution and classroom focus.'}
              </p>
              <Link
                href={levelFinderHref}
                className={`mt-8 inline-flex items-center gap-2 rounded-full bg-[#f58220] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(245,130,32,0.28)] transition hover:bg-[#d96f12] ${FOCUS_RING}`}
              >
                {locale === 'tr' ? 'Seviye bulucu' : 'Level finder'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="space-y-3">
              {visibleFaq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={`${item.question}-${index}`} className="overflow-hidden rounded-lg border border-[#eadfce] bg-[#fff9ee]">
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-black text-[#24333f] ${FOCUS_RING}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-[#eadfce] px-5 py-5 text-sm leading-7 text-[#68727b]">
                        {item.problem ? (
                          <p>
                            <strong className="text-[#24333f]">{locale === 'tr' ? 'Sorun: ' : 'Problem: '}</strong>
                            {item.problem}
                          </p>
                        ) : null}
                        <p className={item.problem ? 'mt-3' : ''}>
                          <strong className="text-[#24333f]">{locale === 'tr' ? 'Çözüm: ' : 'Solution: '}</strong>
                          {item.solution || item.answer}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
