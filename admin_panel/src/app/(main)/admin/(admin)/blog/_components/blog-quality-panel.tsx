'use client';

import * as React from 'react';
import { Check, Gauge, Lightbulb, X } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BlogSeoQualityScore } from '@/integrations/shared';
import { BLOG_SEO_CHECK_META } from '@/integrations/shared/blog-seo-quality';

const LEVEL_META: Record<
  BlogSeoQualityScore['level'],
  { label: string; text: string; ring: string; bar: string }
> = {
  ready: { label: 'Yayına hazır', text: 'text-gm-success', ring: 'border-gm-success/30', bar: 'bg-gm-success' },
  publishable: { label: 'Geliştirilmeli', text: 'text-gm-gold', ring: 'border-gm-gold/30', bar: 'bg-gm-gold' },
  fail: { label: 'Yayınlanamaz', text: 'text-gm-error', ring: 'border-gm-error/30', bar: 'bg-gm-error' },
};

export default function BlogQualityPanel({ score }: { score: BlogSeoQualityScore }) {
  const level = LEVEL_META[score.level];

  const groups = React.useMemo(() => {
    const acc: Record<string, { code: string; ok: boolean; label: string; points: number }[]> = {};
    for (const [code, ok] of Object.entries(score.checks)) {
      const meta = BLOG_SEO_CHECK_META[code];
      if (!meta) continue;
      (acc[meta.group] ||= []).push({ code, ok, label: meta.label, points: meta.points });
    }
    return Object.entries(acc);
  }, [score.checks]);

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
        <CardTitle className="font-serif text-2xl flex items-center gap-3">
          <Gauge className="h-5 w-5 text-gm-gold" />
          İçerik Kalitesi
        </CardTitle>
        <CardDescription className="font-serif italic text-gm-muted opacity-70">
          Yazarken canlı puanlanır · hedef 80+
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Score */}
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 bg-gm-surface/40',
              level.ring,
            )}
          >
            <span className={cn('text-2xl font-black leading-none', level.text)}>{score.score}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gm-muted">/ 100</span>
          </div>
          <div className="space-y-1.5">
            <div className={cn('text-lg font-bold', level.text)}>{level.label}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                  score.gate_passed
                    ? 'bg-gm-success/10 text-gm-success'
                    : 'bg-gm-error/10 text-gm-error',
                )}
              >
                {score.gate_passed ? 'Sert kapı geçti' : 'Sert kapı kaldı'}
              </span>
            </div>
            <div className="h-1.5 w-44 max-w-full overflow-hidden rounded-full bg-gm-surface">
              <div className={cn('h-full rounded-full transition-all', level.bar)} style={{ width: `${score.score}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Kelime', value: String(score.word_count) },
            { label: 'Yoğunluk', value: `%${score.keyword_density}` },
            { label: 'Geçiş', value: String(score.keyword_occurrences) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-3 text-center">
              <div className="text-lg font-bold text-gm-text">{stat.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gm-muted">{stat.label}</div>
            </div>
          ))}
        </div>
        {score.target_keyword ? (
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/30 px-4 py-2.5 text-xs">
            <span className="font-bold uppercase tracking-widest text-gm-muted text-[9px]">Odak kelime</span>{' '}
            <span className="text-gm-text">{score.target_keyword}</span>
          </div>
        ) : null}

        {/* Checks */}
        <div className="space-y-4">
          {groups.map(([group, items]) => (
            <div key={group} className="space-y-1.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gm-muted">{group}</div>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.code} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full',
                        item.ok ? 'bg-gm-success/15 text-gm-success' : 'bg-gm-error/15 text-gm-error',
                      )}
                    >
                      {item.ok ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <span className={cn(item.ok ? 'text-gm-text' : 'text-gm-muted')}>{item.label}</span>
                    <span className="ml-auto font-mono text-[10px] text-gm-muted/70">
                      {item.ok ? `+${item.points}` : '0'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {score.recommendations.length > 0 ? (
          <div className="space-y-2 rounded-2xl border border-gm-gold/20 bg-gm-gold/5 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gm-gold">
              <Lightbulb className="size-3.5" />
              Öneriler
            </div>
            <ul className="space-y-1.5">
              {score.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-xs text-gm-muted">
                  <span className="text-gm-gold">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
