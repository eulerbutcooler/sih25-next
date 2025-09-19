// next.config.ts
import { type NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['sebfmvfueecjzdxhkcnk.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sebfmvfueecjzdxhkcnk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // other config options here
};

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
