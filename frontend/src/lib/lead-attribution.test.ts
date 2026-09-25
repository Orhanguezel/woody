/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import { aiAssistantSource, leadAttributionParams } from './lead-attribution';

describe('lead attribution', () => {
  test('AI asistan yönlendiricilerini tanır, benzer adları tanımaz', () => {
    expect(aiAssistantSource('https://chatgpt.com/')).toBe('chatgpt.com');
    expect(aiAssistantSource('https://gemini.google.com/app')).toBe('gemini.google.com');
    expect(aiAssistantSource('https://www.perplexity.ai/search')).toBe('perplexity.ai');
    expect(aiAssistantSource('chatgpt.com')).toBe('chatgpt.com');
    expect(aiAssistantSource('https://www.google.com/')).toBe('');
    expect(aiAssistantSource('https://notchatgpt.com/')).toBe('');
    expect(aiAssistantSource(undefined)).toBe('');
  });

  test('izin varsa açılış sayfası, referrer host ve AI kaynağı eklenir', () => {
    expect(
      leadAttributionParams({
        consentState: 'granted',
        landingUrl: '/tr/blog/6-yas-ingilizce-egitimi',
        referrer: 'https://chatgpt.com/',
      }),
    ).toEqual({
      landing_page: '/tr/blog/6-yas-ingilizce-egitimi',
      referrer_host: 'chatgpt.com',
      ai_source: 'chatgpt.com',
    });
  });

  test('referrer yoksa utm_source ile AI kaynağı bulunur', () => {
    expect(
      leadAttributionParams({ consentState: 'granted', landingUrl: '/tr', source: 'chatgpt.com' }),
    ).toEqual({ landing_page: '/tr', ai_source: 'chatgpt.com' });
  });

  test('izin yoksa hiçbir parametre eklenmez', () => {
    expect(
      leadAttributionParams({ consentState: 'denied', landingUrl: '/tr', referrer: 'https://chatgpt.com/' }),
    ).toEqual({});
    expect(leadAttributionParams(null)).toEqual({});
  });
});
