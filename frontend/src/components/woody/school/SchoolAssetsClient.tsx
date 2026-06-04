'use client';

import Link from 'next/link';
import { Download, FileText, Lock, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FOCUS_RING } from '@/lib/a11y';
import { useLocaleShort } from '@/i18n';
import { localizePath } from '@/integrations/shared';
import { useListMySchoolAssetsQuery } from '@/integrations/rtk/hooks';

function labelFor(value: string | null) {
  if (!value) return '-';
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SchoolAssetsClient() {
  const locale = useLocaleShort();
  const { data = [], error, isFetching, isLoading, refetch } = useListMySchoolAssetsQuery();
  const isUnauthorized =
    (error as { status?: number } | undefined)?.status === 401 ||
    (error as { originalStatus?: number } | undefined)?.originalStatus === 401;

  return (
    <main className="min-h-[70vh] bg-[var(--gm-bg)] py-16 lg:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-primary)]">
              Woody School
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1] text-[var(--gm-text)]">
              {locale === 'tr' ? 'Atanan dijital içerikler' : 'Assigned digital content'}
            </h1>
            <p className="mt-4 max-w-2xl text-[var(--gm-text-dim)]">
              {locale === 'tr'
                ? 'Okul hesabınıza tanımlanan içerikler burada görünür. Dosya bağlantıları girişli okul kullanıcısı için korunur.'
                : 'Content assigned to your school account appears here. File links are protected for signed-in school users.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            {locale === 'tr' ? 'Yenile' : 'Refresh'}
          </Button>
        </div>

        {isUnauthorized ? (
          <section className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-8 text-center shadow-[var(--gm-shadow-soft)]">
            <Lock className="mx-auto mb-4 size-9 text-[var(--gm-primary)]" aria-hidden />
            <h2 className="text-xl font-bold text-[var(--gm-text)]">
              {locale === 'tr' ? 'Giriş gerekli' : 'Sign-in required'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--gm-text-dim)]">
              {locale === 'tr'
                ? 'Atanan okul içeriklerini görmek için okul kullanıcısı hesabıyla giriş yapın.'
                : 'Sign in with a school user account to view assigned school content.'}
            </p>
            <Link
              href={localizePath(locale, '/login')}
              className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--gm-primary)] px-5 font-bold text-[var(--gm-surface)] ${FOCUS_RING}`}
            >
              {locale === 'tr' ? 'Giriş yap' : 'Sign in'}
            </Link>
          </section>
        ) : null}

        {!isUnauthorized && isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-lg bg-[var(--gm-surface)]" />
            ))}
          </div>
        ) : null}

        {!isUnauthorized && !isLoading && data.length === 0 ? (
          <section className="rounded-lg border border-dashed border-[var(--gm-border)] bg-[var(--gm-surface)] p-8 text-center text-[var(--gm-text-dim)]">
            {locale === 'tr'
              ? 'Bu okul hesabına atanmış aktif içerik yok.'
              : 'There is no active content assigned to this school account.'}
          </section>
        ) : null}

        {!isUnauthorized && data.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((asset) => (
              <article
                key={asset.id}
                className="flex h-full flex-col rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-6 shadow-[var(--gm-shadow-soft)]"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[var(--gm-bg-deep)] text-[var(--gm-primary)]">
                  <FileText className="size-6" aria-hidden />
                </div>
                <h2 className="text-lg font-bold text-[var(--gm-text)]">{asset.title}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--gm-muted)]">{locale === 'tr' ? 'Seviye' : 'Level'}</dt>
                    <dd className="font-bold text-[var(--gm-text)]">{labelFor(asset.level)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--gm-muted)]">{locale === 'tr' ? 'Ürün' : 'Product'}</dt>
                    <dd className="font-bold text-[var(--gm-text)]">{labelFor(asset.product)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--gm-muted)]">{locale === 'tr' ? 'Tip' : 'Type'}</dt>
                    <dd className="font-bold text-[var(--gm-text)]">{asset.asset_type}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--gm-muted)]">{locale === 'tr' ? 'Okul' : 'School'}</dt>
                    <dd className="font-bold text-[var(--gm-text)]">{asset.school_name || '-'}</dd>
                  </div>
                </dl>
                <a
                  href={`/api/v1/school/assets/${encodeURIComponent(asset.id)}/file`}
                  className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--gm-primary)] px-5 font-bold text-[var(--gm-surface)] ${FOCUS_RING}`}
                  aria-label={locale === 'tr' ? `${asset.title} dosyasını aç` : `Open ${asset.title} file`}
                >
                  <Download className="size-5" aria-hidden />
                  {locale === 'tr' ? 'Dosyayı aç' : 'Open file'}
                </a>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
