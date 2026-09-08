import { z } from 'zod';
export const leadKinds = z.enum(['quote', 'contact']);
export const followupSchema = z.object({
  version: z.number().int().min(0),
  stage: z.enum(['new', 'contacted', 'qualified', 'demo', 'quoted', 'won', 'lost']),
  responsible: z.string().trim().max(180).default(''),
  purpose: z.enum(['unknown', 'institution', 'home', 'career', 'other']),
  next_action_at: z.string().datetime({offset:true}).nullable(),
  loss_reason: z.string().trim().max(500).default(''),
  note: z.string().trim().max(3000).default(''),
}).strict().superRefine((v, ctx) => {
  if (v.stage === 'lost' && !v.loss_reason) ctx.addIssue({code:'custom',path:['loss_reason'],message:'Kayıp nedeni gerekli'});
  if (['won','lost'].includes(v.stage) && v.next_action_at) ctx.addIssue({code:'custom',path:['next_action_at'],message:'Kapalı kayıtta sonraki işlem tarihi boş olmalı'});
});
