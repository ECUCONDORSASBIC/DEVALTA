#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración base de Tailwind
const baseConfig = `import { baseConfig } from '../../configs/tailwind/base.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
`;

// Configuración de PostCSS
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

// CSS global con Tailwind
const globalsCSS = `@tailwind base;
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
}
`;

// Aplicaciones que necesitan consolidación
const apps = [
    'doctors',
    'patients',
    'web-app',
    'companies',
    'api-server',
    'anthropic-simulator',
    'admin',
    'medical',
    'development'
];

// Dependencias necesarias para Tailwind
const tailwindDeps = {
    'tailwindcss': '^3.4.0',
    'autoprefixer': '^10.4.16',
    'postcss': '^8.4.32'
};

function updatePackageJson(appPath) {
    const packageJsonPath = path.join(appPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(`⚠️  No package.json encontrado en ${appPath}`);
        return;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let updated = false;

        // Agregar dependencias de Tailwind si no existen
        if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
        }

        for (const [dep, version] of Object.entries(tailwindDeps)) {
            if (!packageJson.devDependencies[dep]) {
                packageJson.devDependencies[dep] = version;
                updated = true;
                console.log(`✅ Agregada dependencia ${dep}@${version} a ${path.basename(appPath)}`);
            }
        }

        if (updated) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
    } catch (error) {
        console.error(`❌ Error actualizando package.json en ${appPath}:`, error.message);
    }
}

function createTailwindConfig(appPath) {
    const configPath = path.join(appPath, 'tailwind.config.js');

    try {
        fs.writeFileSync(configPath, baseConfig);
        console.log(`✅ Configuración de Tailwind actualizada en ${path.basename(appPath)}`);
    } catch (error) {
        console.error(`❌ Error creando tailwind.config.js en ${appPath}:`, error.message);
    }
}

function createPostCSSConfig(appPath) {
    const configPath = path.join(appPath, 'postcss.config.js');

    try {
        fs.writeFileSync(configPath, postcssConfig);
        console.log(`✅ Configuración de PostCSS actualizada en ${appPath}`);
    } catch (error) {
        console.error(`❌ Error creando postcss.config.js en ${appPath}:`, error.message);
    }
}

function createGlobalsCSS(appPath) {
    const cssPath = path.join(appPath, 'src/app/globals.css');

    // Crear directorio si no existe
    const cssDir = path.dirname(cssPath);
    if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir, { recursive: true });
    }

    try {
        fs.writeFileSync(cssPath, globalsCSS);
        console.log(`✅ CSS global actualizado en ${path.basename(appPath)}`);
    } catch (error) {
        console.error(`❌ Error creando globals.css en ${appPath}:`, error.message);
    }
}

function updateLayoutFile(appPath) {
    const layoutPath = path.join(appPath, 'src/app/layout.tsx');

    if (!fs.existsSync(layoutPath)) {
        console.log(`⚠️  No layout.tsx encontrado en ${appPath}`);
        return;
    }

    try {
        let layoutContent = fs.readFileSync(layoutPath, 'utf8');

        // Verificar si ya importa globals.css
        if (!layoutContent.includes("import './globals.css'")) {
            // Agregar import después de las importaciones existentes
            const importMatch = layoutContent.match(/import.*from.*['"]/);
            if (importMatch) {
                const insertIndex = layoutContent.lastIndexOf(importMatch[0]) + importMatch[0].length;
                layoutContent = layoutContent.slice(0, insertIndex) +
                    "\nimport './globals.css';" +
                    layoutContent.slice(insertIndex);
            } else {
                // Si no hay importaciones, agregar al inicio
                layoutContent = "import './globals.css';\n" + layoutContent;
            }

            fs.writeFileSync(layoutPath, layoutContent);
            console.log(`✅ Layout actualizado en ${path.basename(appPath)}`);
        }
    } catch (error) {
        console.error(`❌ Error actualizando layout en ${appPath}:`, error.message);
    }
}

function consolidateApp(appName) {
    const appPath = path.join(__dirname, '..', 'apps', appName);

    if (!fs.existsSync(appPath)) {
        console.log(`⚠️  Aplicación ${appName} no encontrada`);
        return;
    }

    console.log(`\n🔄 Consolidando ${appName}...`);

    updatePackageJson(appPath);
    createTailwindConfig(appPath);
    createPostCSSConfig(appPath);
    createGlobalsCSS(appPath);
    updateLayoutFile(appPath);
}

// Función principal
function main() {
    console.log('🚀 Iniciando consolidación de Tailwind CSS...\n');

    for (const app of apps) {
        consolidateApp(app);
    }

    console.log('\n✅ Consolidación completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecutar: pnpm install');
    console.log('2. Ejecutar: pnpm dev para probar las aplicaciones');
    console.log('3. Verificar que no hay errores de Tailwind CSS');
}

main(); 