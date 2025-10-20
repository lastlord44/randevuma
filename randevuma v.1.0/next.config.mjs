/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { turbo: false },        // Webpack'e zorla
  eslint: { ignoreDuringBuilds: true },  // (teşhis için)
  typescript: { ignoreBuildErrors: true } // (teşhis için)
};
export default nextConfig;
