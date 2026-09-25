// =============================================================
// AI görünürlük planı (2026-09-25) — canlı DB ayağı:
//  1. Yazar birliği: `Yalçın Karakuş` yazar kaydı kalan yazılar site
//     yazarına (Ayşe Polat Karakuş) çevrilir (2026-08-31 kararı: bu isim
//     hiçbir yerde görünmez). Frontend bu adı /about#author profiline bağlar.
//  2. Altı öncelikli TR rehbere doğrudan cevap, eksik tablo ve
//     "Kaynaklar ve sınırlar" bölümü (woodyGeoCitabilityContent.ts).
//     İçerik değişen yazının blog_posts.updated_at'i güncellenir →
//     Article.dateModified ve byline "Güncelleme" tarihi gerçek değişikliği gösterir.
//
// Varsayılan DRY-RUN. Uygula: bun src/scripts/applyWoodyGeoCitability.ts --apply
// Idempotent: ikinci koşu "değişiklik yok" der.
// Not: blog detay sayfası s-maxage=3600 cache'li; API anında günceldir.
// =============================================================
import 'dotenv/config';

import mysql from 'mysql2/promise';

import { CITABILITY_OPS, applyCitability } from './woodyGeoCitabilityContent';

const APPLY = process.argv.includes('--apply');
const RETIRED_AUTHOR = 'Yalçın Karakuş';
const SITE_AUTHOR = 'Ayşe Polat Karakuş';

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
  const connection = await mysql.createConnection(databaseConfig());
  let changed = 0;
  let failed = 0;
  try {
    const [authorRows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM blog_posts WHERE author = ?',
      [RETIRED_AUTHOR],
    );
    console.log(`${APPLY ? 'APPLY' : 'PLAN '} yazar: ${authorRows.length} yazı "${RETIRED_AUTHOR}" → "${SITE_AUTHOR}"`);
    if (APPLY && authorRows.length) {
      await connection.query('UPDATE blog_posts SET author = ? WHERE author = ?', [SITE_AUTHOR, RETIRED_AUTHOR]);
      changed += authorRows.length;
    }

    for (const op of CITABILITY_OPS) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT blog_post_id, content FROM blog_posts_i18n WHERE slug = ? AND locale = ? LIMIT 1',
        [op.slug, 'tr'],
      );
      const row = rows[0];
      if (!row) {
        console.log(`SKIP ${op.slug}: tr satırı yok`);
        failed += 1;
        continue;
      }
      const result = applyCitability(op, String(row.content || ''));
      if (result.errors.length) {
        console.log(`SKIP ${op.slug}: ${result.errors.join('; ')}`);
        failed += 1;
        continue;
      }
      if (!result.changes.length) {
        console.log(`SKIP ${op.slug}: değişiklik yok (idempotent)`);
        continue;
      }
      console.log(
        `${APPLY ? 'APPLY' : 'PLAN '} ${op.slug}: ${result.changes.join(', ')} (${String(row.content).length} → ${result.html.length} karakter)`,
      );
      if (APPLY) {
        await connection.query('UPDATE blog_posts_i18n SET content = ? WHERE slug = ? AND locale = ?', [
          result.html,
          op.slug,
          'tr',
        ]);
        await connection.query('UPDATE blog_posts SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [row.blog_post_id]);
      }
      changed += 1;
    }
    console.log(`${APPLY ? 'Uygulandı' : 'Plan'}: ${changed} değişiklik, ${failed} atlanan hata. ${APPLY ? '' : 'Uygulamak için --apply'}`);
    if (failed) process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
