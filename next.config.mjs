/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Express integration
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Disable TypeScript checks during build (for faster deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
