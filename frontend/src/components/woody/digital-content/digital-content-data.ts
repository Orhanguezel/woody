import { BookOpen, Film, Library, Music } from 'lucide-react';

export const DIGITAL_VALID_PASSWORDS = [
  // TODO: Move school content password verification to the backend before paid/subscription library launch.
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

export const DIGITAL_PROTECTED_SECTIONS = ['storyland', 'movieland'];

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
  topic?: string;
  thumbnail: string;
  audioUrl?: string;
  videoUrl?: string;
};

export type DigitalContentCopy = {
  hero?: { title?: string; description?: string; eyebrow?: string };
  footnote?: string;
  levelLabels?: Record<string, { title?: string; subtitle?: string; detailTitle?: string }>;
  sectionLabels?: Record<string, { title?: string; description?: string; badge?: string }>;
  library?: {
    badge?: string;
    title?: string;
    description?: string;
    modalTitle?: string;
    modalDescription?: string;
    registerCta?: string;
    loginCta?: string;
  };
  ui?: Record<string, string>;
  musicland?: {
    intro?: string;
    tracks?: Record<string, DigitalContentItem[]>;
  };
};

export function getLevelTitle(level: string, copy?: DigitalContentCopy) {
  return copy?.levelLabels?.[level]?.detailTitle || copy?.levelLabels?.[level]?.title || level;
}

export function getSectionTitle(section: string, copy?: DigitalContentCopy) {
  return copy?.sectionLabels?.[section]?.title || section;
}

export function getMusiclandTracks(level: string, copy?: DigitalContentCopy) {
  return copy?.musicland?.tracks?.[level] ?? [];
}

export function getGeneratedItems(level: string, section: string, copy?: DigitalContentCopy): DigitalContentItem[] {
  if (section === 'musicland') return getMusiclandTracks(level, copy);
  const sectionMeta = DIGITAL_SECTIONS.find((item) => item.id === section);
  const count = sectionMeta?.count ?? 0;
  const color = SECTION_PLACEHOLDER_HEX[section as DigitalSectionId] ?? 'F5C518';
  const title = getSectionTitle(section, copy);
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${title} ${index + 1}`,
    thumbnail: `https://via.placeholder.com/300x200/${color}/FFFFFF?text=${encodeURIComponent(`${title} ${index + 1}`)}`,
    videoUrl: '',
  }));
}
