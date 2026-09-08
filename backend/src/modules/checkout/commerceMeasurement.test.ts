import { afterEach, expect, mock, test } from 'bun:test';
const queries: Array<{sql:string,args?:unknown[]}> = [];
let orderRows: any[] = [], outboxRows: any[] = [], claimable = true;
mock.module('@/db/client', () => ({ pool: { execute: async (sql: string,args?:unknown[]) => {
  queries.push({sql,args});
  if(sql.includes('FROM orders o')) return [orderRows];
  if(sql.includes('FROM commerce_measurement_outbox')) return [outboxRows];
  if(sql.includes("SET status = 'processing'")) return [{affectedRows:claimable?1:0}];
  return [[{ product_id: 'sku', title: 'Basic', unit_price: 3000, quantity: 1 }]];
}} }));
mock.module('@/core/env', () => ({ env: {GA4_API_SECRET:'test-secret',GA4_MEASUREMENT_ID:'G-TEST'} }));
const { loadCommerceMeasurement,processCommerceMeasurementOutbox } = await import('./commerceMeasurement');
const originalFetch=globalThis.fetch;
const app={log:{warn:()=>{}}} as any;
afterEach(() => { orderRows = []; outboxRows=[]; queries.length=0; claimable=true; globalThis.fetch=originalFetch; });
function payment(){orderRows=[{id:'order',total:'3000.00',ga_client_id:'123.456',ga_session_id:'123'}];outboxRows=[{id:'outbox',order_id:'order',event_name:'purchase',attempt_count:0,created_at:new Date('2026-09-08T10:00:00Z')}];}
test('verified payment preserves its amount and attribution',async()=>{payment();expect(await loadCommerceMeasurement('order')).toMatchObject({value:3000,client_id:'123.456',session_id:'123',items:[{quantity:1,price:3000,item_id:'sku',item_name:'Basic'}]});});
test('ineligible payment never reaches Google and becomes reviewable',async()=>{payment();orderRows=[];let calls=0;globalThis.fetch=(async()=>{calls++;return new Response('',{status:200})}) as any;await processCommerceMeasurementOutbox(app);expect(calls).toBe(0);expect(queries.some(q=>q.sql.includes('measurement_ineligible_consent_payment_or_test'))).toBe(true);});
test('a competing worker that loses the claim never sends the event',async()=>{payment();claimable=false;let calls=0;globalThis.fetch=(async()=>{calls++;return new Response('',{status:200})}) as any;await processCommerceMeasurementOutbox(app);expect(calls).toBe(0);});
test('delivery uses original event time and updates sent only after successful response',async()=>{payment();let payload:any;globalThis.fetch=(async(_url:any,init:any)=>{payload=JSON.parse(init.body);return new Response('',{status:200})}) as any;await processCommerceMeasurementOutbox(app);expect(payload.timestamp_micros).toBe(new Date('2026-09-08T10:00:00Z').getTime()*1000);expect(payload.events[0].params.transaction_id).toBe('order');expect(queries.some(q=>q.sql.includes("SET status = 'sent'"))).toBe(true);});
test('network failure schedules retry without exposing request URL secrets',async()=>{payment();globalThis.fetch=(async()=>{throw new Error('https://example.com?api_secret=test-secret')}) as any;await processCommerceMeasurementOutbox(app);expect(queries.some(q=>q.sql.includes("SET status = 'sent'"))).toBe(false);expect(queries.some(q=>q.sql.includes("SET status = 'failed'"))).toBe(true);expect(JSON.stringify(queries)).not.toContain('test-secret');});
