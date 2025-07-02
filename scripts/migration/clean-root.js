#!/usr/bin/env node

/**
 * 🧹 LIMPIADOR DE RAÍZ - MIGRACIÓN ARQUITECTÓNICA
 * 
 * Este script limpia la raíz del proyecto moviendo archivos a ubicaciones apropiadas
 * y reduciendo la contaminación del workspace principal.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class RootCleaner {
    constructor() {
        this.stats = {
            filesMoved: 0,
            filesDeleted: 0,
            directoriesCreated: 0,
            errors: []
        };

        this.cleanupPlan = {
            // Archivos a mover a platform/configs/
            configs: [
                'tailwind.config.js',
                'eslint.js',
                'postcss.config.js',
                'postcss.config.mjs',
                'next.config.js',
                'tsconfig.json',
                'tsconfig.tsbuildinfo'
            ],

            // Archivos a mover a platform/docs/
            docs: [
                'README.md',
                'README_REFACTORED.md',
                'README_PLAN_ACCION.md',
                'DEVELOPMENT_GUIDELINES.md',
                'memory_guidelines.md',
                'PAGINAS_DISPONIBLES_ALTAMEDICA.md',
                'REPORTE_PLAN_ACCION_FINAL.md',
                'PLAN_ACCION_APLICACIONES_ALTAMEDICA.md',
                'ARCHITECTURE_OPTIMIZATION_PLAN.md',
                'ANALISIS_CURSOR_PREMIUM_ALTAMEDICA.md',
                'CURSOR_PREMIUM_ANALISIS.md',
                'CURSOR_PREMIUM_BENEFICIOS.md',
                'GUIA_ACTIVACION_CURSOR_PREMIUM.md',
                'FIREBASE_EMULATORS_GUIDE.md',
                'FIREBASE_AUTH_IMPLEMENTATION.md',
                'cursor-performance-audit.md',
                'cursor-extension-audit.md',
                'baseline_inventory_report.md'
            ],

            // Archivos a mover a platform/scripts/
            scripts: [
                'watchdog.ps1',
                'cursor-setup.ps1',
                'cursor-setup-altamedica.ps1',
                'copilot-enhanced-profile.ps1',
                'run-refactored-altamedica.cjs'
            ],

            // Archivos a mover a infrastructure/
            infrastructure: [
                'ecosystem.config.cjs',
                'firebase-debug.log',
                '.firebaserc'
            ],

            // Archivos a eliminar (temporales o duplicados)
            delete: [
                'prompt.json',
                'medical-dictionary.json',
                'copilot-enhanced-config.json',
                'cursor-mcp-config.json',
                'mcp-config.json',
                'baseline_metrics_raw.json',
                'next-env.d.ts'
            ]
        };
    }

    log(message, type = 'info') {
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            cleanup: '🧹'
        }[type];

        console.log(`${prefix} ${message}`);
    }

    async clean() {
        this.log('🧹 INICIANDO LIMPIEZA DE RAÍZ...', 'info');

        try {
            // 1. Crear directorios de destino
            await this.createDestinationDirectories();

            // 2. Mover configuraciones
            await this.moveConfigs();

            // 3. Mover documentación
            await this.moveDocs();

            // 4. Mover scripts
            await this.moveScripts();

            // 5. Mover archivos de infraestructura
            await this.moveInfrastructure();

            // 6. Eliminar archivos temporales
            await this.deleteTemporaryFiles();

            // 7. Crear archivos de configuración centralizados
            await this.createCentralizedConfigs();

            // 8. Verificar limpieza
            await this.verifyCleanup();

            this.log('🎉 LIMPIEZA DE RAÍZ COMPLETADA!', 'success');
            this.printSummary();

            return {
                success: true,
                stats: this.stats
            };

        } catch (error) {
            this.log(`❌ Error durante limpieza: ${error.message}`, 'error');
            this.stats.errors.push(error.message);
            return {
                success: false,
                error: error.message,
                stats: this.stats
            };
        }
    }

    async createDestinationDirectories() {
        this.log('📁 Creando directorios de destino...', 'info');

        const directories = [
            'platform/configs/base',
            'platform/configs/next',
            'platform/configs/tailwind',
            'platform/configs/eslint',
            'platform/docs/architecture',
            'platform/docs/development',
            'platform/scripts/setup',
            'infrastructure/firebase',
            'infrastructure/monitoring'
        ];

        for (const dir of directories) {
            const fullPath = path.join(projectRoot, dir);
            await fs.mkdir(fullPath, { recursive: true });
            this.stats.directoriesCreated++;
        }

        this.log(`✅ ${this.stats.directoriesCreated} directorios creados`, 'success');
    }

    async moveConfigs() {
        this.log('⚙️ Moviendo configuraciones...', 'cleanup');

        for (const file of this.cleanupPlan.configs) {
            const sourcePath = path.join(projectRoot, file);
            const targetPath = this.getConfigTargetPath(file);

            if (await this.exists(sourcePath)) {
                await this.moveFile(sourcePath, targetPath);
                this.stats.filesMoved++;
            }
        }
    }

    async moveDocs() {
        this.log('📚 Moviendo documentación...', 'cleanup');

        for (const file of this.cleanupPlan.docs) {
            const sourcePath = path.join(projectRoot, file);
            const targetPath = this.getDocTargetPath(file);

            if (await this.exists(sourcePath)) {
                await this.moveFile(sourcePath, targetPath);
                this.stats.filesMoved++;
            }
        }
    }

    async moveScripts() {
        this.log('📜 Moviendo scripts...', 'cleanup');

        for (const file of this.cleanupPlan.scripts) {
            const sourcePath = path.join(projectRoot, file);
            const targetPath = path.join(projectRoot, 'platform/scripts/setup', file);

            if (await this.exists(sourcePath)) {
                await this.moveFile(sourcePath, targetPath);
                this.stats.filesMoved++;
            }
        }
    }

    async moveInfrastructure() {
        this.log('🏗️ Moviendo archivos de infraestructura...', 'cleanup');

        for (const file of this.cleanupPlan.infrastructure) {
            const sourcePath = path.join(projectRoot, file);
            const targetPath = this.getInfrastructureTargetPath(file);

            if (await this.exists(sourcePath)) {
                await this.moveFile(sourcePath, targetPath);
                this.stats.filesMoved++;
            }
        }
    }

    async deleteTemporaryFiles() {
        this.log('🗑️ Eliminando archivos temporales...', 'cleanup');

        for (const file of this.cleanupPlan.delete) {
            const filePath = path.join(projectRoot, file);

            if (await this.exists(filePath)) {
                try {
                    await fs.unlink(filePath);
                    this.log(`🗑️ Eliminado: ${file}`, 'success');
                    this.stats.filesDeleted++;
                } catch (error) {
                    this.log(`⚠️ Error eliminando ${file}: ${error.message}`, 'warning');
                }
            }
        }
    }

    getConfigTargetPath(filename) {
        const configMap = {
            'tailwind.config.js': 'platform/configs/tailwind/base.js',
            'eslint.js': 'platform/configs/eslint/base.js',
            'postcss.config.js': 'platform/configs/postcss/base.js',
            'postcss.config.mjs': 'platform/configs/postcss/base.mjs',
            'next.config.js': 'platform/configs/next/base.js',
            'tsconfig.json': 'platform/configs/typescript/base.json',
            'tsconfig.tsbuildinfo': 'platform/configs/typescript/build-info.json'
        };

        return path.join(projectRoot, configMap[filename] || `platform/configs/base/${filename}`);
    }

    getDocTargetPath(filename) {
        if (filename.includes('ARCHITECTURE') || filename.includes('PLAN')) {
            return path.join(projectRoot, 'platform/docs/architecture', filename);
        } else if (filename.includes('CURSOR') || filename.includes('DEVELOPMENT')) {
            return path.join(projectRoot, 'platform/docs/development', filename);
        } else {
            return path.join(projectRoot, 'platform/docs', filename);
        }
    }

    getInfrastructureTargetPath(filename) {
        if (filename.includes('firebase')) {
            return path.join(projectRoot, 'infrastructure/firebase', filename);
        } else if (filename.includes('ecosystem')) {
            return path.join(projectRoot, 'infrastructure/monitoring', filename);
        } else {
            return path.join(projectRoot, 'infrastructure', filename);
        }
    }

    async moveFile(source, target) {
        try {
            // Crear directorio de destino si no existe
            await fs.mkdir(path.dirname(target), { recursive: true });

            // Mover archivo
            await fs.rename(source, target);

            this.log(`📄 Movido: ${path.relative(projectRoot, source)} → ${path.relative(projectRoot, target)}`, 'success');
        } catch (error) {
            this.log(`⚠️ Error moviendo ${source}: ${error.message}`, 'warning');
            this.stats.errors.push(`Error moving ${source}: ${error.message}`);
        }
    }

    async createCentralizedConfigs() {
        this.log('⚙️ Creando configuraciones centralizadas...', 'info');

        // Crear package.json raíz optimizado
        await this.createOptimizedRootPackage();

        // Crear workspace config optimizado
        await this.createOptimizedWorkspaceConfig();

        // Crear turbo config optimizado
        await this.createOptimizedTurboConfig();
    }

    async createOptimizedRootPackage() {
        const rootPackagePath = path.join(projectRoot, 'package.json');
        const currentPackage = JSON.parse(await fs.readFile(rootPackagePath, 'utf8'));

        const optimizedPackage = {
            name: "altamedica-platform",
            private: true,
            type: "module",
            version: "1.0.0",
            description: "ALTAMEDICA Medical Platform - Enterprise Healthcare Management System",
            packageManager: "pnpm@9.0.0",
            engines: {
                node: ">=18",
                pnpm: ">=9.0.0"
            },
            scripts: {
                "dev": "turbo run dev --concurrency=6",
                "build": "turbo run build",
                "test": "turbo run test",
                "lint": "turbo run lint",
                "type-check": "turbo run type-check",
                "clean": "turbo run clean && rm -rf node_modules",
                "deploy": "turbo run deploy",
                "security:audit": "turbo run security:audit",
                "migration:backup": "node scripts/migration/backup-complete.js",
                "migration:analyze": "node scripts/migration/analyze-dependencies.js",
                "migration:consolidate": "node scripts/migration/consolidate-mcp.js",
                "migration:clean": "node scripts/migration/clean-root.js"
            },
            devDependencies: {
                "@changesets/cli": "^2.27.1",
                "@types/node": "^20.19.1",
                "eslint": "^8.57.1",
                "prettier": "^3.1.0",
                "turbo": "^2.5.4",
                "typescript": "^5.8.3",
                "vitest": "^1.0.0"
            },
            dependencies: {
                "firebase": "^10.14.1",
                "firebase-admin": "^12.7.0",
                "next": "15.3.4",
                "react": "^19.1.0",
                "react-dom": "^19.1.0",
                "zod": "^3.25.67"
            },
            "lint-staged": {
                "*.{ts,tsx,js,jsx}": [
                    "eslint --fix",
                    "prettier --write"
                ],
                "*.{md,json}": [
                    "prettier --write"
                ]
            }
        };

        await fs.writeFile(rootPackagePath, JSON.stringify(optimizedPackage, null, 2));
        this.log('📄 Package.json raíz optimizado', 'success');
    }

    async createOptimizedWorkspaceConfig() {
        const workspaceConfig = `packages:
  - 'apps/*'
  - 'packages/*'
  - 'platform/configs/*'
  - 'infrastructure/*'

# Configuración optimizada para monorepo médico
# Separación clara entre aplicaciones, packages y infraestructura
`;

        await fs.writeFile(path.join(projectRoot, 'pnpm-workspace.yaml'), workspaceConfig);
        this.log('📄 Workspace config optimizado', 'success');
    }

    async createOptimizedTurboConfig() {
        const turboConfig = {
            "$schema": "https://turborepo.com/schema.json",
            "tasks": {
                "postinstall": {},
                "build": {
                    "dependsOn": ["^build"],
                    "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
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
                    "dependsOn": ["^build"],
                    "outputs": ["coverage/**"],
                    "cache": false
                },
                "test:watch": {
                    "cache": false,
                    "persistent": true
                },
                "test:coverage": {
                    "dependsOn": ["^build"],
                    "outputs": ["coverage/**"],
                    "cache": false
                },
                "clean": {
                    "cache": false
                },
                "deploy": {
                    "dependsOn": ["build"],
                    "outputs": []
                },
                "security:audit": {
                    "dependsOn": ["^build"],
                    "outputs": ["security-reports/**"],
                    "cache": false
                }
            }
        };

        await fs.writeFile(path.join(projectRoot, 'turbo.json'), JSON.stringify(turboConfig, null, 2));
        this.log('📄 Turbo config optimizado', 'success');
    }

    async verifyCleanup() {
        this.log('🔍 Verificando limpieza...', 'info');

        try {
            const rootFiles = await fs.readdir(projectRoot);
            const remainingFiles = rootFiles.filter(file =>
                !file.startsWith('.') &&
                !['node_modules', 'dist', 'build', 'coverage'].includes(file)
            );

            this.log(`📊 Archivos restantes en raíz: ${remainingFiles.length}`, 'info');

            if (remainingFiles.length <= 15) {
                this.log('✅ Limpieza exitosa - Raíz optimizada', 'success');
            } else {
                this.log('⚠️ Aún hay archivos que podrían moverse', 'warning');
            }

            // Verificar que los directorios de destino tienen contenido
            const targetDirs = [
                'platform/configs',
                'platform/docs',
                'platform/scripts',
                'infrastructure'
            ];

            for (const dir of targetDirs) {
                const dirPath = path.join(projectRoot, dir);
                if (await this.exists(dirPath)) {
                    const files = await fs.readdir(dirPath);
                    this.log(`📁 ${dir}: ${files.length} archivos`, 'info');
                }
            }

        } catch (error) {
            this.log(`❌ Error en verificación: ${error.message}`, 'error');
        }
    }

    printSummary() {
        console.log('\n📊 RESUMEN DE LIMPIEZA DE RAÍZ:');
        console.log('===============================');
        console.log(`📄 Archivos movidos: ${this.stats.filesMoved}`);
        console.log(`🗑️ Archivos eliminados: ${this.stats.filesDeleted}`);
        console.log(`📁 Directorios creados: ${this.stats.directoriesCreated}`);
        console.log(`❌ Errores: ${this.stats.errors.length}`);

        if (this.stats.errors.length > 0) {
            console.log('\n⚠️ Errores encontrados:');
            this.stats.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }

        console.log('\n🎯 RESULTADO:');
        console.log('   - Raíz del proyecto limpia y organizada');
        console.log('   - Configuraciones centralizadas en platform/configs/');
        console.log('   - Documentación organizada en platform/docs/');
        console.log('   - Scripts organizados en platform/scripts/');
        console.log('   - Infraestructura separada en infrastructure/');
    }

    async exists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }
}

// Ejecutar limpieza
const cleaner = new RootCleaner();
cleaner.clean().then(result => {
    if (result.success) {
        console.log('\n🎉 LIMPIEZA DE RAÍZ COMPLETADA EXITOSAMENTE');
        process.exit(0);
    } else {
        console.log('\n❌ ERROR EN LA LIMPIEZA');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 