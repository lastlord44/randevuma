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
  
  webpack: (config, { isServer, nextRuntime }) => {
    // Only externalize for Node.js runtime (NOT Edge)
    if (isServer && nextRuntime !== 'edge') {
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      config.externals.push(
        ({ request }, callback) => {
          if (request === '@libsql/client' || request === '@prisma/adapter-libsql') {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    config.module.rules.push({
      test: /\/(README\.md|LICENSE)$/i,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;


