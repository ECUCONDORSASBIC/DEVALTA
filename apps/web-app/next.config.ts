import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Experimental features básicas
  experimental: {
    optimizeCss: true,
    // Deshabilitar warnings CSS de dependencias externas
    cssChunking: 'strict',
  },
  
  // Turbopack configuration con supresión de warnings
  turbo: {
    // Configuración para suprimir warnings CSS legacy
    rules: {},
    resolveAlias: {
      // Evitar conflictos con CSS legacy
      '@': './src',
    },
  },
  
  // Webpack config para modo de desarrollo
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suprimir warnings CSS específicos en desarrollo
      config.infrastructureLogging = {
        level: 'error',
      };
      config.stats = {
        warnings: false,
      };
    }
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de seguridad mejorados
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Headers para archivos estáticos con cache
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|otf)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
