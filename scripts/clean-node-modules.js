#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script para limpiar comp  if (targets.buildDirs.length > 0) {
    console.log('\n📁 Directorios build:');
    targets.buildDirs.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }
  
  if (targets.coverageDirs.length > 0) {
    console.log('\n📁 Directorios coverage:');
    targets.coverageDirs.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }
  
  if (targets.tempDirs.length > 0) {
    console.log('\n📁 Directorios temporales:');
    targets.tempDirs.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }

  if (targets.lockFiles.length > 0) {
    console.log('\n📄 Archivos lock:');
    targets.lockFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, file)}`);
    });
  }
  
  if (targets.cacheFiles.length > 0) {
    console.log('\n📄 Archivos de caché:');
    targets.cacheFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, file)}`);
    });
  }
  
  if (targets.logFiles.length > 0) {
    console.log('\n📄 Archivos de log:');
    targets.logFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, file)}`);
    });
  }
  
  if (targets.envFiles.length > 0) {
    console.log('\n📄 Archivos .env locales:');
    targets.envFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, file)}`);
    });
  }nte el monorepo
 * Elimina: node_modules, .next, dist, pnpm-lock.yaml, archivos de caché, logs, builds
 * Ejecutar desde la raíz del proyecto con: pnpm clean:node-modules
 */

function findCleanupTargets(dir, targets = { 
  nodeModules: [], 
  nextDirs: [], 
  distDirs: [], 
  lockFiles: [],
  cacheFiles: [],
  logFiles: [],
  buildDirs: [],
  tempDirs: [],
  coverageDirs: [],
  envFiles: []
}) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Buscar directorios específicos
        if (item.name === 'node_modules') {
          targets.nodeModules.push(fullPath);
        } else if (item.name === '.next') {
          targets.nextDirs.push(fullPath);
        } else if (item.name === 'dist') {
          targets.distDirs.push(fullPath);
        } else if (item.name === 'build') {
          targets.buildDirs.push(fullPath);
        } else if (item.name === 'coverage') {
          targets.coverageDirs.push(fullPath);
        } else if (item.name === '.nyc_output') {
          targets.tempDirs.push(fullPath);
        } else if (item.name === '.cache') {
          targets.tempDirs.push(fullPath);
        } else if (item.name === 'tmp' || item.name === 'temp') {
          targets.tempDirs.push(fullPath);
        } else if (item.name === '.turbo') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name === '.eslintcache') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name !== '.git' && !item.name.startsWith('.')) {
          // Recursivamente buscar en subdirectorios (excepto .git y otros directorios ocultos)
          findCleanupTargets(fullPath, targets);
        }
      } else if (item.isFile()) {
        // Buscar archivos específicos
        if (item.name === 'pnpm-lock.yaml') {
          targets.lockFiles.push(fullPath);
        } else if (item.name === 'yarn.lock') {
          targets.lockFiles.push(fullPath);
        } else if (item.name === 'package-lock.json') {
          targets.lockFiles.push(fullPath);
        } else if (item.name.endsWith('.log')) {
          targets.logFiles.push(fullPath);
        } else if (item.name === '.env.local' || item.name === '.env.development.local' || item.name === '.env.production.local') {
          targets.envFiles.push(fullPath);
        } else if (item.name === 'tsconfig.tsbuildinfo') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name === '.DS_Store') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name === 'Thumbs.db') {
          targets.cacheFiles.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ No se pudo acceder al directorio: ${dir}`);
  }
  
  return targets;
}

function getDirectorySize(dirPath) {
  try {
    let size = 0;
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        size += getDirectorySize(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        size += stats.size;
      }
    }
    return size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (process.platform === 'win32') {
        // En Windows, usar rmdir con /s /q para borrar recursivamente
        execSync(`rmdir /s /q "${filePath}"`, { stdio: 'pipe' });
      } else {
        // En Unix/Linux/macOS, usar rm -rf
        execSync(`rm -rf "${filePath}"`, { stdio: 'pipe' });
      }
    } else {
      // Es un archivo
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    all: args.includes('--all') || args.includes('-a'),
    deps: args.includes('--deps') || args.includes('-d'),
    cache: args.includes('--cache') || args.includes('-c'),
    logs: args.includes('--logs') || args.includes('-l'),
    builds: args.includes('--builds') || args.includes('-b'),
    env: args.includes('--env') || args.includes('-e'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    console.log(`
🧹 Script de Limpieza del Monorepo AltaMedica

Uso:
  node scripts/clean-node-modules.js [opciones]

Opciones:
  --all, -a      Limpieza completa (por defecto)
  --deps, -d     Solo dependencias (node_modules, lock files)
  --cache, -c    Solo archivos de caché (.next, .turbo, etc.)
  --logs, -l     Solo archivos de log
  --builds, -b   Solo directorios de build (dist, build)
  --env, -e      Solo archivos .env locales
  --help, -h     Mostrar esta ayuda

Ejemplos:
  pnpm clean:node-modules           # Limpieza completa
  pnpm clean:node-modules --deps    # Solo node_modules y lock files
  pnpm clean:node-modules --cache   # Solo archivos de caché
`);
    return;
  }

  console.log('🧹 Iniciando limpieza del monorepo...\n');
  
  const rootDir = process.cwd();
  console.log(`📁 Directorio raíz: ${rootDir}\n`);
  
  // Buscar todos los elementos a limpiar
  console.log('🔍 Buscando elementos para limpiar...');
  const targets = findCleanupTargets(rootDir);
  
  // Filtrar según opciones
  if (!options.all) {
    if (!options.deps) {
      targets.nodeModules = [];
      targets.lockFiles = [];
    }
    if (!options.cache) {
      targets.nextDirs = [];
      targets.cacheFiles = [];
      targets.tempDirs = [];
    }
    if (!options.logs) {
      targets.logFiles = [];
    }
    if (!options.builds) {
      targets.distDirs = [];
      targets.buildDirs = [];
      targets.coverageDirs = [];
    }
    if (!options.env) {
      targets.envFiles = [];
    }
  }
  
  const totalItems = targets.nodeModules.length + targets.nextDirs.length + 
                    targets.distDirs.length + targets.lockFiles.length +
                    targets.cacheFiles.length + targets.logFiles.length +
                    targets.buildDirs.length + targets.tempDirs.length +
                    targets.coverageDirs.length + targets.envFiles.length;
  
  if (totalItems === 0) {
    console.log('✅ No se encontraron elementos para eliminar.');
    return;
  }
  
  console.log(`\n📦 Elementos encontrados:`);
  console.log(`   📁 node_modules: ${targets.nodeModules.length}`);
  console.log(`   📁 .next: ${targets.nextDirs.length}`);
  console.log(`   📁 dist: ${targets.distDirs.length}`);
  console.log(`   � build: ${targets.buildDirs.length}`);
  console.log(`   📁 coverage: ${targets.coverageDirs.length}`);
  console.log(`   📁 temp/cache: ${targets.tempDirs.length}`);
  console.log(`   📄 lock files: ${targets.lockFiles.length}`);
  console.log(`   📄 cache files: ${targets.cacheFiles.length}`);
  console.log(`   📄 log files: ${targets.logFiles.length}`);
  console.log(`   📄 env local files: ${targets.envFiles.length}`);
  console.log(`   🎯 Total: ${totalItems} elementos\n`);
  
  // Mostrar elementos específicos
  if (targets.nodeModules.length > 0) {
    console.log('📁 Directorios node_modules:');
    targets.nodeModules.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }
  
  if (targets.nextDirs.length > 0) {
    console.log('\n📁 Directorios .next:');
    targets.nextDirs.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }
  
  if (targets.distDirs.length > 0) {
    console.log('\n📁 Directorios dist:');
    targets.distDirs.forEach((dir, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, dir)}`);
    });
  }
  
  if (targets.lockFiles.length > 0) {
    console.log('\n� Archivos pnpm-lock.yaml:');
    targets.lockFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(rootDir, file)}`);
    });
  }
  
  console.log('\n🗑️ Eliminando elementos...');
  let successCount = 0;
  let failCount = 0;
  
  // Función auxiliar para eliminar array de elementos
  function deleteElements(elements, type) {
    for (const element of elements) {
      const relativePath = path.relative(rootDir, element);
      process.stdout.write(`   Eliminando ${type}: ${relativePath}... `);
      
      if (deleteFileOrDirectory(element)) {
        console.log('✅');
        successCount++;
      } else {
        console.log('❌');
        failCount++;
      }
    }
  }
  
  // Eliminar todos los elementos
  deleteElements(targets.nodeModules, 'node_modules');
  deleteElements(targets.nextDirs, '.next');
  deleteElements(targets.distDirs, 'dist');
  deleteElements(targets.buildDirs, 'build');
  deleteElements(targets.coverageDirs, 'coverage');
  deleteElements(targets.tempDirs, 'temp/cache');
  deleteElements(targets.lockFiles, 'lock files');
  deleteElements(targets.cacheFiles, 'cache files');
  deleteElements(targets.logFiles, 'log files');
  deleteElements(targets.envFiles, 'env local files');
  
  console.log('\n📊 Resumen:');
  console.log(`   ✅ Eliminados exitosamente: ${successCount}`);
  if (failCount > 0) {
    console.log(`   ❌ Fallos: ${failCount}`);
  }
  
  if (successCount > 0) {
    console.log('\n🎉 Limpieza completada! Ahora puedes ejecutar:');
    console.log('   pnpm install          - Para reinstalar todas las dependencias');
    console.log('   pnpm clean:all         - Para limpiar y reinstalar automáticamente');
    console.log('   pnpm fresh-install     - Para reinstalar con lockfile congelado');
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { findCleanupTargets, deleteFileOrDirectory };
