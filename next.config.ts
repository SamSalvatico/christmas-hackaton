import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    // TypeScript errors should fail the build in production
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

