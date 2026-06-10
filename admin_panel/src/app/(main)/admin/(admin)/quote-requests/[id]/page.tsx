import QuoteRequestDetailClient from '../_components/quote-request-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  return <QuoteRequestDetailClient id={p.id} />;
}
