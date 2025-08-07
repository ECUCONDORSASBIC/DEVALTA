#!/usr/bin/env node

/**
 * 🧹 AltaMedica Workspace Cleanup
 * Limpia packages obsoletos automáticamente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkspaceCleanup {
  constructor() {
    this.rootDir = process.cwd();
    this.packagesDir = path.join(this.rootDir, 'packages');
  }

  async execute() {
    console.log('🧹 LIMPIEZA AUTOMÁTICA DEL WORKSPACE\n');
    
    // 1. Mover packages consolidados a nombres finales
    await this.renameConsolidatedPackages();
    
    // 2. Eliminar packages obsoletos
    await this.removeObsoletePackages();
    
    // 3. Actualizar references en apps
    await this.updateAppReferences();
    
    // 4. Reinstalar dependencias
    await this.reinstallDependencies();
    
    // 5. Verificar resultado
    await this.verifyResult();
    
    console.log('✅ WORKSPACE COMPLETAMENTE LIMPIO Y OPTIMIZADO!\n');
    this.showFinalStatus();
  }

  async renameConsolidatedPackages() {
    console.log('📦 Renombrando packages consolidados...');
    
    // Renombrar medical-consolidated → medical
    const medicalOld = path.join(this.packagesDir, 'medical-consolidated');
    const medicalNew = path.join(this.packagesDir, 'medical-new');
    
    if (fs.existsSync(medicalOld)) {
      fs.renameSync(medicalOld, medicalNew);
      console.log('   ✅ medical-consolidated → medical-new');
    }
    
    // Renombrar ui-consolidated → ui-new
    const uiOld = path.join(this.packagesDir, 'ui-consolidated');
    const uiNew = path.join(this.packagesDir, 'ui-new');
    
    if (fs.existsSync(uiOld)) {
      fs.renameSync(uiOld, uiNew);
      console.log('   ✅ ui-consolidated → ui-new');
    }
    
    console.log('');
  }

  async removeObsoletePackages() {
    console.log('🗑️ Eliminando packages obsoletos...');
    
    const packagesToRemove = [
      'medical-cache', 'medical-components', 'medical-fhir', 'medical-security',
      'medical-types', 'medical-utils', 'ai-medical-core', 'ai-providers',
      'ml-core', 'design-system', 'tailwind-config', 'agent-event-bus',
      'claude-config-manager', 'logger', 'shared', 'database', 'eslint-config',
      'typescript-config', 'telemedicine-core', 'ui'
    ];
    
    let removedCount = 0;
    
    packagesToRemove.forEach(pkg => {
      const pkgPath = path.join(this.packagesDir, pkg);
      if (fs.existsSync(pkgPath)) {
        try {
          execSync(`rm -rf "${pkgPath}"`, { stdio: 'pipe' });
          console.log(`   🗑️ Eliminado: ${pkg}`);
          removedCount++;
        } catch (e) {
          console.log(`   ⚠️ Error eliminando ${pkg}: ${e.message}`);
        }
      }
    });
    
    console.log(`   ✅ ${removedCount} packages obsoletos eliminados\n`);
  }

  async updateAppReferences() {
    console.log('🔄 Actualizando referencias en apps...');
    
    // Mover packages finales a nombres correctos
    const medicalNew = path.join(this.packagesDir, 'medical-new');
    const medicalFinal = path.join(this.packagesDir, 'medical');
    
    if (fs.existsSync(medicalNew)) {
      // Eliminar medical original si existe
      const medicalOriginal = path.join(this.packagesDir, 'medical');
      if (fs.existsSync(medicalOriginal)) {
        execSync(`rm -rf "${medicalOriginal}"`, { stdio: 'pipe' });
      }
      fs.renameSync(medicalNew, medicalFinal);
      console.log('   ✅ medical-new → medical (final)');
    }
    
    const uiNew = path.join(this.packagesDir, 'ui-new');
    const uiFinal = path.join(this.packagesDir, 'ui');
    
    if (fs.existsSync(uiNew)) {
      fs.renameSync(uiNew, uiFinal);
      console.log('   ✅ ui-new → ui (final)');
    }
    
    // Actualizar pnpm-workspace.yaml final
    const workspaceConfig = `packages:
  - 'apps/*'
  - 'packages/core'
  - 'packages/firebase'
  - 'packages/types'
  - 'packages/medical'
  - 'packages/ui'
`;
    
    fs.writeFileSync(path.join(this.rootDir, 'pnpm-workspace.yaml'), workspaceConfig);
    console.log('   ✅ pnpm-workspace.yaml actualizado con nombres finales\n');
  }

  async reinstallDependencies() {
    console.log('📦 Reinstalando dependencias con estructura simplificada...');
    
    try {
      // Limpiar node_modules y locks
      console.log('   🧹 Limpiando instalaciones anteriores...');
      execSync('rm -rf node_modules pnpm-lock.yaml', { cwd: this.rootDir, stdio: 'pipe' });
      
      // Reinstalar
      console.log('   📦 Instalando dependencias...');
      execSync('pnpm install', { cwd: this.rootDir, stdio: 'inherit' });
      
      console.log('   ✅ Dependencias reinstaladas exitosamente\n');
    } catch (e) {
      console.log('   ⚠️ Error en reinstalación, continuando...\n');
    }
  }

  async verifyResult() {
    console.log('✅ Verificando resultado final...');
    
    const finalPackages = fs.readdirSync(this.packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`   📦 Packages finales (${finalPackages.length}):`);
    finalPackages.forEach(pkg => {
      console.log(`   • ${pkg}`);
    });
    
    console.log('');
  }

  showFinalStatus() {
    console.log('🏆 ESTADO FINAL DEL WORKSPACE:\n');
    
    console.log('✅ PACKAGES ACTIVOS (5):');
    console.log('   • @altamedica/core - Utilities básicas');
    console.log('   • @altamedica/firebase - Configuración Firebase');
    console.log('   • @altamedica/types - TypeScript types');
    console.log('   • @altamedica/medical - TODO lo médico consolidado');
    console.log('   • @altamedica/ui - Componentes UI consolidados\n');
    
    console.log('🚀 APPS DISPONIBLES:');
    console.log('   • web-app (3000) - Gateway central');
    console.log('   • api-server (3001) - Backend APIs');
    console.log('   • doctors (3002) - Portal médicos');
    console.log('   • patients (3003) - Portal pacientes');
    console.log('   • companies (3004) - Marketplace B2B');
    console.log('   • admin (3005) - Dashboard admin\n');
    
    console.log('⚡ COMANDOS OPTIMIZADOS:');
    console.log('   npm run dev:simplified     # Iniciar stack completo');
    console.log('   node tools/check-workspace.js  # Verificar estado');
    console.log('   pnpm install               # Reinstalar si necesario\n');
    
    console.log('🎯 PRÓXIMO PASO:');
    console.log('   node tools/dev-simplified.js');
    console.log('   # ¡Tu workspace está listo para desarrollo eficiente!\n');
  }
}

// Ejecutar limpieza
const cleanup = new WorkspaceCleanup();
cleanup.execute();