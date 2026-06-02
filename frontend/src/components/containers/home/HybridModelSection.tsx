import React from 'react';
import { Sparkles, Users } from 'lucide-react';
import { getPublicAppName } from '@/lib/site-config';
import homeHybridModel from '@/config/pages/home-hybrid-model.json';

type HybridCopy = {
  eyebrow: string;
  title: string;
  description: string;
  ai: { title: string; text: string };
  human: { title: string; text: string };
  bridge: string;
  stats: { num: string; label: string }[];
};

export default function HybridModelSection({ locale = 'tr' }: { locale?: string }) {
  const appName = getPublicAppName();
  const raw = homeHybridModel as Record<string, HybridCopy>;
  const copy = raw[locale] || raw[locale.split('-')[0]] || raw.tr;
  const desc = copy.description.replace(/\{\{appName\}\}/g, appName);

  return (
    <section className="py-32 px-6 bg-[var(--gm-bg-deep)] relative overflow-hidden text-[var(--gm-text)] border-y border-[var(--gm-border-soft)]">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--gm-gold)] opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[var(--gm-gold)] opacity-[0.04] blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-20 reveal">
          <span className="section-label !text-[var(--gm-gold-deep)] before:bg-[var(--gm-gold)]">{copy.eyebrow}</span>
          <h2
            className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic font-light text-[var(--gm-text)] leading-tight mb-6"
            dangerouslySetInnerHTML={{ __html: copy.title }}
          />
          <p className="text-[var(--gm-text-dim)] max-w-2xl mx-auto leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch gap-8 lg:gap-0 reveal">
          {/* AI Side */}
          <div className="p-12 border border-[var(--gm-gold)]/30 bg-[var(--gm-surface)]/70 text-center flex flex-col items-center rounded-sm">
            <div className="w-14 h-14 rounded-full bg-[var(--gm-gold)]/15 flex items-center justify-center text-[var(--gm-gold-deep)] mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="font-display text-sm tracking-[0.2em] text-[var(--gm-gold-deep)] mb-4 uppercase">{copy.ai.title}</h3>
            <p className="text-sm text-[var(--gm-text-dim)] leading-relaxed">
              {copy.ai.text}
            </p>
          </div>

          {/* Bridge */}
          <div className="flex flex-row lg:flex-col items-center justify-center py-6 lg:py-0 px-8 relative">
            <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[var(--gm-gold)]/40" />
            <div className="w-14 h-14 rounded-full border border-[var(--gm-gold)] bg-[var(--gm-bg-deep)] flex items-center justify-center relative z-10">
              <span className="font-display text-[9px] tracking-[0.2em] text-[var(--gm-gold-deep)]">{copy.bridge}</span>
            </div>
          </div>

          {/* Human Side */}
          <div className="p-12 border border-[var(--gm-gold)]/30 bg-[var(--gm-surface)]/70 text-center flex flex-col items-center rounded-sm">
            <div className="w-14 h-14 rounded-full bg-[var(--gm-gold)]/15 flex items-center justify-center text-[var(--gm-gold-deep)] mb-6">
              <Users size={28} />
            </div>
            <h3 className="font-display text-sm tracking-[0.2em] text-[var(--gm-gold-deep)] mb-4 uppercase">{copy.human.title}</h3>
            <p className="text-sm text-[var(--gm-text-dim)] leading-relaxed">
              {copy.human.text}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-[var(--gm-border-soft)] reveal">
          {copy.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl text-[var(--gm-gold-deep)] mb-1">{s.num}</div>
              <div className="font-display text-[9px] tracking-[0.3em] text-[var(--gm-muted)] uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
