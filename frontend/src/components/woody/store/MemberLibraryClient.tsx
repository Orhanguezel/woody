'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Clock3, LockKeyhole, PlayCircle, RefreshCcw } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';
import type { StoreUiCopy } from './types';

type LibraryContent = {
  id: string;
  kind: 'digital' | 'physical';
  mediaType?: string | null;
  title: string;
  description?: string | null;
  isPreview?: boolean;
  displayOrder?: number;
};

type LibraryProduct = {
  entitlementId?: string;
  productId: string;
  title: string;
  slug?: string;
  imageUrl?: string | null;
  expiresAt?: string | null;
  remainingDays?: number | null;
  contents?: LibraryContent[];
};

function asRows(payload: unknown): LibraryProduct[] {
  if (Array.isArray(payload)) return payload as LibraryProduct[];
  const body = payload as { data?: unknown; items?: unknown };
  if (Array.isArray(body.items)) return body.items as LibraryProduct[];
  return Array.isArray(body.data) ? (body.data as LibraryProduct[]) : [];
}

function remainingText(row: LibraryProduct, ui: StoreUiCopy) {
  if (row.remainingDays == null) return ui.unlimited || '';
  if (row.remainingDays <= 0) return ui.locked || '';
  return (ui.remainingDays || '').replace('{{days}}', String(row.remainingDays));
}

export default function MemberLibraryClient({ locale, ui = {} }: { locale: string; ui?: StoreUiCopy }) {
  const [rows, setRows] = React.useState<LibraryProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);

  async function load() {
    setLoading(true);
    setUnauthorized(false);
    try {
      const res = await fetch('/api/v1/me/library', { credentials: 'include' });
      if (res.status === 401) {
        setUnauthorized(true);
        setRows([]);
        return;
      }
      setRows(res.ok ? asRows(await res.json()) : []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-white pt-28 text-gray-900">
      <section className="container pb-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary">
              {ui.storeEyebrow || ''}
            </p>
            <h1 className="mt-3 text-4xl font-black">{ui.libraryTitle || ''}</h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              {ui.libraryDescription || ''}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-200 px-4 py-2 font-bold ${FOCUS_RING}`}
          >
            <RefreshCcw className="size-4" aria-hidden />
            {ui.refresh || ''}
          </button>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="container">
          {loading ? (
            <div className="rounded-lg border border-gray-100 bg-white p-8 text-gray-600">
              {ui.loading || ''}
            </div>
          ) : unauthorized ? (
            <div className="rounded-lg border border-gray-100 bg-white p-8">
              <LockKeyhole className="mb-4 size-8 text-brand-primary" aria-hidden />
              <h2 className="text-2xl font-black">{ui.loginRequired || ''}</h2>
              <Link
                href={`/${locale}/login?next=/${locale}/me/library`}
                className={`mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-primary px-5 py-3 font-bold text-white ${FOCUS_RING}`}
              >
                {ui.login || ''}
              </Link>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-gray-100 bg-white p-8">
              <BookOpen className="mb-4 size-8 text-brand-primary" aria-hidden />
              <h2 className="text-2xl font-black">{ui.libraryEmpty || ''}</h2>
              <Link
                href={`/${locale}/store`}
                className={`mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-primary px-5 py-3 font-bold text-white ${FOCUS_RING}`}
              >
                {ui.goToStore || ''}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {rows.map((row) => (
                <article key={row.productId} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black">{row.title}</h2>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                        <Clock3 className="size-4" aria-hidden />
                        {remainingText(row, ui)}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/store/${row.slug || row.productId}`}
                      className={`inline-flex min-h-10 items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-bold ${FOCUS_RING}`}
                    >
                      {ui.productDetail || ''}
                    </Link>
                  </div>
                  {row.contents?.length ? (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {row.contents.map((content) => {
                        const body = (
                          <>
                            <PlayCircle className="mt-0.5 size-5 shrink-0 text-brand-primary" aria-hidden />
                            <span>
                              <span className="block font-bold">{content.title}</span>
                              <span className="mt-1 block text-xs uppercase tracking-widest text-gray-500">
                                {content.kind === 'physical' ? (ui.physical || '') : content.mediaType || ui.digital || ''}
                              </span>
                            </span>
                          </>
                        );
                        return content.kind === 'physical' ? (
                          <div
                            key={content.id}
                            className="flex items-start gap-3 rounded-md border border-gray-100 p-4"
                          >
                            {body}
                          </div>
                        ) : (
                          <Link
                            key={content.id}
                            href={`/${locale}/me/contents/${content.id}?${new URLSearchParams({
                              title: content.title,
                              mediaType: content.mediaType || '',
                            }).toString()}`}
                            className={`flex items-start gap-3 rounded-md border border-gray-100 p-4 transition hover:border-brand-primary ${FOCUS_RING}`}
                          >
                            {body}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
