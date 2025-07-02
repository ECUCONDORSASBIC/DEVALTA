#!/usr/bin/env node
/**
 * 🗑️ ALTAMEDICA INTELLIGENT GARBAGE DETECTOR
 * ========================================
 * Identifica y categoriza archivos basura (testing, repair, temporary)
 * Límite PROACTIVO: 250 líneas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class IntelligentGarbageDetector {
  constructor() {
    // 🗑️ PATRONES DE ARCHIVOS BASURA
    this.garbagePatterns = {
      // Scripts temporales de creación
      temporaryCreators: [
        /^create-.*\.(js|mjs|cjs|ts)$/,
        /^setup-.*\.(js|mjs|cjs|ts)$/,
        /^generate-.*\.(js|mjs|cjs|ts)$/
      ],
      
      // Scripts de reparación/fix
      repairScripts: [
        /^repair-.*\.(js|mjs|cjs|ts|ps1)$/,
        /^fix-.*\.(js|mjs|cjs|ts|ps1)$/,
        /^emergency-.*\.(js|mjs|cjs|ts|ps1)$/,
        /.*-repair\.(js|mjs|cjs|ts|ps1)$/,
        /.*-fix\.(js|mjs|cjs|ts|ps1)$/,
        /.*-fixer\.(js|mjs|cjs|ts|ps1)$/
      ],
      
      // Scripts de testing temporal
      testingJunk: [
        /^test-.*\.(js|mjs|cjs|ts)$/,
        /^debug-.*\.(js|mjs|cjs|ts)$/,
        /^simple-.*-test\.(js|mjs|cjs)$/,
        /.*-test-.*\.(js|mjs|cjs)$/,
        /^quick-test\.(js|mjs|cjs)$/
      ],
      
      // Scripts de verificación
      verificationScripts: [
        /^verify-.*\.(js|mjs|cjs|ts)$/,
        /^validate-.*\.(js|mjs|cjs|ts)$/,
        /^check-.*\.(js|mjs|cjs|ts)$/,
        /.*-verification\.(js|mjs|cjs|ts)$/,
        /.*-diagnostic\.(js|mjs|cjs|ts)$/
      ],
      
      // Archivos de diagnóstico
      diagnosticFiles: [
        /^diagnose-.*\.(js|mjs|cjs|ts|ps1)$/,
        /.*-diagnosis\.(js|mjs|cjs|ts)$/,
        /.*-health-check\.(js|mjs|cjs|ts)$/,
        /^platform-.*\.(js|mjs|cjs|ts)$/
      ],
      
      // Backups y reportes temporales
      temporaryReports: [
        /.*-backup-\d{8}-\d{6}\.(json|md)$/,
        /.*-report\.(json|md)$/,
        /.*-verification-report\.(json|md)$/,
        /BACKEND_VERIFICATION_REPORT\.json$/,
        /lab-results-test-report\.json$/
      ],
      
      // Scripts PowerShell duplicados
      duplicatedPowerShell: [
        /^mcp-.*\.ps1$/,
        /^activate-.*\.ps1$/,
        /^install-.*\.ps1$/,
        /^restart-.*\.ps1$/,
        /^reset-.*\.ps1$/,
        /.*-emergency.*\.ps1$/
      ]
    };

    // 🛡️ ARCHIVOS CRÍTICOS - NUNCA TOCAR
    this.protectedPatterns = [
      /^package\.json$/,
      /^pnpm-.*\.yaml$/,
      /^firebase\.json$/,
      /^firestore\.rules$/,
      /^firestore\.indexes\.json$/,
      /^\.env\.local$/,
      /^mcp-config\.json$/,
      /^dev-master\.ps1$/,
      /^README\.md$/,
      /^turbo\.json$/,
      /^tsconfig\.json$/,
      /^eslint\.config\.mjs$/
    ];

    // 📁 DIRECTORIOS PROTEGIDOS
    this.protectedDirs = [
      'apps/',
      'packages/',
      'node_modules/',
      'docs/DOCUMENTOS',
      '.git/'
    ];

    this.garbageFound = {
      temporaryCreators: [],
      repairScripts: [],
      testingJunk: [],
      verificationScripts: [],
      diagnosticFiles: [],
      temporaryReports: [],
      duplicatedPowerShell: []
    };
  }

  async scanProject() {
    console.log('🗑️ ESCANEANDO PROYECTO PARA DETECTAR ARCHIVOS BASURA');
    console.log('==================================================\n');

    await this.scanDirectory(projectRoot, '');
    return this.generateReport();
  }

  async scanDirectory(dirPath, relativePath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);
      
      // Saltar directorios protegidos
      if (this.isProtectedDirectory(relativeItemPath)) {
        continue;
      }

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        await this.scanDirectory(fullPath, relativeItemPath);
      } else {
        this.analyzeFile(item, fullPath, relativeItemPath);
      }
    }
  }

  isProtectedDirectory(relativePath) {
    return this.protectedDirs.some(dir => 
      relativePath.startsWith(dir) || 
      relativePath.includes('node_modules') ||
      relativePath.includes('.git')
    );
  }

  analyzeFile(filename, fullPath, relativePath) {
    // Verificar si es archivo protegido
    if (this.protectedPatterns.some(pattern => pattern.test(filename))) {
      return;
    }

    // Categorizar archivos basura
    for (const [category, patterns] of Object.entries(this.garbagePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(filename)) {
          this.garbageFound[category].push({
            filename,
            fullPath,
            relativePath,
            size: fs.statSync(fullPath).size,
            modified: fs.statSync(fullPath).mtime.toISOString()
          });
          return; // Solo una categoría por archivo
        }
      }
    }
  }

  generateReport() {
    console.log('📊 REPORTE DE ARCHIVOS BASURA DETECTADOS');
    console.log('======================================\n');

    let totalFiles = 0;
    let totalSize = 0;

    for (const [category, files] of Object.entries(this.garbageFound)) {
      if (files.length > 0) {
        console.log(`🗑️ ${this.getCategoryTitle(category)} (${files.length} archivos):`);
        console.log('─'.repeat(50));
        
        files.forEach(file => {
          console.log(`   ${file.relativePath} (${Math.round(file.size/1024)}KB)`);
          totalSize += file.size;
          totalFiles++;
        });
        console.log('');
      }
    }

    console.log(`📈 RESUMEN TOTAL:`);
    console.log(`   Archivos basura: ${totalFiles}`);
    console.log(`   Espacio a liberar: ${Math.round(totalSize/1024/1024)}MB`);
    
    return this.garbageFound;
  }

  getCategoryTitle(category) {
    const titles = {
      temporaryCreators: 'SCRIPTS TEMPORALES DE CREACIÓN',
      repairScripts: 'SCRIPTS DE REPARACIÓN/FIX',
      testingJunk: 'SCRIPTS DE TESTING TEMPORAL',
      verificationScripts: 'SCRIPTS DE VERIFICACIÓN',
      diagnosticFiles: 'ARCHIVOS DE DIAGNÓSTICO',
      temporaryReports: 'REPORTES Y BACKUPS TEMPORALES',
      duplicatedPowerShell: 'SCRIPTS POWERSHELL DUPLICADOS'
    };
    return titles[category] || category.toUpperCase();
  }

  async cleanupGarbage(confirmed = false) {
    if (!confirmed) {
      console.log('\n⚠️  Para ejecutar la limpieza, ejecuta:');
      console.log('node tools/intelligent-garbage-detector.js --cleanup');
      return;
    }

    console.log('\n🧹 INICIANDO LIMPIEZA DE ARCHIVOS BASURA...');
    
    let deletedFiles = 0;
    
    for (const [category, files] of Object.entries(this.garbageFound)) {
      if (files.length > 0) {
        console.log(`\n🗑️ Eliminando ${this.getCategoryTitle(category)}...`);
        
        for (const file of files) {
          try {
            fs.unlinkSync(file.fullPath);
            console.log(`   ✅ ${file.relativePath}`);
            deletedFiles++;
          } catch (error) {
            console.log(`   ❌ Error al eliminar ${file.relativePath}: ${error.message}`);
          }
        }
      }
    }

    console.log(`\n✅ LIMPIEZA COMPLETADA: ${deletedFiles} archivos eliminados`);
  }
}

// Ejecutar análisis
const detector = new IntelligentGarbageDetector();
const shouldCleanup = process.argv.includes('--cleanup');

detector.scanProject().then(() => {
  detector.cleanupGarbage(shouldCleanup);
}).catch(console.error);
