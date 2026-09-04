import type { Metadata } from 'next';

// Hesap/kutuphane ekranlari kullaniciya ozeldir. Varsayilan site metadata'sini
// miras alip indexlenmesi, alakasiz sorgular ve yanlis canonical sinyali uretiyordu.
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function MemberAreaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
