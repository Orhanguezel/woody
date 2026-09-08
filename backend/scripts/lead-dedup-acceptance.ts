import assert from 'node:assert/strict';
import {pool} from '../src/db/client';
import {insertLeadOnce} from '../src/modules/leads/insertOnce';
const c=await pool.getConnection();const original=pool.execute;
try {
 await c.query('CREATE TEMPORARY TABLE quote_requests(id VARCHAR(36) PRIMARY KEY, email VARCHAR(255), student_count INT)');
 pool.execute=c.execute.bind(c) as typeof pool.execute;
 const id='00000000-0000-4000-8000-000000000001';
 assert.deepEqual(await insertLeadOnce('quote_requests',id,['email','student_count'],['qa@example.test',30]),{id,duplicate:false});
 assert.deepEqual(await insertLeadOnce('quote_requests',id,['email','student_count'],['qa@example.test',30]),{id,duplicate:true});
 await assert.rejects(insertLeadOnce('quote_requests',id,['email','student_count'],['other@example.test',30]),/request_id_conflict/);
 const [rows]=await c.query('SELECT COUNT(*) n FROM quote_requests');
 assert.equal(Number((rows as any[])[0].n),1);
 console.log(JSON.stringify({passed:true,temporaryTablesOnly:true,cases:4}));
} finally {pool.execute=original;await c.destroy();await pool.end();}
