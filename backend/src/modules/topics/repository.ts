import { db } from '@/db/client';
import { topics } from './schema';
import { subjects } from '@/modules/subjects/schema';
import { eq } from 'drizzle-orm';

export async function findAllTopics(activeOnly = true) {
  const rows = await db.select().from(topics).orderBy(topics.displayOrder);
  if (activeOnly) return rows.filter(r => r.isActive === 1);
  return rows;
}

export async function findTopicBySlug(slug: string) {
  const [row] = await db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
  return row ?? null;
}

export async function findTopicById(id: number) {
  const [row] = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return row ?? null;
}

export async function findSubjectsByTopicId(topicId: number) {
  return db.select().from(subjects)
    .where(eq(subjects.topicId, topicId))
    .orderBy(subjects.displayOrder);
}

export async function insertTopic(data: {
  slug: string; name: string; description?: string;
  icon_emoji?: string; display_order?: number;
}) {
  const [result] = await db.insert(topics).values({
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    iconEmoji: data.icon_emoji ?? null,
    displayOrder: data.display_order ?? 0,
  }).$returningId();
  return result.id;
}

export async function updateTopic(id: number, data: {
  slug?: string; name?: string; description?: string;
  icon_emoji?: string; display_order?: number;
}) {
  await db.update(topics).set({
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.icon_emoji !== undefined && { iconEmoji: data.icon_emoji }),
    ...(data.display_order !== undefined && { displayOrder: data.display_order }),
  }).where(eq(topics.id, id));
}

export async function deleteTopic(id: number) {
  await db.delete(topics).where(eq(topics.id, id));
}

export async function setTopicActive(id: number, isActive: boolean) {
  await db.update(topics).set({ isActive: isActive ? 1 : 0 }).where(eq(topics.id, id));
}
