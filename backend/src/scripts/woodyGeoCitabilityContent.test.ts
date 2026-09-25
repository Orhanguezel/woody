import { describe, expect, test } from 'bun:test';

import { CITABILITY_OPS, applyCitability } from './woodyGeoCitabilityContent';

const op = CITABILITY_OPS.find((item) => item.slug === '6-yas-ingilizce-egitimi')!;
const sample =
  '<p>Giriş</p><h2>6 Yaş İçin Etkili Öğretim Yöntemleri</h2><p>Yöntem</p>' +
  '<h2>Sıkça Sorulan Sorular (FAQ)</h2><h3>Soru?</h3><p>Cevap</p>';

describe('applyCitability', () => {
  test('doğrudan cevap, tablo ve kaynak bölümü ekler; ikinci koşu değişiklik yapmaz', () => {
    const first = applyCitability(op, sample);
    expect(first.errors).toEqual([]);
    expect(first.html.startsWith('<p><strong>6 yaş İngilizce eğitimi nasıl planlanmalı?</strong>')).toBe(true);
    expect(first.html).toContain('<table>');
    expect(first.html.indexOf('<h2>Kaynaklar ve sınırlar</h2>')).toBeLessThan(
      first.html.indexOf('<h2>Sıkça Sorulan Sorular (FAQ)</h2>'),
    );
    expect(first.html).toContain('cambridgeenglish.org');
    const second = applyCitability(op, first.html);
    expect(second.changes).toEqual([]);
    expect(second.html).toBe(first.html);
  });

  test('çapa bulunamazsa yazı yarım değiştirilmez', () => {
    const broken = '<p>Giriş</p><h2>Başka başlık</h2>';
    const result = applyCitability(op, broken);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.html).toBe(broken);
  });

  test('kaynak bölümü kurumun onayladığını iddia etmez', () => {
    const html = applyCitability(op, sample).html;
    expect(html).toContain('onayladığı anlamına gelmez');
  });
});
