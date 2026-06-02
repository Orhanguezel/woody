import HomeLayoutAdminClient from './_components/home-layout-admin-client';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('Anasayfa Düzeni'),
};

export default function Page() {
  return <HomeLayoutAdminClient />;
}
