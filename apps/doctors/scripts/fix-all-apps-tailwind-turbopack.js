#!/usr/bin/env node

/**
 * Script para aplicar correcciones de Tailwind CSS y Turbopack a todas las apps del monorepo
 * 
 * Este script:
 * 1. Escanea todas las apps del monorepo
 * 2. Detecta problemas de configuración
 * 3. Aplica correcciones automáticamente
 * 4. Genera un reporte completo
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const APPS_DIR = './apps';

class MonorepoFixer {
    constructor() {
        this.apps = [];
        this.issues = [];
        this.fixes = [];
        this.results = [];
    }

    async scanAllApps() {
        console.log('🔍 Escaneando todas las apps del monorepo...\n');

        try {
            const items = await fs.readdir(APPS_DIR);

            for (const item of items) {
                const appPath = path.join(APPS_DIR, item);
                const stat = await fs.stat(appPath);

                if (stat.isDirectory()) {
                    this.apps.push(item);
                }
            }

            console.log(`📱 Apps encontradas: ${this.apps.join(', ')}\n`);

        } catch (error) {
            console.error('❌ Error escaneando apps:', error.message);
            return;
        }
    }

    async fixApp(appName) {
        console.log(`🔧 Corrigiendo app: ${appName}`);
        const appPath = path.join(APPS_DIR, appName);

        try {
            // 1. Verificar si es una app Next.js
            const packageJsonPath = path.join(appPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            if (!packageJson.dependencies?.next) {
                console.log(`   ⏭️ ${appName}: No es una app Next.js, saltando...`);
                return;
            }

            // 2. Corregir configuración de Tailwind CSS
            await this.fixTailwindConfig(appName, appPath, packageJson);

            // 3. Corregir configuración de Turbopack
            await this.fixTurbopackConfig(appName, appPath, packageJson);

            // 4. Corregir scripts de desarrollo
            await this.fixDevScripts(appName, appPath, packageJson);

            this.results.push({
                app: appName,
                status: 'success',
                fixes: this.fixes.filter(f => f.app === appName).length
            });

        } catch (error) {
            console.log(`   ❌ Error en ${appName}: ${error.message}`);
            this.results.push({
                app: appName,
                status: 'error',
                error: error.message
            });
        }
    }

    async fixTailwindConfig(appName, appPath, packageJson) {
        const tailwindVersion = packageJson.devDependencies?.tailwindcss;
        const hasTailwindPostCSS = packageJson.devDependencies?.['@tailwindcss/postcss'];

        if (!tailwindVersion) {
            console.log(`   ⏭️ ${appName}: No tiene Tailwind CSS instalado`);
            return;
        }

        const isTailwindV3 = tailwindVersion.startsWith('^3');
        const isTailwindV4 = tailwindVersion.startsWith('^4');

        // Corregir postcss.config.js
        const postcssConfigPath = path.join(appPath, 'postcss.config.js');
        let postcssConfig = null;

        try {
            postcssConfig = await fs.readFile(postcssConfigPath, 'utf8');
        } catch (error) {
            // No existe postcss.config.js
        }

        if (isTailwindV3 && postcssConfig && postcssConfig.includes('@tailwindcss/postcss')) {
            console.log(`   🔧 ${appName}: Corrigiendo PostCSS para Tailwind v3`);

            const newConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

            await fs.writeFile(postcssConfigPath, newConfig);
            this.fixes.push({
                app: appName,
                type: 'postcss_config',
                description: 'Cambiado @tailwindcss/postcss por tailwindcss para v3'
            });
        }

        if (isTailwindV4 && postcssConfig && !postcssConfig.includes('@tailwindcss/postcss')) {
            console.log(`   🔧 ${appName}: Corrigiendo PostCSS para Tailwind v4`);

            const newConfig = `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};`;

            await fs.writeFile(postcssConfigPath, newConfig);
            this.fixes.push({
                app: appName,
                type: 'postcss_config',
                description: 'Cambiado tailwindcss por @tailwindcss/postcss para v4'
            });
        }

        if (isTailwindV4 && !hasTailwindPostCSS) {
            console.log(`   📦 ${appName}: Instalando @tailwindcss/postcss para v4`);

            try {
                execSync('npm install -D @tailwindcss/postcss', { cwd: appPath, stdio: 'pipe' });
                this.fixes.push({
                    app: appName,
                    type: 'install_dependency',
                    description: 'Instalado @tailwindcss/postcss'
                });
            } catch (error) {
                console.log(`   ❌ Error instalando dependencia en ${appName}: ${error.message}`);
            }
        }

        // Corregir globals.css
        const globalsCssPath = path.join(appPath, 'src/app/globals.css');
        let globalsCss = null;

        try {
            globalsCss = await fs.readFile(globalsCssPath, 'utf8');
        } catch (error) {
            // No existe globals.css
        }

        if (globalsCss) {
            const usesV4Syntax = globalsCss.includes('@import "tailwindcss"');
            const usesV3Syntax = globalsCss.includes('@tailwind base');

            if (isTailwindV4 && usesV3Syntax) {
                console.log(`   🔧 ${appName}: Corrigiendo sintaxis CSS para v4`);

                const newCss = `@import "tailwindcss";

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}`;

                await fs.writeFile(globalsCssPath, newCss);
                this.fixes.push({
                    app: appName,
                    type: 'globals_css',
                    description: 'Cambiado a sintaxis v4: @import "tailwindcss"'
                });
            }

            if (isTailwindV3 && usesV4Syntax) {
                console.log(`   🔧 ${appName}: Corrigiendo sintaxis CSS para v3`);

                const newCss = `@tailwind base;
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
}`;

                await fs.writeFile(globalsCssPath, newCss);
                this.fixes.push({
                    app: appName,
                    type: 'globals_css',
                    description: 'Cambiado a sintaxis v3: @tailwind base/components/utilities'
                });
            }
        }
    }

    async fixTurbopackConfig(appName, appPath, packageJson) {
        const nextVersion = packageJson.dependencies?.next;
        if (!nextVersion || !nextVersion.startsWith('^15')) {
            console.log(`   ⏭️ ${appName}: Next.js ${nextVersion}, saltando Turbopack`);
            return;
        }

        const nextConfigPath = path.join(appPath, 'next.config.js');
        let nextConfig = null;

        try {
            nextConfig = await fs.readFile(nextConfigPath, 'utf8');
        } catch (error) {
            console.log(`   ⏭️ ${appName}: No tiene next.config.js`);
            return;
        }

        // Corregir configuración obsoleta de Turbopack
        if (nextConfig.includes('experimental.turbo')) {
            console.log(`   🔧 ${appName}: Migrando configuración de Turbopack`);

            const newConfig = nextConfig
                .replace(/experimental:\s*{[^}]*turbo[^}]*}/g, 'turbopack: {}')
                .replace(/experimental:\s*{[^}]*}/g, '')
                .replace(/,\s*,/g, ',')
                .replace(/,\s*}/g, '}');

            await fs.writeFile(nextConfigPath, newConfig);
            this.fixes.push({
                app: appName,
                type: 'turbopack_config',
                description: 'Migrado de experimental.turbo a turbopack'
            });
        }
    }

    async fixDevScripts(appName, appPath, packageJson) {
        const scripts = packageJson.scripts || {};
        const devScript = scripts.dev;

        if (devScript && !devScript.includes('--turbopack')) {
            console.log(`   🔧 ${appName}: Agregando flag --turbopack al script dev`);

            const newDevScript = devScript.replace(
                /next dev/,
                'next dev --turbopack'
            );

            packageJson.scripts.dev = newDevScript;

            await fs.writeFile(
                path.join(appPath, 'package.json'),
                JSON.stringify(packageJson, null, 2)
            );

            this.fixes.push({
                app: appName,
                type: 'dev_script',
                description: 'Agregado flag --turbopack al script dev'
            });
        }
    }

    async run() {
        console.log('🚀 Iniciando corrección automática del monorepo...\n');

        await this.scanAllApps();

        for (const app of this.apps) {
            await this.fixApp(app);
        }

        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 REPORTE FINAL DE CORRECCIONES\n');
        console.log('='.repeat(60));

        const successfulApps = this.results.filter(r => r.status === 'success');
        const failedApps = this.results.filter(r => r.status === 'error');
        const totalFixes = this.fixes.length;

        console.log(`✅ Apps corregidas exitosamente: ${successfulApps.length}/${this.apps.length}`);
        console.log(`❌ Apps con errores: ${failedApps.length}`);
        console.log(`🔧 Total de correcciones aplicadas: ${totalFixes}\n`);

        if (successfulApps.length > 0) {
            console.log('📱 APPS CORREGIDAS:');
            successfulApps.forEach(result => {
                const appFixes = this.fixes.filter(f => f.app === result.app);
                console.log(`   ✅ ${result.app}: ${appFixes.length} correcciones`);

                appFixes.forEach(fix => {
                    console.log(`      • ${fix.type}: ${fix.description}`);
                });
            });
            console.log();
        }

        if (failedApps.length > 0) {
            console.log('❌ APPS CON ERRORES:');
            failedApps.forEach(result => {
                console.log(`   ❌ ${result.app}: ${result.error}`);
            });
            console.log();
        }

        if (totalFixes > 0) {
            console.log('🎯 RESUMEN DE CORRECCIONES:');

            const fixTypes = {};
            this.fixes.forEach(fix => {
                fixTypes[fix.type] = (fixTypes[fix.type] || 0) + 1;
            });

            Object.entries(fixTypes).forEach(([type, count]) => {
                console.log(`   • ${type}: ${count} correcciones`);
            });

            console.log('\n💡 PRÓXIMOS PASOS:');
            console.log('1. Reiniciar todos los servidores de desarrollo');
            console.log('2. Verificar que las apps funcionen correctamente');
            console.log('3. Probar el MCP con las herramientas especializadas');
            console.log('4. Optimizar configuración de Turbo si es necesario');
        }

        console.log('\n🎉 ¡Corrección del monorepo completada!');
    }
}

// Ejecutar el script
const fixer = new MonorepoFixer();
fixer.run().catch(console.error); 