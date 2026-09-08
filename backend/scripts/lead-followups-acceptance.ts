// Real MySQL, session-local TEMPORARY tables. No notifications or customer writes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Fastify from 'fastify';
import {pool} from '../src/db/client';
import {registerLeadFollowupsAdmin} from '../src/modules/leadFollowups/router';
const c=await pool.getConnection();const app=Fastify();
const release=c.release.bind(c);
try {
 const sql=await readFile(new URL('../src/db/seed/sql/054_lead_followups.sql',import.meta.url),'utf8');
 await c.query(sql.replace('CREATE TABLE IF NOT EXISTS','CREATE TEMPORARY TABLE'));
 await c.query('CREATE TEMPORARY TABLE quote_requests(id VARCHAR(64) PRIMARY KEY)');
 await c.query('CREATE TEMPORARY TABLE contact_messages(id VARCHAR(64) PRIMARY KEY)');
 await c.query("INSERT INTO quote_requests VALUES('qa')");
 c.release=()=>{};
 const adapter={execute:c.execute.bind(c),query:c.query.bind(c),getConnection:async()=>c} as unknown as typeof pool;
 await registerLeadFollowupsAdmin(app,adapter);
 const get=()=>app.inject({method:'GET',url:'/lead-followups/quote/qa'});
 assert.equal((await get()).json().version,0);
 const body={version:0,stage:'qualified',responsible:'QA ekip',purpose:'institution',next_action_at:'2026-09-10T12:00:00+03:00',loss_reason:'',note:'Demo hazırla'};
 const put=(payload:any)=>app.inject({method:'PUT',url:'/lead-followups/quote/qa',payload});
 assert.equal((await put(body)).statusCode,200);
 assert.equal((await put(body)).statusCode,409);
 assert.equal((await get()).json().next_action_at,'2026-09-10T09:00:00.000Z');
 assert.equal((await put({...body,version:1,stage:'lost',next_action_at:null})).statusCode,400);
 assert.equal((await put({...body,version:1,stage:'lost',next_action_at:null,loss_reason:'Bütçe'})).statusCode,200);
 assert.equal((await app.inject({method:'GET',url:'/lead-followups/contact/qa'})).statusCode,404);
 assert.equal(Number((await app.inject({method:'GET',url:'/lead-followups'})).json().counts[0].count),1);
 await c.query("DELETE FROM quote_requests WHERE id='qa'");
 assert.equal((await app.inject({method:'GET',url:'/lead-followups'})).json().items.length,0);
 console.log(JSON.stringify({passed:true,temporaryTablesOnly:true,cases:8}));
} finally {await app.close();c.release=release;await c.destroy();await pool.end();}
