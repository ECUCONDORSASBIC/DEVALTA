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

function updateFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Actualizado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
    return false;
  }
}

function updatePackageJson(appPath, useV4) {
  const packagePath = path.join(appPath, 'package.json');
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageData.devDependencies) {
      packageData.devDependencies = {};
    }

    if (useV4) {
      packageData.devDependencies.tailwindcss = "^4.1.11";
      packageData.devDependencies["@tailwindcss/postcss"] = "^4.1.11";
    } else {
      packageData.devDependencies.tailwindcss = "^3.4.17";
      packageData.devDependencies.autoprefixer = "^10.4.21";
      packageData.devDependencies.postcss = "^8.5.6";
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
    console.log(`✅ Package.json actualizado: ${packagePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando package.json:`, error.message);
    return false;
  }
}

function processApp(appName, useV4 = false) {
  const appPath = path.join(process.cwd(), 'apps', appName);

  if (!fs.existsSync(appPath)) {
    console.log(`⚠️  App no encontrada: ${appName}`);
    return false;
  }

  console.log(`\n🔄 Procesando: ${appName}`);

  // Actualizar package.json
  updatePackageJson(appPath, useV4);

  // Actualizar postcss.config.js
  const postcssPath = path.join(appPath, 'postcss.config.js');
  const postcssContent = useV4 ? TAILWIND_V4_POSTCSS : TAILWIND_V3_POSTCSS;
  updateFile(postcssPath, postcssContent);

  // Actualizar globals.css
  const globalsPath = path.join(appPath, 'src', 'app', 'globals.css');
  if (fs.existsSync(globalsPath)) {
    const globalsContent = useV4 ? TAILWIND_V4_GLOBALS : TAILWIND_V3_GLOBALS;
    updateFile(globalsPath, globalsContent);
  }

  return true;
}

// Aplicaciones a procesar
const APPS = [
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

function main() {
  const args = process.argv.slice(2);
  const useV4 = args.includes('--v4');
  const targetApp = args.find(arg => !arg.startsWith('--'));

  console.log('🚀 Solucionando problemas de Tailwind CSS...');
  console.log(`🎯 Modo: ${useV4 ? 'Tailwind CSS 4' : 'Tailwind CSS 3'}`);

  if (targetApp) {
    processApp(targetApp, useV4);
  } else {
    APPS.forEach(app => processApp(app, useV4));
  }

  console.log('\n✅ Proceso completado!');
  console.log('📝 Ejecuta "npm install" en cada aplicación para actualizar dependencias.');
}

main(); 