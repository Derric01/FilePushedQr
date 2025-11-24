/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Express integration
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
