// Módulo ESM: Next.js config para web-app
import path from 'path';
import { fileURLToPath } from 'url';
import createBundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuración experimental optimizada para Next.js 15.3.4
  experimental: {
    optimizePackageImports: ['three', 'lucide-react']
  },
  
  // Headers para desarrollo y CORS
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
    
    // Add alias for @ to resolve to ./src
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    // Configuración específica para el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        // Sentry Node.js specific modules
        async_hooks: false,
        child_process: false,
        inspector: false,
        net: false,
        tls: false,
        dns: false,
        util: false,
        url: false,
        querystring: false,
        os: false,
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
        
        // Suprimir warnings de passive event listeners en desarrollo
        config.plugins = config.plugins || [];
        config.plugins.push({
          apply: (compiler) => {
            compiler.hooks.afterEmit.tap('SuppressPassiveListenerWarnings', () => {
              // Interceptar console.warn para filtrar warnings específicos
              const originalWarn = console.warn;
              console.warn = function(...args) {
                const message = args.join(' ');
                if (message.includes('passive event listener') || 
                    message.includes('scroll-blocking')) {
                  return; // Suprimir este warning específico
                }
                originalWarn.apply(console, args);
              };
            });
          }
        });
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

export default withBundleAnalyzer(nextConfig);
// Documentación: Este archivo es ESM (type: module) y no debe mezclar sintaxis CJS.
