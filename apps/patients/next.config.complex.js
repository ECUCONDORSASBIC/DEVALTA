// Configuración simplificada para desarrollo
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones experimentales
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
    optimizeCss: true
  },
  
  // Configuración de imágenes optimizada
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Headers de performance y CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
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
      }
    ]
  },
  
  // Configuración de webpack optimizada
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Optimizar chunks
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
          patient: {
            name: 'patient-core',
            test: /[\\/]src[\\/](components[\\/]patient|hooks[\\/]patient)[\\/]/,
            priority: 20,
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
  }
};

export default nextConfig;
