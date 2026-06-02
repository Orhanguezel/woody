import AdminBannersClient from './_components/admin-banners-client';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('Banner Yönetimi'),
};

export default function Page() {
  return <AdminBannersClient />;
}
