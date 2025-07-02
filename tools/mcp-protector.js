#!/usr/bin/env node
// 🛡️ PROTECTOR MCP - Sistema de protección contra alteraciones

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🛡️ PROTECTOR MCP - SISTEMA DE PROTECCIÓN ACTIVADO');
console.log('================================================');

class MCPProtector {
  constructor() {
    this.protectedFiles = [
      'ai-flow-orchestrator-mcp.js',
      'codebase-intelligence-mcp.js', 
      'context-memory-mcp.js',
      'multi-agent-composer-mcp.js',
      'smart-completion-mcp.js',
      'project-scaffolding-mcp.js',
      'medical-mcp-server.js',
      'patient-simulator-mcp.js'
    ];
    this.checksumFile = path.join(projectRoot, 'tools', '.mcp-checksums.json');
  }

  async protect() {
    console.log('🔒 Creando sistema de protección...');
    
    // Crear checksums de protección
    await this.createChecksums();
    
    // Crear archivos de solo lectura
    await this.setReadOnly();
    
    // Crear backup de emergencia
    await this.createEmergencyBackup();
    
    console.log('✅ SISTEMA DE PROTECCIÓN ACTIVADO');
    console.log('🚫 Los archivos MCP están protegidos contra alteraciones');
  }

  async createChecksums() {
    console.log('🔐 Generando checksums de protección...');
    
    const checksums = {};
    
    for (const file of this.protectedFiles) {
      const filePath = path.join(projectRoot, 'tools', file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const stats = fs.statSync(filePath);
        
        checksums[file] = {
          hash,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          protected: true
        };
        
        console.log(`   ✅ ${file} - Protegido`);
      } else {
        console.log(`   ⚠️ ${file} - No encontrado`);
      }
    }
    
    fs.writeFileSync(this.checksumFile, JSON.stringify(checksums, null, 2));
    console.log(`   💾 Checksums guardados en: .mcp-checksums.json`);
  }

  async setReadOnly() {
    console.log('🔒 Configurando archivos como solo lectura...');
    
    for (const file of this.protectedFiles) {
      const filePath = path.join(projectRoot, 'tools', file);
      
      if (fs.existsSync(filePath)) {
        try {
          // En Windows, marcar como solo lectura
          const stats = fs.statSync(filePath);
          fs.chmodSync(filePath, stats.mode & ~0o200); // Remover permiso de escritura
          console.log(`   🔒 ${file} - Solo lectura activado`);
        } catch (e) {
          console.log(`   ⚠️ ${file} - No se pudo marcar como solo lectura`);
        }
      }
    }
  }

  async createEmergencyBackup() {
    console.log('🆘 Creando backup de emergencia...');
    
    const backupDir = path.join(projectRoot, 'tools', '.emergency-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    for (const file of this.protectedFiles) {
      const sourcePath = path.join(projectRoot, 'tools', file);
      if (fs.existsSync(sourcePath)) {
        const backupPath = path.join(backupDir, `${timestamp}-${file}`);
        fs.copyFileSync(sourcePath, backupPath);
      }
    }
    
    console.log(`   💾 Backup de emergencia en: tools/.emergency-backup/`);
  }

  async verify() {
    console.log('🔍 VERIFICANDO INTEGRIDAD DE ARCHIVOS MCP...');
    
    if (!fs.existsSync(this.checksumFile)) {
      console.log('❌ No se encontraron checksums de protección');
      return false;
    }
    
    const savedChecksums = JSON.parse(fs.readFileSync(this.checksumFile, 'utf8'));
    let allValid = true;
    
    for (const [file, savedData] of Object.entries(savedChecksums)) {
      const filePath = path.join(projectRoot, 'tools', file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ ${file} - ARCHIVO FALTANTE`);
        allValid = false;
        continue;
      }
      
      const content = fs.readFileSync(filePath);
      const currentHash = crypto.createHash('sha256').update(content).digest('hex');
      
      if (currentHash === savedData.hash) {
        console.log(`   ✅ ${file} - Integridad verificada`);
      } else {
        console.log(`   🚨 ${file} - ARCHIVO ALTERADO`);
        allValid = false;
      }
    }
    
    return allValid;
  }

  async restore() {
    console.log('🔄 RESTAURANDO ARCHIVOS DESDE BACKUP...');
    
    const backupDir = path.join(projectRoot, 'tools', '.emergency-backup');
    
    if (!fs.existsSync(backupDir)) {
      console.log('❌ No se encontró directorio de backup');
      return false;
    }
    
    const backupFiles = fs.readdirSync(backupDir);
    const latestBackups = {};
    
    // Encontrar los backups más recientes
    for (const backupFile of backupFiles) {
      const match = backupFile.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      if (match) {
        const [, date, originalFile] = match;
        if (!latestBackups[originalFile] || date > latestBackups[originalFile].date) {
          latestBackups[originalFile] = { date, backupFile };
        }
      }
    }
    
    // Restaurar archivos
    for (const [originalFile, backup] of Object.entries(latestBackups)) {
      const backupPath = path.join(backupDir, backup.backupFile);
      const originalPath = path.join(projectRoot, 'tools', originalFile);
      
      try {
        fs.copyFileSync(backupPath, originalPath);
        console.log(`   ✅ ${originalFile} - Restaurado desde backup`);
      } catch (e) {
        console.log(`   ❌ ${originalFile} - Error al restaurar: ${e.message}`);
      }
    }
    
    return true;
  }
}

// Función principal
async function main() {
  const protector = new MCPProtector();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'protect':
      await protector.protect();
      break;
      
    case 'verify':
      const isValid = await protector.verify();
      console.log(isValid ? '✅ Todos los archivos están íntegros' : '🚨 Algunos archivos han sido alterados');
      process.exit(isValid ? 0 : 1);
      break;
      
    case 'restore':
      await protector.restore();
      break;
      
    default:
      console.log('📚 USO DEL PROTECTOR MCP:');
      console.log('  node mcp-protector.js protect  - Activar protección');
      console.log('  node mcp-protector.js verify   - Verificar integridad');
      console.log('  node mcp-protector.js restore  - Restaurar desde backup');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
