import BlogSalesNextStep from './BlogSalesNextStep';
import Image from 'next/image';
import { tCategory, tUi } from '@/i18n/staticUi';

import Link from 'next/link';

import { FOCUS_RING } from '@/lib/a11y';
import { localizePath } from '@/integrations/shared';
import { wrapRichContentTables } from '@/lib/rich-content';
import type { WoodyFallbackBlogPost } from './blog-loader.server';

export default function WoodyBlogFallbackDetail({
  post,
  locale,
}: {
  post: WoodyFallbackBlogPost;
  locale: string;
}) {
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)]">
      <header className="border-b border-[var(--gm-border-soft)] bg-[linear-gradient(180deg,var(--gm-bg)_0%,var(--gm-surface)_100%)]">
        <div className="mx-auto max-w-4xl px-5 pb-10 pt-28 md:px-6 md:pb-12 md:pt-28">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <Link
              href={localizePath(locale, '/blog')}
              className={`rounded-sm text-[var(--gm-gold-deep)] transition-colors hover:text-[var(--gm-primary)] ${FOCUS_RING}`}
            >
              {locale === 'tr' ? 'Blog' : tUi(locale, 'Back to blog')}
            </Link>
            {post.category ? (
              <>
                <span aria-hidden="true" className="text-[var(--gm-muted)]">/</span>
                <span className="text-[var(--gm-text-dim)]">{tCategory(locale, post.category)}</span>
              </>
            ) : null}
          </nav>
          <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.08] tracking-[-0.02em]">
            {post.title}
          </h1>
          {post.summary ? (
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--gm-text-dim)] md:text-lg md:leading-8">
              {post.summary}
            </p>
          ) : null}
          {date ? <p className="mt-4 text-sm font-medium text-[var(--gm-muted)]">{date}</p> : null}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 md:px-6 md:py-10">
        {post.featured_image ? (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] shadow-[var(--gm-shadow-card)] md:mb-10">
            <Image
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <article className="mx-auto max-w-3xl rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] px-5 py-7 text-[var(--gm-text-dim)] shadow-[var(--gm-shadow-soft)] md:px-9 md:py-9">
          {post.content_html ? (
            <div
              className="blog-rich-content prose max-w-none font-sans prose-headings:font-display prose-headings:text-[var(--gm-text)] prose-p:font-sans prose-p:text-[var(--gm-text-dim)] prose-li:font-sans prose-strong:font-sans"
              dangerouslySetInnerHTML={{ __html: wrapRichContentTables(post.content_html) }}
            />
          ) : (
            <p>{post.summary}</p>
          )}
        </article>
        <BlogSalesNextStep slug={post.slug} locale={locale} />
      </section>
    </main>
  );
}
