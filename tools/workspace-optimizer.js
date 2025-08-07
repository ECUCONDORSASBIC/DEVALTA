#!/usr/bin/env node

/**
 * 🚀 AltaMedica Workspace Optimizer
 * Herramienta para simplificar y optimizar la arquitectura del monorepo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkspaceOptimizer {
  constructor() {
    this.rootDir = process.cwd();
    this.appsDir = path.join(this.rootDir, 'apps');
    this.packagesDir = path.join(this.rootDir, 'packages');
    this.issues = [];
    this.solutions = [];
  }

  async analyze() {
    console.log('🔍 ANALIZANDO WORKSPACE ALTAMEDICA...\n');
    
    await this.analyzePackageStructure();
    await this.analyzeDependencies();
    await this.analyzeImports();
    await this.analyzeBuildIssues();
    await this.analyzeRedundancy();
    
    this.generateReport();
    this.proposeSolutions();
  }

  async analyzePackageStructure() {
    console.log('📦 Analizando estructura de packages...');
    
    const packages = fs.readdirSync(this.packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`   Encontrados ${packages.length} packages:`);
    packages.forEach(pkg => console.log(`   - ${pkg}`));
    
    // Detectar packages problemáticos
    const problematicPackages = packages.filter(pkg => {
      const packagePath = path.join(this.packagesDir, pkg);
      const packageJson = path.join(packagePath, 'package.json');
      
      if (!fs.existsSync(packageJson)) {
        this.issues.push(`❌ ${pkg}: Sin package.json`);
        return true;
      }
      
      try {
        const pkgData = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        if (!pkgData.main && !pkgData.exports) {
          this.issues.push(`⚠️ ${pkg}: Sin entry point definido`);
          return true;
        }
      } catch (e) {
        this.issues.push(`❌ ${pkg}: package.json inválido`);
        return true;
      }
      
      return false;
    });
    
    console.log(`   Packages problemáticos: ${problematicPackages.length}\n`);
  }

  async analyzeDependencies() {
    console.log('🔗 Analizando dependencias...');
    
    const apps = ['web-app', 'api-server', 'doctors', 'patients', 'companies', 'admin'];
    const dependencyMatrix = {};
    
    for (const app of apps) {
      const packageJsonPath = path.join(this.appsDir, app, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...pkgData.dependencies, ...pkgData.devDependencies };
        
        dependencyMatrix[app] = Object.keys(deps).filter(dep => dep.startsWith('@altamedica/'));
        console.log(`   ${app}: ${dependencyMatrix[app].length} dependencias internas`);
      }
    }
    
    // Detectar dependencias circulares y problemáticas
    const allInternalDeps = Object.values(dependencyMatrix).flat();
    const depCounts = {};
    allInternalDeps.forEach(dep => {
      depCounts[dep] = (depCounts[dep] || 0) + 1;
    });
    
    console.log('\n   📊 Dependencias más usadas:');
    Object.entries(depCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([dep, count]) => {
        console.log(`   - ${dep}: ${count} apps`);
      });
    
    console.log('');
  }

  async analyzeImports() {
    console.log('📥 Analizando imports problemáticos...');
    
    const apps = ['web-app', 'doctors', 'patients', 'companies', 'admin'];
    let totalImportIssues = 0;
    
    for (const app of apps) {
      const appPath = path.join(this.appsDir, app);
      if (fs.existsSync(appPath)) {
        try {
          // Buscar imports problemáticos
          const result = execSync(`find "${appPath}" -name "*.ts" -o -name "*.tsx" | head -20 | xargs grep -l "import.*@altamedica" 2>/dev/null || true`, { encoding: 'utf8' });
          const files = result.trim().split('\n').filter(f => f);
          
          if (files.length > 0) {
            console.log(`   ${app}: ${files.length} archivos con imports internos`);
            totalImportIssues += files.length;
          }
        } catch (e) {
          // Ignorar errores
        }
      }
    }
    
    if (totalImportIssues > 50) {
      this.issues.push(`⚠️ Demasiados imports internos: ${totalImportIssues} archivos`);
    }
    
    console.log(`   Total archivos con imports internos: ${totalImportIssues}\n`);
  }

  async analyzeBuildIssues() {
    console.log('🔨 Analizando problemas de build...');
    
    // Verificar si hay problemas de TypeScript
    try {
      const result = execSync('npm run type-check 2>&1 || true', { encoding: 'utf8', cwd: this.rootDir });
      if (result.includes('error')) {
        const errorCount = (result.match(/error TS/g) || []).length;
        this.issues.push(`❌ ${errorCount} errores de TypeScript en el workspace`);
        console.log(`   Errores TypeScript detectados: ${errorCount}`);
      } else {
        console.log('   ✅ Sin errores de TypeScript');
      }
    } catch (e) {
      this.issues.push('❌ No se pudo ejecutar type-check');
    }
    
    console.log('');
  }

  async analyzeRedundancy() {
    console.log('🔄 Analizando código redundante...');
    
    const packages = fs.readdirSync(this.packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Buscar packages que podrían consolidarse
    const medicalPackages = packages.filter(pkg => pkg.includes('medical'));
    const uiPackages = packages.filter(pkg => pkg.includes('ui') || pkg.includes('component'));
    
    console.log(`   Packages médicos: ${medicalPackages.length}`);
    console.log(`   Packages UI: ${uiPackages.length}`);
    
    if (medicalPackages.length > 4) {
      this.issues.push(`⚠️ Demasiados packages médicos (${medicalPackages.length}), considerar consolidar`);
    }
    
    if (uiPackages.length > 2) {
      this.issues.push(`⚠️ Múltiples packages UI (${uiPackages.length}), consolidar en uno`);
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📋 REPORTE DE PROBLEMAS DETECTADOS:\n');
    
    if (this.issues.length === 0) {
      console.log('✅ ¡No se detectaron problemas críticos!\n');
      return;
    }
    
    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('');
  }

  proposeSolutions() {
    console.log('🚀 SOLUCIONES PROPUESTAS:\n');
    
    // Solución 1: Simplificar packages
    this.solutions.push({
      title: "1. 📦 CONSOLIDAR PACKAGES",
      description: "Reducir la fragmentación del workspace",
      actions: [
        "Fusionar todos los packages médicos en @altamedica/medical",
        "Consolidar UI packages en @altamedica/ui",
        "Mantener solo: core, ui, medical, firebase, types",
        "Eliminar packages con <100 líneas de código"
      ]
    });
    
    // Solución 2: Simplificar dependencias
    this.solutions.push({
      title: "2. 🔗 SIMPLIFICAR DEPENDENCIAS",
      description: "Reducir imports internos complejos",
      actions: [
        "Cada app debe importar máximo 3 packages internos",
        "Consolidar utilities en @altamedica/core",
        "Usar imports directos en lugar de workspace protocol",
        "Eliminar dependencias circulares"
      ]
    });
    
    // Solución 3: Arquitectura self-contained
    this.solutions.push({
      title: "3. 🏗️ APPS SELF-CONTAINED",
      description: "Hacer cada app más independiente",
      actions: [
        "Mover lógica específica de app a src/lib/",
        "Duplicar código común pequeño (<50 líneas)",
        "Usar shared packages solo para grandes utilities",
        "Cada app debe funcionar sin packages complejos"
      ]
    });
    
    // Solución 4: Build simplificado
    this.solutions.push({
      title: "4. ⚡ BUILD OPTIMIZADO",
      description: "Simplificar el proceso de build",
      actions: [
        "Eliminar Turbo cache problemático",
        "Build independiente por app",
        "Scripts npm simples sin dependencies",
        "Eliminar configuraciones complejas de Turbo"
      ]
    });
    
    this.solutions.forEach(solution => {
      console.log(`${solution.title}`);
      console.log(`   ${solution.description}`);
      solution.actions.forEach(action => {
        console.log(`   • ${action}`);
      });
      console.log('');
    });
    
    this.generateCommands();
  }

  generateCommands() {
    console.log('🛠️ COMANDOS PARA IMPLEMENTAR:\n');
    
    console.log('# 1. Backup actual');
    console.log('cp -r packages packages-backup\n');
    
    console.log('# 2. Consolidar packages médicos');
    console.log('mkdir -p packages/medical/src');
    console.log('# Mover contenido de medical-* a packages/medical/\n');
    
    console.log('# 3. Consolidar UI');
    console.log('mkdir -p packages/ui-consolidated/src');
    console.log('# Mover contenido de ui, design-system a packages/ui-consolidated/\n');
    
    console.log('# 4. Limpiar packages innecesarios');
    console.log('# rm -rf packages/medical-* packages/design-system packages/tailwind-config\n');
    
    console.log('# 5. Actualizar package.json de apps para usar nuevos packages');
    console.log('# Ejecutar: node tools/workspace-optimizer.js --fix\n');
    
    console.log('¿Quieres que ejecute estos cambios automáticamente? (y/n)');
  }

  async autoFix() {
    console.log('🔧 APLICANDO FIXES AUTOMÁTICOS...\n');
    
    // 1. Consolidar packages médicos
    await this.consolidateMedicalPackages();
    
    // 2. Simplificar dependencias de apps
    await this.simplifyAppDependencies();
    
    // 3. Generar configuración optimizada
    await this.generateOptimizedConfig();
    
    console.log('✅ WORKSPACE OPTIMIZADO!\n');
    console.log('Ejecuta: npm install && npm run dev:all para probar\n');
  }

  async consolidateMedicalPackages() {
    console.log('📦 Consolidando packages médicos...');
    
    const medicalDir = path.join(this.packagesDir, 'medical');
    if (!fs.existsSync(medicalDir)) {
      fs.mkdirSync(medicalDir, { recursive: true });
      fs.mkdirSync(path.join(medicalDir, 'src'), { recursive: true });
    }
    
    // Crear package.json consolidado
    const packageJson = {
      name: '@altamedica/medical',
      version: '1.0.0',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      exports: {
        '.': './dist/index.js',
        './types': './dist/types/index.js',
        './components': './dist/components/index.js',
        './utils': './dist/utils/index.js'
      },
      scripts: {
        build: 'tsc',
        dev: 'tsc --watch'
      },
      dependencies: {
        react: '^18.0.0',
        typescript: '^5.0.0'
      }
    };
    
    fs.writeFileSync(
      path.join(medicalDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    
    // Crear index.ts consolidado
    const indexContent = `// 🏥 AltaMedica Medical Package Consolidado
export * from './types';
export * from './utils';
export * from './components';

// Re-exports principales
export type { Patient, Doctor, Appointment, MedicalRecord } from './types';
export { validateMedicalData, calculateRisk, formatMedicalDate } from './utils';
`;
    
    fs.writeFileSync(path.join(medicalDir, 'src', 'index.ts'), indexContent);
    
    console.log('   ✅ Package médico consolidado creado');
  }

  async simplifyAppDependencies() {
    console.log('🔗 Simplificando dependencias de apps...');
    
    const apps = ['web-app', 'doctors', 'patients', 'companies', 'admin'];
    
    for (const app of apps) {
      const packageJsonPath = path.join(this.appsDir, app, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Simplificar dependencias internas
        const deps = pkgData.dependencies || {};
        const newDeps = {};
        
        // Mantener solo dependencies esenciales
        Object.keys(deps).forEach(dep => {
          if (dep.startsWith('@altamedica/')) {
            if (['@altamedica/core', '@altamedica/ui', '@altamedica/medical'].includes(dep)) {
              newDeps[dep] = 'workspace:*';
            }
          } else {
            newDeps[dep] = deps[dep];
          }
        });
        
        pkgData.dependencies = newDeps;
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkgData, null, 2));
        console.log(`   ✅ ${app}: dependencias simplificadas`);
      }
    }
  }

  async generateOptimizedConfig() {
    console.log('⚙️ Generando configuración optimizada...');
    
    // Crear nuevo pnpm-workspace.yaml simplificado
    const workspaceConfig = `packages:
  - 'apps/*'
  - 'packages/core'
  - 'packages/ui'
  - 'packages/medical'
  - 'packages/firebase'
  - 'packages/types'
`;
    
    fs.writeFileSync(path.join(this.rootDir, 'pnpm-workspace.yaml'), workspaceConfig);
    
    // Generar script de desarrollo simplificado
    const devScript = `#!/bin/bash
# 🚀 AltaMedica Development Script Optimizado

echo "🏥 Iniciando AltaMedica Stack Simplificado..."

# 1. Build packages esenciales
echo "📦 Building core packages..."
cd packages/core && npm run build &
cd packages/ui && npm run build &
cd packages/medical && npm run build &
wait

# 2. Iniciar apps principales
echo "🚀 Starting applications..."
cd apps/web-app && npm run dev &
cd apps/api-server && npm run dev &
cd apps/doctors && npm run dev &
cd apps/patients && npm run dev &

echo "✅ Stack iniciado! URLs:"
echo "   Web App: http://localhost:3000"
echo "   API: http://localhost:3001"
echo "   Doctors: http://localhost:3002"
echo "   Patients: http://localhost:3003"
`;
    
    fs.writeFileSync(path.join(this.rootDir, 'dev-simplified.sh'), devScript);
    fs.chmodSync(path.join(this.rootDir, 'dev-simplified.sh'), '755');
    
    console.log('   ✅ Configuración optimizada generada');
  }
}

// Ejecutar herramienta
const optimizer = new WorkspaceOptimizer();

if (process.argv.includes('--fix')) {
  optimizer.autoFix();
} else if (process.argv.includes('--analyze')) {
  optimizer.analyze();
} else {
  console.log(`🚀 AltaMedica Workspace Optimizer

Uso:
  node tools/workspace-optimizer.js --analyze  # Analizar problemas
  node tools/workspace-optimizer.js --fix      # Aplicar fixes automáticos

Ejemplo:
  node tools/workspace-optimizer.js --analyze
`);
}