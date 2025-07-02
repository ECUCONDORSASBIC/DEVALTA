#!/usr/bin/env node

/**
 * 📦 ANALIZADOR DE DEPENDENCIAS - MIGRACIÓN ARQUITECTÓNICA
 * 
 * Este script analiza todas las dependencias del monorepo para identificar
 * duplicaciones, inconsistencias y oportunidades de optimización.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class DependencyAnalyzer {
    constructor() {
        this.results = {
            packages: [],
            duplicates: [],
            inconsistencies: [],
            recommendations: [],
            stats: {
                totalPackages: 0,
                duplicateDependencies: 0,
                inconsistentVersions: 0,
                workspaceIssues: 0
            }
        };
    }

    log(message, type = 'info') {
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            analysis: '🔍'
        }[type];

        console.log(`${prefix} ${message}`);
    }

    async analyze() {
        this.log('📦 INICIANDO ANÁLISIS DE DEPENDENCIAS...', 'info');

        try {
            // 1. Encontrar todos los package.json
            const packageFiles = await this.findPackageFiles();
            this.log(`📁 Encontrados ${packageFiles.length} archivos package.json`, 'success');

            // 2. Analizar cada package.json
            for (const pkgFile of packageFiles) {
                await this.analyzePackage(pkgFile);
            }

            // 3. Identificar duplicaciones
            this.identifyDuplicates();

            // 4. Identificar inconsistencias
            this.identifyInconsistencies();

            // 5. Generar recomendaciones
            this.generateRecommendations();

            // 6. Guardar reporte
            await this.saveReport();

            this.log('🎉 ANÁLISIS DE DEPENDENCIAS COMPLETADO!', 'success');
            this.printSummary();

            return this.results;

        } catch (error) {
            this.log(`❌ Error durante análisis: ${error.message}`, 'error');
            throw error;
        }
    }

    async findPackageFiles() {
        const packageFiles = [];

        const searchDirs = ['apps', 'packages', 'platform', 'infrastructure'];

        for (const dir of searchDirs) {
            const dirPath = path.join(projectRoot, dir);
            if (await this.exists(dirPath)) {
                const files = await this.findFiles(dirPath, 'package.json');
                packageFiles.push(...files);
            }
        }

        // Agregar package.json raíz
        const rootPackage = path.join(projectRoot, 'package.json');
        if (await this.exists(rootPackage)) {
            packageFiles.unshift(rootPackage);
        }

        return packageFiles;
    }

    async analyzePackage(pkgFile) {
        try {
            const content = await fs.readFile(pkgFile, 'utf8');
            const pkg = JSON.parse(content);

            const relativePath = path.relative(projectRoot, pkgFile);
            const packageInfo = {
                path: relativePath,
                name: pkg.name || 'unnamed',
                version: pkg.version || '0.0.0',
                dependencies: pkg.dependencies || {},
                devDependencies: pkg.devDependencies || {},
                peerDependencies: pkg.peerDependencies || {},
                workspaceDependencies: this.extractWorkspaceDependencies(pkg),
                scripts: pkg.scripts || {},
                type: this.determinePackageType(relativePath)
            };

            this.results.packages.push(packageInfo);
            this.results.stats.totalPackages++;

            this.log(`📦 Analizado: ${relativePath}`, 'analysis');

        } catch (error) {
            this.log(`⚠️ Error analizando ${pkgFile}: ${error.message}`, 'warning');
        }
    }

    extractWorkspaceDependencies(pkg) {
        const workspaceDeps = [];

        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...pkg.peerDependencies
        };

        for (const [dep, version] of Object.entries(allDeps)) {
            if (version === 'workspace:*' || version.startsWith('workspace:')) {
                workspaceDeps.push({
                    name: dep,
                    version: version,
                    type: this.getDependencyType(pkg, dep)
                });
            }
        }

        return workspaceDeps;
    }

    getDependencyType(pkg, dep) {
        if (pkg.dependencies && pkg.dependencies[dep]) return 'dependencies';
        if (pkg.devDependencies && pkg.devDependencies[dep]) return 'devDependencies';
        if (pkg.peerDependencies && pkg.peerDependencies[dep]) return 'peerDependencies';
        return 'unknown';
    }

    determinePackageType(relativePath) {
        if (relativePath === 'package.json') return 'root';
        if (relativePath.startsWith('apps/')) return 'app';
        if (relativePath.startsWith('packages/')) return 'package';
        if (relativePath.startsWith('platform/')) return 'platform';
        if (relativePath.startsWith('infrastructure/')) return 'infrastructure';
        return 'other';
    }

    identifyDuplicates() {
        this.log('🔍 Identificando dependencias duplicadas...', 'analysis');

        const allDependencies = new Map();

        for (const pkg of this.results.packages) {
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies,
                ...pkg.peerDependencies
            };

            for (const [dep, version] of Object.entries(allDeps)) {
                if (!allDependencies.has(dep)) {
                    allDependencies.set(dep, []);
                }
                allDependencies.get(dep).push({
                    package: pkg.path,
                    version: version,
                    type: this.getDependencyType(pkg, dep)
                });
            }
        }

        // Identificar duplicados
        for (const [dep, usages] of allDependencies.entries()) {
            if (usages.length > 1) {
                const versions = [...new Set(usages.map(u => u.version))];

                if (versions.length > 1) {
                    this.results.duplicates.push({
                        dependency: dep,
                        usages: usages,
                        versions: versions,
                        recommendation: `Consolidar a una sola versión: ${this.recommendVersion(versions)}`
                    });
                    this.results.stats.duplicateDependencies++;
                }
            }
        }
    }

    identifyInconsistencies() {
        this.log('🔍 Identificando inconsistencias...', 'analysis');

        // Verificar workspace dependencies inconsistentes
        for (const pkg of this.results.packages) {
            for (const wsDep of pkg.workspaceDependencies) {
                if (wsDep.name.startsWith('@altamedica/') && wsDep.version !== 'workspace:*') {
                    this.results.inconsistencies.push({
                        type: 'workspace_version',
                        package: pkg.path,
                        dependency: wsDep.name,
                        current: wsDep.version,
                        recommended: 'workspace:*',
                        description: 'Workspace dependency should use workspace:*'
                    });
                    this.results.stats.workspaceIssues++;
                }
            }
        }

        // Verificar versiones de React inconsistentes
        const reactVersions = this.getDependencyVersions('react');
        if (reactVersions.length > 1) {
            this.results.inconsistencies.push({
                type: 'react_version',
                versions: reactVersions,
                recommendation: 'Unificar a React 19 en todo el monorepo',
                description: 'Múltiples versiones de React detectadas'
            });
            this.results.stats.inconsistentVersions++;
        }

        // Verificar versiones de Next.js inconsistentes
        const nextVersions = this.getDependencyVersions('next');
        if (nextVersions.length > 1) {
            this.results.inconsistencies.push({
                type: 'next_version',
                versions: nextVersions,
                recommendation: 'Unificar a Next.js 15 en todo el monorepo',
                description: 'Múltiples versiones de Next.js detectadas'
            });
            this.results.stats.inconsistentVersions++;
        }
    }

    getDependencyVersions(depName) {
        const versions = new Set();

        for (const pkg of this.results.packages) {
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies,
                ...pkg.peerDependencies
            };

            if (allDeps[depName]) {
                versions.add(allDeps[depName]);
            }
        }

        return Array.from(versions);
    }

    recommendVersion(versions) {
        // Priorizar versiones más recientes
        const sorted = versions.sort((a, b) => {
            const aNum = this.extractVersionNumber(a);
            const bNum = this.extractVersionNumber(b);
            return bNum - aNum;
        });

        return sorted[0];
    }

    extractVersionNumber(version) {
        const match = version.match(/\d+\.\d+\.\d+/);
        if (match) {
            const parts = match[0].split('.').map(Number);
            return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
        }
        return 0;
    }

    generateRecommendations() {
        this.log('💡 Generando recomendaciones...', 'analysis');

        // Recomendación 1: Consolidar dependencias duplicadas
        if (this.results.duplicates.length > 0) {
            this.results.recommendations.push({
                priority: 'high',
                category: 'dependencies',
                title: 'Consolidar dependencias duplicadas',
                description: `Se encontraron ${this.results.duplicates.length} dependencias con múltiples versiones`,
                action: 'Crear script de consolidación automática',
                impact: 'Reducción de bundle size y conflictos de versiones'
            });
        }

        // Recomendación 2: Estandarizar workspace dependencies
        if (this.results.stats.workspaceIssues > 0) {
            this.results.recommendations.push({
                priority: 'high',
                category: 'workspace',
                title: 'Estandarizar workspace dependencies',
                description: `Se encontraron ${this.results.stats.workspaceIssues} inconsistencias en workspace dependencies`,
                action: 'Actualizar todos los workspace:* a formato consistente',
                impact: 'Mejor gestión de dependencias internas'
            });
        }

        // Recomendación 3: Unificar versiones de React y Next.js
        if (this.results.stats.inconsistentVersions > 0) {
            this.results.recommendations.push({
                priority: 'medium',
                category: 'versions',
                title: 'Unificar versiones de frameworks',
                description: 'Múltiples versiones de React y Next.js detectadas',
                action: 'Migrar a React 19 y Next.js 15 en todo el monorepo',
                impact: 'Consistencia y mejor performance'
            });
        }
    }

    async saveReport() {
        const reportPath = path.join(projectRoot, 'reports', 'dependency-analysis.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });

        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        this.log(`📄 Reporte guardado: ${reportPath}`, 'success');
    }

    printSummary() {
        console.log('\n📊 RESUMEN DEL ANÁLISIS:');
        console.log('========================');
        console.log(`📦 Total de packages: ${this.results.stats.totalPackages}`);
        console.log(`🔄 Dependencias duplicadas: ${this.results.stats.duplicateDependencies}`);
        console.log(`⚠️ Versiones inconsistentes: ${this.results.stats.inconsistentVersions}`);
        console.log(`🔗 Issues de workspace: ${this.results.stats.workspaceIssues}`);
        console.log(`💡 Recomendaciones: ${this.results.recommendations.length}`);

        if (this.results.duplicates.length > 0) {
            console.log('\n🔄 DEPENDENCIAS DUPLICADAS:');
            this.results.duplicates.slice(0, 5).forEach(dup => {
                console.log(`   - ${dup.dependency}: ${dup.versions.join(', ')}`);
            });
        }

        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMENDACIONES PRIORITARIAS:');
            this.results.recommendations
                .filter(r => r.priority === 'high')
                .forEach(rec => {
                    console.log(`   - ${rec.title}: ${rec.description}`);
                });
        }
    }

    async exists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    async findFiles(dir, pattern) {
        const files = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await this.findFiles(fullPath, pattern));
                } else if (entry.isFile() && entry.name === pattern) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignorar errores de acceso
        }

        return files;
    }
}

// Ejecutar análisis
const analyzer = new DependencyAnalyzer();
analyzer.analyze().then(results => {
    console.log('\n🎉 ANÁLISIS COMPLETADO EXITOSAMENTE');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 