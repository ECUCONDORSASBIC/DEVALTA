#!/usr/bin/env node

/**
 * 🔍 ANÁLISIS PROFUNDO DE OPTIMIZACIÓN - CURSOR PREMIUM
 * 
 * Script para detectar duplicaciones, redundancias y oportunidades
 * de optimización en todo el código fuente
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

class DeepAnalyzer {
    constructor() {
        this.results = {
            duplicates: [],
            redundancies: [],
            optimizations: [],
            stats: {
                filesAnalyzed: 0,
                duplicatesFound: 0,
                redundanciesFound: 0,
                optimizationsSuggested: 0
            }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            analysis: '🔍'
        }[type];

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async analyzeProject() {
        this.log('🚀 Iniciando análisis profundo del proyecto...', 'info');

        try {
            // 1. Análisis de scripts duplicados
            await this.analyzeScripts();

            // 2. Análisis de configuraciones
            await this.analyzeConfigurations();

            // 3. Análisis de dependencias
            await this.analyzeDependencies();

            // 4. Análisis de estructura
            await this.analyzeStructure();

            // 5. Análisis de código
            await this.analyzeCode();

            // 6. Generar reporte
            await this.generateReport();

            this.log('🎉 Análisis profundo completado!', 'success');

        } catch (error) {
            this.log(`Error durante el análisis: ${error.message}`, 'error');
        }
    }

    async analyzeScripts() {
        this.log('📜 Analizando scripts...', 'analysis');

        const scriptPatterns = [
            'start-*.js',
            'start-*.cjs',
            'start-*.sh',
            'start-*.bat',
            'dev-*.js',
            'dev-*.cjs',
            'run-*.js',
            'run-*.cjs'
        ];

        const scripts = [];

        // Buscar todos los scripts
        for (const pattern of scriptPatterns) {
            const matches = await this.findFiles(pattern);
            scripts.push(...matches);
        }

        // Analizar duplicaciones
        const duplicates = this.findScriptDuplicates(scripts);

        if (duplicates.length > 0) {
            this.results.duplicates.push({
                category: 'Scripts',
                items: duplicates,
                recommendation: 'Consolidar scripts similares en uno solo'
            });
            this.results.stats.duplicatesFound += duplicates.length;
        }
    }

    async analyzeConfigurations() {
        this.log('⚙️ Analizando configuraciones...', 'analysis');

        const configFiles = [
            'package.json',
            'tsconfig.json',
            'eslint.config.js',
            'eslint.config.mjs',
            'tailwind.config.js',
            'next.config.js',
            'postcss.config.js'
        ];

        const configs = [];

        // Buscar configuraciones en todo el proyecto
        for (const config of configFiles) {
            const matches = await this.findFiles(config);
            configs.push(...matches);
        }

        // Analizar redundancias en configuraciones
        const redundancies = this.findConfigRedundancies(configs);

        if (redundancies.length > 0) {
            this.results.redundancies.push({
                category: 'Configuraciones',
                items: redundancies,
                recommendation: 'Unificar configuraciones similares'
            });
            this.results.stats.redundanciesFound += redundancies.length;
        }
    }

    async analyzeDependencies() {
        this.log('📦 Analizando dependencias...', 'analysis');

        const packageFiles = await this.findFiles('package.json');

        for (const pkgFile of packageFiles) {
            try {
                const content = await fs.readFile(pkgFile, 'utf8');
                const pkg = JSON.parse(content);

                // Analizar dependencias duplicadas
                const duplicateDeps = this.findDuplicateDependencies(pkg);

                if (duplicateDeps.length > 0) {
                    this.results.optimizations.push({
                        category: 'Dependencias',
                        file: pkgFile,
                        items: duplicateDeps,
                        recommendation: 'Eliminar dependencias duplicadas'
                    });
                    this.results.stats.optimizationsSuggested += duplicateDeps.length;
                }
            } catch (error) {
                this.log(`Error analizando ${pkgFile}: ${error.message}`, 'warning');
            }
        }
    }

    async analyzeStructure() {
        this.log('🏗️ Analizando estructura...', 'analysis');

        const structure = await this.getProjectStructure();

        // Detectar directorios vacíos o innecesarios
        const emptyDirs = await this.findEmptyDirectories();

        if (emptyDirs.length > 0) {
            this.results.optimizations.push({
                category: 'Estructura',
                items: emptyDirs,
                recommendation: 'Eliminar directorios vacíos'
            });
        }

        // Detectar archivos temporales
        const tempFiles = await this.findTemporaryFiles();

        if (tempFiles.length > 0) {
            this.results.optimizations.push({
                category: 'Archivos Temporales',
                items: tempFiles,
                recommendation: 'Eliminar archivos temporales'
            });
        }
    }

    async analyzeCode() {
        this.log('💻 Analizando código...', 'analysis');

        const codeFiles = await this.findFiles('*.{js,ts,jsx,tsx}');

        for (const file of codeFiles.slice(0, 50)) { // Limitar para performance
            try {
                const content = await fs.readFile(file, 'utf8');

                // Detectar imports duplicados
                const duplicateImports = this.findDuplicateImports(content);

                if (duplicateImports.length > 0) {
                    this.results.optimizations.push({
                        category: 'Código',
                        file: file,
                        items: duplicateImports,
                        recommendation: 'Eliminar imports duplicados'
                    });
                }

                this.results.stats.filesAnalyzed++;
            } catch (error) {
                // Ignorar errores de lectura
            }
        }
    }

    async findFiles(pattern) {
        const { glob } = await import('glob');
        return await glob(pattern, { cwd: projectRoot, absolute: true });
    }

    findScriptDuplicates(scripts) {
        const duplicates = [];
        const groups = {};

        for (const script of scripts) {
            const basename = path.basename(script, path.extname(script));
            if (!groups[basename]) {
                groups[basename] = [];
            }
            groups[basename].push(script);
        }

        for (const [name, files] of Object.entries(groups)) {
            if (files.length > 1) {
                duplicates.push({
                    name,
                    files,
                    suggestion: `Consolidar en un solo script: ${name}.cjs`
                });
            }
        }

        return duplicates;
    }

    findConfigRedundancies(configs) {
        const redundancies = [];

        // Agrupar por tipo de configuración
        const groups = {};
        for (const config of configs) {
            const basename = path.basename(config);
            if (!groups[basename]) {
                groups[basename] = [];
            }
            groups[basename].push(config);
        }

        for (const [name, files] of Object.entries(groups)) {
            if (files.length > 1) {
                redundancies.push({
                    name,
                    files,
                    suggestion: `Unificar en configs/base/${name}`
                });
            }
        }

        return redundancies;
    }

    findDuplicateDependencies(pkg) {
        const duplicates = [];

        // Verificar dependencias duplicadas entre dependencies y devDependencies
        const deps = Object.keys(pkg.dependencies || {});
        const devDeps = Object.keys(pkg.devDependencies || {});

        for (const dep of deps) {
            if (devDeps.includes(dep)) {
                duplicates.push({
                    package: dep,
                    suggestion: `Mover a devDependencies si es solo para desarrollo`
                });
            }
        }

        return duplicates;
    }

    async findEmptyDirectories() {
        const emptyDirs = [];

        try {
            const dirs = await this.findFiles('**/');

            for (const dir of dirs) {
                try {
                    const files = await fs.readdir(dir);
                    if (files.length === 0) {
                        emptyDirs.push(dir);
                    }
                } catch (error) {
                    // Ignorar errores de lectura
                }
            }
        } catch (error) {
            // Ignorar errores de glob
        }

        return emptyDirs;
    }

    async findTemporaryFiles() {
        const tempPatterns = [
            '*.tmp',
            '*.temp',
            '*.log',
            '*.cache',
            '.DS_Store',
            'Thumbs.db'
        ];

        const tempFiles = [];

        for (const pattern of tempPatterns) {
            const matches = await this.findFiles(pattern);
            tempFiles.push(...matches);
        }

        return tempFiles;
    }

    findDuplicateImports(content) {
        const imports = content.match(/import.*from.*['"]/g) || [];
        const duplicates = [];

        const importCounts = {};
        for (const imp of imports) {
            importCounts[imp] = (importCounts[imp] || 0) + 1;
        }

        for (const [imp, count] of Object.entries(importCounts)) {
            if (count > 1) {
                duplicates.push({
                    import: imp,
                    count,
                    suggestion: 'Consolidar imports duplicados'
                });
            }
        }

        return duplicates;
    }

    async getProjectStructure() {
        const structure = {};

        try {
            const items = await fs.readdir(projectRoot);

            for (const item of items) {
                const itemPath = path.join(projectRoot, item);
                const stats = await fs.stat(itemPath);

                structure[item] = {
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime
                };
            }
        } catch (error) {
            this.log(`Error obteniendo estructura: ${error.message}`, 'warning');
        }

        return structure;
    }

    async generateReport() {
        this.log('📊 Generando reporte de análisis...', 'info');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                filesAnalyzed: this.results.stats.filesAnalyzed,
                duplicatesFound: this.results.stats.duplicatesFound,
                redundanciesFound: this.results.stats.redundanciesFound,
                optimizationsSuggested: this.results.stats.optimizationsSuggested
            },
            details: this.results,
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(projectRoot, 'reports', 'deep-analysis.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        this.log('✅ Reporte generado en reports/deep-analysis.json', 'success');

        // Mostrar resumen
        this.showSummary();
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.results.stats.duplicatesFound > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Eliminar scripts duplicados',
                impact: 'Reducción de mantenimiento y confusión'
            });
        }

        if (this.results.stats.redundanciesFound > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Unificar configuraciones',
                impact: 'Mejora de consistencia y mantenibilidad'
            });
        }

        if (this.results.stats.optimizationsSuggested > 0) {
            recommendations.push({
                priority: 'low',
                action: 'Optimizar dependencias y código',
                impact: 'Mejora de performance y tamaño de bundle'
            });
        }

        return recommendations;
    }

    showSummary() {
        console.log('\n📈 RESUMEN DEL ANÁLISIS PROFUNDO:');
        console.log('==================================');
        console.log(`   • Archivos analizados: ${this.results.stats.filesAnalyzed}`);
        console.log(`   • Duplicados encontrados: ${this.results.stats.duplicatesFound}`);
        console.log(`   • Redundancias encontradas: ${this.results.stats.redundanciesFound}`);
        console.log(`   • Optimizaciones sugeridas: ${this.results.stats.optimizationsSuggested}`);

        if (this.results.duplicates.length > 0) {
            console.log('\n🔍 DUPLICADOS ENCONTRADOS:');
            for (const duplicate of this.results.duplicates) {
                console.log(`   • ${duplicate.category}: ${duplicate.items.length} items`);
            }
        }

        if (this.results.optimizations.length > 0) {
            console.log('\n💡 OPTIMIZACIONES SUGERIDAS:');
            for (const opt of this.results.optimizations.slice(0, 5)) {
                console.log(`   • ${opt.category}: ${opt.recommendation}`);
            }
        }
    }
}

// Ejecutar análisis
const analyzer = new DeepAnalyzer();
analyzer.analyzeProject().catch(console.error); 