const { appConfigs } = require('@altamedica/config-next');
const { attachChunkErrorHandler } = require('@altamedica/utils');

/** @type {import('next').NextConfig} */
module.exports = appConfigs.webApp({
  // Custom configuration for web-app
  transpilePackages: [
    // Additional packages specific to web-app
    '@altamedica/medical-components',
    '@altamedica/patient-services',
    '@altamedica/telemedicine-core',
  ],
  
  // Image domains for medical content
  images: {
    domains: [
      'localhost',
      'altamedica.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google OAuth avatars
    ],
  },
  
  // Custom webpack config for web-app
  webpack: (config, { isServer, dev }) => {
    // Client-side optimizations
    if (!isServer) {
      // Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
      };

      // Exclude Firebase Admin from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/auth': 'commonjs firebase-admin/auth',
        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
      });
      
      // Optimize Three.js bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': require.resolve('three'),
        '@react-three/fiber': require.resolve('@react-three/fiber'),
      };
    }

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 20,
            },
            medical: {
              test: /[\\/]node_modules[\\/](three|leaflet|@tensorflow|@react-three)[\\/]/,
              name: 'medical-libs',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|recharts|canvas-confetti)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 12,
            },
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 10,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 5,
            }
          }
        }
      };
    }
    
    return config;
  },
  
  // Additional experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'recharts'
    ],
    webpackBuildWorker: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000,
  },

  // TypeScript and ESLint for development
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // App-specific redirects
  async redirects() {
    return [
      {
        source: '/telemedicine',
        destination: '/patients',
        permanent: true,
      },
      {
        source: '/doctors-portal',
        destination: '/doctors',
        permanent: true,
      }
    ];
  },
  
  // PWA preparation
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      }
    ];
  }
});