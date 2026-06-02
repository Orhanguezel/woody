import AdminCampaignsClient from './_components/admin-campaigns-client';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('Kampanya Yönetimi'),
};

export default function Page() {
  return <AdminCampaignsClient />;
}
