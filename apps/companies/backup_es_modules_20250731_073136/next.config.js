/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [],
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
