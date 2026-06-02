#!/usr/bin/env node
/**
 * sorular/*.json -> INSERT SQL (yedek / demoda kullan; normal akis: db:import).
 *
 *   node src/db/seed/export-questions-sql.mjs
 *   node src/db/seed/export-questions-sql.mjs --out /tmp/questions_seed.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGO_ROOT = path.resolve(__dirname, '../../../../');

const SUBJECT_MAP = {
  'sorular/sebzecilik/domates-sorular.json': { topicSlug: 'sebzecilik', subjectSlug: 'domates' },
  'sorular/sebzecilik/biber-sorular.json': { topicSlug: 'sebzecilik', subjectSlug: 'biber' },
  'sorular/sebzecilik/patlican-sorular.json': { topicSlug: 'sebzecilik', subjectSlug: 'patlican' },
  'sorular/bagcilik/1_hafta_sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/2-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/3-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/4-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/5-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/6-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/8-hafta-sorular.json': { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/meyvecilik/aronya-sorular.json': { topicSlug: 'meyvecilik', subjectSlug: 'aronya' },
  'sorular/meyvecilik/cilek-sorular.json': { topicSlug: 'meyvecilik', subjectSlug: 'cilek' },
  'sorular/meyvecilik/maviyemis-sorular.json': { topicSlug: 'meyvecilik', subjectSlug: 'maviyemis' },
  'sorular/meyvecilik/budama-sorular.json': { topicSlug: 'meyvecilik', subjectSlug: 'budama' },
};

function sqlStr(v) {
  return String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function parseArgs(argv) {
  let outPath = path.join(__dirname, 'sql', '099_questions_static_data.generated.sql');
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') outPath = argv[++i];
  }
  return { outPath };
}

function main() {
  const { outPath } = parseArgs(process.argv);
  const lines = [
    '-- Bu dosya otomatik uretildi; seed zincirine EKLEME — cift kayit olur.',
    '-- Statik sorular icin: bun src/db/seed/import-questions.ts',
    '-- Bu SQL yedek / demo icin kullanilabilir.',
    '',
    'SET NAMES utf8mb4;',
    '',
  ];

  let total = 0;

  for (const [relPath, mapping] of Object.entries(SUBJECT_MAP)) {
    const absPath = path.join(TARGO_ROOT, relPath);
    if (!fs.existsSync(absPath)) continue;

    const raw = fs.readFileSync(absPath, 'utf8');
    const questions = JSON.parse(raw);
    if (!Array.isArray(questions)) continue;

    lines.push(`-- ${relPath} (${questions.length})`);

    for (const q of questions) {
      const optsJson = JSON.stringify(q.opts ?? []);
      const topicSql = sqlStr(mapping.topicSlug);
      const subjectSql = sqlStr(mapping.subjectSlug);
      const topicIdExpr =
        `(SELECT t.id FROM topics t WHERE t.slug = '${topicSql}' LIMIT 1)`;
      const subjectIdExpr =
        `(SELECT s.id FROM subjects s INNER JOIN topics t ON s.topic_id = t.id ` +
        `WHERE t.slug = '${topicSql}' AND s.slug = '${subjectSql}' LIMIT 1)`;

      const insertLine =
        `INSERT INTO questions (topic_id, subject_id, question, options, correct_answer, ` +
        `explanation, week_tag, difficulty, is_active, display_order, source_id, created_at) VALUES (` +
        `${topicIdExpr}, ${subjectIdExpr}, ` +
        `'${sqlStr(q.q)}', '${sqlStr(optsJson)}', ${Number(q.ans)}, ` +
        `${q.exp != null && q.exp !== '' ? `'${sqlStr(q.exp)}'` : 'NULL'}, ` +
        `${q.cat != null && q.cat !== '' ? `'${sqlStr(q.cat)}'` : 'NULL'}, ` +
        `1, 1, 0, ${Number(q.id)}, CURRENT_TIMESTAMP(3)) ` +
        `ON DUPLICATE KEY UPDATE question = VALUES(question), options = VALUES(options), ` +
        `correct_answer = VALUES(correct_answer), explanation = VALUES(explanation), ` +
        `week_tag = VALUES(week_tag);`;

      lines.push(insertLine);
      total++;
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Yazildi: ${outPath} (${total} INSERT)`);
}

main();
