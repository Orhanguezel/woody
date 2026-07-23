export const ROUTES = {
  home: '/',
  about: '/about',
  blog: {
    index: '/blog',
    detail: (slug: string) => `/blog/${slug}`,
  },
  profile: {
    index: '/profile',
    privacy: '/profile/privacy',
  },
  contact: '/contact',
  faqs: '/faqs',
  legal: {
    terms: '/kullanim-sartlari',
    privacy: '/gizlilik',
    cookie: '/cerez-politikasi',
    kvkk: '/kvkk',
  },
} as const;
