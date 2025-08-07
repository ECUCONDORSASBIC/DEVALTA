/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔧 ENABLE STRICT MODE FOR BETTER DEVELOPMENT EXPERIENCE
  reactStrictMode: true,
  
  // 🛡️ ENABLE TYPESCRIPT AND ESLINT CHECKS (SECURITY IMPROVEMENT)
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks during builds
    dirs: ['src'], // Only check src directory
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking
  },

  // 🚀 SERVERLESS OPTIMIZATION - Reduce bundle size
  serverExternalPackages: ['firebase-admin'], // Moved from experimental
  outputFileTracingRoot: process.cwd(), // Moved from experimental

  // ⚡ PERFORMANCE OPTIMIZATIONS
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // 📦 WEBPACK OPTIMIZATION FOR SERVERLESS
  webpack: (config, { isServer, dev }) => {
    // Only configure fallbacks for client-side (browser)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Node.js modules that should not be bundled for browser
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        // Keep these for compatibility but optimize
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        process: require.resolve('process/browser'),
      };

      // Add required polyfills
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    // 🎯 OPTIMIZE FIREBASE ADMIN FOR SERVERLESS
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/auth': 'commonjs firebase-admin/auth',
        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
        'firebase-admin/storage': 'commonjs firebase-admin/storage',
      });
    }

    // 📈 ENABLE TREE SHAKING FOR BETTER PERFORMANCE
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }

    return config;
  },

  // 🌍 ENVIRONMENT VARIABLES (PUBLIC)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // 🛡️ SECURITY HEADERS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ⚡ PERFORMANCE OPTIMIZATIONS
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // 📱 OUTPUT CONFIGURATION FOR DEPLOYMENT
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig