'use client';

// Blog/ürün DÜZENLEME sayfasında Google indeks durumu bölgesi:
// sonuç (verdict) + kapsam (coverageState) + son tarama + öneri (neden) + "İnceleme İste" düğmesi.

import * as React from 'react';
import { Globe, RefreshCcw, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

function fmt(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  const cleanSlug = (slug || '').trim();
  const indexQ = useGscEntityIndexQuery({ type, locale }, { skip: !cleanSlug });
  const statusQ = useGscStatusQuery();
  const [inspect, inspectState] = useGscEntityInspectMutation();
  const [fresh, setFresh] = React.useState<GscIndexItem | null>(null);

  const item = fresh ?? (cleanSlug ? indexQ.data?.items?.[cleanSlug] : undefined) ?? null;
  const category = item?.category ?? 'unchecked';
  const meta = GSC_CATEGORY_META[category] ?? GSC_CATEGORY_META.unchecked;

  // slug değişince taze sonucu sıfırla (yanlış slug'a yapışmasın)
  React.useEffect(() => {
    setFresh(null);
  }, [cleanSlug, locale]);

  async function requestInspect() {
    if (!cleanSlug) return;
    try {
      const result = await inspect({ type, locale, slug: cleanSlug }).unwrap();
      setFresh(result);
      toast.success('İnceleme tamamlandı — indeks durumu güncellendi');
    } catch (e) {
      const data = (e as { data?: { error?: { message?: string } } })?.data;
      toast.error(data?.error?.message || 'İnceleme başarısız (GSC bağlantısı / kota olabilir)');
    }
  }

  // GSC deep-link: gerçek property'yi status'tan al; URL denetlenmemişse type+locale+slug'tan kur.
  const property = statusQ.data?.site || 'https://woodyvearkadaslari.com/';
  const origin = property.startsWith('sc-domain:')
    ? `https://${property.slice('sc-domain:'.length).replace(/\/+$/, '')}`
    : property.replace(/\/+$/, '');
  const seg = type === 'product' ? 'store' : 'blog';
  const pageUrl = item?.url || (cleanSlug ? `${origin}/${locale}/${seg}/${cleanSlug}` : null);
  const gscInspectHref = pageUrl
    ? `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(property)}&id=${encodeURIComponent(pageUrl)}`
    : null;

  return (
    <div className="rounded-[28px] border border-gm-border-soft bg-gm-surface/20 overflow-hidden">
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

      <div className="p-6 space-y-4">
        {!cleanSlug ? (
          <p className="text-sm text-gm-muted font-serif italic">
            Yazıyı kaydedip bir slug oluşturduktan sonra indeks durumu denetlenebilir.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Sonuç</dt>
                <dd className="text-gm-text mt-1">{item ? (GSC_VERDICT_LABELS[item.verdict] ?? item.verdict ?? '—') : 'Denetlenmedi'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kapsam durumu</dt>
                <dd className="text-gm-text mt-1">{item?.coverage_state || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Son tarama (Google)</dt>
                <dd className="text-gm-text mt-1 font-mono text-xs">{fmt(item?.last_crawl)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">Son denetim</dt>
                <dd className="text-gm-text mt-1 font-mono text-xs">{fmt(item?.checked_at)}</dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-gm-border-soft bg-gm-bg-deep/30 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gm-muted mb-1">Neden / Öneri</div>
              <p className="text-sm text-gm-text/90 leading-relaxed">
                {item?.recommendation ||
                  'Bu URL henüz Google’da denetlenmedi. “İnceleme İste” ile canlı durumu çekebilirsiniz.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={requestInspect}
                disabled={disabled || inspectState.isLoading}
                className="rounded-full px-6 h-11 font-bold tracking-widest uppercase text-[10px]"
              >
                <RefreshCcw className={cn('mr-2 size-4', inspectState.isLoading && 'animate-spin')} />
                {item ? 'Yeniden Denetle' : 'İnceleme İste'}
              </Button>
              {gscInspectHref ? (
                <a
                  href={gscInspectHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Search Console'da bu URL'i aç.\nÖNEMLİ: Tarayıcıda GSC property'sinin (${property}) sahibi Google hesabıyla oturum açık olmalı; farklı hesapta Google 404 gösterir.`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gm-muted hover:text-gm-gold transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  GSC’de aç
                </a>
              ) : null}
              {category === 'issue' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gm-error font-bold">
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
