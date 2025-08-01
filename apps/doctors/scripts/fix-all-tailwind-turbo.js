// ==================== SCRIPT DESACTIVADO ====================
console.log('⚠️  Script desactivado: fix-all-tailwind-turbo.js no realiza ninguna acción.');
process.exit(0);
// ============================================================

// El resto del código queda comentado para evitar cualquier ejecución accidental.
/*
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuración para Tailwind CSS 4
const TAILWIND_V4_POSTCSS = `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};`;

const TAILWIND_V4_GLOBALS = `@import "tailwindcss";

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md border border-gray-200;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .nav-link {
    @apply text-gray-600 hover:text-primary-600 transition-colors duration-200;
  }
  
  .nav-link-active {
    @apply text-primary-600 font-medium;
  }
}`;

// Configuración para Tailwind CSS 3
const TAILWIND_V3_POSTCSS = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

const TAILWIND_V3_GLOBALS = `@tailwind base;
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

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md border border-gray-200;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .nav-link {
    @apply text-gray-600 hover:text-primary-600 transition-colors duration-200;
  }
  
  .nav-link-active {
    @apply text-primary-600 font-medium;
  }
}`;

// Configuración corregida de Turbo
const TURBO_CONFIG = `{
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
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    },
    "build:doctors": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev:doctors": {
      "cache": false,
      "persistent": true
    },
    "build:patients": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev:patients": {
      "cache": false,
      "persistent": true
    },
    "build:root": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev:root": {
      "cache": false,
      "persistent": true
    },
    "build:packages": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev:packages": {
      "cache": false,
      "persistent": true
    }
  }
}`;

// Lista de todas las aplicaciones
const ALL_APPS = [
  'doctors',
  'admin',
  'companies',
  'medical',
  'patients',
  'web-app',
  'api-server',
  'development',
  'anthropic-simulator'
];

function updateFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Actualizado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
    return false;
  }
}

function updatePackageJson(projectPath, useV4 = false) {
  const packagePath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️  Package.json no encontrado en: ${projectPath}`);
    return false;
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageData.devDependencies) {
      packageData.devDependencies = {};
    }

    if (useV4) {
      packageData.devDependencies.tailwindcss = "^4.1.11";
      packageData.devDependencies["@tailwindcss/postcss"] = "^4.1.11";
      packageData.devDependencies.autoprefixer = "^10.4.21";
      packageData.devDependencies.postcss = "^8.5.6";
    } else {
      packageData.devDependencies.tailwindcss = "^3.4.17";
      packageData.devDependencies.autoprefixer = "^10.4.21";
      packageData.devDependencies.postcss = "^8.5.6";
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
    console.log(`✅ Package.json actualizado: ${packagePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando package.json en ${projectPath}:`, error.message);
    return false;
  }
}

function updatePostCSSConfig(projectPath, useV4 = false) {
  const postcssPath = path.join(projectPath, 'postcss.config.js');
  const postcssContent = useV4 ? TAILWIND_V4_POSTCSS : TAILWIND_V3_POSTCSS;

  return updateFile(postcssPath, postcssContent);
}

function updateGlobalsCSS(projectPath, useV4 = false) {
  const possiblePaths = [
    path.join(projectPath, 'src', 'app', 'globals.css'),
    path.join(projectPath, 'app', 'globals.css'),
    path.join(projectPath, 'src', 'globals.css'),
    path.join(projectPath, 'globals.css')
  ];

  const globalsContent = useV4 ? TAILWIND_V4_GLOBALS : TAILWIND_V3_GLOBALS;

  for (const globalsPath of possiblePaths) {
    if (fs.existsSync(globalsPath)) {
      return updateFile(globalsPath, globalsContent);
    }
  }

  console.log(`⚠️  globals.css no encontrado en: ${projectPath}`);
  return false;
}

function processProject(projectPath, projectName, useV4 = false) {
  console.log(`\n🔄 Procesando: ${projectName}`);
  console.log(`📁 Ruta: ${projectPath}`);

  if (!fs.existsSync(projectPath)) {
    console.log(`⚠️  Proyecto no encontrado: ${projectPath}`);
    return false;
  }

  let successCount = 0;
  let totalCount = 0;

  // Actualizar package.json
  totalCount++;
  if (updatePackageJson(projectPath, useV4)) successCount++;

  // Actualizar postcss.config.js
  totalCount++;
  if (updatePostCSSConfig(projectPath, useV4)) successCount++;

  // Actualizar globals.css
  totalCount++;
  if (updateGlobalsCSS(projectPath, useV4)) successCount++;

  console.log(`📊 ${projectName}: ${successCount}/${totalCount} archivos actualizados`);
  return successCount === totalCount;
}

function updateTurboConfig() {
  console.log('\n🔄 Actualizando configuración de Turbo...');

  const turboPath = path.join(process.cwd(), 'turbo.json');
  const success = updateFile(turboPath, TURBO_CONFIG);

  if (success) {
    console.log('✅ Configuración de Turbo actualizada correctamente');
  }

  return success;
}

function main() {
  console.log('🚀 Iniciando corrección completa de Tailwind CSS y Turbo...\n');

  const args = process.argv.slice(2);
  const useV4 = args.includes('--v4');

  console.log(`🎯 Modo: ${useV4 ? 'Tailwind CSS 4' : 'Tailwind CSS 3'}`);

  let totalSuccess = 0;
  let totalProjects = 0;

  // Actualizar configuración de Turbo
  updateTurboConfig();

  // Procesar todas las aplicaciones
  console.log('\n📱 Procesando aplicaciones...');
  ALL_APPS.forEach(appName => {
    totalProjects++;
    const appPath = path.join(process.cwd(), 'apps', appName);
    if (processProject(appPath, appName, useV4)) {
      totalSuccess++;
    }
  });

  console.log('\n📊 Resumen final:');
  console.log(`✅ Proyectos procesados exitosamente: ${totalSuccess}/${totalProjects}`);
  console.log(`❌ Proyectos con errores: ${totalProjects - totalSuccess}`);

  console.log('\n🎉 Proceso completado!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Ejecuta "npm install" para actualizar dependencias');
  console.log('2. Verifica que no hay errores de compilación');
  console.log('3. Prueba que los estilos se aplican correctamente');
  console.log('4. Ejecuta "npm run dev" en las aplicaciones para verificar');
}

main();
*/ 