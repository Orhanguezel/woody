const copy = {
  tr: ['Oyun Tabanlı Öğrenme', 'Dijital İçeriklerle Desteklenen Sistem', 'Her Yaş İçin Uygun Setler'],
  en: ['Play-Based Learning', 'A System Supported by Digital Content', 'Suitable Sets for Every Age'],
};

export default function WoodyGrayBanner({ locale }: { locale: string }) {
  const items = locale === 'tr' ? copy.tr : copy.en;
  return (
    <section className="bg-sand-100 py-5">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-3 px-6 text-center md:flex-row md:gap-8">
        {items.map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            {index > 0 ? <span className="hidden h-5 w-px bg-gray-300 md:inline-block" aria-hidden /> : null}
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gray-600 md:text-[14px]">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
