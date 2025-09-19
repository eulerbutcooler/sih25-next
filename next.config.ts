// next.config.ts
import { type NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use webpack instead of turbopack for better PWA compatibility
  webpack: (config) => {
    return config;
  },
  images: {
    domains: ["sebfmvfueecjzdxhkcnk.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sebfmvfueecjzdxhkcnk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
