import { buildLlmsText } from '@/app/llms-shared';

export async function GET() {
  return new Response(await buildLlmsText({ full: false }), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
