import type { Metadata } from 'next';
import ExpertiseCategoriesSection from '@/components/containers/home/ExpertiseCategoriesSection';
import HomeIntroSection from '@/components/containers/home/HomeIntroSection';
import { normPath } from '@/integrations/shared';
import { buildMetadataFromSeo, fetchSeoObject } from '@/seo/server';
import { getExplorePageCopy } from '@/lib/page-copy';
import { getPublicAppName } from '@/lib/site-config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const app = getPublicAppName();
  const explore = await getExplorePageCopy(locale, app);
  const base = await buildMetadataFromSeo(await fetchSeoObject(locale), {
    locale,
    pathname: normPath('/explore'),
  });

  return {
    ...base,
    title: explore.title,
    description: explore.description,
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = await getExplorePageCopy(locale, getPublicAppName());

  return (
    <main className="bg-[var(--gm-bg)] text-[var(--gm-text)] pt-32">
      <section className="px-6 pt-32 pb-20 border-b border-[var(--gm-border-soft)]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="section-label">{copy.sectionLabel}</span>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.05] mt-6 mb-8">{copy.h1}</h1>
          <p className="max-w-2xl mx-auto text-[var(--gm-text-dim)] font-light leading-relaxed mb-10">{copy.lead}</p>
          <a href="#konular" className="btn-premium inline-flex">
            {copy.cta}
          </a>
        </div>
      </section>
      <ExpertiseCategoriesSection locale={locale} />
      <HomeIntroSection />
    </main>
  );
}
