import { z } from 'zod';

export const listQuestionsQuery = z.object({
  topic_id: z.coerce.number().int().positive().optional(),
  subject_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const randomQuestionsBody = z.object({
  topic_id: z.number().int().positive().optional(),
  subject_id: z.number().int().positive().optional(),
  count: z.number().int().min(1).max(50).default(10),
});

export const createQuestionSchema = z.object({
  topic_id: z.number().int().positive(),
  subject_id: z.number().int().positive(),
  question: z.string().min(5),
  options: z.array(z.string()).min(2).max(6),
  correct_answer: z.number().int().min(0),
  explanation: z.string().optional(),
  week_tag: z.string().max(100).optional(),
  difficulty: z.number().int().min(1).max(3).default(1),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const toggleActiveSchema = z.object({
  is_active: z.union([z.boolean(), z.number().int().min(0).max(1)]),
});
