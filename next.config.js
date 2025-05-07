/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "api.dicebear.com"],
  },
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors for build
    // This is not recommended unless you're fixing the errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
