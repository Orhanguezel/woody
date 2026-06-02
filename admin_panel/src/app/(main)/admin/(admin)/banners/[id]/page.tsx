import BannerFormPage from '../new/page';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('Banner Düzenle'),
};

export default function Page() {
  return <BannerFormPage />;
}
