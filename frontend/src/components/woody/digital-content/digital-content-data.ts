import { BookOpen, Film, Library, Music } from 'lucide-react';

export const DIGITAL_VALID_PASSWORDS = [
  '3333',
  '1023', '8472', '5619', '3904', '7281', '6645', '2198', '7530', '4802', '9157',
  '6384', '2741', '5096', '1837', '7429', '3568', '9210', '4673', '8052', '1149',
  '6932', '2785', '5410', '8603', '7391', '4027', '1586', '9974', '6328', '2840',
  '7159', '4362', '8207', '1593', '6701', '2489', '9015', '3746', '5820', '6631',
  '4208', '7754', '2986', '5417', '8632', '3179', '6045', '1892', '7360', '9521',
  '4178', '6309', '2851', '7946', '5283', '1497', '8601', '3725', '6480', '9134',
  '2057', '4813', '7592', '1348', '6827', '9903', '2764', '5189', '7435', '8640',
  '3908', '6214', '1572', '8046', '2935', '5681', '7420', '3197', '6502', '9871',
  '2468', '1357', '8642', '5793', '4081', '7326', '1950', '6217', '7834', '4529',
  '9182', '3407', '6759', '2048', '5863', '7294', '8106', '4671', '3528', '6930',
];

export const DIGITAL_PROTECTED_SECTIONS = ['storyland', 'library', 'movieland'];

export const DIGITAL_LEVELS = [
  { id: 'basic', name: 'BASIC', subtitle: 'Level 1', color: 'var(--level-basic)' },
  { id: 'junior', name: 'JUNIOR', subtitle: 'Level 2', color: 'var(--level-junior)' },
  { id: 'senior', name: 'SENIOR', subtitle: 'Level 3', color: 'var(--level-senior)' },
] as const;

export const DIGITAL_SECTIONS = [
  { id: 'storyland', name: 'Storyland', icon: BookOpen, color: 'var(--level-junior)', count: 16 },
  { id: 'movieland', name: 'Movieland', icon: Film, color: 'var(--level-pro)', count: 8 },
  { id: 'musicland', name: 'Musicland', icon: Music, color: '#6B21A8', count: 8 },
  { id: 'library', name: 'Library', icon: Library, color: '#92400E', count: 0 },
] as const;

export type DigitalLevelId = (typeof DIGITAL_LEVELS)[number]['id'];
export type DigitalSectionId = (typeof DIGITAL_SECTIONS)[number]['id'];

/** Placeholder thumbnail üretimi için (via.placeholder hex, # yok). */
const SECTION_PLACEHOLDER_HEX: Record<DigitalSectionId, string> = {
  storyland: 'F5C518',
  movieland: 'DC2626',
  musicland: '6B21A8',
  library: '92400E',
};

export type DigitalContentItem = {
  id: number;
  title: string;
  thumbnail: string;
  audioUrl?: string;
  videoUrl?: string;
};

export const DIGITAL_LEVEL_TITLES: Record<string, string> = {
  basic: 'BASIC Level',
  junior: 'JUNIOR Level',
  senior: 'SENIOR Level',
};

export const DIGITAL_SECTION_TITLES: Record<string, string> = {
  storyland: 'Storyland',
  movieland: 'Movieland',
  musicland: 'Musicland',
  library: 'Library',
};

const musiclandTracks: Record<string, DigitalContentItem[]> = {
  basic: [
    { id: 1, title: 'Theme 1', audioUrl: '/media/woody/reference/iccoy0mm_theme%201%20.mp3', thumbnail: '/media/woody/reference/pxj6okjj_1.png' },
    { id: 2, title: 'Theme 2', audioUrl: '/media/woody/reference/y3dz0w3v_theme%202.mp3', thumbnail: '/media/woody/reference/3r3f6uwx_2.png' },
    { id: 3, title: 'Theme 3', audioUrl: '/media/woody/reference/lfgctcef_theme%203%20.mp3', thumbnail: '/media/woody/reference/fvlxvwww_3.png' },
    { id: 4, title: 'Theme 4', audioUrl: '/media/woody/reference/6pfdm5c0_theme%204%20.mp3', thumbnail: '/media/woody/reference/5ukkudwy_4.png' },
    { id: 5, title: 'Theme 5', audioUrl: '/media/woody/reference/w4djc170_Theme%205.mp3', thumbnail: '/media/woody/reference/9bh5jjnf_5.png' },
    { id: 6, title: 'Theme 6', audioUrl: '/media/woody/reference/g2sj2m65_theme%206.mp3', thumbnail: '/media/woody/reference/9vonr43z_6.png' },
    { id: 7, title: 'Theme 7', audioUrl: '/media/woody/reference/2sncgdds_theme%207.mp3', thumbnail: '/media/woody/reference/73lilv7l_7.png' },
    { id: 8, title: 'Theme 8', audioUrl: '/media/woody/reference/726lj4d9_theme%208.mp3', thumbnail: '/media/woody/reference/8ontm0a3_8.png' },
  ],
  junior: [
    { id: 1, title: 'Theme 1', audioUrl: '/media/woody/reference/r6xwf4fx_Theme%201.mp3', thumbnail: '/media/woody/reference/rn4hl66d_1.png' },
    { id: 2, title: 'Theme 2', audioUrl: '/media/woody/reference/ypzzvi5i_theme%202.mp3', thumbnail: '/media/woody/reference/68recr7x_2.png' },
    { id: 3, title: 'Theme 3', audioUrl: '/media/woody/reference/07v23187_theme%203%20.mp3', thumbnail: '/media/woody/reference/ex1xgfa1_3.png' },
    { id: 4, title: 'Theme 4', audioUrl: '/media/woody/reference/kbi01h0d_theme%204%20.mp3', thumbnail: '/media/woody/reference/0skbimng_4.png' },
    { id: 5, title: 'Theme 5', audioUrl: '/media/woody/reference/fqeyspb4_theme%205.mp3', thumbnail: '/media/woody/reference/uj8it9vz_5.png' },
    { id: 6, title: 'Theme 6', audioUrl: '/media/woody/reference/c2eihyip_theme%206.mp3', thumbnail: '/media/woody/reference/22qudlvp_11.png' },
    { id: 7, title: 'Theme 7', audioUrl: '/media/woody/reference/ttak76ty_theme%207.mp3', thumbnail: '/media/woody/reference/xvg3m6sd_13.png' },
    { id: 8, title: 'Theme 8', audioUrl: '/media/woody/reference/hj56hh9t_theme%208%20.mp3', thumbnail: '/media/woody/reference/cnuuucdz_15.png' },
  ],
  senior: [
    { id: 1, title: 'Theme 1', audioUrl: '/media/woody/reference/9uqnvd3a_theme%201.mp3', thumbnail: '/media/woody/reference/ejpqg9mg_I%CC%87lk%20sayfa%20theme%201_Sayfa_1.jpg' },
    { id: 2, title: 'Theme 2', audioUrl: '/media/woody/reference/ymbcni8l_theme%202%20.mp3', thumbnail: '/media/woody/reference/pxbe6piu_I%CC%87lk%20sayfa%20theme%201_Sayfa_2.jpg' },
    { id: 3, title: 'Theme 3', audioUrl: '/media/woody/reference/k7dc3mmg_theme%203.mp3', thumbnail: '/media/woody/reference/uoftphsc_I%CC%87lk%20sayfa%20theme%201_Sayfa_3.jpg' },
    { id: 4, title: 'Theme 4', audioUrl: '/media/woody/reference/87azrhhk_theme%204.mp3', thumbnail: '/media/woody/reference/kbd06i5m_I%CC%87lk%20sayfa%20theme%201_Sayfa_4.jpg' },
    { id: 5, title: 'Theme 5', audioUrl: '/media/woody/reference/tuf69tq4_theme%205%20.mp3', thumbnail: '/media/woody/reference/bbn6tpbx_I%CC%87lk%20sayfa%20theme%201_Sayfa_5.jpg' },
    { id: 6, title: 'Theme 6', audioUrl: '/media/woody/reference/u633wm8u_THEME%206.mp3', thumbnail: '/media/woody/reference/wh47lcep_I%CC%87lk%20sayfa%20theme%201_Sayfa_6.jpg' },
    { id: 7, title: 'Theme 7', audioUrl: '/media/woody/reference/8620pn8i_THEME%207.mp3', thumbnail: '/media/woody/reference/w6y5frsb_I%CC%87lk%20sayfa%20theme%201_Sayfa_7.jpg' },
    { id: 8, title: 'Theme 8', audioUrl: '/media/woody/reference/y64ptt3d_theme%208%20.mp3', thumbnail: '/media/woody/reference/ymtca4bt_I%CC%87lk%20sayfa%20theme%201_Sayfa_8.jpg' },
  ],
};

export function getMusiclandTracks(level: string) {
  return musiclandTracks[level] ?? [];
}

export function getGeneratedItems(level: string, section: string): DigitalContentItem[] {
  if (section === 'musicland') return getMusiclandTracks(level);
  const sectionMeta = DIGITAL_SECTIONS.find((item) => item.id === section);
  const count = sectionMeta?.count ?? 0;
  const color = SECTION_PLACEHOLDER_HEX[section as DigitalSectionId] ?? 'F5C518';
  const title = DIGITAL_SECTION_TITLES[section] ?? section;
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${title} ${index + 1}`,
    thumbnail: `https://via.placeholder.com/300x200/${color}/FFFFFF?text=${encodeURIComponent(`${title} ${index + 1}`)}`,
    videoUrl: '',
  }));
}
