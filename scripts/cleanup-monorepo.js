#!/usr/bin/env node

/**
 * Script de limpieza y organización del monorepo AltaMedica
 * Elimina archivos duplicados y organiza la estructura
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonorepoCleaner {
  constructor() {
    this.rootDir = process.cwd();
    this.backupDir = path.join(this.rootDir, 'backups', 'cleanup-' + Date.now());
  }

  async run() {
    console.log('🧹 Iniciando limpieza del monorepo AltaMedica...\n');

    try {
      // 1. Crear backup
      await this.createBackup();
      
      // 2. Limpiar archivos de desarrollo en raíz
      await this.cleanRootFiles();
      
      // 3. Consolidar configuraciones
      await this.consolidateConfigs();
      
      // 4. Organizar documentación
      await this.organizeDocs();
      
      // 5. Limpiar node_modules duplicados
      await this.cleanNodeModules();
      
      console.log('✅ Limpieza completada exitosamente!');
      console.log(`📁 Backup guardado en: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error.message);
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('📦 Creando backup...');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Archivos a respaldar
    const filesToBackup = [
      'tailwind.config.js',
      'postcss.config.js',
      'next.config.js',
      'check-file.js',
      'clean-project.js',
      'diagnose-component.js',
      'fix-and-restart.js',
      'pre-check.js'
    ];

    for (const file of filesToBackup) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(this.backupDir, file);
        fs.copyFileSync(filePath, backupPath);
      }
    }
  }

  async cleanRootFiles() {
    console.log('🗑️ Limpiando archivos de desarrollo en raíz...');
    
    const filesToRemove = [
      'check-file.js',
      'clean-project.js', 
      'diagnose-component.js',
      'fix-and-restart.js',
      'pre-check.js',
      'test-rate-limiting.cjs',
      'test-simulator.html'
    ];

    for (const file of filesToRemove) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  - Eliminado: ${file}`);
      }
    }
  }

  async consolidateConfigs() {
    console.log('⚙️ Consolidando configuraciones...');
    
    // Mover configuraciones a carpeta configs/
    const configsDir = path.join(this.rootDir, 'configs');
    if (!fs.existsSync(configsDir)) {
      fs.mkdirSync(configsDir, { recursive: true });
    }

    const configsToMove = [
      { from: 'tailwind.config.js', to: 'configs/tailwind/root.config.js' },
      { from: 'postcss.config.js', to: 'configs/postcss/root.config.js' },
      { from: 'next.config.js', to: 'configs/next/root.config.js' }
    ];

    for (const config of configsToMove) {
      const fromPath = path.join(this.rootDir, config.from);
      const toPath = path.join(this.rootDir, config.to);
      
      if (fs.existsSync(fromPath)) {
        const toDir = path.dirname(toPath);
        if (!fs.existsSync(toDir)) {
          fs.mkdirSync(toDir, { recursive: true });
        }
        fs.copyFileSync(fromPath, toPath);
        console.log(`  - Movido: ${config.from} → ${config.to}`);
      }
    }
  }

  async organizeDocs() {
    console.log('📚 Organizando documentación...');
    
    const docsDir = path.join(this.rootDir, 'DOCUMENTOS');
    const rootDocsDir = path.join(this.rootDir, 'docs');
    
    // Mover archivos .md de la raíz a docs/
    const mdFiles = fs.readdirSync(this.rootDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md');
    
    for (const file of mdFiles) {
      const fromPath = path.join(this.rootDir, file);
      const toPath = path.join(rootDocsDir, file);
      
      if (!fs.existsSync(rootDocsDir)) {
        fs.mkdirSync(rootDocsDir, { recursive: true });
      }
      
      fs.copyFileSync(fromPath, toPath);
      console.log(`  - Movido: ${file} → docs/${file}`);
    }
  }

  async cleanNodeModules() {
    console.log('📦 Limpiando node_modules duplicados...');
    
    // Verificar si web-app tiene node_modules independiente
    const webAppNodeModules = path.join(this.rootDir, 'apps', 'web-app', 'node_modules');
    if (fs.existsSync(webAppNodeModules)) {
      console.log('  ⚠️ web-app tiene node_modules independiente - considerar migrar a workspace');
    }
  }
}

// Ejecutar limpieza
const cleaner = new MonorepoCleaner();
cleaner.run(); 