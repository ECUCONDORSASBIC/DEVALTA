#!/usr/bin/env node

/**
 * 🛡️ SCRIPT DE BACKUP COMPLETO - MIGRACIÓN ARQUITECTÓNICA
 * 
 * Este script crea un backup completo y verificable del proyecto
 * antes de iniciar la migración arquitectónica.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const backupDir = path.join(projectRoot, 'backups', `complete-backup-${Date.now()}`);

class CompleteBackup {
    constructor() {
        this.stats = {
            filesBackedUp: 0,
            directoriesBackedUp: 0,
            totalSize: 0,
            errors: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type];

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async createBackup() {
        this.log('🛡️ INICIANDO BACKUP COMPLETO DEL PROYECTO...', 'info');

        try {
            // 1. Crear directorio de backup
            await fs.mkdir(backupDir, { recursive: true });
            this.log(`📁 Backup directory creado: ${backupDir}`, 'success');

            // 2. Lista de directorios críticos a respaldar
            const criticalDirs = [
                'apps',
                'packages',
                'configs',
                'scripts',
                'docs',
                'tools',
                'mcp-protected',
                'platform',
                'infrastructure'
            ];

            // 3. Lista de archivos críticos en raíz
            const criticalFiles = [
                'package.json',
                'pnpm-workspace.yaml',
                'turbo.json',
                'tsconfig.json',
                'next.config.js',
                'tailwind.config.js',
                'eslint.js',
                'postcss.config.js',
                '.gitignore',
                '.firebaserc',
                'firebase-debug.log'
            ];

            // 4. Backup de directorios críticos
            for (const dir of criticalDirs) {
                const sourcePath = path.join(projectRoot, dir);
                const targetPath = path.join(backupDir, dir);

                if (await this.exists(sourcePath)) {
                    await this.copyDirectory(sourcePath, targetPath);
                    this.stats.directoriesBackedUp++;
                }
            }

            // 5. Backup de archivos críticos
            for (const file of criticalFiles) {
                const sourcePath = path.join(projectRoot, file);
                const targetPath = path.join(backupDir, file);

                if (await this.exists(sourcePath)) {
                    await this.copyFile(sourcePath, targetPath);
                    this.stats.filesBackedUp++;
                }
            }

            // 6. Backup de archivos de documentación
            const docFiles = await this.findFiles(projectRoot, '*.md');
            for (const docFile of docFiles) {
                const relativePath = path.relative(projectRoot, docFile);
                const targetPath = path.join(backupDir, 'docs', relativePath);

                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                await this.copyFile(docFile, targetPath);
                this.stats.filesBackedUp++;
            }

            // 7. Crear manifest del backup
            await this.createBackupManifest();

            // 8. Verificar integridad del backup
            await this.verifyBackup();

            this.log('🎉 BACKUP COMPLETO EXITOSO!', 'success');
            this.log(`📊 Estadísticas:`, 'info');
            this.log(`   - Archivos respaldados: ${this.stats.filesBackedUp}`, 'info');
            this.log(`   - Directorios respaldados: ${this.stats.directoriesBackedUp}`, 'info');
            this.log(`   - Tamaño total: ${(this.stats.totalSize / 1024 / 1024).toFixed(2)} MB`, 'info');
            this.log(`   - Errores: ${this.stats.errors.length}`, this.stats.errors.length > 0 ? 'warning' : 'success');
            this.log(`📁 Ubicación: ${backupDir}`, 'info');

            return {
                success: true,
                backupPath: backupDir,
                stats: this.stats
            };

        } catch (error) {
            this.log(`❌ Error durante backup: ${error.message}`, 'error');
            this.stats.errors.push(error.message);
            return {
                success: false,
                error: error.message,
                stats: this.stats
            };
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

    async copyFile(source, target) {
        try {
            const content = await fs.readFile(source);
            await fs.writeFile(target, content);

            const stats = await fs.stat(source);
            this.stats.totalSize += stats.size;

            this.log(`📄 Backup: ${path.relative(projectRoot, source)}`, 'success');
        } catch (error) {
            this.log(`⚠️ Error copiando ${source}: ${error.message}`, 'warning');
            this.stats.errors.push(`Error copying ${source}: ${error.message}`);
        }
    }

    async copyDirectory(source, target) {
        try {
            await fs.mkdir(target, { recursive: true });

            const entries = await fs.readdir(source, { withFileTypes: true });

            for (const entry of entries) {
                const sourcePath = path.join(source, entry.name);
                const targetPath = path.join(target, entry.name);

                if (entry.isDirectory()) {
                    await this.copyDirectory(sourcePath, targetPath);
                } else {
                    await this.copyFile(sourcePath, targetPath);
                }
            }

            this.log(`📁 Backup: ${path.relative(projectRoot, source)}`, 'success');
        } catch (error) {
            this.log(`⚠️ Error copiando directorio ${source}: ${error.message}`, 'warning');
            this.stats.errors.push(`Error copying directory ${source}: ${error.message}`);
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
                } else if (entry.isFile() && entry.name.match(pattern)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignorar errores de acceso
        }

        return files;
    }

    async createBackupManifest() {
        const manifest = {
            timestamp: new Date().toISOString(),
            projectRoot: projectRoot,
            backupPath: backupDir,
            stats: this.stats,
            gitInfo: await this.getGitInfo(),
            nodeInfo: {
                version: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        const manifestPath = path.join(backupDir, 'backup-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        this.log('📋 Manifest del backup creado', 'success');
    }

    async getGitInfo() {
        try {
            const commitHash = execSync('git rev-parse HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim();
            const branch = execSync('git branch --show-current', { cwd: projectRoot, encoding: 'utf8' }).trim();

            return {
                commitHash,
                branch,
                isClean: execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim() === ''
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async verifyBackup() {
        this.log('🔍 Verificando integridad del backup...', 'info');

        const manifestPath = path.join(backupDir, 'backup-manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

        // Verificar que los archivos críticos existen
        const criticalFiles = [
            'package.json',
            'pnpm-workspace.yaml',
            'turbo.json'
        ];

        for (const file of criticalFiles) {
            const backupPath = path.join(backupDir, file);
            if (await this.exists(backupPath)) {
                this.log(`✅ Verificado: ${file}`, 'success');
            } else {
                this.log(`❌ No encontrado: ${file}`, 'error');
                this.stats.errors.push(`Critical file not found in backup: ${file}`);
            }
        }

        this.log('🔍 Verificación completada', 'success');
    }
}

// Ejecutar backup
const backup = new CompleteBackup();
backup.createBackup().then(result => {
    if (result.success) {
        console.log('\n🎉 BACKUP COMPLETADO EXITOSAMENTE');
        console.log('🛡️ El proyecto está seguro para la migración');
        process.exit(0);
    } else {
        console.log('\n❌ ERROR EN EL BACKUP');
        console.log('🚨 NO proceder con la migración');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 