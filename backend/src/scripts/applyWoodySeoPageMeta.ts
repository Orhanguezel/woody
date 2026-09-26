// =============================================================
// seo_pages başlık/açıklama düzeltmesi (2026-09-26, SEO kataloğu denetimi):
//  - 10 dilde 20 sayfanın 16'sında açıklama aynı Türkçe jenerik cümleydi
//    ("Woody and Friends — Okul öncesi İngilizce, atölye ve dijital içerik deneyimi.").
//  - 7 dilde başlık markayı ikiye katlıyordu ("Woody and Friends und Freunde").
//  - Yasal sayfa başlıkları her dilde İngilizceydi; bazı başlıklar 65+ karakterdi.
//  - pt-br satırı yoktu; API tr satırına düşüyor, /pt-br sayfaları Türkçe meta alıyordu.
// Kaynak: data/woody-seo-pages-meta-2026-09-26.json (dil → sayfa → [başlık, açıklama]).
// Yalnız title/description ve og.title/og.description (og.mode 'content' değilse) değişir;
// diğer alanlar korunur. pt-br satırı en satırının yapısından klonlanır.
//
// Varsayılan DRY-RUN. Uygula: bun src/scripts/applyWoodySeoPageMeta.ts --apply
// Not: serverMetadata seo_pages'i ~600 sn cache'ler.
// =============================================================
import 'dotenv/config';

import { readFileSync } from 'node:fs';

import mysql from 'mysql2/promise';

const APPLY = process.argv.includes('--apply');
type Meta = Record<string, Record<string, [string, string]>>;
const META: Meta = JSON.parse(readFileSync(new URL('./data/woody-seo-pages-meta-2026-09-26.json', import.meta.url), 'utf8'));

function databaseConfig() {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!String(process.env[key] || '').trim()) throw new Error(`Missing database environment: ${key}`);
  }
  return {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    charset: 'utf8mb4',
  };
}

function validate() {
  for (const [locale, pages] of Object.entries(META)) {
    for (const [key, [title, description]] of Object.entries(pages)) {
      if (title.length > 65 || description.length < 100 || description.length > 165) {
        throw new Error(`${locale}.${key}: başlık ${title.length}, açıklama ${description.length} karakter`);
      }
    }
  }
}

function patchEntry(entry: any, title: string, description: string) {
  const next = { ...(entry ?? {}), title, description };
  if (next.og && typeof next.og === 'object' && next.og.mode !== 'content') {
    // og.alt eski başlığı taşıyordu (7 dilde marka tekrarı dahil); başlıkla eşitlenir.
    next.og = { ...next.og, title, description, alt: title };
  }
  return next;
}

async function main() {
  validate();
  const connection = await mysql.createConnection(databaseConfig());
  try {
    const [enRows] = await connection.query<mysql.RowDataPacket[]>(
      "SELECT value FROM site_settings WHERE `key`='seo_pages' AND locale='en' LIMIT 1",
    );
    if (!enRows[0]) throw new Error('seo_pages en satırı yok');
    const enValue = JSON.parse(String(enRows[0].value));

    let changed = 0;
    for (const [locale, pages] of Object.entries(META)) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        "SELECT id, value FROM site_settings WHERE `key`='seo_pages' AND locale=? LIMIT 1",
        [locale],
      );
      const existing = rows[0];
      const current = existing ? JSON.parse(String(existing.value)) : structuredClone(enValue);
      const next = { ...current };
      const edits: string[] = [];
      for (const [key, [title, description]] of Object.entries(pages)) {
        const base = current[key] ?? (existing ? undefined : enValue[key]);
        if (!base) {
          edits.push(`${key}(yeni)`);
          next[key] = patchEntry(enValue[key] ?? {}, title, description);
          continue;
        }
        const patched = patchEntry(base, title, description);
        if (JSON.stringify(patched) !== JSON.stringify(current[key])) {
          next[key] = patched;
          edits.push(key);
        }
      }
      if (!edits.length && existing) {
        console.log(`SKIP ${locale}: değişiklik yok (idempotent)`);
        continue;
      }
      console.log(`${APPLY ? 'APPLY' : 'PLAN '} ${locale}${existing ? '' : ' (YENİ SATIR)'}: ${edits.length} sayfa — ${edits.join(', ')}`);
      if (APPLY) {
        const value = JSON.stringify(next);
        if (existing) {
          await connection.query('UPDATE site_settings SET value=? WHERE id=?', [value, existing.id]);
        } else {
          await connection.query(
            "INSERT INTO site_settings (id, `key`, locale, value) VALUES (?, 'seo_pages', ?, ?)",
            [`ss-woody-seo-pages-${locale}`, locale, value],
          );
        }
      }
      changed += 1;
    }
    console.log(`${APPLY ? 'Uygulandı' : 'Plan'}: ${changed} dil satırı.${APPLY ? '' : ' Uygulamak için --apply'}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
