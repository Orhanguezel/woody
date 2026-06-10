/** @type {import('next').NextConfig} */
// Path-mount (tek domain altinda /admin): ADMIN_ASSET_PREFIX set edilince
// statik asset'ler bu prefix altindan servis edilir (frontend ile /_next cakismaz).
// Bos birakilirsa (local dev / subdomain) hicbir sey degismez.
const ASSET_PREFIX = (process.env.ADMIN_ASSET_PREFIX || '').replace(/\/+$/, '');

const nextConfig = {
  reactCompiler: true,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  ...(ASSET_PREFIX ? { assetPrefix: ASSET_PREFIX } : {}),

  // ✅ Image optimization config
  images: {
    // Path-mount'ta /_next/image frontend'e dusmesin diye optimizasyonu kapat.
    ...(ASSET_PREFIX ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8101',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ kaldırıyoruz: /admin/dashboard -> /admin/dashboard/default
  async redirects() {
    return [
      // İstersen eski linkleri yakalamak için tersine redirect bırakabilirsin:
      // { source: '/admin/dashboard/default', destination: '/admin/dashboard', permanent: false },
    ];
  },

  async rewrites() {
    const raw =
      process.env.PANEL_API_URL || process.env.NEXT_PUBLIC_PANEL_API_URL || 'http://127.0.0.1:8086';
    const originOnly = String(raw)
      .replace(/\/+$/, '')
      .replace(/\/api(\/v\d+)?$/i, '');
    const mediaOrigin = String(
      process.env.PANEL_MEDIA_URL ||
        process.env.PANEL_FRONTEND_URL ||
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        'http://127.0.0.1:3101',
    ).replace(/\/+$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${originOnly}/api/v1/:path*`,
      },
      // Yerel storage dosyalari backend'te servis edilir (LOCAL_STORAGE_BASE_URL=/uploads).
      // Admin origin'inden goreli /uploads/* isteklerini backend'e proxy'le ki
      // yuklenen gorseller (avatar, medya) onizlemede gorunsun.
      {
        source: '/uploads/:path*',
        destination: `${originOnly}/uploads/:path*`,
      },
      // Referans medya dosyalari public frontend tarafinda durur. Admin dev/preview
      // origin'inde de ayni goreli URL'ler kirilmadan calissin.
      {
        source: '/media/:path*',
        destination: `${mediaOrigin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
