import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "api.dicebear.com"],
  },
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors for build
    // This is not recommended unless you're fixing the errors
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
