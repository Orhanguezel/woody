/** Shared focus ring for interactive elements (a11y cila — görünüm değişmez). */
export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gm-primary)]/35 focus-visible:ring-offset-2';

/** Auth / form text fields (mevcut focus:border korunur). */
export const AUTH_FIELD_CLS =
  'w-full rounded-sm border border-border-light bg-bg-card px-4 py-3 text-text-primary transition-all placeholder:text-text-muted focus:border-brand-primary focus:outline-none';
