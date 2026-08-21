import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/validation'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
