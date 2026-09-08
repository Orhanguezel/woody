import {afterEach,expect,mock,test} from 'bun:test';
let calls=0, refunded=0, unresolved=0, acquired=1;
const queries:Array<{sql:string,args?:unknown[]}>=[];
const connection={execute:async(sql:string,args?:unknown[])=>{
 queries.push({sql,args});
 if(sql.includes('GET_LOCK')) return [[{acquired}]];
 if(sql.includes('FROM orders')) return [[{id:'order',total:3000,payment_status:'paid',payment_method:'paytr',payment_ref:'ref'}]];
 if(sql.includes('AS refunded')) return [[{refunded,unresolved}]];
 return [{affectedRows:1}];
},beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}};
mock.module('@/db/client',()=>({pool:{getConnection:async()=>connection}}));
mock.module('./paytrConfig',()=>({loadPaytrConfig:async()=>({merchantId:'test',merchantKey:'secret',merchantSalt:'salt'}),isPaytrUsable:()=>true}));
const {refundPaytrOrder}=await import('./paytrRefund');
const original=globalThis.fetch;
afterEach(()=>{queries.length=0;calls=0;refunded=0;unresolved=0;acquired=1;globalThis.fetch=original;});
function gateway(){globalThis.fetch=(async(_url,init)=>{calls++;const body=init?.body as URLSearchParams;return Response.json({status:'success',merchant_oid:'ref',return_amount:body.get('return_amount'),is_test:0});}) as typeof fetch;}
test('partial refund persists its amount and queues its unique operation without revoking access',async()=>{gateway();expect(await refundPaytrOrder({orderId:'order',amount:500})).toEqual({refunded:500,full:false});expect(calls).toBe(1);expect(queries.some(q=>q.sql.includes('DELETE FROM user_entitlements'))).toBe(false);expect(queries.find(q=>q.sql.includes('INSERT INTO commerce_refunds'))?.args?.[2]).toBe('500.00');expect(queries.find(q=>q.sql.includes('commerce_measurement_outbox'))?.args?.[2]).toMatch(/^refund:/);});
test('full refund after partial uses only remaining amount',async()=>{gateway();refunded=500;expect(await refundPaytrOrder({orderId:'order'})).toEqual({refunded:2500,full:true});expect(queries.some(q=>q.sql.includes('DELETE FROM user_entitlements'))).toBe(true);});
test('cumulative over-refund is rejected before gateway',async()=>{gateway();refunded=500;await expect(refundPaytrOrder({orderId:'order',amount:2600})).rejects.toThrow('refund_amount_exceeds_remaining');expect(calls).toBe(0);});
test('concurrent request cannot send a second refund',async()=>{gateway();acquired=0;await expect(refundPaytrOrder({orderId:'order'})).rejects.toThrow('refund_in_progress');expect(calls).toBe(0);});
test('ambiguous gateway result is recorded and requires reconciliation',async()=>{globalThis.fetch=(async()=>{calls++;throw Error('network');}) as typeof fetch;await expect(refundPaytrOrder({orderId:'order'})).rejects.toThrow('refund_requires_reconciliation');expect(queries.some(q=>q.sql.includes("status='uncertain'"))).toBe(true);unresolved=1;await expect(refundPaytrOrder({orderId:'order'})).rejects.toThrow('refund_requires_reconciliation');expect(calls).toBe(1);});
