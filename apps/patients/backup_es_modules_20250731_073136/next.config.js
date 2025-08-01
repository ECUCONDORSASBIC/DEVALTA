/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuración básica de imágenes
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Headers básicos de CORS
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
          }
        ]
      }
    ]
  }
};

export default nextConfig;