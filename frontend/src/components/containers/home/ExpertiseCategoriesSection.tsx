'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { localizePath } from '@/integrations/shared';
import {
  BookOpen,
  Layers,
  Sprout,
  Shield,
  Droplets,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import categoriesJson from '@/config/pages/home-expertise-categories.json';
import sectionJson from '@/config/pages/home-expertise-section.json';

type LocaleKey = 'tr' | 'en' | 'de';

type Cat = { id: string; label: string; desc: string };

type Section = {
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  subtitle: string;
  cta: string;
};

function pickLocaleKey(locale: string): LocaleKey {
  const k = locale.split('-')[0]?.toLowerCase();
  if (k === 'de') return 'de';
  if (k === 'en') return 'en';
  return 'tr';
}

const ICONS: Record<string, LucideIcon> = {
  bitki: BookOpen,
  tohum: Sprout,
  koruma: Shield,
  toprak: Layers,
  sulama: Droplets,
  uretim: Sprout,
  education: BookOpen,
};

export default function ExpertiseCategoriesSection({ locale = 'tr' }: { locale?: string }) {
  const { categories, section } = useMemo(() => {
    const lk = pickLocaleKey(locale);
    const catRaw = categoriesJson as Record<LocaleKey, Cat[]>;
    const secRaw = sectionJson as Record<LocaleKey, Section>;
    return {
      categories: catRaw[lk] || catRaw.en || [],
      section: secRaw[lk] || secRaw.en,
    };
  }, [locale]);

  return (
    <section id="konular" className="scroll-mt-32 py-24 bg-[var(--gm-bg)] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="font-display text-[10px] tracking-[0.5em] text-[var(--gm-gold-deep)] uppercase mb-4 block">
            {section.eyebrow}
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--gm-text)] mb-6">
            {section.titleBefore}
            <span className="text-[var(--gm-gold)]">{section.titleAccent}</span>
          </h2>
          <p className="font-serif italic text-[var(--gm-text-dim)] max-w-2xl mx-auto">
            {section.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const Icon = ICONS[cat.id] || Layers;
            return (
              <div
                key={cat.id}
                className="reveal"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <Link
                  href={`${localizePath(locale, '/explore')}?alan=${encodeURIComponent(cat.id)}`}
                  className="group p-8 rounded-3xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/20 hover:border-[var(--gm-gold)]/40 transition-all duration-500 block h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                    <Icon size={120} strokeWidth={0.5} className="text-[var(--gm-gold)]" />
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--gm-gold)]/10 text-[var(--gm-gold)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-glow-gold/10">
                      <Icon size={28} />
                    </div>

                    <h3 className="font-serif text-2xl text-[var(--gm-text)] mb-3 group-hover:text-[var(--gm-gold)] transition-colors">
                      {cat.label}
                    </h3>

                    <p className="text-sm text-[var(--gm-text-dim)] leading-relaxed mb-8 flex-grow">
                      {cat.desc}
                    </p>

                    <div className="flex items-center gap-2 text-[var(--gm-gold)] font-display text-[10px] tracking-widest uppercase font-bold group/btn">
                      <span>{section.cta}</span>
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
