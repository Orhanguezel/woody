import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '@/core/env';
import { logStep } from './utils';

type RawQuestion = {
  id: number;
  cat: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

type SubjectMapping = {
  topicSlug: string;
  subjectSlug: string;
};

const TARGO_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../../../',
);

const SUBJECT_MAP: Record<string, SubjectMapping> = {
  'sorular/sebzecilik/domates-sorular.json': { topicSlug: 'sebzecilik', subjectSlug: 'domates' },
  'sorular/sebzecilik/biber-sorular.json':   { topicSlug: 'sebzecilik', subjectSlug: 'biber' },
  'sorular/sebzecilik/patlican-sorular.json':{ topicSlug: 'sebzecilik', subjectSlug: 'patlican' },
  'sorular/bagcilik/1_hafta_sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/2-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/3-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/4-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/5-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/6-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/bagcilik/8-hafta-sorular.json':   { topicSlug: 'bagcilik', subjectSlug: 'bagcilik-genel' },
  'sorular/meyvecilik/aronya-sorular.json':  { topicSlug: 'meyvecilik', subjectSlug: 'aronya' },
  'sorular/meyvecilik/cilek-sorular.json':   { topicSlug: 'meyvecilik', subjectSlug: 'cilek' },
  'sorular/meyvecilik/maviyemis-sorular.json':{ topicSlug: 'meyvecilik', subjectSlug: 'maviyemis' },
  'sorular/meyvecilik/budama-sorular.json':  { topicSlug: 'meyvecilik', subjectSlug: 'budama' },
};

type TopicRow = { id: number; slug: string };
type SubjectRow = { id: number; slug: string; topic_id: number };

async function main() {
  const conn = await mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.name,
    charset: 'utf8mb4_unicode_ci',
  });

  try {
    const [topicRows] = await conn.query<TopicRow[] & mysql.RowDataPacket[]>(
      'SELECT id, slug FROM topics',
    );
    const topicMap = new Map(topicRows.map(r => [r.slug, r.id]));

    const [subjectRows] = await conn.query<SubjectRow[] & mysql.RowDataPacket[]>(
      'SELECT id, slug, topic_id FROM subjects',
    );
    const subjectMap = new Map(
      subjectRows.map(r => [`${r.topic_id}:${r.slug}`, r.id]),
    );

    let totalInserted = 0;

    for (const [relPath, mapping] of Object.entries(SUBJECT_MAP)) {
      const absPath = path.join(TARGO_ROOT, relPath);
      if (!fs.existsSync(absPath)) {
        logStep(`File not found, skipping: ${relPath}`);
        continue;
      }

      const topicId = topicMap.get(mapping.topicSlug);
      if (!topicId) {
        logStep(`Topic not found: ${mapping.topicSlug}`);
        continue;
      }

      const subjectId = subjectMap.get(`${topicId}:${mapping.subjectSlug}`);
      if (!subjectId) {
        logStep(`Subject not found: ${mapping.subjectSlug} in topic ${mapping.topicSlug}`);
        continue;
      }

      const raw = fs.readFileSync(absPath, 'utf8');
      const questions: RawQuestion[] = JSON.parse(raw);
      logStep(`Importing ${questions.length} questions from ${relPath}`);

      for (const q of questions) {
        await conn.query(
          `INSERT INTO questions
            (topic_id, subject_id, question, options, correct_answer, explanation, week_tag, source_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))
          ON DUPLICATE KEY UPDATE
            question = VALUES(question),
            options = VALUES(options),
            correct_answer = VALUES(correct_answer),
            explanation = VALUES(explanation),
            week_tag = VALUES(week_tag)`,
          [topicId, subjectId, q.q, JSON.stringify(q.opts), q.ans, q.exp || null, q.cat || null, q.id],
        );
        totalInserted++;
      }
    }

    logStep(`Updating question counts...`);
    await conn.query(`
      UPDATE topics t SET question_count = (
        SELECT COUNT(*) FROM questions q WHERE q.topic_id = t.id
      )
    `);
    await conn.query(`
      UPDATE subjects s SET question_count = (
        SELECT COUNT(*) FROM questions q WHERE q.subject_id = s.id
      )
    `);

    logStep(`Import completed. Total: ${totalInserted} questions processed.`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
