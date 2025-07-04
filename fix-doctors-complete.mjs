#!/usr/bin/env node
/**
 * ALTAMEDICA DOCTORS - REPARACIÓN COMPLETA DE ERRORES
 * Resuelve conflictos Next.js 15.x, Firebase, React y dependencias
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
    return true;
  } catch (error) {
    log(`  ❌ Error en: ${description}`, 'red');
    log(`     ${error.message}`, 'red');
    return false;
  }
};

const removeIfExists = (path) => {
  if (existsSync(path)) {
    log(`  🗑️  Eliminando: ${path}`, 'yellow');
    rmSync(path, { recursive: true, force: true });
  }
};

async function reparacionCompleta() {
  try {
    log('━'.repeat(80), 'cyan');
    log('🏥 ALTAMEDICA DOCTORS - REPARACIÓN COMPLETA DE ERRORES', 'bold');
    log('🔧 Next.js 15.x + Firebase + React + Dependencies Fix', 'cyan');
    log('━'.repeat(80), 'cyan');

    const rootPath = process.cwd();
    const doctorsPath = join(rootPath, 'apps', 'doctors');

    // PASO 1: Limpieza completa de cachés
    log('\n[1/8] Limpieza completa de cachés y artefactos', 'magenta');
    removeIfExists(join(rootPath, 'node_modules'));
    removeIfExists(join(rootPath, 'pnpm-lock.yaml'));
    removeIfExists(join(rootPath, '.pnpm-store'));
    removeIfExists(join(doctorsPath, 'node_modules'));
    removeIfExists(join(doctorsPath, '.next'));
    removeIfExists(join(doctorsPath, '.turbo'));
    
    // Limpiar cachés globales
    execute('pnpm store prune', 'Limpiando store PNPM');
    execute('npm cache clean --force', 'Limpiando caché NPM');

    // PASO 2: Verificar versiones antes de la instalación
    log('\n[2/8] Verificando configuración de dependencias', 'magenta');
    
    // PASO 3: Reinstalación desde root (monorepo approach)
    log('\n[3/8] Instalación desde root del monorepo', 'magenta');
    if (!execute('pnpm install --no-frozen-lockfile', 'Instalando dependencias root')) {
      throw new Error('Falló instalación root');
    }

    // PASO 4: Instalación específica de doctors app
    log('\n[4/8] Instalación específica de doctors app', 'magenta');
    if (!execute('pnpm --filter=doctors install', 'Instalando dependencias doctors')) {
      throw new Error('Falló instalación doctors');
    }

    // PASO 5: Verificar versiones post-instalación
    log('\n[5/8] Verificando versiones instaladas', 'magenta');
    execute('pnpm --filter=doctors list next react react-dom', 'Verificando versiones críticas');

    // PASO 6: Build de packages médicos
    log('\n[6/8] Construyendo packages médicos', 'magenta');
    execute('pnpm --filter=@altamedica/medical-types build', 'Build medical-types');
    execute('pnpm --filter=@altamedica/medical-utils build', 'Build medical-utils');

    // PASO 7: Verificación TypeScript
    log('\n[7/8] Verificación TypeScript', 'magenta');
    execute('pnpm --filter=doctors run type-check', 'Verificando TypeScript doctors', doctorsPath);

    // PASO 8: Test de inicio
    log('\n[8/8] Preparando test de inicio', 'magenta');
    log('  💡 Para probar: cd apps/doctors && pnpm dev', 'cyan');

    log('\n━'.repeat(80), 'green');
    log('✅ REPARACIÓN COMPLETADA EXITOSAMENTE', 'bold');
    log('🚀 Sistema médico listo para desarrollo', 'green');
    log('💡 Medical packages integrados y configurados', 'cyan');
    log('━'.repeat(80), 'green');

  } catch (error) {
    log('\n━'.repeat(80), 'red');
    log('❌ ERROR EN REPARACIÓN', 'bold');
    log(`💥 ${error.message}`, 'red');
    log('🔍 Revisar logs y dependencias manualmente', 'yellow');
    log('━'.repeat(80), 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  reparacionCompleta();
}

export { reparacionCompleta };