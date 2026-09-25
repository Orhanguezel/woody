/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import { extractVisibleFaq } from './blog-faq';

describe('extractVisibleFaq', () => {
  test('görünür SSS bölümündeki soru-cevapları alır, sonraki h2 ve CTA paragrafını almaz', () => {
    const html =
      '<p>Giriş</p><h2>Sıkça Sorulan Sorular (FAQ)</h2>' +
      '<h3>6 yaşında başlamak geç mi?</h3>\n<p>Hayır. Altı yaş verimli bir dönemdir.</p>' +
      '<h3>Günde ne kadar yeterli?</h3><p>Günde 15&ndash;20 dakika.</p><p>Bize ulaşın.</p>' +
      '<h2>Yaşa göre rehberler</h2><h3>Başka</h3><p>Dahil değil</p>';
    const items = extractVisibleFaq(html);
    expect(items.map((item) => item.question)).toEqual(['6 yaşında başlamak geç mi?', 'Günde ne kadar yeterli?']);
    expect(items[0].answer).toBe('Hayır. Altı yaş verimli bir dönemdir.');
    expect(items[1].answer).toBe('Günde 15–20 dakika.');
  });

  test('SSS bölümü yoksa şema üretilmez', () => {
    expect(extractVisibleFaq('<h2>Konu</h2><h3>Soru?</h3><p>Cevap</p>')).toEqual([]);
    expect(extractVisibleFaq(null)).toEqual([]);
  });
});
