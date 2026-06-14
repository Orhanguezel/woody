import CatalogTaxonomyDetailClient from '../../_components/catalog-taxonomy-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  return <CatalogTaxonomyDetailClient id={p.id} kind="levels" />;
}
