import type { FastifyInstance } from 'fastify';
import { pool } from '@/db/client';
import { followupSchema, leadKinds } from './validation';
const sources = { quote: 'quote_requests', contact: 'contact_messages' } as const;
const empty = {stage:'new',responsible:'',purpose:'unknown',next_action_at:null,loss_reason:'',note:'',version:0};
export async function registerLeadFollowupsAdmin(app: FastifyInstance, db = pool) {
  app.get('/lead-followups', async () => {
    const visible = `FROM lead_followups f WHERE ((f.record_kind='quote' AND EXISTS(SELECT 1 FROM quote_requests q WHERE q.id=f.record_id)) OR (f.record_kind='contact' AND EXISTS(SELECT 1 FROM contact_messages c WHERE c.id=f.record_id)))`;
    const [counts] = await db.query(`SELECT stage, COUNT(*) AS count ${visible} GROUP BY stage`);
    // Kurum / ev / kariyer ayrimi: yalniz acik (won/lost disi) takiplerde sayilir.
    const [purposes] = await db.query(`SELECT purpose, COUNT(*) AS count ${visible} AND f.stage NOT IN ('won','lost') GROUP BY purpose`);
    const [rows] = await db.query(`SELECT f.*, DATE_FORMAT(f.next_action_at, '%Y-%m-%dT%H:%i:%s.000Z') AS next_action_at ${visible} ORDER BY (f.next_action_at IS NULL), f.next_action_at ASC LIMIT 100`);
    return {items:rows,counts,purposes,scope:'Yalnız satış takibi açılmış kayıtlar; tüm başvurular değildir'};
  });
  app.get('/lead-followups/:kind/:id', async (req, reply) => {
    const {kind,id} = req.params as {kind:string;id:string};
    const parsed = leadKinds.safeParse(kind);
    if (!parsed.success) return reply.code(400).send({error:{message:'invalid_kind'}});
    const [records] = await db.execute(`SELECT id FROM ${sources[parsed.data]} WHERE id=? LIMIT 1`,[id]);
    if (!(records as any[]).length) return reply.code(404).send({error:{message:'not_found'}});
    const [rows] = await db.execute("SELECT *, DATE_FORMAT(next_action_at, '%Y-%m-%dT%H:%i:%s.000Z') AS next_action_at FROM lead_followups WHERE record_kind=? AND record_id=?",[kind,id]);
    return (rows as any[])[0] || {...empty,record_kind:kind,record_id:id};
  });
  app.put('/lead-followups/:kind/:id', async (req, reply) => {
    const {kind,id} = req.params as {kind:string;id:string};
    const parsedKind = leadKinds.safeParse(kind), parsed = followupSchema.safeParse(req.body);
    if (!parsedKind.success || !parsed.success) return reply.code(400).send({error:{message:'invalid_followup'}});
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Lock the parent even before a sidecar exists: concurrent first saves cannot both win.
      const [records] = await conn.execute(`SELECT id FROM ${sources[parsedKind.data]} WHERE id=? FOR UPDATE`,[id]);
      if (!(records as any[]).length) {await conn.rollback();return reply.code(404).send({error:{message:'not_found'}});}
      const [existing] = await conn.execute('SELECT version FROM lead_followups WHERE record_kind=? AND record_id=? FOR UPDATE',[kind,id]);
      const version = Number((existing as any[])[0]?.version || 0);
      if (version !== parsed.data.version) {await conn.rollback();return reply.code(409).send({error:{message:'followup_changed_reload'}});}
      const d = parsed.data;
      const nextAt = d.next_action_at ? new Date(d.next_action_at).toISOString().slice(0,23).replace('T',' ') : null;
      const values = [d.stage,d.responsible,d.purpose,nextAt,d.loss_reason,d.note,version+1];
      if (version) await conn.execute('UPDATE lead_followups SET stage=?, responsible=?, purpose=?, next_action_at=?, loss_reason=?, note=?, version=? WHERE record_kind=? AND record_id=?',[...values,kind,id]);
      else await conn.execute('INSERT INTO lead_followups(stage,responsible,purpose,next_action_at,loss_reason,note,version,record_kind,record_id) VALUES(?,?,?,?,?,?,?,?,?)',[...values,kind,id]);
      await conn.commit();
      return {...d,version:version+1,record_kind:kind,record_id:id};
    } catch (error) {await conn.rollback();throw error;} finally {conn.release();}
  });
}
