/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15+: serverComponentsExternalPackages taşındı
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@libsql/client', '@prisma/adapter-libsql');
    }
    config.module.rules.push({
      test: /\/(README\.md|LICENSE)$/i,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;


