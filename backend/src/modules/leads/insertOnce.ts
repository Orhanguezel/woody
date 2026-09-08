import { randomUUID } from 'node:crypto';
import {pool} from '@/db/client';
// Only internal callers supply table/column names; public input is always bound.
export async function insertLeadOnce(table:'quote_requests'|'contact_messages', requestId:string|undefined, columns:string[], values:Array<string|number|null>) {
 const id=requestId || randomUUID();
 try {
  await pool.execute(`INSERT INTO ${table} (id,${columns.join(',')}) VALUES (${columns.map(()=>'?').concat('?').join(',')})`,[id,...values]);
  return {id,duplicate:false};
 } catch(error) {
  if (!requestId || (error as {code?:string}).code!=='ER_DUP_ENTRY') throw error;
  const [rows]=await pool.execute(`SELECT ${columns.join(',')} FROM ${table} WHERE id=? LIMIT 1`,[id]);
  const row=(rows as Record<string,unknown>[])[0];
  // Transport metadata can differ on an actual retry, business payload cannot.
  const same=row && columns.every((key,i)=>['ip','user_agent'].includes(key) || String(row[key]??'')===String(values[i]??''));
  if(!same)throw Object.assign(new Error('request_id_conflict'),{statusCode:409});
  return {id,duplicate:true};
 }
}
