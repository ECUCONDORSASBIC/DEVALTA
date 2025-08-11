const { appConfigs } = require('@altamedica/config-next');

/** @type {import('next').NextConfig} */
module.exports = appConfigs.patients({
  // Custom configuration for patients app
  transpilePackages: [
    // Additional packages specific to patients
    '@altamedica/patient-services',
    '@altamedica/medical-hooks',
    '@altamedica/telemedicine-core',
  ],
  
  // Image domains for patient content
  images: {
    domains: [
      'localhost',
      'altamedica.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google OAuth avatars
    ],
  },
  
  // Custom webpack config for patients app
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Medical libraries for patients
            medical: {
              test: /[\\/]node_modules[\\/](@tensorflow|chart\.js|webcamjs)[\\/]/,
              name: 'medical-libs',
              chunks: 'all',
              priority: 15,
            },
            // Firebase for real-time features
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 20,
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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    scrollRestoration: true,
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  
  // Patient-specific caching headers
  async headers() {
    const baseHeaders = await appConfigs.patients().headers();
    return [
      ...baseHeaders,
      {
        source: '/ai-diagnosis',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  }
});