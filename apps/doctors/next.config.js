/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  transpilePackages: ['@altamedica/ui'],
  webpack: (config, { isServer, webpack }) => {
    // Resolver para manejar módulos de Node.js en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
        buffer: false,
        stream: false,
        crypto: false,
        util: false,
        fs: false,
        net: false,
        tls: false,
      };

      // Provide plugin para variables globales
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify({}),
        })
      );

      // Ignore node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': false,
        'node:buffer': false,
        'node:stream': false,
      };
    }
    return config;
  }
}

export default nextConfig
