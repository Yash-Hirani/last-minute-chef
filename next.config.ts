import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'duxutcoohteuwwkgypky.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.archanaskitchen.com',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
