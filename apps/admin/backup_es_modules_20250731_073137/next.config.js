// Módulo ESM: Next.js config optimizado para admin
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  
  // Optimizaciones experimentales para panel de administración
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@headlessui/react'],
    optimizeCss: true
  },
  
  // Configuración de imágenes optimizada
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Headers de seguridad y CORS para panel de administración
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
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  
  // Configuración de webpack optimizada para admin
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Optimizar chunks para panel de administración
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
            test: /[\\/]node_modules[\\/]@headlessui[\\/]/,
            priority: 15,
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

export default withBundleAnalyzer(nextConfig);
