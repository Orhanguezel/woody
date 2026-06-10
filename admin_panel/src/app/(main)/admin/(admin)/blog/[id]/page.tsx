// src/app/(main)/admin/blog/[id]/page.tsx
// id === 'new'  -> yeni yazi
// id === <uuid> -> yazi duzenleme (locale boyutuyla)

import BlogDetailClient from '../_components/blog-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  return <BlogDetailClient id={p.id} />;
}
