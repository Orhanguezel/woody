import { z } from 'zod';

const slugRe = /^[a-z0-9_]{1,100}$/;

export const createHomeSectionSchema = z.object({
  slug: z.string().trim().regex(slugRe, 'invalid_slug'),
  label: z.string().trim().min(1).max(255),
  component_key: z.string().trim().min(1).max(100),
  order_index: z.number().int().min(0).max(4294967295).optional(),
  is_active: z.union([z.literal(0), z.literal(1)]).optional(),
  config: z.record(z.unknown()).nullable().optional(),
});

export const patchHomeSectionSchema = z.object({
  slug: z.string().trim().regex(slugRe, 'invalid_slug').optional(),
  label: z.string().trim().min(1).max(255).optional(),
  component_key: z.string().trim().min(1).max(100).optional(),
  order_index: z.number().int().min(0).max(4294967295).optional(),
  is_active: z.union([z.literal(0), z.literal(1)]).optional(),
  config: z.record(z.unknown()).nullable().optional(),
});

export const reorderHomeSectionsSchema = z.object({
  items: z.array(z.object({
    // id'ler UUID degil kisa slug olabilir (seed: 'home-hero' vb.) — min(32) reorder'i kiriyordu
    id: z.string().trim().min(1).max(64),
    order_index: z.number().int().min(0).max(4294967295),
  })).min(1),
});
