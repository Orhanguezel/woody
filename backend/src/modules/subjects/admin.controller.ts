import type { FastifyRequest, FastifyReply } from 'fastify';
import { findSubjectById, insertSubject, updateSubject, deleteSubject } from './repository';
import { createSubjectSchema, updateSubjectSchema } from './validation';

export async function adminCreateSubject(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = createSubjectSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const id = await insertSubject(parsed.data);
    return reply.code(201).send({ success: true, data: { id } });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminUpdateSubject(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    const existing = await findSubjectById(id);
    if (!existing) return reply.code(404).send({ success: false, message: 'not_found' });

    const parsed = updateSubjectSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    await updateSubject(id, parsed.data);
    return reply.send({ success: true, message: 'updated' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminDeleteSubject(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    await deleteSubject(id);
    return reply.send({ success: true, message: 'deleted' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
