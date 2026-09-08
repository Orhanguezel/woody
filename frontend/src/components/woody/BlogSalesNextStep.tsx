import Link from 'next/link';

/** Only audited Turkish articles; no automatic cross-locale or product guessing. */
export default function BlogSalesNextStep({ slug, locale }: { slug: string; locale: string }) {
  if (locale !== 'tr') return null;
  const parent = slug === '4-5-6-yas-ingilizce-egitimi';
  const school = ['anaokulu-ingilizce-ders-plani-nasil-hazirlanir', 'anaokulu-ingilizce-egitim-seti-nasil-secilir'].includes(slug);
  if (!parent && !school) return null;
  return <aside className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-slate-900" aria-label="Sonraki adım">
    <h2 className="text-xl font-bold">{parent ? 'Çocuğunuz için uygun başlangıcı bulun' : 'Bu yaklaşımı sınıfınızda uygulayın'}</h2>
    <p className="mt-2 text-sm leading-6">{parent ? 'Seviye bulucuyla başlayın; ev ve özel ders setlerinin içeriklerini inceleyin.' : 'Woody Okul Serisi kitap, öğretmen planı, oyun ve dijital içeriği bir araya getirir. Kurumunuza uygun teklif isteyin.'}</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <Link className="rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2" href={parent ? '/tr/level-finder' : '/tr/preschool#quote-form'}>{parent ? 'Uygun seviyeyi bul' : 'Kurumum için teklif al'}</Link>
      <Link className="rounded-lg border border-orange-300 px-4 py-3 font-semibold focus-visible:outline focus-visible:outline-2" href={parent ? '/tr/home-tutor' : '/tr/workshop'}>{parent ? 'Ev setlerini incele' : 'Küçük grup seçenekleri'}</Link>
    </div>
  </aside>;
}
