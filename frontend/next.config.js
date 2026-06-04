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
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
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
      { source: '/:locale/about', destination: '/:locale?section=promises' },
      { source: '/:locale/hakkimizda', destination: '/:locale?section=promises' },
      { source: '/:locale/how-it-works', destination: '/:locale?section=hybrid_model' },
      { source: '/:locale/nasil-calisir', destination: '/:locale?section=hybrid_model' },
      { source: '/:locale/referanslar', destination: '/:locale?section=testimonials' },
      { source: '/:locale/testimonials', destination: '/:locale?section=testimonials' },
      { source: '/:locale/yorumlar', destination: '/:locale?section=testimonials' },
      { source: '/:locale/featured', destination: '/:locale?section=consultants_featured' },
      { source: '/:locale/popular', destination: '/:locale?section=consultants_popular' },
      { source: '/:locale/trust', destination: '/:locale?section=trust' },
      { source: '/:locale/privacy', destination: '/:locale?section=trust' },
      { source: '/:locale/gizlilik', destination: '/:locale?section=trust' },
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
          `/:locale(${LOCALE_ROUTE_GROUP})/:page(preschool|workshop|home-tutor|woody-academy|library|blog|store|digital-content|faqs|editorial-policy|contact|terms|privacy-policy|cookie-policy|kvkk)`,
        headers: staticContentCache,
      },
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/blog/:path*`,
        headers: staticContentCache,
      },
      {
        source: `/:locale(${LOCALE_ROUTE_GROUP})/store/:path*`,
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
      { source: '/:locale/gutschein', destination: '/:locale', permanent: true },
      { source: '/:locale/services', destination: '/:locale/consultants', permanent: true },
      { source: '/:locale/appointment', destination: '/:locale/consultants', permanent: true },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
