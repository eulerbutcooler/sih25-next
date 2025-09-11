// next.config.ts
import { type NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // other config options here
};

export default withPWA({
  ...nextConfig,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  },
});
