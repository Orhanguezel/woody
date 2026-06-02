import { z } from 'zod';
import { submissionStatusEnum } from './schema';

export const submitQuestionBody = z.object({
  topic_slug: z.string().min(1).max(100).optional(),
  subject_slug: z.string().min(1).max(100).optional(),
  contributor_note: z.string().max(2000).optional(),
  payload: z.object({
    q: z.string().min(3).max(8000),
    opts: z.array(z.string().min(1).max(2000)).min(2).max(12),
    ans: z.number().int().min(0),
    exp: z.string().max(8000).optional(),
    cat: z.string().max(500).optional(),
    zorluk: z.enum(['baslangic', 'kolay', 'orta', 'zor', 'asiri_zor']).optional(),
  }).passthrough().superRefine((p, ctx) => {
    if (p.ans >= p.opts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ans_index_out_of_range',
        path: ['ans'],
      });
    }
  }),
});

export const adminPatchSubmissionBody = z.object({
  status: z.enum(submissionStatusEnum),
  reviewer_note: z.string().max(2000).optional(),
  merged_question_id: z.number().int().positive().optional().nullable(),
});

export type SubmitQuestionBody = z.infer<typeof submitQuestionBody>;
