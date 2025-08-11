const { appConfigs } = require('@altamedica/config-next');
const createBundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const config = appConfigs.admin({
  // Custom configuration for admin app
  transpilePackages: [
    // Additional packages specific to admin
    '@altamedica/shared',
    '@altamedica/database',
  ],
  
  // Image domains for admin content
  images: {
    domains: [
      'localhost',
      'altamedica.com',
      'firebasestorage.googleapis.com',
      'admin-assets.altamedica.com',
    ],
  },
  
  // Custom webpack config for admin app
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        stream: false,
      };
      
      // Optimize chunks for admin panel
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true
          },
          admin: {
            name: 'admin-core',
            test: /[\\/]src[\\/](components[\\/]admin|hooks[\\/]admin)[\\/]/,
            priority: 20,
            reuseExistingChunk: true
          },
          ui: {
            name: 'ui-components',
            test: /[\\/]node_modules[\\/](@headlessui|@radix-ui)[\\/]/,
            priority: 15,
            reuseExistingChunk: true
          },
          charts: {
            name: 'admin-charts',
            test: /[\\/]node_modules[\\/](recharts|d3|victory)[\\/]/,
            priority: 18,
            reuseExistingChunk: true
          },
          firebase: {
            name: 'firebase',
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            priority: 17,
            reuseExistingChunk: true
          }
        }
      };
      
      // Performance budgets
      config.performance = {
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
        hints: dev ? false : 'warning'
      };
    }
    
    return config;
  },
  
  // Additional experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@headlessui/react',
      '@radix-ui/react-icons',
    ],
  },

  // TypeScript and ESLint - stricter for admin
  typescript: {
    ignoreBuildErrors: false, // Admin should have no type errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Admin should pass all linting
  },
  
  // Enhanced security headers for admin (already includes base from appConfigs)
  extraHeaders: [
    {
      key: 'X-Robots-Tag',
      value: 'noindex, nofollow, noarchive, nosnippet, noimageindex'
    },
    {
      key: 'X-Permitted-Cross-Domain-Policies',
      value: 'none'
    }
  ],
  
  // Admin-specific headers
  async headers() {
    const baseHeaders = await appConfigs.admin().headers();
    return [
      ...baseHeaders,
      {
        source: '/api/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
  
  // Admin-specific redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  }
});

module.exports = withBundleAnalyzer(config);