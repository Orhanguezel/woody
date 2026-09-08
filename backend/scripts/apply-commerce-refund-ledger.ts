import { readFile } from 'node:fs/promises';
import { pool } from '../src/db/client';

// Add only the refund ledger; never run the full content seed on production.
try {
  const sql = await readFile(new URL('../src/db/seed/sql/053_commerce_refund_ledger.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Commerce refund ledger ready');
} finally {
  await pool.end();
}
