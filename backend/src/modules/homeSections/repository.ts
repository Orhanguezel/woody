import { randomUUID } from 'crypto';
import { db } from '@/db/client';
import { homeSections, type HomeSectionRow } from './schema';
import { asc, eq } from 'drizzle-orm';

export type HomeSectionPublicDto = {
  id: string;
  slug: string;
  label: string;
  component_key: string;
  order_index: number;
  is_active: number;
  config: Record<string, unknown> | null;
};

function toPublic(r: HomeSectionRow): HomeSectionPublicDto {
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    component_key: r.componentKey,
    order_index: r.orderIndex,
    is_active: r.isActive,
    config: (r.config as Record<string, unknown> | null) ?? null,
  };
}

export async function findLayoutPublicActive(): Promise<HomeSectionPublicDto[]> {
  const rows = await db
    .select()
    .from(homeSections)
    .where(eq(homeSections.isActive, 1))
    .orderBy(asc(homeSections.orderIndex));
  return rows.map(toPublic);
}

export async function findAllSectionsAdmin(): Promise<HomeSectionRow[]> {
  return db.select().from(homeSections).orderBy(asc(homeSections.orderIndex));
}

export async function findSectionById(id: string): Promise<HomeSectionRow | null> {
  const [row] = await db.select().from(homeSections).where(eq(homeSections.id, id)).limit(1);
  return row ?? null;
}

export async function findSectionBySlug(slug: string): Promise<HomeSectionRow | null> {
  const [row] = await db.select().from(homeSections).where(eq(homeSections.slug, slug)).limit(1);
  return row ?? null;
}

export async function insertSection(data: {
  slug: string;
  label: string;
  componentKey: string;
  orderIndex: number;
  isActive: number;
  config: Record<string, unknown> | null;
}): Promise<string> {
  const id = randomUUID();
  await db.insert(homeSections).values({
    id,
    slug: data.slug,
    label: data.label,
    componentKey: data.componentKey,
    orderIndex: data.orderIndex,
    isActive: data.isActive,
    config: data.config,
  });
  return id;
}

type SectionPatch = Partial<{
  slug: string;
  label: string;
  componentKey: string;
  orderIndex: number;
  isActive: number;
  config: Record<string, unknown> | null;
}>;

export async function updateSection(id: string, patch: SectionPatch): Promise<void> {
  const u: Partial<typeof homeSections.$inferInsert> = {};
  if (patch.slug !== undefined) u.slug = patch.slug;
  if (patch.label !== undefined) u.label = patch.label;
  if (patch.componentKey !== undefined) u.componentKey = patch.componentKey;
  if (patch.orderIndex !== undefined) u.orderIndex = patch.orderIndex;
  if (patch.isActive !== undefined) u.isActive = patch.isActive;
  if (patch.config !== undefined) u.config = patch.config;
  if (!Object.keys(u).length) return;
  await db.update(homeSections).set(u).where(eq(homeSections.id, id));
}

export async function deleteSection(id: string): Promise<void> {
  await db.delete(homeSections).where(eq(homeSections.id, id));
}

export async function maxOrderIndex(): Promise<number> {
  const rows = await findAllSectionsAdmin();
  return rows.reduce((m, r) => Math.max(m, r.orderIndex), 0);
}

export function rowToAdminDto(r: HomeSectionRow): HomeSectionPublicDto & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    ...toPublic(r),
    created_at: r.createdAt ? String(r.createdAt) : undefined,
    updated_at: r.updatedAt ? String(r.updatedAt) : undefined,
  };
}
