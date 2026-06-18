import Image from 'next/image';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';

import { FOCUS_RING } from '@/lib/a11y';
import { localizePath } from '@/integrations/shared';
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
      <section className="border-b border-[var(--gm-border-soft)] bg-[linear-gradient(180deg,var(--gm-bg)_0%,var(--gm-surface)_100%)] py-16 lg:py-24">
        <div className="container max-w-4xl">
          <Link
            href={localizePath(locale, '/blog')}
            className={`rounded-sm text-sm font-semibold uppercase tracking-[0.16em] text-[var(--gm-gold-deep)] ${FOCUS_RING}`}
          >
            {tUi(locale, 'Back to blog')}
          </Link>
          {post.category ? (
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-primary)]">
              {post.category}
            </p>
          ) : null}
          <h1 className="mt-4 text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1]">
            {post.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--gm-text-dim)]">{post.summary}</p>
          {date ? <p className="mt-5 text-sm text-[var(--gm-muted)]">{date}</p> : null}
        </div>
      </section>

      <section className="container max-w-4xl py-12 lg:py-16">
        {post.featured_image ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] shadow-[var(--gm-shadow-card)]">
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

        <article className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-6 leading-8 text-[var(--gm-text-dim)] shadow-[var(--gm-shadow-soft)] md:p-8">
          {post.content_html ? (
            <div
              className="prose max-w-none font-sans prose-headings:font-display prose-headings:text-[var(--gm-text)] prose-p:font-sans prose-p:text-[var(--gm-text-dim)] prose-li:font-sans prose-strong:font-sans"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          ) : (
            <p>{post.summary}</p>
          )}
        </article>
      </section>
    </main>
  );
}
