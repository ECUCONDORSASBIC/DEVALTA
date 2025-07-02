// Archivo de configuración principal de Webpack para Micro-frontends - Altamedica
// Advanced optimization + Medical compliance + Enterprise performance

const path = require('path')
const { ModuleFederationPlugin } = require('@module-federation/webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const isDevelopment = !isProduction

  return {
    // Configuración de modo y entrada
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    
    entry: {
      main: './src/index.tsx',
      'medical-shared': './src/microfrontends/shared/index.ts',
      'patient-management': './src/microfrontends/patient-management/index.tsx',
      'appointment-scheduling': './src/microfrontends/appointment-scheduling/index.tsx',
      'telemedicine': './src/microfrontends/telemedicine/index.tsx'
    },

    // Configuración de resolución optimizada
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/shared': path.resolve(__dirname, 'src/microfrontends/shared'),
        '@/patient-management': path.resolve(__dirname, 'src/microfrontends/patient-management'),
        '@/appointment-scheduling': path.resolve(__dirname, 'src/microfrontends/appointment-scheduling'),
        '@/telemedicine': path.resolve(__dirname, 'src/microfrontends/telemedicine'),
        '@/optimized': path.resolve(__dirname, 'src/optimized'),
        '@/lazy': path.resolve(__dirname, 'src/lazy')
      },
      fallback: {
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false
      }
    },

    // Configuración de módulos y loaders
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: 'defaults' }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  '@babel/preset-typescript'
                ],
                plugins: [
                  // Optimizaciones específicas para micro-frontends médicos
                  ['@babel/plugin-transform-runtime', { regenerator: true }],
                  '@babel/plugin-proposal-class-properties',
                  '@babel/plugin-proposal-object-rest-spread',
                  // Plugin para lazy loading optimizado
                  ['import', {
                    libraryName: 'lucide-react',
                    libraryDirectory: '',
                    camel2DashComponentName: false
                  }, 'lucide-react'],
                  // Plugin para tree shaking de date-fns
                  ['import', {
                    libraryName: 'date-fns',
                    libraryDirectory: '',
                    camel2DashComponentName: false
                  }, 'date-fns']
                ]
              }
            }
          ]
        },

        // CSS/SCSS con soporte para Tailwind
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    ...(isProduction ? [require('cssnano')] : [])
                  ]
                }
              }
            }
          ]
        },

        // Archivos estáticos optimizados
        {
          test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb
            }
          },
          generator: {
            filename: isProduction 
              ? 'images/[name].[contenthash:8][ext]'
              : 'images/[name][ext]'
          }
        },

        // Fuentes optimizadas
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: isProduction 
              ? 'fonts/[name].[contenthash:8][ext]'
              : 'fonts/[name][ext]'
          }
        }
      ]
    },

    // Optimización avanzada
    optimization: {
      minimize: isProduction,
      minimizer: [
        // Minimizador de JavaScript optimizado para código médico
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.warn'] : []
            },
            mangle: {
              safari10: true
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        }),

        // Minimizador de CSS
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true }
              }
            ]
          }
        })
      ],

      // Configuración de splitting optimizada para micro-frontends médicos
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            enforce: true
          },

          // React ecosystem
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react-vendor',
            priority: 20,
            chunks: 'all',
            enforce: true
          },

          // UI libraries específicas
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui-vendor',
            priority: 15,
            chunks: 'all'
          },

          // Utilidades médicas compartidas
          medicalShared: {
            test: /[\\/]src[\\/]microfrontends[\\/]shared[\\/]/,
            name: 'medical-shared',
            priority: 25,
            chunks: 'all',
            enforce: true
          },

          // Componentes médicos por módulo
          patientManagement: {
            test: /[\\/]src[\\/]microfrontends[\\/]patient-management[\\/]/,
            name: 'patient-management-chunk',
            priority: 22,
            chunks: 'all'
          },

          appointmentScheduling: {
            test: /[\\/]src[\\/]microfrontends[\\/]appointment-scheduling[\\/]/,
            name: 'appointment-scheduling-chunk',
            priority: 22,
            chunks: 'all'
          },

          telemedicine: {
            test: /[\\/]src[\\/]microfrontends[\\/]telemedicine[\\/]/,
            name: 'telemedicine-chunk',
            priority: 22,
            chunks: 'all'
          },

          // Optimización y cache
          optimized: {
            test: /[\\/]src[\\/]optimized[\\/]/,
            name: 'optimized-utils',
            priority: 18,
            chunks: 'all'
          },

          // Lazy loading utilities
          lazy: {
            test: /[\\/]src[\\/]lazy[\\/]/,
            name: 'lazy-utils',
            priority: 18,
            chunks: 'all'
          },

          // Componentes comunes
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      },

      // Configuración de runtime
      runtimeChunk: {
        name: 'runtime'
      }
    },

    // Plugins optimizados para aplicaciones médicas
    plugins: [
      // Module Federation para micro-frontends
      new ModuleFederationPlugin({
        name: 'altamedica_shell',
        filename: 'remoteEntry.js',
        
        // Módulos expuestos
        exposes: {
          './MedicalShared': './src/microfrontends/shared/index.ts',
          './PatientManagement': './src/microfrontends/patient-management/PatientManagementApp.tsx',
          './AppointmentScheduling': './src/microfrontends/appointment-scheduling/AppointmentApp.tsx',
          './Telemedicine': './src/microfrontends/telemedicine/TelemedicineApp.tsx',
          './MedicalTypes': './src/types/medical.ts',
          './MedicalUtils': './src/lib/medical-utils.ts',
          './MedicalHooks': './src/hooks/useMedical.ts',
          './MedicalCache': './src/optimized/cache/MedicalCacheManager.ts',
          './PerformanceMonitor': './src/optimized/MedicalPerformanceMonitor.tsx'
        },

        // Dependencias compartidas
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
          'react-router-dom': {
            singleton: true,
            requiredVersion: '^6.0.0'
          },
          '@headlessui/react': {
            singleton: true,
            requiredVersion: '^1.7.0'
          },
          'lucide-react': {
            singleton: true,
            requiredVersion: '^0.292.0'
          },
          'date-fns': {
            singleton: true,
            requiredVersion: '^2.30.0'
          },
          'tailwindcss': {
            singleton: true,
            requiredVersion: '^3.3.0'
          }
        }
      }),

      // HTML Plugin con optimizaciones médicas
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false,
        templateParameters: {
          MEDICAL_COMPLIANCE_MODE: 'HIPAA',
          PERFORMANCE_MONITORING: 'enabled',
          MICROFRONTEND_MODE: 'enabled'
        }
      }),

      // Extracción de CSS para producción
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css'
        })
      ] : []),

      // Compresión para producción
      ...(isProduction ? [
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        })
      ] : []),

      // Bundle analyzer en modo análisis
      ...(process.env.ANALYZE ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html'
        })
      ] : [])
    ],

    // Configuración del servidor de desarrollo
    devServer: isDevelopment ? {
      port: 3000,
      host: 'localhost',
      hot: true,
      liveReload: true,
      historyApiFallback: true,
      compress: true,
      
      // Headers de seguridad para desarrollo médico
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },

      // Configuración específica para micro-frontends
      allowedHosts: [
        'localhost',
        'patient.altamedica.local',
        'appointments.altamedica.local',
        'telemedicine.altamedica.local'
      ],

      // Proxy para APIs
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    } : undefined,

    // Configuración de performance
    performance: {
      maxAssetSize: 250000,
      maxEntrypointSize: 250000,
      hints: isProduction ? 'warning' : false
    },

    // Stats optimizados
    stats: {
      preset: 'minimal',
      moduleTrace: true,
      errorDetails: true
    },

    // Configuración de cache para desarrollo
    cache: isDevelopment ? {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    } : false
  }
}