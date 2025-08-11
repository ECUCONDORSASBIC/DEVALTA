const { appConfigs } = require('@altamedica/config-next');
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = appConfigs.companies({
  // Custom configuration for companies app
  transpilePackages: [
    // Additional packages specific to companies
    '@altamedica/marketplace-hooks',
    '@altamedica/maps', // For hospital redistribution maps
  ],
  
  // Image domains for company content
  images: {
    domains: [
      'localhost',
      'altamedica.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'company-logos.altamedica.com', // Company logos CDN
    ],
  },
  
  // Custom webpack config for companies app
  webpack: (config, { isServer, dev }) => {
    // Development alias for marketplace-hooks
    if (dev) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['@altamedica/marketplace-hooks'] = path.resolve(
        __dirname,
        '../../packages/marketplace-hooks/src'
      );
    }
    
    if (!isServer) {
      // Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Leaflet and mapping libraries
            maps: {
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
              name: 'maps',
              chunks: 'all',
              priority: 20,
            },
            // Charts for analytics (recharts has issues with Turbopack)
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3|victory)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 15,
            },
            // Firebase for real-time features
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 18,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Additional experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      // Note: recharts removed due to Turbopack issues
    ],
    externalDir: true,
    scrollRestoration: true,
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Company-specific headers
  async headers() {
    const baseHeaders = await appConfigs.companies().headers();
    return [
      ...baseHeaders,
      {
        source: '/api/marketplace/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      {
        source: '/operations-hub',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow embedding in same origin for dashboard
          },
        ],
      },
    ];
  },
  
  // Companies-specific redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/operations-hub',
        permanent: true,
      },
      {
        source: '/crisis-management',
        destination: '/operations-hub',
        permanent: true,
      },
    ];
  }
});