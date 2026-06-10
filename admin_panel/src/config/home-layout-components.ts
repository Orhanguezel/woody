export const HOME_LAYOUT_COMPONENT_OPTIONS = [
  { key: 'WoodyHomeHero', label: 'Woody Hero (üst vitrin)' },
  { key: 'WoodyGrayBanner', label: 'Woody öğrenme vurguları' },
  { key: 'ZodiacGridSection', label: 'Öne çıkan kategoriler' },
  { key: 'WoodySetZigzag', label: 'Woody setleri' },
  { key: 'WoodyWhyCambridge', label: 'Neden Woody' },
  { key: 'CertificationSection', label: 'Sertifikalar' },
  { key: 'WoodyNewsCarousel', label: 'Woody yenilikler' },
  { key: 'HeroNew', label: 'Hero (üst vitrin)' },
  { key: 'BannerSlot', label: 'Banner alanı' },
  { key: 'PromisesSection', label: 'Özet / vaatler' },
  { key: 'FeaturesNew', label: 'Özellikler (3 sütun)' },
  { key: 'HomeIntroSection', label: 'Nasıl çalışır (adımlar)' },
  { key: 'WelcomeBannerSection', label: 'Karşılama bandı' },
  { key: 'HomeCTABanner', label: 'CTA bandı' },
] as const;

export const HOME_LAYOUT_COMPONENT_KEYS = HOME_LAYOUT_COMPONENT_OPTIONS.map((o) => o.key);
