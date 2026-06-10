// src/app/(main)/admin/schools/[id]/page.tsx
// id === 'new'  -> yeni okul olusturma modu
// id === <uuid> -> okul duzenleme + kullanicilar / icerik erisimi

import SchoolDetailClient from '../_components/school-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  return <SchoolDetailClient id={p.id} />;
}
