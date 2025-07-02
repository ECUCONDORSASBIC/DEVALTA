/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['leaflet'],
    serverComponentsExternalPackages: ['leaflet']
  },
  
  // Optimizaciones de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Headers de seguridad y performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Configuración de webpack optimizada
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      // Optimizar chunks para evitar violaciones de performance
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          leaflet: {
            name: 'leaflet',
            test: /[\/]node_modules[\/]leaflet[\/]/,
            priority: 10,
            reuseExistingChunk: true
          },
          maps: {
            name: 'maps',
            test: /[\/](leaflet|mapbox|ol)[\/]/,
            priority: 8,
            reuseExistingChunk: true
          },
          vendor: {
            name: 'vendor',
            test: /[\/]node_modules[\/]/,
            priority: 5,
            reuseExistingChunk: true,
            maxSize: 200000
          }
        }
      };
      
      // Configurar performance budgets
      config.performance = {
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
        hints: dev ? false : 'warning'
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
