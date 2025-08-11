const { appConfigs } = require('@altamedica/config-next');

/** @type {import('next').NextConfig} */
module.exports = appConfigs.doctors({
  // Custom configuration for doctors app
  transpilePackages: [
    // Additional packages specific to doctors
    '@altamedica/medical-services',
    '@altamedica/medical-hooks',
    '@altamedica/telemedicine-core',
  ],
  
  // Styled components support
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  
  // Image domains for medical content
  images: {
    domains: [
      'localhost',
      'altamedica.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com', // Medical document storage
    ],
  },
  
  // Custom webpack config for doctors app
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
        buffer: false,
        stream: false,
        crypto: false,
        util: false,
        fs: false,
        net: false,
        tls: false,
      };

      // Provide plugin for global variables
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({}),
        })
      );

      // Ignore node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': false,
        'node:buffer': false,
        'node:stream': false,
      };
    }
    
    // Production optimizations
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Telemedicine and WebRTC libs
            telemedicine: {
              test: /[\\/]node_modules[\\/](webrtc|simple-peer|socket\.io)[\\/]/,
              name: 'telemedicine',
              chunks: 'all',
              priority: 20,
            },
            // Medical visualization libs
            medical: {
              test: /[\\/]node_modules[\\/](chart\.js|d3|recharts)[\\/]/,
              name: 'medical-viz',
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
      'recharts',
      'd3',
    ],
    scrollRestoration: true,
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Doctor-specific headers for medical data
  async headers() {
    const baseHeaders = await appConfigs.doctors().headers();
    return [
      ...baseHeaders,
      {
        source: '/api/medical/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/telemedicine/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(*), microphone=(*), display-capture=(*)',
          },
        ],
      },
    ];
  }
});