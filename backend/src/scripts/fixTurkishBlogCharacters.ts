import 'dotenv/config';

import mysql, { type RowDataPacket } from 'mysql2/promise';

const APPLY = process.argv.includes('--apply');
const TEXT_FIELDS = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'] as const;

type BlogTranslation = RowDataPacket & {
  blog_post_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
};

function databaseConfig() {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!String(process.env[key] || '').trim()) {
      throw new Error(`Missing database environment: ${key}`);
    }
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

function fixPlainText(value: string): string {
  return value.replace(/hikaye/g, 'hikâye').replace(/Hikaye/g, 'Hikâye');
}

function fixHtmlTextNodes(html: string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith('<') ? part : fixPlainText(part)))
    .join('');
}

async function main() {
  const connection = await mysql.createConnection(databaseConfig());
  let changedRows = 0;
  let changedOccurrences = 0;

  try {
    const [rows] = await connection.query<BlogTranslation[]>(
      `SELECT blog_post_id, slug, title, excerpt, content, meta_title, meta_description
         FROM blog_posts_i18n
        WHERE locale = 'tr'
        ORDER BY slug`,
    );

    for (const row of rows) {
      const next = Object.fromEntries(
        TEXT_FIELDS.map((field) => {
          const current = row[field];
          if (current === null) return [field, null];
          return [field, field === 'content' ? fixHtmlTextNodes(current) : fixPlainText(current)];
        }),
      ) as Record<(typeof TEXT_FIELDS)[number], string | null>;

      const changedFields = TEXT_FIELDS.filter((field) => next[field] !== row[field]);
      if (changedFields.length === 0) continue;

      changedRows += 1;
      for (const field of changedFields) {
        const before = String(row[field] || '');
        const after = String(next[field] || '');
        changedOccurrences += (after.match(/hikâye/gi) || []).length - (before.match(/hikâye/gi) || []).length;
      }

      console.log(`${APPLY ? 'APPLY' : 'PLAN '} ${row.slug}: ${changedFields.join(', ')}`);
      if (!APPLY) continue;

      await connection.execute(
        `UPDATE blog_posts_i18n
            SET title = ?, excerpt = ?, content = ?, meta_title = ?, meta_description = ?
          WHERE blog_post_id = ? AND locale = 'tr'`,
        [next.title, next.excerpt, next.content, next.meta_title, next.meta_description, row.blog_post_id],
      );
      await connection.execute('UPDATE blog_posts SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [
        row.blog_post_id,
      ]);
    }

    console.log(
      `${APPLY ? 'Applied' : 'Planned'}: ${changedRows}/${rows.length} yazı, ${changedOccurrences} karakter düzeltmesi.`,
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
