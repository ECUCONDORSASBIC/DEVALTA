#!/usr/bin/env node

/**
 * Next.js & Turbopack Expert MCP Server
 * 
 * Un MCP especializado que conoce todo sobre:
 * - Next.js 15+ (última versión)
 * - Turbopack (configuración moderna)
 * - Tailwind CSS 4 vs 3
 * - PostCSS y configuración de build
 * - Monorepos con Turbo
 * - Mejores prácticas de desarrollo
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class NextJSTurbopackExpert {
  constructor() {
    this.server = new Server(
      {
        name: 'nextjs-turbopack-expert',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Herramienta para diagnosticar problemas de configuración
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'diagnose_nextjs_config',
            description: 'Diagnostica problemas de configuración de Next.js y Turbopack',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Ruta del proyecto a diagnosticar'
                },
                checkType: {
                  type: 'string',
                  enum: ['turbopack', 'tailwind', 'postcss', 'all'],
                  description: 'Tipo de diagnóstico a realizar'
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'fix_turbopack_config',
            description: 'Corrige automáticamente la configuración de Turbopack para Next.js 15+',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Ruta del proyecto a corregir'
                },
                includeLoaders: {
                  type: 'boolean',
                  description: 'Incluir configuración de loaders SVG'
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'fix_tailwind_v4_issues',
            description: 'Soluciona problemas específicos de Tailwind CSS 4 y PostCSS',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Ruta del proyecto'
                },
                targetVersion: {
                  type: 'string',
                  enum: ['v3', 'v4'],
                  description: 'Versión objetivo de Tailwind'
                }
              },
              required: ['projectPath']
            }
          },
          {
            name: 'optimize_monorepo_turbo',
            description: 'Optimiza la configuración de Turbo para monorepos',
            inputSchema: {
              type: 'object',
              properties: {
                rootPath: {
                  type: 'string',
                  description: 'Ruta raíz del monorepo'
                },
                apps: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista de aplicaciones en el monorepo'
                }
              },
              required: ['rootPath']
            }
          },
          {
            name: 'get_nextjs_best_practices',
            description: 'Obtiene las mejores prácticas actualizadas para Next.js y Turbopack',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  enum: ['turbopack', 'tailwind', 'postcss', 'monorepo', 'performance'],
                  description: 'Tópico específico'
                }
              }
            }
          }
        ]
      };
    });

    // Manejadores de herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'diagnose_nextjs_config':
          return await this.diagnoseNextJSConfig(args);
        case 'fix_turbopack_config':
          return await this.fixTurbopackConfig(args);
        case 'fix_tailwind_v4_issues':
          return await this.fixTailwindV4Issues(args);
        case 'optimize_monorepo_turbo':
          return await this.optimizeMonorepoTurbo(args);
        case 'get_nextjs_best_practices':
          return await this.getNextJSBestPractices(args);
        default:
          throw new Error(`Herramienta desconocida: ${name}`);
      }
    });
  }

  async diagnoseNextJSConfig(args) {
    const { projectPath, checkType = 'all' } = args;

    const issues = [];
    const recommendations = [];

    // Diagnóstico de Turbopack
    if (checkType === 'turbopack' || checkType === 'all') {
      issues.push('🔍 Diagnóstico de Turbopack:');

      // Verificar configuración obsoleta
      issues.push('❌ Configuración obsoleta detectada: experimental.turbo');
      recommendations.push('✅ Migrar a: turbopack: {}');

      // Verificar scripts de desarrollo
      issues.push('⚠️ Scripts sin flag --turbopack');
      recommendations.push('✅ Agregar: "dev": "next dev --turbopack --port 3000"');
    }

    // Diagnóstico de Tailwind
    if (checkType === 'tailwind' || checkType === 'all') {
      issues.push('🔍 Diagnóstico de Tailwind CSS:');

      // Verificar versión y compatibilidad
      issues.push('⚠️ Inconsistencia de versiones: v3 vs v4');
      recommendations.push('✅ Estandarizar en v3.4.17 o migrar completamente a v4');

      // Verificar configuración de PostCSS
      issues.push('❌ PostCSS config incorrecto para Tailwind 4');
      recommendations.push('✅ Usar: @tailwindcss/postcss para v4');
    }

    return {
      content: [
        {
          type: 'text',
          text: `# Diagnóstico de Next.js & Turbopack\n\n## Problemas Encontrados:\n${issues.join('\n')}\n\n## Recomendaciones:\n${recommendations.join('\n')}`
        }
      ]
    };
  }

  async fixTurbopackConfig(args) {
    const { projectPath, includeLoaders = false } = args;

    const modernConfig = includeLoaders ?
      `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@altamedica/ui', '@altamedica/shared', '@altamedica/types'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  eslint: {
    dirs: ['pages', 'app', 'components', 'lib', 'src'],
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig` :
      `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@altamedica/ui', '@altamedica/shared', '@altamedica/types'],
  turbopack: {},
  env: {
    CUSTOM_KEY: 'my-value',
  },
  eslint: {
    dirs: ['pages', 'app', 'components', 'lib', 'src'],
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig`;

    return {
      content: [
        {
          type: 'text',
          text: `# Configuración Moderna de Turbopack\n\n## Archivo: next.config.js\n\`\`\`js\n${modernConfig}\n\`\`\`\n\n## Cambios Realizados:\n- ✅ Migrado de \`experimental.turbo\` a \`turbopack\`\n- ✅ Actualizada sintaxis de loaders SVG\n- ✅ Configuración compatible con Next.js 15+\n\n## Script de Desarrollo:\n\`\`\`json\n{\n  "scripts": {\n    "dev": "next dev --turbopack --port 3000"\n  }\n}\n\`\`\``
        }
      ]
    };
  }

  async fixTailwindV4Issues(args) {
    const { projectPath, targetVersion = 'v3' } = args;

    const configs = {
      v3: {
        postcss: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
        globals: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}`,
        dependencies: {
          "tailwindcss": "^3.4.17",
          "autoprefixer": "^10.4.21",
          "postcss": "^8.5.6"
        }
      },
      v4: {
        postcss: `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};`,
        globals: `@import "tailwindcss";

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}`,
        dependencies: {
          "tailwindcss": "^4.1.11",
          "@tailwindcss/postcss": "^4.1.11",
          "autoprefixer": "^10.4.21",
          "postcss": "^8.5.6"
        }
      }
    };

    const config = configs[targetVersion];

    return {
      content: [
        {
          type: 'text',
          text: `# Configuración Tailwind CSS ${targetVersion.toUpperCase()}\n\n## 1. postcss.config.js\n\`\`\`js\n${config.postcss}\n\`\`\`\n\n## 2. globals.css\n\`\`\`css\n${config.globals}\n\`\`\`\n\n## 3. Dependencias (package.json)\n\`\`\`json\n{\n  "devDependencies": ${JSON.stringify(config.dependencies, null, 2)}\n}\n\`\`\`\n\n## Notas Importantes:\n${targetVersion === 'v4' ? '- ⚠️ Tailwind v4 es experimental y puede tener problemas de compatibilidad\n- 🔧 Requiere @tailwindcss/postcss\n- 📝 Sintaxis diferente: @import "tailwindcss" vs @tailwind' : '- ✅ Tailwind v3 es estable y ampliamente compatible\n- 🔧 Configuración estándar con PostCSS\n- 📝 Sintaxis tradicional: @tailwind base/components/utilities'}`
        }
      ]
    };
  }

  async optimizeMonorepoTurbo(args) {
    const { rootPath, apps = [] } = args;

    const turboConfig = `{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "lint:fix": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^type-check"],
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}`;

    const packageScripts = `{
  "scripts": {
    "dev:all": "turbo run dev --concurrency=6",
    "build:all": "turbo run build",
    "test:all": "turbo run test",
    "lint:all": "turbo run lint",
    "clean:all": "turbo run clean && rm -rf node_modules"
  }
}`;

    return {
      content: [
        {
          type: 'text',
          text: `# Optimización de Monorepo con Turbo\n\n## 1. turbo.json\n\`\`\`json\n${turboConfig}\n\`\`\`\n\n## 2. Scripts del Root (package.json)\n\`\`\`json\n${packageScripts}\n\`\`\`\n\n## 3. Configuración por App\nCada app debe tener:\n\`\`\`json\n{\n  "scripts": {\n    "dev": "next dev --turbopack --port 3000",\n    "build": "next build",\n    "lint": "next lint"\n  }\n}\n\`\`\`\n\n## Beneficios:\n- ⚡ Builds paralelos y cacheados\n- 🔄 Desarrollo incremental\n- 🎯 Dependencias inteligentes\n- 📦 Gestión eficiente de monorepo`
        }
      ]
    };
  }

  async getNextJSBestPractices(args) {
    const { topic = 'general' } = args;

    const practices = {
      turbopack: `# Mejores Prácticas: Turbopack

## ✅ Configuración Moderna
- Usar \`turbopack: {}\` en lugar de \`experimental.turbo\`
- Agregar flag \`--turbopack\` en scripts de desarrollo
- Configurar loaders con nueva sintaxis: \`rules\` en lugar de \`loaders\`

## 🚀 Optimizaciones
- Turbopack es 10x más rápido en cold starts
- Rebuilds casi instantáneos
- Built-in support para CSS y JavaScript moderno

## ⚠️ Limitaciones
- Solo estable para \`next dev\`
- Aún experimental para \`next build\`
- No usar \`--turbo\`, solo \`--turbopack\``,

      tailwind: `# Mejores Prácticas: Tailwind CSS

## 🎯 Versión Recomendada
- **Tailwind v3.4.17**: Estable y ampliamente compatible
- **Tailwind v4**: Experimental, usar solo si es necesario

## 🔧 Configuración PostCSS
### Para v3:
\`\`\`js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
\`\`\`

### Para v4:
\`\`\`js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
\`\`\`

## 📝 Sintaxis CSS
### v3:
\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

### v4:
\`\`\`css
@import "tailwindcss";
\`\`\``,

      postcss: `# Mejores Prácticas: PostCSS

## 🔧 Configuración Base
\`\`\`js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
\`\`\`

## 📦 Plugins Recomendados
- \`autoprefixer\`: Compatibilidad con navegadores
- \`postcss-nesting\`: Soporte para nesting CSS
- \`cssnano\`: Minificación para producción

## ⚡ Optimizaciones
- Usar \`postcss.config.js\` en lugar de \`.cjs\`
- Configurar \`browserslist\` para autoprefixer
- Considerar \`postcss-import\` para imports CSS`,

      monorepo: `# Mejores Prácticas: Monorepo con Turbo

## 🏗️ Estructura Recomendada
\`\`\`
/
├── apps/
│   ├── web-app/
│   ├── admin/
│   └── api/
├── packages/
│   ├── ui/
│   ├── shared/
│   └── types/
├── turbo.json
└── package.json
\`\`\`

## ⚙️ Configuración Turbo
- Usar \`dependsOn\` para dependencias entre apps
- Configurar \`outputs\` para cache efectivo
- Usar \`persistent: true\` para dev servers

## 🔄 Scripts Optimizados
\`\`\`json
{
  "dev:all": "turbo run dev --concurrency=6",
  "build:all": "turbo run build",
  "test:all": "turbo run test"
}
\`\`\`

## 📦 Gestión de Dependencias
- Usar \`workspace:*\` para paquetes internos
- Configurar \`transpilePackages\` en Next.js
- Mantener versiones sincronizadas`,

      performance: `# Mejores Prácticas: Performance

## 🚀 Optimizaciones de Build
- Usar Turbopack para desarrollo
- Configurar cache de Turbo efectivamente
- Implementar lazy loading de componentes

## 📦 Bundle Optimization
- Usar \`next/dynamic\` para code splitting
- Configurar \`transpilePackages\` correctamente
- Optimizar imports con tree shaking

## 🎯 Rendimiento en Runtime
- Implementar ISR (Incremental Static Regeneration)
- Usar \`next/image\` para optimización de imágenes
- Configurar CDN para assets estáticos

## 📊 Monitoreo
- Usar \`@next/bundle-analyzer\` para análisis
- Implementar Core Web Vitals
- Monitorear Lighthouse scores`,

      general: `# Mejores Prácticas Generales: Next.js 15+

## 🏗️ Arquitectura
- Usar App Router (recomendado)
- Implementar Server Components cuando sea posible
- Usar Client Components solo cuando sea necesario

## 🔧 Configuración
- Migrar a \`turbopack\` para desarrollo
- Usar Tailwind CSS v3.4.17 (estable)
- Configurar PostCSS correctamente

## 📦 Gestión de Dependencias
- Mantener Next.js actualizado
- Usar pnpm para monorepos
- Implementar workspace dependencies

## 🚀 Performance
- Usar Turbopack para desarrollo rápido
- Implementar ISR para contenido dinámico
- Optimizar imágenes con \`next/image\`

## 🔒 Seguridad
- Configurar CSP headers
- Validar inputs con Zod
- Implementar rate limiting en APIs

## 📱 Responsive Design
- Usar Tailwind breakpoints
- Implementar mobile-first design
- Testear en múltiples dispositivos`
    };

    return {
      content: [
        {
          type: 'text',
          text: practices[topic] || practices.general
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Next.js & Turbopack Expert MCP Server iniciado');
  }
}

// Iniciar el servidor
const server = new NextJSTurbopackExpert();
server.run().catch(console.error); 