import { z } from 'zod';

export const startSessionBody = z.object({
  session_type: z.enum(['daily', 'topic', 'subject', 'practice', 'exam']).default('subject'),
  topic_id: z.number().int().positive().optional(),
  subject_id: z.number().int().positive().optional(),
  question_count: z.number().int().min(1).max(50).default(10),
});

export const submitSessionBody = z.object({
  answers: z.record(
    z.string(),
    z.number().int().nullable(),
  ),
});
