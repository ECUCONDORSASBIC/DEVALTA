#!/usr/bin/env node
/**
 * 🧠 ANALIZADOR INTELIGENTE DE BASURA OBSOLETA
 * ============================================
 * Identifica automáticamente archivos duplicados, obsoletos y basura
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class IntelligentGarbageAnalyzer {
  constructor() {
    // 🚨 SCRIPTS MCP DUPLICADOS (elegir solo 1-2 principales)
    this.mcpDuplicates = [
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
      'restart-vscode-mcp.ps1'
    ];

    // 🗑️ SCRIPTS DE TEST OBSOLETOS (múltiples versiones)
    this.testGarbage = [
      'simple-lab-test.js',
      'simple-lab-test.cjs',
      'create-appointments-test-data.cjs',
      'create-appointments-test-data.js',
      'create-test-data.js',
      'debug-specific.cjs',
      'quick-post-test.cjs'
    ];

    // 🚨 TOOLS/ DUPLICADOS (múltiples MCP servers similares)
    this.toolsDuplicates = [
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
      'tools/diagnose-mcp-base-servers.js'
    ];

    // 🔧 SCRIPTS DE REPAIR/EMERGENCY OBSOLETOS
    this.repairGarbage = [
      'emergency-mcp-repair.ps1',
      'emergency-repair.ps1',
      'mcp-emergency-fix.ps1',
      'repair-vscode.ps1',
      'reset-altamedica.ps1',
      'diagnose-copilot.ps1',
      'install-mcp-revolutionary.ps1',
      'install-vscode-extensions.ps1',
      'setup-copilot-integration.ps1',
      'validate-mcp-config.ps1'
    ];

    // ✅ ARCHIVOS CRÍTICOS - NUNCA TOCAR
    this.protected = [
      'dev-master.ps1',
      'mcp-config.json',
      'package.json',
      'pnpm-workspace.yaml',
      'pnpm-lock.yaml',
      '.env.local',
      'firebase.json',
      'firestore.rules',
      'apps/',
      'packages/',
      'scripts/start-dev.ps1',
      'scripts/deploy.ps1',
      'tools/universal-diagnostic.js',
      'tools/system-protection-analysis.js'
    ];
  }

  async analyze() {
    console.log('🧠 ANÁLISIS INTELIGENTE DE BASURA OBSOLETA');
    console.log('=========================================\n');

    const analysis = {
      mcpDuplicates: [],
      testGarbage: [],
      toolsDuplicates: [],
      repairGarbage: [],
      backupFolder: [],
      safeTotalSize: 0,
      recommendations: []
    };

    // Analizar MCP duplicados
    console.log('🔍 Analizando scripts MCP duplicados...');
    for (const file of this.mcpDuplicates) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = this.getSample(fullPath);
        analysis.mcpDuplicates.push({
          path: file,
          size: stats.size,
          modified: stats.mtime,
          content: content.substring(0, 100),
          reason: 'Script MCP duplicado - funcionalidad redundante'
        });
        analysis.safeTotalSize += stats.size;
      }
    }

    // Analizar test garbage
    console.log('🧪 Analizando archivos de test obsoletos...');
    for (const file of this.testGarbage) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        analysis.testGarbage.push({
          path: file,
          size: stats.size,
          modified: stats.mtime,
          reason: 'Archivo de test obsoleto - múltiples versiones'
        });
        analysis.safeTotalSize += stats.size;
      }
    }

    // Analizar tools duplicados
    console.log('🛠️ Analizando tools/ duplicados...');
    for (const file of this.toolsDuplicates) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        analysis.toolsDuplicates.push({
          path: file,
          size: stats.size,
          modified: stats.mtime,
          reason: 'MCP server duplicado en tools/'
        });
        analysis.safeTotalSize += stats.size;
      }
    }

    // Analizar repair scripts
    console.log('🔧 Analizando scripts de repair obsoletos...');
    for (const file of this.repairGarbage) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        analysis.repairGarbage.push({
          path: file,
          size: stats.size,
          modified: stats.mtime,
          reason: 'Script de repair/emergency obsoleto'
        });
        analysis.safeTotalSize += stats.size;
      }
    }

    // Analizar carpeta BACKUP
    const backupPath = path.join(projectRoot, 'BACKUP_CLEANUP_2025-06-22');
    if (fs.existsSync(backupPath)) {
      const files = this.getAllFiles(backupPath);
      let backupSize = 0;
      files.forEach(file => {
        const stats = fs.statSync(file);
        backupSize += stats.size;
      });
      analysis.backupFolder.push({
        path: 'BACKUP_CLEANUP_2025-06-22/',
        fileCount: files.length,
        totalSize: backupSize,
        reason: 'Carpeta de backup - archivos ya respaldados'
      });
      analysis.safeTotalSize += backupSize;
    }

    this.generateReport(analysis);
    return analysis;
  }

  getAllFiles(dirPath) {
    const files = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  getSample(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content;
    } catch (error) {
      return `Error leyendo: ${error.message}`;
    }
  }

  generateReport(analysis) {
    const totalFiles = analysis.mcpDuplicates.length + 
                      analysis.testGarbage.length + 
                      analysis.toolsDuplicates.length + 
                      analysis.repairGarbage.length +
                      (analysis.backupFolder.length > 0 ? analysis.backupFolder[0].fileCount : 0);

    console.log('📊 REPORTE DE BASURA IDENTIFICADA');
    console.log('===============================');
    console.log(`📁 Total archivos basura: ${totalFiles}`);
    console.log(`💾 Espacio a recuperar: ${(analysis.safeTotalSize / 1024 / 1024).toFixed(2)} MB\n`);

    if (analysis.mcpDuplicates.length > 0) {
      console.log('🔴 SCRIPTS MCP DUPLICADOS (SEGURO ELIMINAR):');
      analysis.mcpDuplicates.forEach(item => {
        console.log(`   ❌ ${item.path} (${(item.size/1024).toFixed(1)}KB) - ${item.reason}`);
      });
      console.log('   💡 Recomendación: Mantener solo dev-master.ps1\n');
    }

    if (analysis.testGarbage.length > 0) {
      console.log('🟡 ARCHIVOS DE TEST OBSOLETOS:');
      analysis.testGarbage.forEach(item => {
        console.log(`   ❌ ${item.path} (${(item.size/1024).toFixed(1)}KB) - ${item.reason}`);
      });
      console.log('   💡 Tests funcionales están en apps/*/src/app/api/*/test.js\n');
    }

    if (analysis.toolsDuplicates.length > 0) {
      console.log('🔧 TOOLS/ DUPLICADOS:');
      analysis.toolsDuplicates.forEach(item => {
        console.log(`   ❌ ${item.path} (${(item.size/1024).toFixed(1)}KB) - ${item.reason}`);
      });
      console.log('   💡 Mantener solo universal-diagnostic.js y system-protection-analysis.js\n');
    }

    if (analysis.repairGarbage.length > 0) {
      console.log('🚨 SCRIPTS DE REPAIR OBSOLETOS:');
      analysis.repairGarbage.forEach(item => {
        console.log(`   ❌ ${item.path} (${(item.size/1024).toFixed(1)}KB) - ${item.reason}`);
      });
      console.log('   💡 Sistema ya está funcional, repairs no necesarios\n');
    }

    if (analysis.backupFolder.length > 0) {
      console.log('📦 CARPETA DE BACKUP:');
      analysis.backupFolder.forEach(item => {
        console.log(`   ❌ ${item.path} (${item.fileCount} archivos, ${(item.totalSize/1024/1024).toFixed(2)}MB)`);
      });
      console.log('   💡 Archivos ya respaldados, se pueden eliminar\n');
    }

    console.log('🎯 PRÓXIMOS PASOS:');
    console.log('================');
    console.log('1. ✅ Ejecutar: node tools/intelligent-cleanup-executor.js');
    console.log('2. 🔍 Revisar lista antes de confirmar');
    console.log('3. 🗑️ Eliminar archivos basura automáticamente');
    console.log('4. 📊 Verificar espacio recuperado');
  }
}

// Ejecutar análisis
const analyzer = new IntelligentGarbageAnalyzer();
analyzer.analyze().catch(console.error);
