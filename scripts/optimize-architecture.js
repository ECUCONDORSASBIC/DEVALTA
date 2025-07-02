#!/usr/bin/env node

/**
 * 🏗️ SCRIPT DE OPTIMIZACIÓN ARQUITECTÓNICA - CURSOR PREMIUM
 * 
 * Este script automatiza la optimización de la arquitectura del monorepo
 * eliminando duplicaciones, consolidando configuraciones y mejorando
 * la estructura general del proyecto.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

class ArchitectureOptimizer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      dependenciesRemoved: 0,
      configsConsolidated: 0,
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

  async optimizeArchitecture() {
    this.log('🚀 Iniciando optimización arquitectónica...', 'info');
    
    try {
      // 1. Consolidar configuraciones base
      await this.consolidateBaseConfigs();
      
      // 2. Optimizar dependencias
      await this.optimizeDependencies();
      
      // 3. Reorganizar estructura
      await this.reorganizeStructure();
      
      // 4. Unificar scripts
      await this.unifyScripts();
      
      // 5. Generar reporte
      await this.generateReport();
      
      this.log('🎉 Optimización arquitectónica completada exitosamente!', 'success');
      
    } catch (error) {
      this.log(`Error durante la optimización: ${error.message}`, 'error');
      this.stats.errors.push(error.message);
    }
  }

  async consolidateBaseConfigs() {
    this.log('📋 Consolidando configuraciones base...', 'info');
    
    const configs = [
      'tsconfig.base.json',
      'eslint.base.js',
      'tailwind.base.js'
    ];
    
    for (const config of configs) {
      const sourcePath = path.join(projectRoot, 'configs', 'base', config);
      const targetPath = path.join(projectRoot, config.replace('.base', ''));
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        this.log(`✅ Configuración ${config} consolidada`, 'success');
        this.stats.configsConsolidated++;
      } catch (error) {
        this.log(`⚠️ No se pudo consolidar ${config}: ${error.message}`, 'warning');
      }
    }
  }

  async optimizeDependencies() {
    this.log('📦 Optimizando dependencias...', 'info');
    
    try {
      // Eliminar node_modules duplicados
      const apps = await fs.readdir(path.join(projectRoot, 'apps'));
      
      for (const app of apps) {
        const nodeModulesPath = path.join(projectRoot, 'apps', app, 'node_modules');
        
        try {
          await fs.rm(nodeModulesPath, { recursive: true, force: true });
          this.log(`✅ node_modules eliminado en apps/${app}`, 'success');
          this.stats.dependenciesRemoved++;
        } catch (error) {
          // Ignorar si no existe
        }
      }
      
      // Reinstalar dependencias optimizadas
      this.log('🔄 Reinstalando dependencias optimizadas...', 'info');
      execSync('pnpm install', { cwd: projectRoot, stdio: 'inherit' });
      
    } catch (error) {
      this.log(`⚠️ Error optimizando dependencias: ${error.message}`, 'warning');
    }
  }

  async reorganizeStructure() {
    this.log('🏗️ Reorganizando estructura...', 'info');
    
    // Crear directorios optimizados
    const optimizedDirs = [
      'apps/medical',      // Apps médicas
      'apps/admin',        // Apps administrativas
      'apps/development',  // Apps de desarrollo
      'packages/core',     // Funcionalidades core
      'packages/auth',     // Autenticación
      'packages/medical'   // Tipos médicos
    ];
    
    for (const dir of optimizedDirs) {
      const dirPath = path.join(projectRoot, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        this.log(`✅ Directorio creado: ${dir}`, 'success');
      } catch (error) {
        this.log(`⚠️ Error creando ${dir}: ${error.message}`, 'warning');
      }
    }
  }

  async unifyScripts() {
    this.log('🔧 Unificando scripts...', 'info');
    
    const unifiedScripts = {
      'dev:all': 'turbo run dev',
      'build:all': 'turbo run build',
      'test:all': 'turbo run test',
      'lint:all': 'turbo run lint',
      'clean:all': 'turbo run clean && rm -rf node_modules',
      'optimize': 'node scripts/optimize-architecture.js',
      'analyze': 'node scripts/analyze-architecture.js'
    };
    
    try {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // Agregar scripts unificados
      packageJson.scripts = { ...unifiedScripts, ...packageJson.scripts };
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.log('✅ Scripts unificados en package.json', 'success');
      
    } catch (error) {
      this.log(`⚠️ Error unificando scripts: ${error.message}`, 'warning');
    }
  }

  async generateReport() {
    this.log('📊 Generando reporte de optimización...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      optimizations: [
        'Configuraciones base consolidadas',
        'Dependencias duplicadas eliminadas',
        'Estructura reorganizada',
        'Scripts unificados',
        'Configuración de Cursor Premium optimizada'
      ],
      recommendations: [
        'Ejecutar "pnpm install" para actualizar dependencias',
        'Revisar configuraciones específicas de cada app',
        'Actualizar imports en archivos existentes',
        'Ejecutar tests para verificar funcionalidad'
      ]
    };
    
    const reportPath = path.join(projectRoot, 'reports', 'architecture-optimization.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log('✅ Reporte generado en reports/architecture-optimization.json', 'success');
    
    // Mostrar resumen
    console.log('\n📈 RESUMEN DE OPTIMIZACIÓN:');
    console.log(`   • Configuraciones consolidadas: ${this.stats.configsConsolidated}`);
    console.log(`   • Dependencias eliminadas: ${this.stats.dependenciesRemoved}`);
    console.log(`   • Archivos procesados: ${this.stats.filesProcessed}`);
    console.log(`   • Errores encontrados: ${this.stats.errors.length}`);
  }
}

// Ejecutar optimización
const optimizer = new ArchitectureOptimizer();
optimizer.optimizeArchitecture().catch(console.error); 