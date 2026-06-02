import CampaignFormPage from '../new/page';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('Kampanya Düzenle'),
};

export default function Page() {
  return <CampaignFormPage />;
}
