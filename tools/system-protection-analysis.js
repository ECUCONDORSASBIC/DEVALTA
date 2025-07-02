#!/usr/bin/env node
/**
 * 🛡️ ANÁLISIS DE PROTECCIÓN DEL SISTEMA ALTAMEDICA
 * ===============================================
 * Identifica componentes CRÍTICOS que NUNCA deben tocarse
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

class SystemProtectionAnalyzer {
  constructor() {
    // 🚨 ARCHIVOS CRÍTICOS - NUNCA TOCAR
    this.criticalFiles = {
      // APIs funcionales
      'apps/api-server/': 'API Server principal (puerto 3001) - FUNCIONAL',
      'apps/companies/': 'Companies API (puerto 3002)',
      'apps/doctors/': 'Doctors API (puerto 3003)',
      
      // Packages internos
      'packages/': 'Librerías internas del monorepo',
      
      // Configuración core
      'package.json': 'Configuración principal del workspace',
      'pnpm-workspace.yaml': 'Configuración del monorepo',
      'pnpm-lock.yaml': 'Lock de dependencias',
      'firebase.json': 'Configuración de Firebase',
      'firestore.rules': 'Reglas de seguridad de Firestore',
      'firestore.indexes.json': 'Índices de Firestore',
      '.env.local': 'Variables de entorno',
      
      // MCPs funcionales
      'mcp-config.json': 'Configuración de MCPs funcionales',
      
      // Scripts operativos
      'dev-master.ps1': 'Script principal de desarrollo',
      'mcp-status.ps1': 'Script de estado MCP',
      
      // Documentación crítica
      'DOCUMENTO-PLATAFORMA-ALTAMEDICA.md': 'Documentación principal',
      'API_IMPLEMENTATION_FINAL_SUCCESS.md': 'Estado de implementación',
      'REPORTE_FINAL_ESTADO_PLATAFORMA.md': 'Reporte de estado actual'
    };

    // 🟡 ARCHIVOS SOSPECHOSOS - REVISAR ANTES DE TOCAR
    this.suspiciousFiles = [
      'simple-lab-test.js',
      'simple-lab-test.cjs',
      'tools/project-cleanup-master.js'
    ];

    // ✅ ARCHIVOS SEGUROS PARA LIMPIAR (si existen)
    this.safeToClean = [
      'node_modules/',
      '.next/',
      'dist/',
      '*.log',
      '*.tmp',
      'debug-*.js',
      'test-*.temp.js'
    ];
  }

  async analyze() {
    console.log('🛡️ ANÁLISIS DE PROTECCIÓN SISTEMA ALTAMEDICA');
    console.log('==========================================\n');

    const analysis = {
      protected: [],
      suspicious: [],
      safeToClean: [],
      recommendations: []
    };

    // Verificar archivos críticos
    for (const [file, description] of Object.entries(this.criticalFiles)) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        analysis.protected.push({
          path: file,
          description,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.isFile() ? stats.size : 'N/A',
          modified: stats.mtime.toISOString()
        });
      }
    }

    // Verificar archivos sospechosos
    for (const file of this.suspiciousFiles) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        analysis.suspicious.push({
          path: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          content: this.getSample(fullPath)
        });
      }
    }

    this.generateReport(analysis);
    return analysis;
  }

  getSample(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.substring(0, 200) + (content.length > 200 ? '...' : '');
    } catch (error) {
      return `Error leyendo archivo: ${error.message}`;
    }
  }

  generateReport(analysis) {
    console.log('🚨 COMPONENTES CRÍTICOS PROTEGIDOS:');
    console.log('================================');
    analysis.protected.forEach(item => {
      console.log(`✅ ${item.path} - ${item.description}`);
    });

    console.log('\n🟡 ARCHIVOS A REVISAR ANTES DE MODIFICAR:');
    console.log('======================================');
    analysis.suspicious.forEach(item => {
      console.log(`⚠️  ${item.path} (${item.size} bytes)`);
      console.log(`   Muestra: ${item.content.substring(0, 100)}...`);
    });

    console.log('\n💡 RECOMENDACIONES:');
    console.log('================');
    console.log('1. ✅ NUNCA tocar archivos críticos sin análisis previo');
    console.log('2. 🔍 SEMPRE hacer backup antes de cualquier cleanup');
    console.log('3. 🧪 PROBAR en entorno aislado primero');
    console.log('4. 📋 DOCUMENTAR todos los cambios realizados');
    console.log('5. 🔄 VERIFICAR funcionalidad después de cualquier cambio');
  }
}

// Ejecutar análisis
const analyzer = new SystemProtectionAnalyzer();
analyzer.analyze().catch(console.error);
