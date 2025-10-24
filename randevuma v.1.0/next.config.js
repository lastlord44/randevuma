// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15+ önerilen: server tarafında belirli paketleri external say
  experimental: {
    serverExternalPackages: [
      '@libsql/client',
      '@prisma/adapter-libsql',
      '@libsql/isomorphic-ws',
      '@libsql/isomorphic-fetch',
    ],
  },

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

  webpack: (config, { isServer, nextRuntime, webpack }) => {
    // 1) README.md / LICENSE / .md / .txt dosyalarını modül değil, ham kaynak olarak yükle
    config.module.rules.push({
      test: /\.(md|markdown|txt|LICENSE)$/i,
      type: 'asset/source',   // raw-loader yerine built-in
    });

    // 2) @libsql/* ve adapter'i yalnızca Node runtime'da external yap (edge'e asla uygulama)
    if (isServer && nextRuntime !== 'edge') {
      config.externals.push(({ request }, callback) => {
        const externals = new Set([
          '@libsql/client',
          '@prisma/adapter-libsql',
          '@libsql/isomorphic-ws',
          '@libsql/isomorphic-fetch',
        ]);
        if (externals.has(request)) {
          return callback(null, `commonjs ${request}`);
        }
        return callback();
      });
    }

    // (isteğe bağlı) Bazı paketler exports/conditions yüzünden browser build'ine kayabiliyor.
    // Node önceliğini garanti etmek için conditionNames'e node ekleyebilirsin:
    config.resolve = config.resolve || {};
    config.resolve.conditionNames = Array.from(
      new Set([...(config.resolve.conditionNames || []), 'node', 'import', 'require', 'default'])
    );

    return config;
  },
};

module.exports = nextConfig;
