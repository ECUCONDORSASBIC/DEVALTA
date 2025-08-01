/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true, // Mantén si es estable
    optimizePackageImports: ['lucide-react'],
  },

  // Configuración de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compresión y optimización
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Headers de seguridad
  async headers() {
    return [
      // ... (mantenido igual)
    ];
  },

  // Redirecciones
  async redirects() {
    return [
      // ... (mantenido igual)
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      // ... (mantenido igual)
    ];
  },

  // Configuración de Webpack
  webpack: (config, { dev, isServer }) => {
    // Optimización de bundles
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Manejo de SVGs
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Leaflet CSS ya está manejado por Next.js por defecto
    // No necesitamos reglas adicionales para CSS

    // Fallback para módulos de Node.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    return config;
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

// Análisis de bundle (condicional)
if (process.env.ANALYZE === 'true') {
  nextConfig.webpack = (config) => {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        }),
      );
    });
    return config;
  };
}

export default nextConfig;
