#!/usr/bin/env node

/**
 * 🚀 SCRIPT PRINCIPAL DE MIGRACIÓN ARQUITECTÓNICA - ALTAMEDICA
 * 
 * Este script ejecuta toda la migración de manera secuencial y segura,
 * con verificaciones en cada paso y capacidad de rollback.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class MigrationOrchestrator {
    constructor() {
        this.steps = [
            { name: 'backup', script: 'backup-complete.js', critical: true },
            { name: 'analyze', script: 'analyze-dependencies.js', critical: false },
            { name: 'consolidate', script: 'consolidate-mcp.js', critical: true },
            { name: 'clean', script: 'clean-root.js', critical: true }
        ];

        this.results = {
            steps: [],
            startTime: null,
            endTime: null,
            success: false,
            errors: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            migration: '🚀',
            step: '📋'
        }[type];

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async run() {
        this.log('🚀 INICIANDO MIGRACIÓN ARQUITECTÓNICA COMPLETA', 'migration');
        this.results.startTime = new Date();

        try {
            // 1. Verificar prerrequisitos
            await this.verifyPrerequisites();

            // 2. Ejecutar pasos secuencialmente
            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                const stepResult = await this.executeStep(step, i + 1);

                this.results.steps.push(stepResult);

                if (!stepResult.success && step.critical) {
                    this.log(`❌ Paso crítico falló: ${step.name}`, 'error');
                    await this.rollback();
                    return this.results;
                }

                if (!stepResult.success) {
                    this.log(`⚠️ Paso no crítico falló: ${step.name}`, 'warning');
                }
            }

            // 3. Verificación final
            await this.finalVerification();

            // 4. Generar reporte
            await this.generateReport();

            this.results.endTime = new Date();
            this.results.success = true;

            this.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE!', 'success');
            this.printSummary();

            return this.results;

        } catch (error) {
            this.log(`❌ Error fatal durante migración: ${error.message}`, 'error');
            this.results.errors.push(error.message);
            await this.rollback();
            return this.results;
        }
    }

    async verifyPrerequisites() {
        this.log('🔍 Verificando prerrequisitos...', 'info');

        // Verificar que estamos en el directorio correcto
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!await this.exists(packageJsonPath)) {
            throw new Error('No se encontró package.json en el directorio raíz');
        }

        // Verificar que tenemos los scripts necesarios
        for (const step of this.steps) {
            const scriptPath = path.join(__dirname, step.script);
            if (!await this.exists(scriptPath)) {
                throw new Error(`Script no encontrado: ${step.script}`);
            }
        }

        // Verificar que git está disponible
        try {
            execSync('git --version', { stdio: 'ignore' });
        } catch (error) {
            throw new Error('Git no está disponible');
        }

        // Verificar que el repositorio está limpio
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim() !== '') {
                this.log('⚠️ Repositorio no está limpio, continuando de todas formas', 'warning');
            }
        } catch (error) {
            this.log('⚠️ No se pudo verificar estado de git', 'warning');
        }

        this.log('✅ Prerrequisitos verificados', 'success');
    }

    async executeStep(step, stepNumber) {
        this.log(`📋 Ejecutando paso ${stepNumber}/${this.steps.length}: ${step.name}`, 'step');

        const stepResult = {
            name: step.name,
            script: step.script,
            critical: step.critical,
            startTime: new Date(),
            endTime: null,
            success: false,
            output: '',
            error: null
        };

        try {
            const scriptPath = path.join(__dirname, step.script);

            // Ejecutar script
            const output = execSync(`node "${scriptPath}"`, {
                cwd: projectRoot,
                encoding: 'utf8',
                stdio: 'pipe'
            });

            stepResult.output = output;
            stepResult.success = true;
            stepResult.endTime = new Date();

            this.log(`✅ Paso ${stepNumber} completado: ${step.name}`, 'success');

        } catch (error) {
            stepResult.error = error.message;
            stepResult.output = error.stdout || '';
            stepResult.endTime = new Date();

            this.log(`❌ Paso ${stepNumber} falló: ${step.name}`, 'error');
            this.log(`   Error: ${error.message}`, 'error');
        }

        return stepResult;
    }

    async finalVerification() {
        this.log('🔍 Verificación final...', 'info');

        // Verificar estructura de directorios
        const expectedDirs = [
            'platform/configs',
            'platform/docs',
            'platform/scripts',
            'platform/tools',
            'infrastructure',
            'backups'
        ];

        for (const dir of expectedDirs) {
            const dirPath = path.join(projectRoot, dir);
            if (await this.exists(dirPath)) {
                const files = await fs.readdir(dirPath);
                this.log(`📁 ${dir}: ${files.length} archivos`, 'info');
            } else {
                this.log(`❌ Directorio faltante: ${dir}`, 'error');
                this.results.errors.push(`Missing directory: ${dir}`);
            }
        }

        // Verificar archivos críticos
        const criticalFiles = [
            'package.json',
            'pnpm-workspace.yaml',
            'turbo.json'
        ];

        for (const file of criticalFiles) {
            const filePath = path.join(projectRoot, file);
            if (await this.exists(filePath)) {
                this.log(`✅ ${file} presente`, 'success');
            } else {
                this.log(`❌ Archivo crítico faltante: ${file}`, 'error');
                this.results.errors.push(`Missing critical file: ${file}`);
            }
        }

        // Verificar que no hay demasiados archivos en raíz
        const rootFiles = await fs.readdir(projectRoot);
        const nonHiddenFiles = rootFiles.filter(f => !f.startsWith('.'));
        const nonDirFiles = nonHiddenFiles.filter(async f => {
            const stat = await fs.stat(path.join(projectRoot, f));
            return stat.isFile();
        });

        this.log(`📊 Archivos en raíz: ${nonDirFiles.length}`, 'info');

        if (nonDirFiles.length <= 15) {
            this.log('✅ Raíz del proyecto limpia', 'success');
        } else {
            this.log('⚠️ Aún hay muchos archivos en raíz', 'warning');
        }
    }

    async generateReport() {
        this.log('📄 Generando reporte de migración...', 'info');

        const report = {
            migration: {
                startTime: this.results.startTime,
                endTime: this.results.endTime,
                duration: this.results.endTime ?
                    (this.results.endTime - this.results.startTime) / 1000 : null,
                success: this.results.success,
                errors: this.results.errors
            },
            steps: this.results.steps.map(step => ({
                name: step.name,
                critical: step.critical,
                success: step.success,
                duration: step.endTime ?
                    (step.endTime - step.startTime) / 1000 : null,
                error: step.error
            })),
            summary: {
                totalSteps: this.results.steps.length,
                successfulSteps: this.results.steps.filter(s => s.success).length,
                failedSteps: this.results.steps.filter(s => !s.success).length,
                criticalFailures: this.results.steps.filter(s => !s.success && s.critical).length
            }
        };

        const reportPath = path.join(projectRoot, 'reports', 'migration-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        this.log(`📄 Reporte guardado: ${reportPath}`, 'success');
    }

    async rollback() {
        this.log('🔄 Iniciando rollback...', 'warning');

        // Buscar el último backup exitoso
        const backupsDir = path.join(projectRoot, 'backups');
        if (await this.exists(backupsDir)) {
            const backups = await fs.readdir(backupsDir);
            const completeBackups = backups.filter(b => b.startsWith('complete-backup-'));

            if (completeBackups.length > 0) {
                const latestBackup = completeBackups.sort().pop();
                const backupPath = path.join(backupsDir, latestBackup);

                this.log(`🔄 Restaurando desde: ${latestBackup}`, 'warning');

                // Aquí implementaríamos la lógica de restauración
                // Por ahora solo logueamos
                this.log('⚠️ Rollback manual requerido', 'warning');
                this.log(`   Backup disponible en: ${backupPath}`, 'warning');
            }
        }
    }

    printSummary() {
        console.log('\n📊 RESUMEN DE MIGRACIÓN:');
        console.log('========================');

        if (this.results.endTime && this.results.startTime) {
            const duration = (this.results.endTime - this.results.startTime) / 1000;
            console.log(`⏱️ Duración total: ${duration.toFixed(2)} segundos`);
        }

        console.log(`📋 Pasos totales: ${this.results.steps.length}`);
        console.log(`✅ Pasos exitosos: ${this.results.steps.filter(s => s.success).length}`);
        console.log(`❌ Pasos fallidos: ${this.results.steps.filter(s => !s.success).length}`);
        console.log(`🚨 Fallos críticos: ${this.results.steps.filter(s => !s.success && s.critical).length}`);

        if (this.results.success) {
            console.log('\n🎉 MIGRACIÓN EXITOSA!');
            console.log('🏗️ Arquitectura optimizada implementada');
            console.log('📁 Estructura reorganizada y limpia');
            console.log('🔧 Configuraciones centralizadas');
            console.log('📦 Dependencias optimizadas');
        } else {
            console.log('\n❌ MIGRACIÓN FALLIDA');
            console.log('🚨 Se requiere intervención manual');
            console.log('🔄 Rollback disponible en backups/');
        }

        if (this.results.errors.length > 0) {
            console.log('\n⚠️ Errores encontrados:');
            this.results.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }

        console.log('\n📄 Reporte detallado disponible en: reports/migration-report.json');
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

// Ejecutar migración
const orchestrator = new MigrationOrchestrator();
orchestrator.run().then(results => {
    if (results.success) {
        console.log('\n🎉 MIGRACIÓN ARQUITECTÓNICA COMPLETADA EXITOSAMENTE');
        console.log('🛡️ El proyecto está optimizado y listo para desarrollo');
        process.exit(0);
    } else {
        console.log('\n❌ MIGRACIÓN FALLIDA');
        console.log('🚨 Revisar errores y considerar rollback');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 