import { readFile } from 'node:fs/promises';
import { pool } from '../src/db/client';
try {
  await pool.query(await readFile(new URL('../src/db/seed/sql/054_lead_followups.sql',import.meta.url),'utf8'));
  console.log('Lead followups ready');
} finally {await pool.end();}
