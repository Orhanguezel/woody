import { z } from 'zod';

export const createTopicSchema = z.object({
  slug: z.string().min(2).max(100),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  icon_emoji: z.string().max(10).optional(),
  display_order: z.number().int().min(0).optional(),
});

export const updateTopicSchema = createTopicSchema.partial();

export const toggleActiveSchema = z.object({
  is_active: z.union([z.boolean(), z.number().int().min(0).max(1)]),
});
