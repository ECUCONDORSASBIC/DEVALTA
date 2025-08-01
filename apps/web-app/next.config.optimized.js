const path = require('path');

// Configuración optimizada para Three.js - Generada automáticamente
const nextConfig = {
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei']
  },
  webpack: (config, { isServer }) => {
    // Optimizaciones para Three.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve('./node_modules/three')
    };
    
    // Configuración para WebGL
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource'
    });
    
    // Optimización de chunks
    config.optimization.splitChunks.cacheGroups.three = {
      test: /[\\/]node_modules[\\/]three[\\/]/,
      name: 'three',
      chunks: 'all',
      priority: 10
    };
    
    // Configuración para evitar problemas de source maps
    config.devtool = isServer ? false : 'eval-source-map';
    
    // Configuración para WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true
    };
    
    return config;
  },
  // Configuración para evitar problemas de source maps
  productionBrowserSourceMaps: false,
  
  // Configuración de headers para WebGL
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ];
  },
  
  // Configuración para mejorar el rendimiento
  swcMinify: true,
  
  // Configuración para evitar warnings de Three.js
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración para optimizar el bundle
  compress: true,
  
  // Configuración para mejorar la estabilidad
  reactStrictMode: false, // Deshabilitado para evitar problemas con Three.js
};

module.exports = nextConfig;
