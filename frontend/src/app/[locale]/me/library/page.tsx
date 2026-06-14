import MemberLibraryClient from '@/components/woody/store/MemberLibraryClient';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import type { StoreUiCopy } from '@/components/woody/store/types';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export default async function MemberLibraryPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent('store', locale);
  const raw = (content?.raw ?? {}) as Record<string, unknown>;
  const ui = raw.ui && typeof raw.ui === 'object' && !Array.isArray(raw.ui) ? raw.ui as StoreUiCopy : undefined;
  return <MemberLibraryClient locale={locale} ui={ui} />;
}
