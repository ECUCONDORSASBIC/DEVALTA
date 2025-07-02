/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@altamedica/ui', '@altamedica/shared', '@altamedica/types'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
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
