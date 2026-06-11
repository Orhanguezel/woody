// Anasayfa section secenekleri — WoodyHomePage.tsx renderers map'i ile BIREBIR ayni olmali.
// (Listede olmayan component_key frontend'de SESSIZCE atlanir — admin'de uyari rozeti gosterilir.)
export const HOME_LAYOUT_COMPONENT_OPTIONS = [
  { key: 'WoodyHomeHero', label: 'Woody Hero (üst vitrin)' },
  { key: 'WoodyGrayBanner', label: 'Öğrenme vurguları (Her Yaş İçin Setler)' },
  { key: 'ZodiacGridSection', label: 'Öne çıkan kategoriler' },
  { key: 'WoodySetZigzag', label: 'Woody setleri' },
  { key: 'WoodyDigitalEntry', label: 'Woody Dijital girişi' },
  { key: 'CertificationSection', label: 'Sertifikalar (Cambridge)' },
  { key: 'WoodyWhyCambridge', label: 'Neden Woody' },
  { key: 'WoodyNewsCarousel', label: 'Woody yenilikler' },
] as const;

export const HOME_LAYOUT_COMPONENT_KEYS = HOME_LAYOUT_COMPONENT_OPTIONS.map((o) => o.key);
