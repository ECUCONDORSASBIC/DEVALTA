/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    images: {
        domains: ['localhost', '192.168.0.37'],
    },
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3009',
    },
}

export default nextConfig
