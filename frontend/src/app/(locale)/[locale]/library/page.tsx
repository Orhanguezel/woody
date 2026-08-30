import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import LibraryPageClient from '@/components/woody/library/LibraryPageClient';
import Link from 'next/link';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import type { StoreUiCopy } from '@/components/woody/store/types';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';

const PAGE_KEY = 'library';
const PATHNAME = '/library';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function LibraryPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  if (!content) return <WoodyFallback pageKey={PAGE_KEY} />;
  const storeContent = await loadWoodyPageContent('store', locale);
  const raw = (storeContent?.raw ?? {}) as Record<string, unknown>;
  const ui = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;
  return (
    <>
      <JsonLd id="woody-library" data={woodyPageGraph({ locale, pathname: PATHNAME, content })} />
      <LibraryPageClient content={content} locale={locale} />
      <section className="bg-white py-12 text-center">
        <Link
          href={`/${locale}/me/library`}
          className="inline-flex min-h-12 items-center rounded-md bg-brand-primary px-6 py-3 font-bold text-white"
        >
          {ui?.goToLibrary || ''}
        </Link>
      </section>
    </>
  );
}
