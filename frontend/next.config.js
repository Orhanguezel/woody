/** @type {import('next').NextConfig} */

// ✅ Bundle Analyzer (ANALYZE=true için)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

function imageHostsFromSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (!raw) return [];
  try {
    const u = new URL(raw);
    const host = u.hostname;
    const proto = u.protocol === 'http:' ? 'http' : 'https';
    const out = [{ protocol: proto, hostname: host, pathname: '/**' }];
    if (host.startsWith('www.')) {
      out.push({ protocol: proto, hostname: host.slice(4), pathname: '/**' });
    } else if (host && host !== 'localhost' && !host.startsWith('127.')) {
      out.push({ protocol: 'https', hostname: `www.${host}`, pathname: '/**' });
    }
    return out;
  } catch {
    return [];
  }
}

const LOCALE_ROUTE_GROUP = 'tr|en|de|ar|fr|ru|es|it|nl|pt-br';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: http: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' http: https: ws: wss:",
      "media-src 'self' blob: http: https:",
      // PayTR odeme iframe'i (paytr.com) + 3D Secure adiminda bankanin ACS sayfasi.
      // 3D dogrulama, iframe'i bankanin kendi alan adina yonlendiriyor; Turkiye'deki
      // tum banka ACS alan adlarini saymak mumkun degil, o yuzden https: da acik.
      // frame-src'de PayTR yokken tarayici odeme ekranini engelliyordu:
      // "This content is blocked. Contact the site owner to fix the issue." (2026-08-31)
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.paytr.com https://*.paytr.com https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.paytr.com",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self)',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig = {
  turbopack: {},
  reactStrictMode: true,
  trailingSlash: false,
  compress: true,

  // ✅ Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // ✅ Experimental optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'lucide-react',
      'date-fns',
    ],
  },

  // ✅ Webpack config
  webpack: (config, { isServer }) => {
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },

      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      ...imageHostsFromSiteUrl(),
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  // Backend uploads klasörünü frontend domain'i üzerinden serve et.
  // Dev: localhost:3000/uploads/x.png → backend origin/uploads (varsayilan 8086)
  // Prod'da Nginx aynı yönlendirmeyi /uploads location bloğuyla yapar.
  async rewrites() {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8086/api/v1').replace(/\/+$/, '');
    const backendUrl = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    const devApiV1 =
      process.env.NODE_ENV === 'development'
        ? [{ source: '/api/v1/:path*', destination: `${apiBase}/:path*` }]
        : [];
    return [
      ...devApiV1,
      { source: '/:locale/hakkimizda', destination: '/:locale/about' },
      { source: '/:locale/how-it-works', destination: '/:locale?section=hybrid_model' },
      { source: '/:locale/nasil-calisir', destination: '/:locale?section=hybrid_model' },
      { source: '/:locale/referanslar', destination: '/:locale?section=testimonials' },
      { source: '/:locale/testimonials', destination: '/:locale?section=testimonials' },
      { source: '/:locale/yorumlar', destination: '/:locale?section=testimonials' },
      { source: '/:locale/featured', destination: '/:locale?section=consultants_featured' },
      { source: '/:locale/popular', destination: '/:locale?section=consultants_popular' },
      { source: '/:locale/trust', destination: '/:locale?section=trust' },
      { source: '/:locale/privacy', destination: '/:locale?section=trust' },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
    ];
  },

  async headers() {
    const staticContentCache = [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    ];

    // Filtreye gore degisen dinamik sayfalar (magaza listesi) — asla stale/eski servis edilmesin.
    // public + stale-while-revalidate, deploy sonrasi tarayiciya eski tasarimi gosteriyordu.
    const dynamicNoStaleCache = [
      {
        key: 'Cache-Control',
        value: 'private, no-cache, no-store, must-revalidate',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})`,
        headers: staticContentCache,
      },
      {
        source:
          `/:locale(${LOCALE_ROUTE_GROUP})/:page(preschool|workshop|home-tutor|woody-academy|library|blog|digital-content|faqs|editorial-policy|contact|terms|privacy-policy|cookie-policy|kvkk)`,
        headers: staticContentCache,
      },
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/blog/:path*`,
        headers: staticContentCache,
      },
      // Magaza LISTESI (filtreli, dinamik): stale cache yok
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/store`,
        headers: dynamicNoStaleCache,
      },
      // Magaza urun DETAY sayfalari (/store/<slug>): cache'lenebilir kalsin
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/store/:path+`,
        headers: staticContentCache,
      },
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/digital-content/:path*`,
        headers: staticContentCache,
      },
    ];
  },

  async redirects() {
    return [
      { source: '/:locale/store/1', destination: '/:locale/store/basic-level-set-ogrenci-seti-0001', permanent: true },
      { source: '/:locale/store/2', destination: '/:locale/store/junior-level-set-ogrenci-seti-0002', permanent: true },
      { source: '/:locale/store/3', destination: '/:locale/store/senior-level-set-ogrenci-seti-0003', permanent: true },
      { source: '/:locale/store/7', destination: '/:locale/store/atolye-basic-0007', permanent: true },
      { source: '/:locale/store/8', destination: '/:locale/store/atolye-junior-0008', permanent: true },
      { source: '/:locale/store/9', destination: '/:locale/store/atolye-senior-0009', permanent: true },
      { source: '/:locale/store/10', destination: '/:locale/store/atolye-pro-000a', permanent: true },
      { source: '/:locale/store/13', destination: '/:locale/store/home-basic-000d', permanent: true },
      { source: '/:locale/store/14', destination: '/:locale/store/home-junior-000e', permanent: true },
      { source: '/:locale/store/15', destination: '/:locale/store/home-senior-000f', permanent: true },
      { source: '/:locale/store/16', destination: '/:locale/store/home-pro-0010', permanent: true },
      { source: '/:locale/gutschein', destination: '/:locale', permanent: true },
      { source: '/:locale/services', destination: '/:locale/consultants', permanent: true },
      { source: '/:locale/appointment', destination: '/:locale/consultants', permanent: true },
      // Yasal sayfa duplicate URL konsolidasyonu: EN-slug -> TR-slug (kanonik) 301.
      { source: '/:locale/privacy-policy', destination: '/:locale/gizlilik', permanent: true },
      { source: '/:locale/cookie-policy', destination: '/:locale/cerez-politikasi', permanent: true },
      { source: '/:locale/terms', destination: '/:locale/kullanim-sartlari', permanent: true },
      // Iceriksiz orphan yasal template route'lari -> ilgili kanonik sayfaya.
      { source: '/:locale/privacy-notice', destination: '/:locale/gizlilik', permanent: true },
      { source: '/:locale/legal-notice', destination: '/:locale/kvkk', permanent: true },

      // --- Eski WordPress/woodymagaza site yapisi -> yeni (GSC "Bulunamadi 404" gideri) ---
      // Ozel woodymagaza alt-yollari (catch-all'dan ONCE gelmeli):
      { source: '/woodymagaza/blog/:path*', destination: '/tr/blog', permanent: true },
      { source: '/woodymagaza/urun/:path*', destination: '/tr/store', permanent: true },
      { source: '/woodymagaza/kategori/:path*', destination: '/tr/store', permanent: true },
      { source: '/woodymagaza/iletisim', destination: '/tr/contact', permanent: true },
      { source: '/woodymagaza/giris-yap', destination: '/tr/login', permanent: true },
      { source: '/woodymagaza/kayit-ol', destination: '/tr/register', permanent: true },
      { source: '/woodymagaza/:path*', destination: '/tr', permanent: true },
      { source: '/woodymagaza', destination: '/tr', permanent: true },
      // Eski icerik sayfalari — locale'li (gecerli locale'lerle sinirli):
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/fiyatlar', destination: '/:locale/store', permanent: true },
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/demo-talep', destination: '/:locale/contact', permanent: true },
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/ev-basic', destination: '/:locale/home-tutor', permanent: true },
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/ev-junior', destination: '/:locale/home-tutor', permanent: true },
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/local/:path*', destination: '/:locale/preschool', permanent: true },
      { source: '/:locale(tr|en|de|ar|fr|ru|es|it|nl|pt-br)/sss', destination: '/:locale/faqs', permanent: true },
      // Eski icerik sayfalari — locale'siz (eski WP kok URL'leri):
      { source: '/fiyatlar', destination: '/tr/store', permanent: true },
      { source: '/fiyat', destination: '/tr/store', permanent: true },
      { source: '/demo-talep', destination: '/tr/contact', permanent: true },
      { source: '/ev-basic', destination: '/tr/home-tutor', permanent: true },
      { source: '/ev-junior', destination: '/tr/home-tutor', permanent: true },
      { source: '/ogrenci-junior', destination: '/tr/home-tutor', permanent: true },
      { source: '/sss', destination: '/tr/faqs', permanent: true },
      { source: '/gallery', destination: '/tr', permanent: true },
      { source: '/anaokulu-ingilizce-egitimi-kapsamli-rehber', destination: '/tr/preschool', permanent: true },
      { source: '/local/istanbul-anaokulu-ingilizce-egitimi', destination: '/tr/preschool', permanent: true },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
