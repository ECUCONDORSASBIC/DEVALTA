/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Deshabilitar Turbopack temporalmente
  experimental: {
    turbo: false,
  },
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
  },
  
  // Configuración de Webpack simplificada
  webpack(config) {
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
}

module.exports = nextConfig 