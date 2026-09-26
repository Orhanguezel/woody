/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Mağaza/sepet/checkout metinleri: tr'de olan her ui anahtarı 10 dilin hepsinde dolu olmalı.
const DIRS = ['tr', 'en', 'de', 'ar', 'fr', 'ru', 'es', 'it', 'nl', 'pt-BR'];
const load = (dir: string) =>
  (JSON.parse(readFileSync(join(import.meta.dir, dir, 'store-products.json'), 'utf8')).ui ?? {}) as Record<string, string>;

describe('store-products ui i18n', () => {
  const base = load('tr');
  for (const dir of DIRS.slice(1)) {
    test(`${dir} tüm anahtarları içerir`, () => {
      const ui = load(dir);
      const missing = Object.keys(base).filter((key) => !String(ui[key] ?? '').trim());
      expect(missing).toEqual([]);
    });
  }
});
