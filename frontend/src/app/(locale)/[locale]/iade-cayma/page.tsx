import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import LegalDraftPage from '@/components/woody/legal/LegalDraftPage';

type Props = { params: Promise<{ locale: string }> };
const PAGE_KEY = 'iade-cayma';

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  if (!content) notFound();
  return <LegalDraftPage content={content} />;
}
