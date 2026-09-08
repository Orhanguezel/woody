// Session-local TEMPORARY tables only; no customer table mutation or external calls.
import assert from 'node:assert/strict';
import {pool} from '../src/db/client';
import {loadCommerceMeasurement} from '../src/modules/checkout/commerceMeasurement';
import {markPaymentResult} from '../src/modules/checkout/paymentResult';
import {commerceLedgerSql} from '../src/modules/contentSource/commerce';
const c=await pool.getConnection();
let cloneId=0;
async function ledgerQuery(sql:string) {
  // MySQL cannot reopen a TEMPORARY table twice in one query. Clone each
  // reference inside this isolated session; the production SQL is unchanged.
  const names=['orders','payment_attempts','commerce_measurement_outbox','commerce_refunds'];
  let result='';let end=0;
  for(const match of sql.matchAll(new RegExp('\\b('+names.join('|')+')\\b','g'))) {
    const alias=`qa_clone_${cloneId++}`;
    await c.execute(`CREATE TEMPORARY TABLE ${alias} AS SELECT * FROM ${match[0]}`);
    result+=sql.slice(end,match.index)+alias;end=match.index!+match[0].length;
  }
  return c.query(result+sql.slice(end));
}
const originalExecute=pool.execute;
const originalConnection=pool.getConnection;
const originalRelease=c.release.bind(c);
try {
 for(const sql of [
  `CREATE TEMPORARY TABLE orders(id VARCHAR(36),total DECIMAL(12,2),payment_status VARCHAR(32),status VARCHAR(32),payment_ref VARCHAR(36),updated_at DATETIME(3))`,
  `CREATE TEMPORARY TABLE order_attribution(order_id VARCHAR(36),ga_client_id VARCHAR(80),ga_session_id VARCHAR(80),consent_state VARCHAR(20))`,
  `CREATE TEMPORARY TABLE payment_attempts(payment_ref VARCHAR(36),status VARCHAR(32),request_payload JSON,callback_payload JSON,updated_at DATETIME(3))`,
  `CREATE TEMPORARY TABLE commerce_measurement_outbox(id VARCHAR(36),order_id VARCHAR(36),destination VARCHAR(32),event_name VARCHAR(64),status VARCHAR(32),next_attempt_at DATETIME(3),created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),UNIQUE(order_id,destination,event_name))`,
  `CREATE TEMPORARY TABLE commerce_refunds(id VARCHAR(36),order_id VARCHAR(36),amount DECIMAL(12,2),status VARCHAR(32),completed_at DATETIME(3))`,
  `CREATE TEMPORARY TABLE order_items(order_id VARCHAR(36),product_id VARCHAR(36),quantity INT,unit_price DECIMAL(12,2),created_at DATETIME(3))`,
  `CREATE TEMPORARY TABLE product_i18n(product_id VARCHAR(36),locale VARCHAR(8),title VARCHAR(100))`,
 ]) await c.execute(sql);
 pool.execute=c.execute.bind(c) as typeof pool.execute;
 c.release=()=>{};
 pool.getConnection=async()=>c;
 await c.execute(`INSERT INTO orders VALUES ('o',3000,'pending','pending','p',NOW(3))`);
 await c.execute(`INSERT INTO payment_attempts VALUES ('p','pending','{"testMode":false}',NULL,NOW(3))`);
 await c.execute(`INSERT INTO order_attribution VALUES ('o','123.456','123','granted')`);
 await c.execute(`INSERT INTO order_items VALUES ('o','sku',1,3000,NOW(3))`);
 assert.equal(await markPaymentResult('o','p',true,{}),true);
 assert.equal(await markPaymentResult('o','p',true,{}),false);
 assert.equal(await markPaymentResult('o','old-ref',true,{}),false);
 assert.equal((await loadCommerceMeasurement('o'))?.value,3000);
 await c.execute(`INSERT INTO commerce_refunds VALUES ('r1','o',500,'succeeded',NOW(3))`);
 await c.execute(`UPDATE payment_attempts SET status='partially_refunded'`);
 assert.equal((await loadCommerceMeasurement('o','refund','r1'))?.value,500);
 const [partial]=await ledgerQuery(`SELECT SUM(CASE WHEN kind='purchase' THEN amount ELSE -amount END) net FROM (${commerceLedgerSql}) e`);
 assert.equal(Number((partial as Array<{net:string}>)[0].net),2500);
 await c.execute(`INSERT INTO commerce_refunds VALUES ('r2','o',2500,'succeeded',NOW(3))`);
 await c.execute(`UPDATE orders SET payment_status='refunded';`);
 await c.execute(`UPDATE payment_attempts SET status='refunded'`);
 assert.equal(await markPaymentResult('o','p',true,{}),false);
 const [full]=await ledgerQuery(`SELECT SUM(CASE WHEN kind='purchase' THEN amount ELSE -amount END) net FROM (${commerceLedgerSql}) e`);
 assert.equal(Number((full as Array<{net:string}>)[0].net),0);
 await c.execute(`UPDATE order_attribution SET consent_state='denied'`);
 assert.equal(await loadCommerceMeasurement('o'),null);
 await c.execute(`UPDATE order_attribution SET consent_state='granted'`);
 await c.execute(`UPDATE payment_attempts SET request_payload='{"testMode":true}'`);
 assert.equal(await loadCommerceMeasurement('o'),null);
 const [excluded]=await ledgerQuery(`SELECT COUNT(*) n FROM (${commerceLedgerSql}) e`);
 assert.equal(Number((excluded as Array<{n:number}>)[0].n),0);
 console.log(JSON.stringify({passed:true,temporaryTablesOnly:true,cases:['duplicate callback','stale payment reference','partial refund amount','cumulative net revenue','refunded callback guard','consent denied','test payment excluded']}));
} finally { pool.execute=originalExecute;pool.getConnection=originalConnection;c.release=originalRelease;await c.destroy();await pool.end(); }
