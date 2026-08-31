'use client';

import React, { useMemo } from 'react';
import { useListCustomPagesPublicQuery } from '@/integrations/rtk/hooks';
import {
  pickFirstPublished,
  CMS_FALLBACK_CSS,
  downgradeH1ToH2,
  extractHtmlFromAny,
} from '@/integrations/shared';
import { useLocaleShort } from '@/i18n';

type Props = {
  /** custom_pages.module_key — icerik admin panelden bu anahtarla yonetilir. */
  moduleKey: string;
  /** DB'de kayit yoksa gosterilecek notr baslik. */
  fallbackTitle: string;
};

/**
 * Ticari yasal metinler (mesafeli satis, on bilgilendirme, iade, teslimat) icin
 * ortak CMS govdesi. Icerik kodda degil custom_pages tablosunda durur.
 */
const CmsLegalPageContent: React.FC<Props> = ({ moduleKey, fallbackTitle }) => {
  const locale = useLocaleShort();
  const isTr = locale === 'tr';

  const { data, isLoading, isError } = useListCustomPagesPublicQuery({
    module_key: moduleKey,
    locale,
    limit: 10,
    sort: 'created_at',
    orderDir: 'asc',
  });

  // Ticari yasal metinlerde asil/baglayici surum Turkce; bir dilde cevirisi yoksa
  // bos kutu yerine TR metin gosterilir (bos sozlesme sayfasi yayinlanamaz).
  const localePage = useMemo(() => pickFirstPublished((data as any)?.items), [data]);
  const needsTrFallback = !isTr && !isLoading && !localePage;

  const { data: trData, isLoading: trLoading } = useListCustomPagesPublicQuery(
    { module_key: moduleKey, locale: 'tr', limit: 10, sort: 'created_at', orderDir: 'asc' },
    { skip: !needsTrFallback },
  );

  const page = useMemo(
    () => localePage ?? pickFirstPublished((trData as any)?.items),
    [localePage, trData],
  );

  const title = useMemo(() => {
    const t = String((page as any)?.title ?? '').trim();
    return t || fallbackTitle;
  }, [page, fallbackTitle]);

  const html = useMemo(() => {
    const raw = extractHtmlFromAny(page);
    return raw ? downgradeH1ToH2(raw) : '';
  }, [page]);

  return (
    <section className="relative min-h-[60vh] py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-(--gm-gold)/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-(--gm-primary)/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {(isLoading || trLoading) && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-12 bg-(--gm-surface) rounded-2xl w-1/3 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-(--gm-surface) rounded w-full animate-pulse" />
              <div className="h-4 bg-(--gm-surface) rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-(--gm-surface) rounded w-4/6 animate-pulse" />
            </div>
          </div>
        )}

        {!isLoading && !trLoading && (isError || !page) && (
          <div className="max-w-4xl mx-auto text-center py-20">
            <div
              className="inline-block bg-(--gm-surface) border border-(--gm-border-soft) text-(--gm-text-dim) px-8 py-4 rounded-2xl font-serif italic"
              role="alert"
            >
              {isTr ? 'İçerik henüz hazırlanmadı.' : 'This content is not available yet.'}
            </div>
          </div>
        )}

        {!!page && !isLoading && !trLoading && (
          <div className="max-w-4xl mx-auto">
            <style>{CMS_FALLBACK_CSS}</style>

            <header className="mb-16 text-center">
              <span className="font-display text-[10px] tracking-[0.4em] text-(--gm-gold-deep) uppercase mb-4 block">
                {isTr ? 'YASAL BİLGİLENDİRME' : 'LEGAL INFORMATION'}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-light text-(--gm-text) mb-8 leading-tight">
                {title}
              </h1>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-(--gm-gold) to-transparent mx-auto" />
            </header>

            {html ? (
              <article
                className="prose prose-stone prose-lg max-w-none bg-(--gm-surface) p-8 md:p-16 rounded-[2rem] shadow-card border border-(--gm-border-soft) cms-html text-(--gm-text-dim) leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <div
                className="bg-(--gm-surface) border border-(--gm-border-soft) text-(--gm-text-dim) px-8 py-6 rounded-2xl text-center italic font-serif"
                role="alert"
              >
                {isTr ? 'Bu bölümün içeriği yakında eklenecektir.' : 'This section will be published soon.'}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CmsLegalPageContent;
