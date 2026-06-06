// =============================================================
// FILE: src/components/common/public/SocialLinks.tsx
// – Social Icons (shared) — circular buttons, pure Tailwind (no styled-jsx)
//   tone="dark" => light icons on dark surfaces (footer)
//   tone="light" => dark icons on light surfaces (offcanvas/default)
// =============================================================
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

import { IconFacebook, IconInstagram, IconLinkedIn, IconTwitterX, IconYoutube } from '@/components/ui/icons';

export type SocialLinksMap = Record<string, string>;

type SocialItem = {
  key: string;
  label: string;
  url: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
};

export type SocialLinksProps = {
  socials?: SocialLinksMap | null;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  withLabels?: boolean; // default: false (icons only)
  onClickItem?: () => void;
};

const normalizeUrl = (u?: string) => {
  if (!u) return '';
  const s = String(u).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
};

const SIZE_MAP: Record<'sm' | 'md' | 'lg', { box: string; icon: string }> = {
  sm: { box: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { box: 'h-10 w-10', icon: 'h-[18px] w-[18px]' },
  lg: { box: 'h-12 w-12', icon: 'h-5 w-5' },
};

const TONE_MAP: Record<'light' | 'dark', string> = {
  light: 'bg-black/5 text-[var(--gm-text)] hover:bg-[var(--gm-primary)] hover:text-white',
  dark: 'bg-white/10 text-white/90 hover:bg-[var(--gm-primary)] hover:text-white',
};

export const SocialLinks: React.FC<SocialLinksProps> = ({
  socials,
  className,
  itemClassName,
  iconClassName,
  size = 'md',
  tone = 'light',
  withLabels = false,
  onClickItem,
}) => {
  const items = useMemo<SocialItem[]>(() => {
    const s = (socials ?? {}) as any;

    const fb = normalizeUrl(s.facebook || s.fb);
    const tw = normalizeUrl(s.twitter || s.x);
    const yt = normalizeUrl(s.youtube || s.yt);
    const li = normalizeUrl(s.linkedin || s.in || s.li);
    const ig = normalizeUrl(s.instagram || s.ig);

    return [
      fb && { key: 'facebook', label: 'Facebook', url: fb, Icon: IconFacebook },
      tw && { key: 'twitter', label: 'X (Twitter)', url: tw, Icon: IconTwitterX },
      yt && { key: 'youtube', label: 'YouTube', url: yt, Icon: IconYoutube },
      li && { key: 'linkedin', label: 'LinkedIn', url: li, Icon: IconLinkedIn },
      ig && { key: 'instagram', label: 'Instagram', url: ig, Icon: IconInstagram },
    ].filter(Boolean) as SocialItem[];
  }, [socials]);

  if (!items.length) return null;

  const sz = SIZE_MAP[size];
  const toneCls = TONE_MAP[tone];

  return (
    <ul className={`m-0 flex list-none flex-wrap items-center gap-2.5 p-0 ${className ?? ''}`}>
      {items.map(({ key, label, url, Icon }) => (
        <li key={key} className={itemClassName}>
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={onClickItem}
            className={`inline-flex ${sz.box} items-center justify-center rounded-full no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.22)] ${toneCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gm-primary)]/40 focus-visible:ring-offset-2`}
          >
            <Icon className={`${sz.icon} ${iconClassName ?? ''}`} />
            {withLabels ? <span className="ml-2 text-[13px] leading-none">{label}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
