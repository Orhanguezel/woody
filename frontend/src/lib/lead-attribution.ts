// =============================================================
// FILE: src/lib/lead-attribution.ts
// Lead olaylarına (generate_lead / whatsapp_click / phone_click) oturumun
// açılış sayfası ve yönlendiren kaynağını ekler. Böylece GA4'te
// "AI asistan → açılış sayfası → CTA → lead" zinciri tek olayda okunur.
// Kaynak: commerce-attribution'ın oturum kaydı (yalnız analitik izni varsa
// yazılır). İzin yoksa hiçbir ek parametre gönderilmez.
// AI host listesi Tanitio `backend/src/modules/seo/ai-traffic.ts` ile aynıdır.
// =============================================================
import { COMMERCE_ATTRIBUTION_STORAGE_KEY, type CommerceAttribution } from './commerce-attribution';

export const AI_ASSISTANT_HOSTS = [
  'chatgpt.com', 'chat.openai.com', 'openai.com',
  'claude.ai', 'anthropic.com',
  'perplexity.ai',
  'gemini.google.com', 'bard.google.com',
  'copilot.microsoft.com', 'copilot.com',
  'you.com', 'phind.com', 'poe.com', 'meta.ai',
  'deepseek.com', 'grok.com', 'x.ai', 'mistral.ai',
] as const;

function hostOf(value: string | undefined): string {
  if (!value) return '';
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    // utm_source=chatgpt.com gibi çıplak host değerleri
    return value.trim().toLowerCase().replace(/^www\./, '').split('/')[0] ?? '';
  }
}

/** Host bir AI asistanına aitse kanonik host adını döner, değilse ''. */
export function aiAssistantSource(value: string | undefined): string {
  const host = hostOf(value);
  if (!host) return '';
  return AI_ASSISTANT_HOSTS.find((known) => host === known || host.endsWith(`.${known}`)) ?? '';
}

export function leadAttributionParams(saved: CommerceAttribution | null): Record<string, string> {
  if (!saved || saved.consentState !== 'granted') return {};
  const referrerHost = hostOf(saved.referrer);
  // ChatGPT gibi asistanlar bağlantıya utm_source ekler; referrer boş gelse de yakalanır.
  const aiSource = aiAssistantSource(saved.referrer) || aiAssistantSource(saved.source);
  return {
    ...(saved.landingUrl ? { landing_page: saved.landingUrl } : {}),
    ...(referrerHost ? { referrer_host: referrerHost } : {}),
    ...(aiSource ? { ai_source: aiSource } : {}),
  };
}

export function readLeadAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(COMMERCE_ATTRIBUTION_STORAGE_KEY);
    return raw ? leadAttributionParams(JSON.parse(raw) as CommerceAttribution) : {};
  } catch {
    return {};
  }
}
