/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15+: serverComponentsExternalPackages taşındı
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
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


