import 'fastify';
import '@fastify/jwt';
import type { JwtUser } from '@shared/shared-backend/middleware/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtUser;
  }
}
