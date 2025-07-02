// Configuración avanzada de Module Federation para Micro-frontends Médicos
// Altamedica - Compliance HIPAA + Performance Enterprise

const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de seguridad HIPAA (heredada)
  poweredByHeader: false,
  generateEtags: false,
  
  // Optimizaciones experimentales para micro-frontends
  experimental: {
    // Habilitar App Router optimizado
    appDir: true,
    // Optimizar imports de packages
    optimizePackageImports: [
      'lucide-react',
      'date-fns', 
      'recharts',
      '@headlessui/react'
    ],
    // Lazy compilation para desarrollo más rápido
    lazyCompilation: true,
    // Optimización de CSS
    optimizeCss: true,
    // Server Components concurrentes
    serverComponentsExternalPackages: ['@prisma/client'],
    // Turbo mode
    turbo: {
      root: process.cwd()
    }
  },

  // Configuración de imágenes optimizada
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    // Lazy loading por defecto
    loader: 'default',
    // Cache optimizado para imágenes médicas
    cacheMaxAge: 86400 // 24 horas
  },

  // Headers de seguridad médica (heredados)
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
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.altamedica.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.altamedica.com https://*.firebase.com https://*.googleapis.com;"
          },
          // Header específico para micro-frontends
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

  // Configuración de redirecciones para micro-frontends
  async redirects() {
    return [
      {
        source: '/pacientes',
        destination: '/microfrontends/patient-management',
        permanent: false
      },
      {
        source: '/citas',
        destination: '/microfrontends/appointment-scheduling', 
        permanent: false
      },
      {
        source: '/telemedicina',
        destination: '/microfrontends/telemedicine',
        permanent: false
      }
    ]
  },

  // Rewrites para API optimization
  async rewrites() {
    return [
      {
        source: '/api/medical/:path*',
        destination: '/api/optimized/:path*'
      }
    ]
  },

  // Webpack configuration para micro-frontends y optimización
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Module Federation configuration
    config.plugins.push(
      new NextFederationPlugin({
        name: 'altamedica_shell',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          patientManagement: `patient_management@${
            dev ? 'http://localhost:3001' : 'https://patient.altamedica.com'
          }/remoteEntry.js`,
          appointmentScheduling: `appointment_scheduling@${
            dev ? 'http://localhost:3002' : 'https://appointments.altamedica.com'  
          }/remoteEntry.js`,
          telemedicine: `telemedicine@${
            dev ? 'http://localhost:3003' : 'https://telemedicine.altamedica.com'
          }/remoteEntry.js`
        },
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: '^18.0.0'
          },
          'react-dom': {
            singleton: true,
            eager: true,
            requiredVersion: '^18.0.0'
          },
          '@/types/medical': {
            singleton: true,
            eager: true
          },
          '@/lib/medical-utils': {
            singleton: true,
            eager: true
          },
          '@/hooks/useMedical': {
            singleton: true,
            eager: true
          }
        },
        exposes: {
          './medical-types': './src/types/medical.ts',
          './medical-utils': './src/lib/medical-utils.ts',
          './medical-hooks': './src/hooks/useMedical.ts',
          './shared-components': './src/microfrontends/shared/index.ts'
        }
      })
    )

    // Optimización de bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          // Vendor chunks optimization
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all'
          },
          // Medical components chunk
          medical: {
            test: /[\\/]src[\\/](components[\\/]medical|microfrontends)[\\/]/,
            name: 'medical-core',
            priority: 20,
            chunks: 'all'
          },
          // Shared utilities chunk
          shared: {
            test: /[\\/]src[\\/](lib|hooks|types)[\\/]/,
            name: 'shared-utils',
            priority: 15,
            chunks: 'all',
            minChunks: 2
          },
          // UI components chunk  
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 12,
            chunks: 'all'
          }
        }
      }
    }

    // Tree shaking optimization
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    // Resolve fallbacks para browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false
      }
    }

    // Aliases para micro-frontends
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/microfrontends': path.resolve(__dirname, 'src/microfrontends'),
      '@/shared': path.resolve(__dirname, 'src/microfrontends/shared')
    }

    return config
  },

  // Variables de entorno para micro-frontends
  env: {
    MEDICAL_COMPLIANCE_MODE: 'HIPAA',
    ENCRYPTION_ENABLED: 'true',
    AUDIT_LOGGING: 'true',
    MICROFRONTEND_MODE: 'enabled',
    PERFORMANCE_MONITORING: 'enabled'
  },

  // Configuración de compresión y cache
  compress: true,
  
  // Configuración de trailing slash
  trailingSlash: false,

  // Configuración de TypeScript estricta
  typescript: {
    tsconfigPath: './tsconfig.json'
  },

  // Configuración de ESLint
  eslint: {
    dirs: ['src']
  },

  // Output configuration para production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined
}

// Wrapper para Module Federation
const path = require('path')
module.exports = nextConfig