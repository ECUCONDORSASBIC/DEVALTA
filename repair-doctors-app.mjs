#!/usr/bin/env node
/**
 * Script de Reparación ALTAMEDICA DOCTORS - Next.js 15.1.7
 * Limpieza y reinstalación específica para aplicación médicos
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const execute = (command, description, cwd = process.cwd()) => {
  try {
    log(`  ▶ ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit', cwd });
    log(`  ✅ ${description} completado`, 'green');
  } catch (error) {
    log(`  ❌ Error en: ${description}`, 'red');
    log(`     ${error.message}`, 'red');
    throw error;
  }
};

const removeIfExists = (path) => {
  if (existsSync(path)) {
    log(`  🗑️  Eliminando: ${path}`, 'yellow');
    rmSync(path, { recursive: true, force: true });
  }
};

async function repairDoctorsApp() {
  try {
    log('━'.repeat(70), 'cyan');
    log('🏥 ALTAMEDICA DOCTORS - Reparación Next.js RSC', 'bold');
    log('🔧 Actualización Next.js 15.3.4 → 15.1.7', 'cyan');
    log('━'.repeat(70), 'cyan');
    
    const doctorsPath = './apps/doctors';
    
    log('\n[1/4] Limpieza de caché y artefactos', 'magenta');
    removeIfExists(join(doctorsPath, 'node_modules'));
    removeIfExists(join(doctorsPath, '.next'));
    removeIfExists(join(doctorsPath, '.turbo'));
    removeIfExists('node_modules/.cache');
    
    log('\n[2/4] Reinstalación de dependencias', 'magenta');
    execute('pnpm install --frozen-lockfile=false', 'Instalando dependencias actualizadas');
    
    log('\n[3/4] Verificación de instalación', 'magenta');
    execute('pnpm --filter=doctors install', 'Verificando app doctors específicamente');
    
    log('\n[4/4] Test de construcción', 'magenta');
    execute('pnpm --filter=doctors run type-check', 'Verificando TypeScript', doctorsPath);
    
    log('\n━'.repeat(70), 'green');
    log('✅ REPARACIÓN COMPLETADA EXITOSAMENTE', 'bold');
    log('🚀 App doctors lista con Next.js 15.1.7', 'green');
    log('💡 Ejecutar: cd apps/doctors && pnpm dev', 'cyan');
    log('━'.repeat(70), 'green');
    
  } catch (error) {
    log('\n━'.repeat(70), 'red');
    log('❌ ERROR EN REPARACIÓN', 'bold');
    log(`💥 ${error.message}`, 'red');
    log('🔍 Revisar configuración y dependencias', 'yellow');
    log('━'.repeat(70), 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  repairDoctorsApp();
}
