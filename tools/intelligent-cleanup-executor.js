#!/usr/bin/env node
/**
 * 🗑️ EJECUTOR DE LIMPIEZA INTELIGENTE
 * ===================================
 * Elimina automáticamente archivos basura identificados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class IntelligentCleanupExecutor {
  constructor() {
    this.filesToDelete = [
      // Scripts MCP duplicados (mantener solo dev-master.ps1)
      'activate-mcp-demo.ps1',
      'altamedica-dev.ps1',
      'mcp.ps1',
      'mcp-quick.ps1',
      'mcp-status.ps1',
      'mcp-protected.ps1',
      'mcp-base-master.ps1',
      'mcp-clean-config.ps1',
      'github-claude-mcp.ps1',
      'start-claude-mcp.ps1',
      'run-mcp-complete.ps1',
      'restart-mcp-complete.ps1',
      'restart-vscode-mcp.ps1',
      
      // Test obsoletos
      'simple-lab-test.js',
      'simple-lab-test.cjs', 
      'create-appointments-test-data.cjs',
      'create-appointments-test-data.js',
      'create-test-data.js',
      'debug-specific.cjs',
      'quick-post-test.cjs',
      
      // Tools duplicados
      'tools/mcp-manager.js',
      'tools/mcp-master-server.js',
      'tools/mcp-simple.js',
      'tools/mcp-basic.js',
      'tools/mcp-protected-manager.js',
      'tools/mcp-cleanup-manager.js',
      'tools/mcp-altamedica-dev.js',
      'tools/validate-mcp-altamedica-dev.js',
      'tools/validate-mcp-altamedicadev.js',
      'tools/validate-mcp-clean.js',
      'tools/validate-mcp-fix.js',
      'tools/quick-mcp-diagnosis.js',
      'tools/diagnose-mcp-base-servers.js',
      
      // Scripts de repair obsoletos
      'repair-vscode.ps1',
      'reset-altamedica.ps1',
      'diagnose-copilot.ps1',
      'install-mcp-revolutionary.ps1',
      'install-vscode-extensions.ps1',
      'setup-copilot-integration.ps1',
      'validate-mcp-config.ps1',
      
      // Otros archivos vacíos/obsoletos
      'check-paths.ps1',
      'test-mcp.ps1'
    ];

    this.foldersToDelete = [
      'BACKUP_CLEANUP_2025-06-22'
    ];

    // Archivos que DEBEN mantenerse (verificación de seguridad)
    this.protected = [
      'dev-master.ps1',
      'mcp-config.json',
      'package.json',
      'pnpm-workspace.yaml',
      'tools/universal-diagnostic.js',
      'tools/system-protection-analysis.js'
    ];
  }

  async execute() {
    console.log('🗑️ EJECUTOR DE LIMPIEZA INTELIGENTE');
    console.log('===================================\n');

    // Verificar que archivos protegidos existen
    console.log('🛡️ Verificando archivos protegidos...');
    for (const file of this.protected) {
      const fullPath = path.join(projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ ARCHIVO PROTEGIDO FALTANTE: ${file}`);
        console.log('🚨 CANCELANDO LIMPIEZA POR SEGURIDAD');
        return;
      }
    }
    console.log('✅ Todos los archivos protegidos están presentes\n');

    // Crear backup antes de eliminar
    const backupDir = path.join(projectRoot, `CLEANUP_BACKUP_${new Date().toISOString().slice(0,10)}`);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
      console.log(`📦 Backup creado en: ${backupDir}\n`);
    }

    let deletedFiles = 0;
    let spaceFreed = 0;

    // Eliminar archivos individuales
    console.log('🗑️ Eliminando archivos basura...');
    for (const file of this.filesToDelete) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        try {
          // Backup del archivo
          const fileName = path.basename(file);
          const backupPath = path.join(backupDir, fileName);
          fs.copyFileSync(fullPath, backupPath);
          
          // Obtener tamaño antes de eliminar
          const stats = fs.statSync(fullPath);
          spaceFreed += stats.size;
          
          // Eliminar archivo
          fs.unlinkSync(fullPath);
          console.log(`✅ Eliminado: ${file} (${(stats.size/1024).toFixed(1)}KB)`);
          deletedFiles++;
        } catch (error) {
          console.log(`❌ Error eliminando ${file}: ${error.message}`);
        }
      }
    }

    // Eliminar carpetas
    console.log('\n📁 Eliminando carpetas de backup...');
    for (const folder of this.foldersToDelete) {
      const fullPath = path.join(projectRoot, folder);
      if (fs.existsSync(fullPath)) {
        try {
          const folderSize = this.getFolderSize(fullPath);
          this.deleteFolder(fullPath);
          console.log(`✅ Eliminada carpeta: ${folder} (${(folderSize/1024/1024).toFixed(2)}MB)`);
          spaceFreed += folderSize;
        } catch (error) {
          console.log(`❌ Error eliminando carpeta ${folder}: ${error.message}`);
        }
      }
    }

    // Reporte final
    console.log('\n📊 LIMPIEZA COMPLETADA');
    console.log('====================');
    console.log(`🗑️ Archivos eliminados: ${deletedFiles}`);
    console.log(`💾 Espacio liberado: ${(spaceFreed/1024/1024).toFixed(2)}MB`);
    console.log(`📦 Backup guardado en: ${backupDir}`);
    
    console.log('\n✅ ARCHIVOS MANTENIDOS (SISTEMA FUNCIONAL):');
    this.protected.forEach(file => {
      console.log(`   🛡️ ${file}`);
    });

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('================');
    console.log('1. ✅ Verificar que el sistema sigue funcionando');
    console.log('2. 🧪 Ejecutar: node tools/universal-diagnostic.js');
    console.log('3. 🚀 Iniciar servidor: pnpm --filter ./apps/api-server dev');
    console.log('4. 🗑️ Si todo funciona, eliminar backup en unos días');
  }

  getFolderSize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        totalSize += this.getFolderSize(fullPath);
      } else {
        totalSize += stats.size;
      }
    }
    return totalSize;
  }

  deleteFolder(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          this.deleteFolder(fullPath);
        } else {
          fs.unlinkSync(fullPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }
}

// Ejecutar limpieza
const executor = new IntelligentCleanupExecutor();
executor.execute().catch(console.error);
