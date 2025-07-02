/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@altamedica/ui', '@altamedica/shared', '@altamedica/types'],
  env: {
    CUSTOM_KEY: 'my-value',
  },
  eslint: {
    dirs: ['pages', 'app', 'components', 'lib', 'src'],
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
