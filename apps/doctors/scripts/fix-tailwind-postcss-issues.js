#!/usr/bin/env node

/**
 * Script para diagnosticar y solucionar problemas de Tailwind CSS y PostCSS
 * 
 * Este script:
 * 1. Detecta inconsistencias entre versiones de Tailwind y configuración de PostCSS
 * 2. Corrige automáticamente las configuraciones incorrectas
 * 3. Proporciona recomendaciones para estandarizar la plataforma
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const APPS_DIR = './apps';
const PACKAGES_DIR = './packages';

class TailwindPostCSSFixer {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.recommendations = [];
    }

    async scanProject() {
        console.log('🔍 Escaneando proyecto para problemas de Tailwind CSS y PostCSS...\n');

        // Escanear apps
        const apps = await this.getDirectories(APPS_DIR);
        for (const app of apps) {
            await this.analyzeApp(app);
        }

        // Escanear packages
        const packages = await this.getDirectories(PACKAGES_DIR);
        for (const pkg of packages) {
            await this.analyzePackage(pkg);
        }

        this.generateReport();
    }

    async getDirectories(dir) {
        try {
            const items = await fs.readdir(dir);
            const directories = [];

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    directories.push(item);
                }
            }

            return directories;
        } catch (error) {
            return [];
        }
    }

    async analyzeApp(appName) {
        const appPath = path.join(APPS_DIR, appName);
        console.log(`📱 Analizando app: ${appName}`);

        try {
            // Verificar package.json
            const packageJsonPath = path.join(appPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            // Verificar versión de Tailwind
            const tailwindVersion = packageJson.devDependencies?.tailwindcss;
            const hasTailwindPostCSS = packageJson.devDependencies?.['@tailwindcss/postcss'];

            // Verificar postcss.config.js
            const postcssConfigPath = path.join(appPath, 'postcss.config.js');
            let postcssConfig = null;

            try {
                const postcssContent = await fs.readFile(postcssConfigPath, 'utf8');
                postcssConfig = postcssContent;
            } catch (error) {
                // No existe postcss.config.js
            }

            // Verificar globals.css
            const globalsCssPath = path.join(appPath, 'src/app/globals.css');
            let globalsCss = null;

            try {
                globalsCss = await fs.readFile(globalsCssPath, 'utf8');
            } catch (error) {
                // No existe globals.css
            }

            // Analizar problemas
            this.analyzeTailwindConfig(appName, tailwindVersion, hasTailwindPostCSS, postcssConfig, globalsCss);

        } catch (error) {
            console.log(`❌ Error analizando ${appName}: ${error.message}`);
        }
    }

    async analyzePackage(pkgName) {
        const pkgPath = path.join(PACKAGES_DIR, pkgName);
        console.log(`📦 Analizando package: ${pkgName}`);

        try {
            const packageJsonPath = path.join(pkgPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            const tailwindVersion = packageJson.devDependencies?.tailwindcss;
            const hasTailwindPostCSS = packageJson.devDependencies?.['@tailwindcss/postcss'];

            if (tailwindVersion || hasTailwindPostCSS) {
                this.issues.push({
                    type: 'package',
                    name: pkgName,
                    issue: 'Package con dependencias de Tailwind',
                    details: `Tailwind: ${tailwindVersion}, PostCSS: ${hasTailwindPostCSS ? 'Sí' : 'No'}`
                });
            }

        } catch (error) {
            // Package sin package.json o error de lectura
        }
    }

    analyzeTailwindConfig(appName, tailwindVersion, hasTailwindPostCSS, postcssConfig, globalsCss) {
        const isTailwindV4 = tailwindVersion && tailwindVersion.startsWith('^4');
        const isTailwindV3 = tailwindVersion && tailwindVersion.startsWith('^3');

        // Problema 1: Tailwind v3 con configuración v4
        if (isTailwindV3 && postcssConfig && postcssConfig.includes('@tailwindcss/postcss')) {
            this.issues.push({
                type: 'app',
                name: appName,
                issue: 'Tailwind v3 con configuración v4',
                severity: 'error',
                details: `Versión: ${tailwindVersion}, usando @tailwindcss/postcss`
            });

            this.fixes.push({
                type: 'postcss_config',
                app: appName,
                action: 'Cambiar @tailwindcss/postcss por tailwindcss',
                code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
            });
        }

        // Problema 2: Tailwind v4 sin configuración v4
        if (isTailwindV4 && postcssConfig && !postcssConfig.includes('@tailwindcss/postcss')) {
            this.issues.push({
                type: 'app',
                name: appName,
                issue: 'Tailwind v4 con configuración v3',
                severity: 'error',
                details: `Versión: ${tailwindVersion}, usando tailwindcss en lugar de @tailwindcss/postcss`
            });

            this.fixes.push({
                type: 'postcss_config',
                app: appName,
                action: 'Cambiar tailwindcss por @tailwindcss/postcss',
                code: `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};`
            });
        }

        // Problema 3: Tailwind v4 sin dependencia @tailwindcss/postcss
        if (isTailwindV4 && !hasTailwindPostCSS) {
            this.issues.push({
                type: 'app',
                name: appName,
                issue: 'Tailwind v4 sin @tailwindcss/postcss',
                severity: 'error',
                details: `Falta instalar @tailwindcss/postcss para Tailwind v4`
            });

            this.fixes.push({
                type: 'install_dependency',
                app: appName,
                action: 'Instalar @tailwindcss/postcss',
                command: `npm install -D @tailwindcss/postcss`
            });
        }

        // Problema 4: Sintaxis CSS incorrecta
        if (globalsCss) {
            const usesV4Syntax = globalsCss.includes('@import "tailwindcss"');
            const usesV3Syntax = globalsCss.includes('@tailwind base');

            if (isTailwindV4 && usesV3Syntax) {
                this.issues.push({
                    type: 'app',
                    name: appName,
                    issue: 'Tailwind v4 con sintaxis v3',
                    severity: 'error',
                    details: 'Usando @tailwind base/components/utilities en lugar de @import "tailwindcss"'
                });

                this.fixes.push({
                    type: 'globals_css',
                    app: appName,
                    action: 'Cambiar a sintaxis v4',
                    code: `@import "tailwindcss";

/* Estilos personalizados */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}`
                });
            }

            if (isTailwindV3 && usesV4Syntax) {
                this.issues.push({
                    type: 'app',
                    name: appName,
                    issue: 'Tailwind v3 con sintaxis v4',
                    severity: 'error',
                    details: 'Usando @import "tailwindcss" en lugar de @tailwind base/components/utilities'
                });

                this.fixes.push({
                    type: 'globals_css',
                    app: appName,
                    action: 'Cambiar a sintaxis v3',
                    code: `@tailwind base;
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
}`
                });
            }
        }

        // Problema 5: Sin configuración de PostCSS
        if ((isTailwindV3 || isTailwindV4) && !postcssConfig) {
            this.issues.push({
                type: 'app',
                name: appName,
                issue: 'Tailwind sin configuración PostCSS',
                severity: 'warning',
                details: 'Falta archivo postcss.config.js'
            });

            const config = isTailwindV4 ?
                `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};` :
                `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

            this.fixes.push({
                type: 'create_postcss_config',
                app: appName,
                action: 'Crear postcss.config.js',
                code: config
            });
        }
    }

    async applyFixes() {
        console.log('\n🔧 Aplicando correcciones...\n');

        for (const fix of this.fixes) {
            try {
                const appPath = path.join(APPS_DIR, fix.app);

                switch (fix.type) {
                    case 'postcss_config':
                        await fs.writeFile(path.join(appPath, 'postcss.config.js'), fix.code);
                        console.log(`✅ Corregido postcss.config.js en ${fix.app}`);
                        break;

                    case 'globals_css':
                        await fs.writeFile(path.join(appPath, 'src/app/globals.css'), fix.code);
                        console.log(`✅ Corregido globals.css en ${fix.app}`);
                        break;

                    case 'create_postcss_config':
                        await fs.writeFile(path.join(appPath, 'postcss.config.js'), fix.code);
                        console.log(`✅ Creado postcss.config.js en ${fix.app}`);
                        break;

                    case 'install_dependency':
                        console.log(`📦 Instalando dependencia en ${fix.app}: ${fix.command}`);
                        execSync(fix.command, { cwd: appPath, stdio: 'inherit' });
                        break;
                }
            } catch (error) {
                console.log(`❌ Error aplicando fix en ${fix.app}: ${error.message}`);
            }
        }
    }

    generateReport() {
        console.log('\n📊 REPORTE DE DIAGNÓSTICO\n');
        console.log('='.repeat(50));

        if (this.issues.length === 0) {
            console.log('✅ No se encontraron problemas de configuración');
            return;
        }

        console.log(`🔍 Problemas encontrados: ${this.issues.length}\n`);

        // Agrupar por tipo
        const appIssues = this.issues.filter(i => i.type === 'app');
        const packageIssues = this.issues.filter(i => i.type === 'package');

        if (appIssues.length > 0) {
            console.log('📱 PROBLEMAS EN APPS:');
            appIssues.forEach(issue => {
                const icon = issue.severity === 'error' ? '❌' : '⚠️';
                console.log(`${icon} ${issue.name}: ${issue.issue}`);
                console.log(`   ${issue.details}\n`);
            });
        }

        if (packageIssues.length > 0) {
            console.log('📦 PROBLEMAS EN PACKAGES:');
            packageIssues.forEach(issue => {
                console.log(`⚠️ ${issue.name}: ${issue.issue}`);
                console.log(`   ${issue.details}\n`);
            });
        }

        if (this.fixes.length > 0) {
            console.log(`🔧 Correcciones disponibles: ${this.fixes.length}`);
            console.log('\nRECOMENDACIONES:');

            // Contar tipos de problemas
            const postcssIssues = this.issues.filter(i => i.issue.includes('PostCSS'));
            const syntaxIssues = this.issues.filter(i => i.issue.includes('sintaxis'));
            const dependencyIssues = this.issues.filter(i => i.issue.includes('dependencia'));

            if (postcssIssues.length > 0) {
                console.log(`• ${postcssIssues.length} apps con configuración PostCSS incorrecta`);
            }

            if (syntaxIssues.length > 0) {
                console.log(`• ${syntaxIssues.length} apps con sintaxis CSS incorrecta`);
            }

            if (dependencyIssues.length > 0) {
                console.log(`• ${dependencyIssues.length} apps con dependencias faltantes`);
            }

            console.log('\n💡 RECOMENDACIÓN PRINCIPAL:');
            console.log('Estandarizar toda la plataforma en Tailwind CSS v3.4.17 para máxima estabilidad');
        }
    }

    async run() {
        await this.scanProject();

        if (this.fixes.length > 0) {
            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('\n¿Deseas aplicar las correcciones automáticamente? (y/N): ', resolve);
            });

            rl.close();

            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                await this.applyFixes();
                console.log('\n✅ Correcciones aplicadas. Reinicia los servidores de desarrollo.');
            } else {
                console.log('\n⚠️ Correcciones no aplicadas. Revisa el reporte manualmente.');
            }
        }
    }
}

// Ejecutar el script
const fixer = new TailwindPostCSSFixer();
fixer.run().catch(console.error); 