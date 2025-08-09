/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 🚀 PERFORMANCE OPTIMIZATIONS - ENHANCED FOR DEVELOPMENT
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  // swcMinify removido - es default en Next.js 15+
  
  // 🔥 DESARROLLO OPTIMIZADO
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development', // Solo para dev
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // 🖼️ OPTIMIZACIÓN DE IMÁGENES MÉDICAS
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 año para imágenes médicas
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 🛡️ SECURITY HEADERS HIPAA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy para aplicaciones médicas
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.firebase.com",
              "style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com",
              "img-src 'self' data: blob: *.googleapis.com *.firebase.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' *.firebase.com *.googleapis.com wss://localhost:8888",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Headers de seguridad médica
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
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
            value: 'camera=(*), microphone=(*), geolocation=(self), notifications=(self)'
          },
          // Headers específicos para telemedicina
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },
  
  // ⚡ WEBPACK OPTIMIZATIONS
  webpack: (config, { isServer, dev }) => {
    // Fallbacks para módulos Node.js
    if (!isServer) {
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

      // 🔧 Exclude Firebase Admin from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/auth': 'commonjs firebase-admin/auth',
        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
      });
      
      // 🎯 OPTIMIZE THREE.JS BUNDLE - Evitar duplicaciones
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': require.resolve('three'),
        '@react-three/fiber': require.resolve('@react-three/fiber'),
      };
    }

    // 🌐 WebAssembly support removed - Firebase Admin now server-only
    
    // Optimizaciones de producción
    if (!dev) {
      // Chunk splitting optimizado
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Firebase y servicios médicos
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 20,
            },
            // Librerías médicas (Three.js, Leaflet, etc.)
            medical: {
              test: /[\\/]node_modules[\\/](three|leaflet|@tensorflow|@react-three)[\\/]/,
              name: 'medical-libs',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            // Librerías de UI pesadas
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|recharts|canvas-confetti)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 12,
            },
            // React y Next.js
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 10,
            },
            // Otras librerías
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
  
  // 📊 EXPERIMENTAL FEATURES - ENHANCED FOR PERFORMANCE
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'recharts'
    ],
    // 🎯 Optimizaciones específicas para Three.js y componentes pesados
    optimizeCss: true,
    webpackBuildWorker: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB para páginas grandes
    // serverComponentsExternalPackages removido - causaba conflicto con Turbopack
  },

  // 🔧 TURBOPACK CONFIGURATION (Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Optimizaciones adicionales
    memoryLimit: 4096, // Aumentar memoria para componentes 3D
  },
  
  // 🎯 CONFIGURACIÓN ESPECÍFICA PARA TELEMEDICINA
  redirects: async () => {
    return [
      // Redirecciones para URLs legacy
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
  
  // 📱 PWA PREPARATION
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      }
    ];
  }
};

module.exports = nextConfig;