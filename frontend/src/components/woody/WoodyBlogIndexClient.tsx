'use client';

import React, { useMemo } from 'react';

import Banner from '@/layout/banner/Breadcrum';
import PublicBanner from '@/components/common/public/Banner';
import BlogPageContent from '@/components/containers/blog/BlogPageContent';
import { LayoutSeoBridge } from '@/seo';
import { useLocaleShort, useUiSection } from '@/i18n';
import { isValidUiText, safeStr } from '@/integrations/shared';
import { useListCustomPagesPublicQuery } from '@/integrations/rtk/hooks';
import type { CustomPageDto } from '@/integrations/shared';
import type { WoodyFallbackBlogPost } from './blog-loader.server';

export default function WoodyBlogIndexClient({
  initialPosts = [],
}: {
  initialPosts?: WoodyFallbackBlogPost[];
}) {
  const locale = useLocaleShort();
  const { ui } = useUiSection('ui_blog', locale as any);

  const bannerTitle = useMemo(() => {
    const key = 'ui_blog_page_title';
    const value = safeStr(ui(key, 'Blog'));
    return isValidUiText(value, key) ? value : 'Blog';
  }, [ui]);

  const { data: blogData } = useListCustomPagesPublicQuery({
    module_key: 'blog',
    locale,
    limit: 5,
    sort: 'created_at',
    orderDir: 'asc',
  });

  const primary = useMemo<CustomPageDto | null>(() => {
    const items = (blogData?.items ?? []) as any[];
    if (!Array.isArray(items) || items.length === 0) return null;
    return (items.find((item) => item?.is_published) as CustomPageDto | undefined) ?? null;
  }, [blogData?.items]);

  const pageTitle = useMemo(() => {
    const key = 'ui_blog_meta_title';
    const value = safeStr(ui(key, ''));
    if (isValidUiText(value, key)) return value;
    return safeStr(primary?.meta_title) || safeStr(primary?.title) || bannerTitle || 'Blog';
  }, [ui, primary?.meta_title, primary?.title, bannerTitle]);

  const pageDescription = useMemo(() => {
    const key = 'ui_blog_meta_description';
    const value = safeStr(ui(key, ''));
    if (isValidUiText(value, key)) return value;
    return safeStr(primary?.meta_description);
  }, [ui, primary]);

  return (
    <>
      <LayoutSeoBridge
        title={pageTitle}
        description={pageDescription}
        ogImage={undefined}
        noindex={false}
      />

      <Banner title={bannerTitle} />

      <div className="min-h-[50vh] bg-bg-primary">
        <section className="container mx-auto px-4 py-16">
          <BlogPageContent initialPosts={initialPosts} />
        </section>

        <section className="container mx-auto px-4 pb-16">
          <PublicBanner placement="blog_inline" variant="slim" count={1} dismissable />
        </section>
      </div>
    </>
  );
}
