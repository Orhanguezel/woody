import { z } from 'zod';

export const createSubjectSchema = z.object({
  topic_id: z.number().int().positive(),
  slug: z.string().min(2).max(100),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  display_order: z.number().int().min(0).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();
