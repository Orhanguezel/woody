// src/app/(main)/admin/products/[id]/page.tsx
// id === 'new'  -> yeni urun olusturma
// id === <uuid> -> urun duzenleme (locale boyutuyla)

import ProductDetailClient from '../_components/product-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  return <ProductDetailClient id={p.id} />;
}
