/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { STATIC_UI } from './staticUi';

// Koddaki her tUi(locale, 'anahtar') / t('anahtar') çevirisinin 10 dilde de olması:
// eksik dilde tUi anahtarın kendisini (çoğu zaman Türkçe) basar.
const LOCALES = ['tr', 'en', 'de', 'ar', 'fr', 'ru', 'es', 'it', 'nl', 'pt-br'];
const SRC = join(import.meta.dir, '..');

function files(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, out);
    else if (/\.tsx?$/.test(name) && !/\.test\./.test(name)) out.push(path);
  }
  return out;
}

describe('tUi translation coverage', () => {
  test('kullanılan her anahtar 10 dilde çevrilmiş', () => {
    const gaps: string[] = [];
    for (const file of files(SRC)) {
      const src = readFileSync(file, 'utf8');
      const aliasT = /const t = \((?:key|k)[^)]*\) => tUi\(/.test(src);
      const re = aliasT ? /\b(?:tUi\([^,()]+,\s*|t\()(['"])((?:(?!\1).)+)\1\s*\)/g : /\btUi\([^,()]+,\s*(['"])((?:(?!\1).)+)\1\s*\)/g;
      for (const match of src.matchAll(re)) {
        const row = STATIC_UI[match[2]];
        const missing = row ? LOCALES.filter((locale) => !row[locale]) : LOCALES;
        if (missing.length) gaps.push(`${relative(SRC, file)}: "${match[2]}" [${missing.join(',')}]`);
      }
    }
    expect(gaps).toEqual([]);
  });
});
