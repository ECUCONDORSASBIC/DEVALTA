#!/usr/bin/env node

/**
 * Script de desarrollo para el workspace organizado por categorías
 * AltaMédica Platform - Workspace Manager
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const CATEGORIES = {
  DOCTORES: {
    name: '🏥 DOCTORES',
    description: 'Aplicaciones y Servicios para Médicos',
    apps: ['doctors', 'admin', 'companies', 'medical'],
    color: '\x1b[34m' // Azul
  },
  PACIENTES: {
    name: '👥 PACIENTES',
    description: 'Aplicaciones y Servicios para Pacientes',
    apps: ['patients', 'web-app'],
    color: '\x1b[32m' // Verde
  },
  ROOT: {
    name: '🏢 ROOT',
    description: 'Servicios Centrales y Administración',
    apps: ['api-server', 'development', 'anthropic-simulator'],
    color: '\x1b[33m' // Amarillo
  },
  PACKAGES: {
    name: '📦 PACKAGES',
    description: 'Bibliotecas Compartidas',
    apps: ['core', 'ui', 'auth', 'firebase', 'types', 'shared', 'medical', 'eslint-config', 'tailwind-config', 'typescript-config', 'claude-config-manager'],
    color: '\x1b[35m' // Magenta
  },
  ETC: {
    name: '🔧 ETC',
    description: 'Configuraciones, Documentación y Herramientas',
    apps: ['configs', 'docs', 'scripts', 'tools', 'infrastructure', 'platform', 'mcp-protected'],
    color: '\x1b[36m' // Cyan
  }
};

const RESET = '\x1b[0m';

function printHeader() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 AltaMédica Platform - Workspace Manager');
  console.log('='.repeat(80));
}

function printCategories() {
  console.log('\n📋 Categorías disponibles:\n');
  
  Object.entries(CATEGORIES).forEach(([key, category]) => {
    console.log(`${category.color}${category.name}${RESET}`);
    console.log(`   ${category.description}`);
    console.log(`   Apps: ${category.apps.join(', ')}`);
    console.log('');
  });
}

function printCommands() {
  console.log('🔧 Comandos disponibles:\n');
  console.log('  dev:all          - Desarrollar todas las aplicaciones');
  console.log('  dev:doctors      - Desarrollar solo aplicaciones de doctores');
  console.log('  dev:patients     - Desarrollar solo aplicaciones de pacientes');
  console.log('  dev:root         - Desarrollar solo servicios centrales');
  console.log('  dev:packages     - Desarrollar solo packages');
  console.log('  build:all        - Construir todas las aplicaciones');
  console.log('  build:doctors    - Construir aplicaciones de doctores');
  console.log('  build:patients   - Construir aplicaciones de pacientes');
  console.log('  build:root       - Construir servicios centrales');
  console.log('  build:packages   - Construir packages');
  console.log('  test:all         - Ejecutar todos los tests');
  console.log('  lint:all         - Ejecutar linting en todo');
  console.log('  clean:all        - Limpiar todo el workspace');
  console.log('');
}

function executeCommand(command) {
  try {
    console.log(`\n🚀 Ejecutando: ${command}`);
    console.log('─'.repeat(50));
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function showHelp() {
  printHeader();
  printCategories();
  printCommands();
  
  console.log('💡 Ejemplos de uso:');
  console.log('  node scripts/dev-workspace.mjs dev:doctors');
  console.log('  node scripts/dev-workspace.mjs build:patients');
  console.log('  node scripts/dev-workspace.mjs test:all');
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  // Verificar si el comando existe en package.json
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const availableScripts = Object.keys(packageJson.scripts);
    
    if (!availableScripts.includes(command)) {
      console.error(`❌ Comando no encontrado: ${command}`);
      console.log('\nComandos disponibles:');
      availableScripts.forEach(script => console.log(`  ${script}`));
      process.exit(1);
    }
    
    // Ejecutar el comando
    executeCommand(`pnpm ${command}`);
    
  } catch (error) {
    console.error('❌ Error leyendo package.json:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
main(); 