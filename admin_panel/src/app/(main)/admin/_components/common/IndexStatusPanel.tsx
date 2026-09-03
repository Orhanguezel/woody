'use client';

import * as React from 'react';
import { ExternalLink, Globe, RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  GSC_CATEGORY_META,
  GSC_VERDICT_LABELS,
  type GscIndexItem,
} from '@/integrations/shared';
import {
  useGscEntityIndexQuery,
  useGscEntityInspectMutation,
  useGscStatusQuery,
} from '@/integrations/hooks';
import { cn } from '@/lib/utils';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function IndexStatusPanel({
  type,
  locale,
  slug,
  disabled,
}: {
  type: 'blog' | 'product';
  locale: string;
  slug: string;
  disabled?: boolean;
}) {
  const cleanSlug = slug.trim();
  const indexQuery = useGscEntityIndexQuery({ type, locale }, { skip: !cleanSlug });
  const statusQuery = useGscStatusQuery();
  const [inspect, inspectState] = useGscEntityInspectMutation();
  const [freshItem, setFreshItem] = React.useState<GscIndexItem | null>(null);

  const item = freshItem ?? indexQuery.data?.items?.[cleanSlug] ?? null;
  const category = item?.category ?? 'unchecked';
  const meta = GSC_CATEGORY_META[category] ?? GSC_CATEGORY_META.unchecked;

  React.useEffect(() => {
    setFreshItem(null);
  }, [cleanSlug, locale]);

  async function requestInspection() {
    if (!cleanSlug) return;
    try {
      const result = await inspect({ type, locale, slug: cleanSlug }).unwrap();
      setFreshItem(result);
      toast.success('Google indeks durumu güncellendi');
    } catch (error) {
      const data = (error as { data?: { error?: { message?: string } } })?.data;
      toast.error(data?.error?.message || 'GSC incelemesi başarısız');
    }
  }

  const property = statusQuery.data?.site || 'sc-domain:woodyvearkadaslari.com';
  const origin = property.startsWith('sc-domain:')
    ? `https://${property.slice('sc-domain:'.length).replace(/\/+$/, '')}`
    : property.replace(/\/+$/, '');
  const segment = type === 'product' ? 'store' : 'blog';
  const pageUrl = item?.url || (cleanSlug ? `${origin}/${locale}/${segment}/${cleanSlug}` : null);
  const gscHref = pageUrl
    ? `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(property)}&id=${encodeURIComponent(pageUrl)}`
    : null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-gm-border-soft bg-gm-surface/20">
      <div className="flex items-center justify-between gap-3 border-b border-gm-border-soft bg-gm-surface/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-gm-gold" />
          <span className="font-serif text-lg text-gm-text">Google İndeks Durumu</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold',
            meta.tone,
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="space-y-4 p-6">
        {!cleanSlug ? (
          <p className="text-sm font-serif italic text-gm-muted">
            İçeriği kaydedip slug oluşturduktan sonra indeks durumu denetlenebilir.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Sonuç</dt>
                <dd className="mt-1 text-gm-text">
                  {item ? GSC_VERDICT_LABELS[item.verdict] || item.verdict || '—' : 'Denetlenmedi'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kapsam durumu</dt>
                <dd className="mt-1 text-gm-text">{item?.coverage_state || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Son tarama (Google)</dt>
                <dd className="mt-1 font-mono text-xs text-gm-text">{formatDate(item?.last_crawl)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Son denetim</dt>
                <dd className="mt-1 font-mono text-xs text-gm-text">{formatDate(item?.checked_at)}</dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-gm-border-soft bg-gm-bg-deep/30 p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Neden / Öneri</div>
              <p className="text-sm leading-relaxed text-gm-text/90">
                {item?.recommendation || 'Bu URL henüz Google’da denetlenmedi.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={requestInspection}
                disabled={disabled || inspectState.isLoading || statusQuery.data?.connected === false}
                className="h-11 rounded-full px-6 text-[10px] font-bold uppercase tracking-widest"
              >
                <RefreshCcw className={cn('mr-2 size-4', inspectState.isLoading && 'animate-spin')} />
                {item ? 'Yeniden Denetle' : 'İnceleme İste'}
              </Button>
              {gscHref ? (
                <a
                  href={gscHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gm-muted transition-colors hover:text-gm-gold"
                >
                  <ExternalLink className="size-3.5" />
                  GSC’de aç
                </a>
              ) : null}
              {category === 'issue' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gm-error">
                  <Search className="size-3.5" /> Sorun tespit edildi
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
