#!/usr/bin/env node

/**
 * Script de validación para el workspace organizado
 * Verifica que la estructura esté correcta según las categorías definidas
 */

import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const EXPECTED_STRUCTURE = {
  DOCTORES: {
    apps: ['doctors', 'admin', 'companies', 'medical'],
    packages: []
  },
  PACIENTES: {
    apps: ['patients', 'web-app'],
    packages: []
  },
  ROOT: {
    apps: ['api-server', 'development', 'anthropic-simulator'],
    packages: []
  },
  PACKAGES: {
    apps: [],
    packages: ['core', 'ui', 'auth', 'firebase', 'types', 'shared', 'medical', 'eslint-config', 'tailwind-config', 'typescript-config', 'claude-config-manager']
  },
  ETC: {
    dirs: ['configs', 'docs', 'scripts', 'tools', 'infrastructure', 'platform', 'mcp-protected']
  }
};

const CATEGORY_COLORS = {
  DOCTORES: '\x1b[34m',
  PACIENTES: '\x1b[32m',
  ROOT: '\x1b[33m',
  PACKAGES: '\x1b[35m',
  ETC: '\x1b[36m'
};

const RESET = '\x1b[0m';

function printHeader() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 AltaMédica Platform - Workspace Validation');
  console.log('='.repeat(80));
}

function checkDirectory(path) {
  return existsSync(path) ? readdirSync(path) : [];
}

function validateApps() {
  console.log('\n📱 Validando aplicaciones...\n');
  
  const appsDir = checkDirectory('apps');
  const expectedApps = [
    ...EXPECTED_STRUCTURE.DOCTORES.apps,
    ...EXPECTED_STRUCTURE.PACIENTES.apps,
    ...EXPECTED_STRUCTURE.ROOT.apps
  ];
  
  let allValid = true;
  
  // Verificar apps existentes
  appsDir.forEach(app => {
    if (!expectedApps.includes(app)) {
      console.log(`⚠️  App no categorizada: ${app}`);
      allValid = false;
    }
  });
  
  // Verificar apps faltantes
  expectedApps.forEach(app => {
    if (!appsDir.includes(app)) {
      console.log(`❌ App faltante: ${app}`);
      allValid = false;
    } else {
      console.log(`✅ App encontrada: ${app}`);
    }
  });
  
  return allValid;
}

function validatePackages() {
  console.log('\n📦 Validando packages...\n');
  
  const packagesDir = checkDirectory('packages');
  const expectedPackages = EXPECTED_STRUCTURE.PACKAGES.packages;
  
  let allValid = true;
  
  // Verificar packages existentes
  packagesDir.forEach(pkg => {
    if (!expectedPackages.includes(pkg)) {
      console.log(`⚠️  Package no categorizado: ${pkg}`);
      allValid = false;
    }
  });
  
  // Verificar packages faltantes
  expectedPackages.forEach(pkg => {
    if (!packagesDir.includes(pkg)) {
      console.log(`❌ Package faltante: ${pkg}`);
      allValid = false;
    } else {
      console.log(`✅ Package encontrado: ${pkg}`);
    }
  });
  
  return allValid;
}

function validateEtcDirectories() {
  console.log('\n🔧 Validando directorios ETC...\n');
  
  const expectedDirs = EXPECTED_STRUCTURE.ETC.dirs;
  let allValid = true;
  
  expectedDirs.forEach(dir => {
    if (!existsSync(dir)) {
      console.log(`❌ Directorio faltante: ${dir}`);
      allValid = false;
    } else {
      console.log(`✅ Directorio encontrado: ${dir}`);
    }
  });
  
  return allValid;
}

function validateWorkspaceConfig() {
  console.log('\n⚙️  Validando configuración del workspace...\n');
  
  let allValid = true;
  
  // Verificar pnpm-workspace.yaml
  if (!existsSync('pnpm-workspace.yaml')) {
    console.log('❌ pnpm-workspace.yaml no encontrado');
    allValid = false;
  } else {
    console.log('✅ pnpm-workspace.yaml encontrado');
  }
  
  // Verificar turbo.json
  if (!existsSync('turbo.json')) {
    console.log('❌ turbo.json no encontrado');
    allValid = false;
  } else {
    console.log('✅ turbo.json encontrado');
  }
  
  // Verificar package.json
  if (!existsSync('package.json')) {
    console.log('❌ package.json no encontrado');
    allValid = false;
  } else {
    console.log('✅ package.json encontrado');
    
    // Verificar scripts organizados
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = Object.keys(packageJson.scripts);
      
      const expectedScripts = [
        'dev:doctors', 'dev:patients', 'dev:root', 'dev:packages',
        'build:doctors', 'build:patients', 'build:root', 'build:packages'
      ];
      
      expectedScripts.forEach(script => {
        if (!scripts.includes(script)) {
          console.log(`⚠️  Script faltante: ${script}`);
          allValid = false;
        } else {
          console.log(`✅ Script encontrado: ${script}`);
        }
      });
    } catch (error) {
      console.log('❌ Error leyendo package.json');
      allValid = false;
    }
  }
  
  return allValid;
}

function printCategorySummary() {
  console.log('\n📊 Resumen por Categorías:\n');
  
  Object.entries(EXPECTED_STRUCTURE).forEach(([category, structure]) => {
    const color = CATEGORY_COLORS[category] || '';
    console.log(`${color}${category}${RESET}:`);
    
    if (structure.apps && structure.apps.length > 0) {
      console.log(`  Apps: ${structure.apps.join(', ')}`);
    }
    
    if (structure.packages && structure.packages.length > 0) {
      console.log(`  Packages: ${structure.packages.join(', ')}`);
    }
    
    if (structure.dirs && structure.dirs.length > 0) {
      console.log(`  Directorios: ${structure.dirs.join(', ')}`);
    }
    
    console.log('');
  });
}

function main() {
  printHeader();
  
  const results = {
    apps: validateApps(),
    packages: validatePackages(),
    etc: validateEtcDirectories(),
    config: validateWorkspaceConfig()
  };
  
  const allValid = Object.values(results).every(result => result);
  
  console.log('\n' + '='.repeat(80));
  
  if (allValid) {
    console.log('🎉 ¡Workspace validado correctamente!');
    console.log('✅ Todas las categorías están organizadas según la estructura esperada.');
  } else {
    console.log('⚠️  Workspace necesita ajustes:');
    console.log('   - Revisar las validaciones fallidas arriba');
    console.log('   - Asegurar que todos los componentes estén en su categoría correcta');
    console.log('   - Verificar la configuración del workspace');
  }
  
  printCategorySummary();
  
  console.log('💡 Para más información, consulta:');
  console.log('   - WORKSPACE_ORGANIZATION.md');
  console.log('   - README_WORKSPACE.md');
  console.log('   - node scripts/workspace-manager.mjs --help');
  
  process.exit(allValid ? 0 : 1);
}

// Ejecutar validación
main(); 