import 'server-only';

import type { WoodyPageContent } from '@/components/woody/content-loader.server';
import { injectAppName } from '@/lib/page-copy';
import { getPublicAppName } from '@/lib/site-config';

export type AnswerIntroData = { text: string; links: Array<{ href: string; label: string }> };

/**
 * Sayfa içeriğindeki `answerIntro` (+ isteğe bağlı `answerIntroLinks`) alanını
 * {{appName}} çözülmüş, dil önekli bağlantılarla döner. Değer yoksa null.
 */
export function answerIntroFromContent(content: WoodyPageContent | null | undefined, locale: string): AnswerIntroData | null {
  const raw = (content?.raw ?? {}) as Record<string, unknown>;
  const text = injectAppName(String(raw.answerIntro ?? ''), getPublicAppName()).trim();
  if (!text) return null;
  const links = (Array.isArray(raw.answerIntroLinks) ? raw.answerIntroLinks : [])
    .map((link) => link as { href?: unknown; label?: unknown })
    .filter((link) => typeof link.href === 'string' && typeof link.label === 'string')
    .map((link) => ({ href: `/${locale}${String(link.href)}`, label: String(link.label) }));
  return { text, links };
}
