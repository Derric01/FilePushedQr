/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Express integration
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Disable ESLint and TypeScript checks during build (for faster deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
