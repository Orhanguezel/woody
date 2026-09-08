/// <reference types="bun-types" />
import {afterEach,expect,test} from 'bun:test';
import {captureCommerceAttribution} from './commerce-attribution';
import {reportPurchaseOnce} from './ecommerce-events';
const originalWindow=globalThis.window, originalDocument=globalThis.document;
function storage(){const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k),key:(i:number)=>[...data.keys()][i],get length(){return data.size;}};}
function setup(){const local=storage(),session=storage();const events:unknown[][]=[];
 const doc={cookie:'',referrer:'https://example.test/page?email=private'};
 const win={localStorage:local,sessionStorage:session,location:{pathname:'/tr/home-tutor',search:'?utm_source=google&gclid=click&email=private'},gtag:(...args:unknown[])=>events.push(args)};
 Object.defineProperty(globalThis,'window',{value:win,writable:true,configurable:true});Object.defineProperty(globalThis,'document',{value:doc,writable:true,configurable:true});return {local,session,events,doc,win};}
afterEach(()=>{Object.defineProperty(globalThis,'window',{value:originalWindow,writable:true,configurable:true});Object.defineProperty(globalThis,'document',{value:originalDocument,writable:true,configurable:true});});
test('consent denial does not store attribution and clears prior attribution',()=>{const s=setup();s.local.setItem('site_cookie_consent_v1','{"analytics":false}');expect(captureCommerceAttribution()).toEqual({consentState:'denied'});expect(s.session.length).toBe(0);});
test('late GA cookie is refreshed while first landing attribution survives navigation',()=>{const s=setup();s.local.setItem('site_cookie_consent_v1','{"analytics":true}');expect(captureCommerceAttribution().source).toBe('google');s.win.location.pathname='/tr/store';s.win.location.search='';s.doc.cookie='_ga=GA1.1.123.456; _ga_TEST=GS2.1.s789$o1';const a=captureCommerceAttribution();expect(a.gaClientId).toBe('123.456');expect(a.gaSessionId).toBe('789');expect(a.source).toBe('google');expect(JSON.stringify(a)).not.toContain('private');});
test('server delivery does not send a browser GA4 purchase; browser delivery sends once',()=>{const s=setup();const payload={currency:'TRY',value:3000,items:[]};reportPurchaseOnce('server',payload,'server');expect(s.events.filter(e=>e[1]==='purchase')).toHaveLength(0);reportPurchaseOnce('browser',payload);reportPurchaseOnce('browser',payload);expect(s.events.filter(e=>e[1]==='purchase')).toHaveLength(1);});
test('latest consent version overrides an older grant',()=>{const s=setup();s.local.setItem('site_cookie_consent_v1','{"analytics":true}');s.local.setItem('site_cookie_consent_v2','{"analytics":false}');expect(captureCommerceAttribution().consentState).toBe('denied');});
test('malformed analytics cookie never blocks checkout',()=>{const s=setup();s.local.setItem('site_cookie_consent_v1','{"analytics":true}');s.doc.cookie='_ga=%broken; _ga_TEST=%broken';expect(()=>captureCommerceAttribution()).not.toThrow();});
