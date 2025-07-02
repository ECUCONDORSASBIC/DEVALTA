/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de seguridad HIPAA
  poweredByHeader: false,
  generateEtags: false,
  
  // Headers de seguridad médica
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.altamedica.com https://*.firebase.com https://*.googleapis.com;"
          }
        ]
      }
    ]
  },

  // Configuración experimental
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },

  // Configuración de imágenes
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif']
  },

  // Variables de entorno requeridas
  env: {
    MEDICAL_COMPLIANCE_MODE: 'HIPAA',
    ENCRYPTION_ENABLED: 'true',
    AUDIT_LOGGING: 'true'
  },

  // Webpack config para optimización médica
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false
      }
    }
    return config
  }
}

module.exports = nextConfig