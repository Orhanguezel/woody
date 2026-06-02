import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  findAllSectionsAdmin,
  findSectionById,
  insertSection,
  updateSection,
  deleteSection,
  rowToAdminDto,
  maxOrderIndex,
} from './repository';
import {
  createHomeSectionSchema,
  patchHomeSectionSchema,
  reorderHomeSectionsSchema,
} from './validation';

export async function adminListHomeSections(_req: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await findAllSectionsAdmin();
    return reply.send({ success: true, data: rows.map(rowToAdminDto) });
  } catch (err) {
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminGetHomeSection(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const row = await findSectionById(req.params.id);
    if (!row) return reply.code(404).send({ success: false, message: 'not_found' });
    return reply.send({ success: true, data: rowToAdminDto(row) });
  } catch {
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminCreateHomeSection(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = createHomeSectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, errors: parsed.error.flatten() });
    }
    const b = parsed.data;
    const nextOrder = b.order_index ?? (await maxOrderIndex()) + 10;
    const id = await insertSection({
      slug: b.slug,
      label: b.label,
      componentKey: b.component_key,
      orderIndex: nextOrder,
      isActive: b.is_active ?? 1,
      config: b.config ?? null,
    });
    return reply.code(201).send({ success: true, data: { id } });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'ER_DUP_ENTRY') {
      return reply.code(409).send({ success: false, message: 'duplicate_slug' });
    }
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminPatchHomeSection(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const existing = await findSectionById(req.params.id);
    if (!existing) return reply.code(404).send({ success: false, message: 'not_found' });

    const parsed = patchHomeSectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, errors: parsed.error.flatten() });
    }
    const b = parsed.data;
    await updateSection(req.params.id, {
      slug: b.slug,
      label: b.label,
      componentKey: b.component_key,
      orderIndex: b.order_index,
      isActive: b.is_active,
      config: b.config === undefined ? undefined : b.config,
    });
    return reply.send({ success: true, data: { id: req.params.id } });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'ER_DUP_ENTRY') {
      return reply.code(409).send({ success: false, message: 'duplicate_slug' });
    }
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminDeleteHomeSection(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const existing = await findSectionById(req.params.id);
    if (!existing) return reply.code(404).send({ success: false, message: 'not_found' });
    await deleteSection(req.params.id);
    return reply.send({ success: true, data: { id: req.params.id, ok: true } });
  } catch {
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminReorderHomeSections(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = reorderHomeSectionsSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, errors: parsed.error.flatten() });
    }
    let count = 0;
    for (const it of parsed.data.items) {
      await updateSection(it.id, { orderIndex: it.order_index });
      count += 1;
    }
    return reply.send({ success: true, data: { ok: true, count } });
  } catch {
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
