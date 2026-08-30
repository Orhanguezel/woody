// Okul Serisi seviye medyasi — kutu gorselleri + tanitim videolari.
// Workshop (Mini School) ve Home & Tutor sayfalarindaki seviye bolumleri,
// PDF revizyonu geregi okul serisiyle ayni gorsel/video setini kullanir.
// Kaynak: PreschoolPageClient.tsx LEVEL_MEDIA (dedup: preschool da buraya tasinabilir).

export type LevelMedia = {
  name: string;
  tag: 'BASIC' | 'JUNIOR' | 'SENIOR' | 'PRO';
  image: string;
  student?: string;
  teacher?: string;
};

export const LEVEL_MEDIA: readonly LevelMedia[] = [
  {
    name: 'Basic Level',
    tag: 'BASIC',
    image: '/media/woody/reference/3jgyyil9_1.png',
    student: '/media/woody/reference/3lhuchbm_Basic%20o%CC%88g%CC%86renci.mp4',
    teacher: '/media/woody/reference/a8v04k8o_Basic%20teachet.mp4',
  },
  {
    name: 'Junior Level',
    tag: 'JUNIOR',
    image: '/media/woody/reference/h5x59v59_3.png',
    student: '/media/woody/reference/che2qlij_jun%C4%B1or%20o%CC%88g%CC%86renci.mp4',
    teacher: '/media/woody/reference/icoq32rz_jun%C4%B1or%20ogretmen.mp4',
  },
  {
    name: 'Senior Level',
    tag: 'SENIOR',
    image: '/media/woody/reference/m4z26p5k_2.png',
    student: '/media/woody/reference/wmelrnc8_senior%20o%CC%88g%CC%86renci..mp4',
    teacher: '/media/woody/reference/2om7n0iq_senior%20teacher.mp4',
  },
  {
    name: 'PRO Level',
    tag: 'PRO',
    image:
      '/media/woody/reference/6qg348xf_Preschool%20Basic%20(297%20x%20210%20mm)%20(Instagram%20Go%CC%88nderisi%20(45)).png',
  },
] as const;

export const LEVEL_UNDERLINE = [
  'bg-level-basic',
  'bg-level-junior',
  'bg-level-senior',
  'bg-level-pro',
] as const;
