import { createApp } from './app';
import { env } from '@/core/env';
import type { FastifyInstance } from 'fastify';

function checkSecurityDefaults() {
  const isProd = env.NODE_ENV === 'production';
  const insecureJwt = env.JWT_SECRET.endsWith('-jwt-secret-change-in-production');
  if (isProd && insecureJwt) {
    console.error('[GUVENLIK] JWT_SECRET varsayilan veya zayif sablon degeri! Production icin degistirin.');
    process.exit(1);
  }
}

async function main() {
  checkSecurityDefaults();
  const app: FastifyInstance = await createApp();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`API listening :${env.PORT} [${env.NODE_ENV}]`);
}

main().catch((e) => {
  console.error('Server failed', e);
  process.exit(1);
});
