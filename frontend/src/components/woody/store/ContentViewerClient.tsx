'use client';

import Link from 'next/link';
import { ArrowLeft, Download, FileText, Music, PlayCircle } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import type { StoreUiCopy } from './types';

function viewerLabel(mediaType: string | undefined, ui: StoreUiCopy) {
  if (mediaType === 'pdf') return ui.viewerPdf || '';
  if (mediaType === 'audio') return ui.viewerAudio || '';
  if (mediaType === 'video') return ui.viewerVideo || '';
  return ui.content || '';
}

export default function ContentViewerClient({
  locale,
  contentId,
  title,
  mediaType,
  ui = {},
}: {
  locale: string;
  contentId: string;
  title?: string;
  mediaType?: string;
  ui?: StoreUiCopy;
}) {
  const src = `/api/v1/me/contents/${encodeURIComponent(contentId)}`;
  const cleanTitle = title || ui.content || '';

  return (
    <main className="min-h-screen bg-gray-950 pt-24 text-white">
      <div className="container pb-6">
        <Link
          href={`/${locale}/me/library`}
          className={`inline-flex items-center gap-2 text-sm font-bold text-gray-300 transition hover:text-white ${FOCUS_RING}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {ui.backToLibrary || ''}
        </Link>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
              {mediaType === 'audio' ? <Music className="size-4" aria-hidden /> : mediaType === 'pdf' ? <FileText className="size-4" aria-hidden /> : <PlayCircle className="size-4" aria-hidden />}
              {viewerLabel(mediaType, ui)}
            </p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">{cleanTitle}</h1>
          </div>
          <a
            href={src}
            className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 ${FOCUS_RING}`}
          >
            <Download className="size-4" aria-hidden />
            {ui.newTab || ''}
          </a>
        </div>
      </div>

      <section className="border-t border-white/10 bg-black">
        {mediaType === 'audio' ? (
          <div className="container flex min-h-[55vh] items-center justify-center py-16">
            <audio src={src} controls autoPlay className="w-full max-w-3xl" />
          </div>
        ) : mediaType === 'pdf' ? (
          <iframe title={cleanTitle} src={src} className="h-[calc(100vh-220px)] min-h-[620px] w-full bg-white" />
        ) : mediaType === 'video' || !mediaType ? (
          <div className="container py-8">
            <video src={src} controls autoPlay className="mx-auto aspect-video w-full max-w-6xl rounded-lg bg-black" />
          </div>
        ) : (
          <iframe title={cleanTitle} src={src} className="h-[calc(100vh-220px)] min-h-[620px] w-full bg-white" />
        )}
      </section>
    </main>
  );
}
