import AdminContactDetailClient from "../_components/admin-contact-detail-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminContactDetailClient id={id} />;
}
