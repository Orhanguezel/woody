import { db } from '@/db/client';
import { subjects } from './schema';
import { topics } from '@/modules/topics/schema';
import { eq, and } from 'drizzle-orm';

export async function findSubjectsByTopicSlug(topicSlug: string) {
  const [topic] = await db.select().from(topics).where(eq(topics.slug, topicSlug)).limit(1);
  if (!topic) return null;
  const rows = await db.select().from(subjects)
    .where(and(eq(subjects.topicId, topic.id), eq(subjects.isActive, 1)))
    .orderBy(subjects.displayOrder);
  return { topic, subjects: rows };
}

export async function findSubjectById(id: number) {
  const [row] = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return row ?? null;
}

export async function findSubjectByTopicIdAndSlug(topicId: number, subjectSlug: string) {
  const [row] = await db.select().from(subjects)
    .where(and(eq(subjects.topicId, topicId), eq(subjects.slug, subjectSlug)))
    .limit(1);
  return row ?? null;
}

export async function insertSubject(data: {
  topic_id: number; slug: string; name: string;
  description?: string; display_order?: number;
}) {
  const [result] = await db.insert(subjects).values({
    topicId: data.topic_id,
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    displayOrder: data.display_order ?? 0,
  }).$returningId();
  return result.id;
}

export async function updateSubject(id: number, data: {
  topic_id?: number; slug?: string; name?: string;
  description?: string; display_order?: number;
}) {
  await db.update(subjects).set({
    ...(data.topic_id !== undefined && { topicId: data.topic_id }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.display_order !== undefined && { displayOrder: data.display_order }),
  }).where(eq(subjects.id, id));
}

export async function deleteSubject(id: number) {
  await db.delete(subjects).where(eq(subjects.id, id));
}
