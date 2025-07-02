# Next.js & Turbopack Expert MCP Server

Un MCP (Model Context Protocol) especializado que conoce todo sobre Next.js 15+, Turbopack, Tailwind CSS y las mejores prácticas de desarrollo moderno.

## 🎯 Características

### Herramientas Disponibles

1. **`diagnose_nextjs_config`** - Diagnostica problemas de configuración
2. **`fix_turbopack_config`** - Corrige configuración de Turbopack para Next.js 15+
3. **`fix_tailwind_v4_issues`** - Soluciona problemas específicos de Tailwind CSS 4
4. **`optimize_monorepo_turbo`** - Optimiza configuración de Turbo para monorepos
5. **`get_nextjs_best_practices`** - Obtiene mejores prácticas actualizadas

### Conocimiento Especializado

- ✅ **Next.js 15+** - Última versión con App Router
- ✅ **Turbopack** - Configuración moderna vs obsoleta
- ✅ **Tailwind CSS v3 vs v4** - Diferencias y migración
- ✅ **PostCSS** - Configuración correcta para cada versión
- ✅ **Monorepos** - Optimización con Turbo
- ✅ **Performance** - Mejores prácticas de rendimiento

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd mcp-servers

# Instalar dependencias
npm install

# Hacer ejecutable
chmod +x nextjs-turbopack-expert.js
```

## 📖 Uso

### Configuración en Cursor

Agregar al archivo de configuración de MCP:

```json
{
  "mcpServers": {
    "nextjs-turbopack-expert": {
      "command": "node",
      "args": ["path/to/mcp-servers/nextjs-turbopack-expert.js"]
    }
  }
}
```

### Ejemplos de Uso

#### 1. Diagnosticar Problemas de Configuración

```javascript
// Diagnóstico completo
{
  "projectPath": "./apps/doctors",
  "checkType": "all"
}

// Solo Turbopack
{
  "projectPath": "./apps/doctors",
  "checkType": "turbopack"
}
```

#### 2. Corregir Configuración de Turbopack

```javascript
// Configuración básica
{
  "projectPath": "./apps/doctors",
  "includeLoaders": false
}

// Con loaders SVG
{
  "projectPath": "./apps/doctors",
  "includeLoaders": true
}
```

#### 3. Solucionar Problemas de Tailwind

```javascript
// Migrar a Tailwind v3 (recomendado)
{
  "projectPath": "./apps/doctors",
  "targetVersion": "v3"
}

// Migrar a Tailwind v4 (experimental)
{
  "projectPath": "./apps/doctors",
  "targetVersion": "v4"
}
```

#### 4. Optimizar Monorepo

```javascript
{
  "rootPath": "./",
  "apps": ["doctors", "patients", "admin", "api-server"]
}
```

#### 5. Obtener Mejores Prácticas

```javascript
// Tópicos disponibles: turbopack, tailwind, postcss, monorepo, performance
{
  "topic": "turbopack"
}
```

## 🔧 Configuraciones Generadas

### Turbopack Moderno (Next.js 15+)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@altamedica/ui",
    "@altamedica/shared",
    "@altamedica/types",
  ],
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  env: {
    CUSTOM_KEY: "my-value",
  },
  eslint: {
    dirs: ["pages", "app", "components", "lib", "src"],
  },
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
```

### Tailwind CSS v3 (Estable)

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// globals.css
@tailwind base;
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
}
```

### Tailwind CSS v4 (Experimental)

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

// globals.css
@import "tailwindcss";

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }

  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### Turbo Config Optimizado

```json
{
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
    "type-check": {
      "dependsOn": ["^type-check"],
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}
```

## 📚 Mejores Prácticas

### Turbopack

- ✅ Usar `turbopack: {}` en lugar de `experimental.turbo`
- ✅ Agregar flag `--turbopack` en scripts de desarrollo
- ✅ Configurar loaders con nueva sintaxis: `rules` en lugar de `loaders`
- ⚠️ Solo estable para `next dev`, experimental para `next build`

### Tailwind CSS

- 🎯 **Tailwind v3.4.17**: Estable y ampliamente compatible
- 🧪 **Tailwind v4**: Experimental, usar solo si es necesario
- 🔧 Configuración PostCSS específica para cada versión
- 📝 Sintaxis CSS diferente entre versiones

### Monorepo con Turbo

- 🏗️ Estructura recomendada con apps/ y packages/
- ⚙️ Configuración Turbo con `dependsOn` y `outputs`
- 🔄 Scripts optimizados para desarrollo paralelo
- 📦 Gestión eficiente de dependencias workspace

## 🐛 Solución de Problemas Comunes

### Error: "@tailwindcss/postcss" no encontrado

**Causa**: Tailwind v3 con configuración v4
**Solución**: Cambiar a `tailwindcss: {}` en postcss.config.js

### Error: "tailwindcss" no funciona como plugin PostCSS

**Causa**: Tailwind v4 sin @tailwindcss/postcss
**Solución**: Instalar `@tailwindcss/postcss` y usar en configuración

### Turbopack no funciona

**Causa**: Configuración obsoleta `experimental.turbo`
**Solución**: Migrar a `turbopack: {}` y agregar flag `--turbopack`

### Estilos no se aplican

**Causa**: Sintaxis CSS incorrecta para la versión
**Solución**: Usar `@tailwind base/components/utilities` para v3 o `@import "tailwindcss"` para v4

## 📊 Beneficios del MCP

- 🧠 **Conocimiento Actualizado**: Siempre al día con las últimas versiones
- 🔧 **Corrección Automática**: Soluciona problemas comunes automáticamente
- 📋 **Diagnóstico Inteligente**: Detecta inconsistencias en la configuración
- 🚀 **Optimización**: Mejora el rendimiento de desarrollo
- 📚 **Documentación**: Proporciona mejores prácticas actualizadas

## 🤝 Contribución

Para contribuir al MCP:

1. Fork el repositorio
2. Crear una rama para tu feature
3. Implementar cambios
4. Agregar tests si es necesario
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

---

**Desarrollado por el equipo de AltaMedica Dev** 🏥
