'use client';

// =============================================================
// FILE: src/layout/header/MegaMenuPanel.tsx
// Premium mega menu — geniş dropdown panel.
// Sol: kategori link'leri (mevcut child menu items)
// Sağ taraf kaldırıldı; panel yalnızca jenerik menü linklerini gösterir.
// =============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { localizePath } from '@/integrations/shared';

type ChildLink = {
  id: string;
  url?: string;
  title?: string;
};

interface Props {
  /** Soldaki link listesi — mevcut menu children */
  links: ChildLink[];
  locale: string;
  /** Panel başlığı */
  panelEyebrow?: string;
}

const isExternalHref = (href: string) =>
  /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);

const cleanHashLink = (href: string) => {
  if (!href) return href;
  if (href.startsWith('#')) return `/${href.substring(1)}`;
  if (href.startsWith('/#')) return `/${href.substring(2)}`;
  if (href.includes('#')) return `/${href.split('#')[1]}`;
  return href;
};

export default function MegaMenuPanel({
  links,
  locale,
  panelEyebrow,
}: Props) {
  return (
    <div className="w-[min(680px,95vw)] bg-[var(--gm-surface)]/95 border border-[var(--gm-border-soft)] rounded-[24px] shadow-[var(--gm-shadow-card)] backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
      {/* Premium Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[var(--gm-primary)] via-[var(--gm-gold)] to-[var(--gm-accent)] opacity-80" />

      <div className="p-8 md:p-10">
          {panelEyebrow && (
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-[var(--gm-primary)]/30" />
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--gm-primary)]">
                {panelEyebrow}
              </p>
            </div>
          )}
          
          <ul className="list-none m-0 p-0 space-y-2">
            {links.length > 0 ? links.map((child) => {
              const cUrl = child.url || '#';
              const cHref = isExternalHref(cUrl) ? cUrl : localizePath(locale, cleanHashLink(cUrl));
              return (
                <li key={child.id}>
                  <Link
                    href={cHref}
                    className="group flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-[15px] text-[var(--gm-text)] hover:bg-[var(--gm-primary)]/10 hover:text-[var(--gm-primary)] transition-all duration-300"
                  >
                    <span className="font-serif tracking-wide">{child.title || 'Kategori'}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--gm-primary)]" />
                  </Link>
                </li>
              );
            }) : (
              <li className="px-5 py-4 text-sm text-[var(--gm-muted)] italic">Henüz kategori bulunmuyor.</li>
            )}
          </ul>
      </div>
    </div>
  );
}
