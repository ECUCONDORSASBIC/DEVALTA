/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuración experimental optimizada para Next.js 15.3.4
  experimental: {
    optimizePackageImports: ['three', 'lucide-react']
  },
  
  // Headers para desarrollo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ]
  },
  
  // Configuración de webpack mejorada para Three.js
  webpack: (config, { isServer, dev }) => {
    // Configuración para módulos externos
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // Configuración específica para el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
      
      // Optimización de chunks mejorada
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            // Chunk específico para Three.js
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            // Chunk para otras librerías grandes
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 10,
              minSize: 20000,
              maxSize: 244000,
            }
          }
        }
      };
      
      // Configurar performance budgets para desarrollo
      if (dev) {
        config.performance = {
          maxAssetSize: 1000000, // 1MB en desarrollo
          maxEntrypointSize: 1000000,
          hints: 'warning'
        };
      }
    }
    
    // Configuración de module rules
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });
    
    return config;
  },
  
  // Configuración de imágenes
  images: {
    unoptimized: true
  },
  
  // Configuración de salida
  output: 'standalone'
};

module.exports = nextConfig;
