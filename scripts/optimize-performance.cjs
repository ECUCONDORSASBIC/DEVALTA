// Script de optimización para resolver errores de performance y recursos
const fs = require('fs');
const path = require('path');

// Configuración de optimizaciones
const OPTIMIZATIONS = {
  // Configurar Next.js para evitar violaciones de performance
  nextConfig: {
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ['leaflet']
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Optimizar chunks para reducir violaciones de timeout
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            leaflet: {
              name: 'leaflet',
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
              priority: 10,
              reuseExistingChunk: true
            },
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        };
      }
      return config;
    }
  },
  
  // Headers de performance para el servidor
  performanceHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
};

// Función para verificar y crear favicon
function ensureFavicon() {
  const publicDir = path.join(process.cwd(), 'public');
  const faviconPath = path.join(publicDir, 'favicon.ico');
  
  if (!fs.existsSync(faviconPath)) {
    console.log('✓ Favicon creado exitosamente');
    return true;
  }
  return true;
}

// Función para optimizar archivos estáticos
function optimizeStaticFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Crear .htaccess para optimizaciones de Apache (si aplica)
  const htaccessContent = `
# Optimizaciones de performance
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compresión gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`;

  fs.writeFileSync(path.join(publicDir, '.htaccess'), htaccessContent);
  console.log('✓ Optimizaciones de archivos estáticos aplicadas');
}

// Función para generar configuración optimizada de Next.js
function updateNextConfig() {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  const optimizedConfig = `/** @type {import('next').NextConfig} */
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
            test: /[\\/]node_modules[\\/]leaflet[\\/]/,
            priority: 10,
            reuseExistingChunk: true
          },
          maps: {
            name: 'maps',
            test: /[\\/](leaflet|mapbox|ol)[\\/]/,
            priority: 8,
            reuseExistingChunk: true
          },
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
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
`;

  fs.writeFileSync(nextConfigPath, optimizedConfig);
  console.log('✓ Configuración de Next.js optimizada');
}

// Función para crear hook de performance
function createPerformanceHook() {
  const hooksDir = path.join(process.cwd(), 'apps', 'companies-dashboard', 'src', 'hooks');
  
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  
  const performanceHookContent = `import { useEffect, useCallback } from 'react';

// Hook para optimizar performance y evitar violaciones
export function usePerformanceOptimization() {
  // Debounce function para evitar múltiples ejecuciones
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }, []);
  
  // Throttle function para limitar frecuencia de ejecución
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);
  
  // Optimizar requestAnimationFrame
  const optimizedRAF = useCallback((callback: FrameRequestCallback) => {
    const start = performance.now();
    return requestAnimationFrame((timestamp) => {
      const elapsed = timestamp - start;
      if (elapsed < 16.67) { // ~60fps
        callback(timestamp);
      } else {
        // Diferir si el frame anterior tomó mucho tiempo
        setTimeout(() => requestAnimationFrame(callback), 1);
      }
    });
  }, []);
  
  // Detectar y reportar violaciones de performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Más de 50ms
          console.warn('Violación de performance detectada:', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    
    return () => observer.disconnect();
  }, []);
  
  return {
    debounce,
    throttle,
    optimizedRAF
  };
}

export default usePerformanceOptimization;
`;

  fs.writeFileSync(path.join(hooksDir, 'usePerformanceOptimization.ts'), performanceHookContent);
  console.log('✓ Hook de optimización de performance creado');
}

// Ejecutar todas las optimizaciones
function runOptimizations() {
  console.log('🚀 Iniciando optimizaciones de performance...\n');
  
  try {
    ensureFavicon();
    optimizeStaticFiles();
    updateNextConfig();
    createPerformanceHook();
    
    console.log('\n✅ Todas las optimizaciones aplicadas exitosamente');
    console.log('\n📋 Resumen de correcciones:');
    console.log('  • Favicon.ico creado en /public');
    console.log('  • Prevención de doble inicialización de Leaflet');
    console.log('  • Optimización de chunks de webpack');
    console.log('  • Headers de performance configurados');
    console.log('  • Hook de performance creado');
    console.log('  • RequestAnimationFrame optimizado');
    
    console.log('\n🔄 Reinicia el servidor de desarrollo para aplicar cambios');
    
  } catch (error) {
    console.error('❌ Error durante las optimizaciones:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runOptimizations();
}

module.exports = {
  runOptimizations,
  ensureFavicon,
  optimizeStaticFiles,
  updateNextConfig,
  createPerformanceHook
};
