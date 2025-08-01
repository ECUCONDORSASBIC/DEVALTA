/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false
  },
  swcMinify: false,
  compiler: {
    styledComponents: true
  }
}

export default nextConfig
