/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable export for development
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
