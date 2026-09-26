// =============================================================
// Katalog çevirisi (2026-09-26): 7 dilde (ar/es/fr/it/nl/pt-br/ru) ürün, kategori ve
// seri çeviri satırları Türkçe'nin birebir kopyasıydı; de'de 9 ürün adı da öyle.
// Sepet/mağaza/checkout bu dillerde Türkçe ürün adı ve rozet gösteriyordu.
// Kaynak: data/woody-catalog-i18n-2026-09-26.json.
//
// Kural (deterministik + güvenli): bir alan YALNIZ mevcut değer Türkçe satırla aynıysa
// ya da boşsa güncellenir; elle çevrilmiş içerik asla ezilmez. Eksik satır eklenmez
// (slug/URL gerektirir). Slug'lara dokunulmaz.
//
// Varsayılan DRY-RUN. Uygula: bun src/scripts/applyWoodyCatalogI18n.ts --apply
// =============================================================
import 'dotenv/config';

import { readFileSync } from 'node:fs';

import mysql from 'mysql2/promise';

const APPLY = process.argv.includes('--apply');
type Fields = Record<string, string>;
type Data = {
  productSuffixes: Record<string, Record<string, Fields>>;
  categories: Record<string, Record<string, Record<string, string>>>;
  series: Record<string, Record<string, Record<string, string>>>;
};
const DATA: Data = JSON.parse(readFileSync(new URL('./data/woody-catalog-i18n-2026-09-26.json', import.meta.url), 'utf8'));

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

async function main() {
  const db = await mysql.createConnection(databaseConfig());
  let updates = 0;
  let skipped = 0;

  async function translateRow(table: string, idColumn: string, id: string, locale: string, fields: Fields) {
    const columns = Object.keys(fields);
    const [trRows] = await db.query<mysql.RowDataPacket[]>(
      `SELECT ${columns.join(', ')} FROM ${table} WHERE ${idColumn} = ? AND locale = 'tr' LIMIT 1`,
      [id],
    );
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      `SELECT ${columns.join(', ')} FROM ${table} WHERE ${idColumn} = ? AND locale = ? LIMIT 1`,
      [id, locale],
    );
    const tr = trRows[0];
    const row = rows[0];
    if (!tr || !row) {
      skipped += 1;
      return;
    }
    const changes = columns.filter((column) => {
      const current = row[column] == null ? '' : String(row[column]);
      const untranslated = current.trim() === '' || current === String(tr[column] ?? '');
      return untranslated && current !== fields[column];
    });
    if (!changes.length) return;
    updates += changes.length;
    console.log(`${APPLY ? 'APPLY' : 'PLAN '} ${table} ${id.slice(-6)} ${locale}: ${changes.map((c) => `${c}="${fields[c]}"`).join(', ').slice(0, 160)}`);
    if (APPLY) {
      await db.query(
        `UPDATE ${table} SET ${changes.map((c) => `${c} = ?`).join(', ')} WHERE ${idColumn} = ? AND locale = ?`,
        [...changes.map((c) => fields[c]), id, locale],
      );
    }
  }

  try {
    for (const [suffix, locales] of Object.entries(DATA.productSuffixes)) {
      const [ids] = await db.query<mysql.RowDataPacket[]>(
        `SELECT DISTINCT product_id FROM product_i18n
          WHERE product_id LIKE ? AND product_id IN (SELECT product_id FROM product_i18n WHERE locale = 'ar')`,
        [`%${suffix}`],
      );
      if (ids.length !== 1) {
        console.log(`SKIP ürün *${suffix}: ${ids.length} eşleşme (1 beklenir)`);
        skipped += 1;
        continue;
      }
      for (const [locale, fields] of Object.entries(locales)) {
        await translateRow('product_i18n', 'product_id', String(ids[0].product_id), locale, fields);
      }
    }
    for (const [id, fieldsByName] of Object.entries(DATA.categories)) {
      for (const locale of Object.keys(fieldsByName.name)) {
        const fields = Object.fromEntries(Object.entries(fieldsByName).map(([field, byLocale]) => [field, byLocale[locale]]));
        await translateRow('category_i18n', 'category_id', id, locale, fields);
      }
    }
    for (const [id, fieldsByName] of Object.entries(DATA.series)) {
      for (const locale of Object.keys(fieldsByName.name)) {
        const fields = Object.fromEntries(Object.entries(fieldsByName).map(([field, byLocale]) => [field, byLocale[locale]]));
        await translateRow('product_series_i18n', 'series_id', id, locale, fields);
      }
    }
    console.log(`${APPLY ? 'Uygulandı' : 'Plan'}: ${updates} alan, ${skipped} satır atlandı.${APPLY ? '' : ' Uygulamak için --apply'}`);
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
