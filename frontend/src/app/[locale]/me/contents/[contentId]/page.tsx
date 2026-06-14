import ContentViewerClient from '@/components/woody/store/ContentViewerClient';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import type { StoreUiCopy } from '@/components/woody/store/types';

type Props = {
  params: Promise<{ locale: string; contentId: string }>;
  searchParams: Promise<{ title?: string; mediaType?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function MemberContentPage({ params, searchParams }: Props) {
  const { locale, contentId } = await params;
  const { title, mediaType } = await searchParams;
  const content = await loadWoodyPageContent('store', locale);
  const raw = (content?.raw ?? {}) as Record<string, unknown>;
  const ui = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;
  return (
    <ContentViewerClient
      locale={locale}
      contentId={contentId}
      title={title}
      mediaType={mediaType}
      ui={ui}
    />
  );
}
