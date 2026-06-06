import { fetchSetting } from '@/i18n/server';

const copy = {
  tr: ['Her Yaş İçin Uygun Setler'],
  en: ['Suitable Sets for Every Age'],
  de: ['Passende Sets für jedes Alter'],
};

function asItems(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const record = value as Record<string, unknown>;
  const raw = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.bannerItems)
      ? record.bannerItems
      : [];
  return raw.map((item) => String(item).trim()).filter(Boolean);
}

export default async function WoodyGrayBanner({ locale, eyebrow }: { locale: string; eyebrow?: string }) {
  const fallback = eyebrow
    ? [eyebrow]
    : locale === 'tr'
      ? copy.tr
      : locale === 'de'
        ? copy.de
        : copy.en;
  const setting = await fetchSetting('home_banner', locale, { revalidate: 60 });
  const items = asItems(setting?.value);
  // DB home_banner '*' altinda TR tutuluyor ve tum dillere dusuyor; TR disi dillerde
  // localize icerik eyebrow'unu (home.json) tercih et.
  const displayItems = locale !== 'tr' && eyebrow ? [eyebrow] : items.length ? items : fallback;
  if (!displayItems.length) return null;

  return (
    <section className="bg-sand-100 py-5">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-3 px-6 text-center md:flex-row md:gap-8">
        {displayItems.map((item, index) => (
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
