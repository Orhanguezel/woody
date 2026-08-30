'use client';

import { Check, Gauge, Lightbulb, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  PRODUCT_SEO_CHECK_META,
  type ProductSeoQualityScore,
} from '@/integrations/shared/product-seo-quality';

const LEVELS = {
  ready: { label: 'SEO hazır', color: 'text-gm-success', border: 'border-gm-success/30', bar: 'bg-gm-success' },
  publishable: { label: 'Geliştirilmeli', color: 'text-gm-gold', border: 'border-gm-gold/30', bar: 'bg-gm-gold' },
  fail: { label: 'SEO yetersiz', color: 'text-gm-error', border: 'border-gm-error/30', bar: 'bg-gm-error' },
} as const;

export default function ProductSeoQualityPanel({ score }: { score: ProductSeoQualityScore }) {
  const level = LEVELS[score.level];
  const groups = Object.entries(score.checks).reduce<
    Record<string, Array<{ key: string; ok: boolean; label: string; points: number }>>
  >((result, [key, ok]) => {
    const meta = PRODUCT_SEO_CHECK_META[key];
    if (meta) (result[meta.group] ||= []).push({ key, ok, label: meta.label, points: meta.points });
    return result;
  }, {});

  return (
    <Card className="overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-surface/20 shadow-xl">
      <CardHeader className="border-b border-gm-border-soft bg-gm-surface/40 p-8 pb-4">
        <CardTitle className="flex items-center gap-3 font-serif text-2xl">
          <Gauge className="size-5 text-gm-gold" />
          Ürün SEO Puanı
        </CardTitle>
        <CardDescription className="font-serif italic text-gm-muted">
          Form değiştikçe canlı hesaplanır · hedef 80+
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="flex items-center gap-5">
          <div className={cn('flex size-20 flex-col items-center justify-center rounded-full border-4', level.border)}>
            <span className={cn('text-2xl font-black', level.color)}>{score.score}</span>
            <span className="text-[9px] font-bold text-gm-muted">/ 100</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className={cn('font-bold', level.color)}>{level.label}</div>
            <div className="h-2 overflow-hidden rounded-full bg-gm-surface">
              <div className={cn('h-full transition-all', level.bar)} style={{ width: `${score.score}%` }} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gm-muted">
              {score.gate_passed ? 'Temel SEO koşulları geçti' : 'Temel SEO alanları eksik'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl border border-gm-border-soft p-2">Meta title: {score.meta_title_length}/65</div>
          <div className="rounded-xl border border-gm-border-soft p-2">Meta açıklama: {score.meta_description_length}/170</div>
        </div>

        {Object.entries(groups).map(([group, checks]) => (
          <div key={group} className="space-y-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gm-muted">{group}</div>
            {checks.map((check) => (
              <div key={check.key} className="flex items-center gap-2 text-xs">
                <span className={cn('flex size-4 items-center justify-center rounded-full', check.ok ? 'bg-gm-success/15 text-gm-success' : 'bg-gm-error/15 text-gm-error')}>
                  {check.ok ? <Check className="size-3" /> : <X className="size-3" />}
                </span>
                <span className={check.ok ? 'text-gm-text' : 'text-gm-muted'}>{check.label}</span>
                <span className="ml-auto font-mono text-[10px] text-gm-muted">{check.ok ? `+${check.points}` : '0'}</span>
              </div>
            ))}
          </div>
        ))}

        {score.recommendations.length ? (
          <div className="space-y-2 rounded-2xl border border-gm-gold/20 bg-gm-gold/5 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gm-gold">
              <Lightbulb className="size-3.5" /> Öneriler
            </div>
            {score.recommendations.map((recommendation) => (
              <p key={recommendation} className="text-xs text-gm-muted">→ {recommendation}</p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
