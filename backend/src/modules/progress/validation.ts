import { z } from 'zod';

export const topicProgressParams = z.object({
  topicId: z.coerce.number().int().positive(),
});
