#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🧹 Script de Limpieza Avanzada del Monorepo AltaMedica
 * 
 * Características:
 * - Limpieza selectiva por categorías
 * - Estimación de espacio en disco
 * - Modo dry-run (--dry-run)
 * - Estadísticas detalladas
 * - Múltiples opciones de filtrado
 * 
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
  testDirs: []
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
        } else if (item.name === '.pytest_cache' || item.name === '__pycache__') {
          targets.testDirs.push(fullPath);
        } else if (item.name === 'out') {
          targets.buildDirs.push(fullPath);
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
        } else if (item.name === 'tsconfig.tsbuildinfo') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name === '.DS_Store') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name === 'Thumbs.db') {
          targets.cacheFiles.push(fullPath);
        } else if (item.name.endsWith('.tgz') || item.name.endsWith('.tar.gz')) {
          targets.tempDirs.push(fullPath);
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

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
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

function calculateTotalSize(targets) {
  let totalSize = 0;
  
  // Calcular tamaño de directorios
  [...targets.nodeModules, ...targets.nextDirs, ...targets.distDirs, 
   ...targets.buildDirs, ...targets.coverageDirs, ...targets.tempDirs, 
   ...targets.testDirs].forEach(dir => {
    totalSize += getDirectorySize(dir);
  });
  
  // Calcular tamaño de archivos
  [...targets.lockFiles, ...targets.cacheFiles, ...targets.logFiles].forEach(file => {
    totalSize += getFileSize(file);
  });
  
  return totalSize;
}

function deleteFileOrDirectory(filePath, dryRun = false) {
  if (dryRun) {
    return true; // Simular éxito en dry run
  }
  
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${filePath}"`, { stdio: 'pipe' });
      } else {
        execSync(`rm -rf "${filePath}"`, { stdio: 'pipe' });
      }
    } else {
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
    all: args.includes('--all') || args.includes('-a') || args.length === 0,
    deps: args.includes('--deps') || args.includes('-d'),
    cache: args.includes('--cache') || args.includes('-c'),
    logs: args.includes('--logs') || args.includes('-l'),
    builds: args.includes('--builds') || args.includes('-b'),
    tests: args.includes('--tests') || args.includes('-t'),
    dryRun: args.includes('--dry-run') || args.includes('--dry'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    console.log(`
🧹 Script de Limpieza Avanzada del Monorepo AltaMedica

Uso:
  node scripts/clean-node-modules.js [opciones]

Opciones de Limpieza:
  --all, -a      Limpieza completa (por defecto)
  --deps, -d     Solo dependencias (node_modules, lock files)
  --cache, -c    Solo archivos de caché (.next, .turbo, .eslintcache, etc.)
  --logs, -l     Solo archivos de log (*.log)
  --builds, -b   Solo directorios de build (dist, build, out)
  --tests, -t    Solo archivos de test (coverage, .pytest_cache, etc.)

Opciones de Control:
  --dry-run      Mostrar qué se eliminaría sin hacerlo realmente
  --help, -h     Mostrar esta ayuda

Elementos que se limpian:
📁 Directorios:
  • node_modules (dependencias)
  • .next (Next.js build cache)
  • dist, build, out (archivos compilados)
  • coverage, .nyc_output (test coverage)
  • .cache, tmp, temp (archivos temporales)
  • .turbo (Turborepo cache)
  • .pytest_cache, __pycache__ (Python test cache)

📄 Archivos:
  • pnpm-lock.yaml, yarn.lock, package-lock.json
  • *.log (archivos de log)
  • tsconfig.tsbuildinfo (TypeScript build info)
  • .DS_Store, Thumbs.db (archivos del sistema)
  • *.tgz, *.tar.gz (archivos comprimidos)

Ejemplos:
  pnpm clean:node-modules                    # Limpieza completa
  pnpm clean:node-modules --deps             # Solo node_modules y lock files
  pnpm clean:node-modules --cache --builds   # Solo caché y builds
  pnpm clean:node-modules --dry-run          # Ver qué se eliminaría
`);
    return;
  }

  console.log('🧹 Iniciando análisis del monorepo...\n');
  
  if (options.dryRun) {
    console.log('🔍 MODO DRY-RUN: Solo mostrando qué se eliminaría\n');
  }
  
  const rootDir = process.cwd();
  console.log(`📁 Directorio raíz: ${rootDir}\n`);

  // Buscar todos los elementos a limpiar
  console.log('🔍 Escaneando proyecto...');
  const targets = findCleanupTargets(rootDir);
  
  // Filtrar según opciones (solo si no es --all)
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
    }
    if (!options.tests) {
      targets.coverageDirs = [];
      targets.testDirs = [];
    }
    if (!options.env) {
      targets.envFiles = [];
    }
  }
  
  const totalItems = targets.nodeModules.length + targets.nextDirs.length + 
                    targets.distDirs.length + targets.lockFiles.length +
                    targets.cacheFiles.length + targets.logFiles.length +
                    targets.buildDirs.length + targets.tempDirs.length +
                    targets.coverageDirs.length + targets.envFiles.length +
                    targets.testDirs.length;
  
  if (totalItems === 0) {
    console.log('✅ No se encontraron elementos para eliminar.');
    return;
  }
  
  // Calcular espacio total
  console.log('📊 Calculando espacio en disco...');
  const totalSize = calculateTotalSize(targets);
  
  console.log(`\n📦 Resumen de elementos encontrados:`);
  console.log(`   📁 node_modules: ${targets.nodeModules.length} directorios`);
  console.log(`   📁 .next builds: ${targets.nextDirs.length} directorios`);
  console.log(`   📁 dist/build: ${targets.distDirs.length + targets.buildDirs.length} directorios`);
  console.log(`   📁 test coverage: ${targets.coverageDirs.length + targets.testDirs.length} directorios`);
  console.log(`   📁 temp/cache: ${targets.tempDirs.length} directorios`);
  console.log(`   📄 lock files: ${targets.lockFiles.length} archivos`);
  console.log(`   📄 cache files: ${targets.cacheFiles.length} archivos`);
  console.log(`   📄 log files: ${targets.logFiles.length} archivos`);
  console.log(`   📄 env local files: ${targets.envFiles.length} archivos`);
  console.log(`   🎯 Total: ${totalItems} elementos`);
  console.log(`   💾 Espacio estimado: ${formatBytes(totalSize)}\n`);
  
  if (options.dryRun) {
    console.log('🔍 ELEMENTOS QUE SE ELIMINARÍAN:\n');
  } else {
    console.log('🗑️ Eliminando elementos...\n');
  }
  
  let successCount = 0;
  let failCount = 0;
  
  // Función auxiliar para eliminar array de elementos
  function deleteElements(elements, type) {
    if (elements.length === 0) return;
    
    console.log(`\n${options.dryRun ? '🔍' : '🗑️'} ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
    
    for (const element of elements) {
      const relativePath = path.relative(rootDir, element);
      const size = fs.statSync(element).isDirectory() 
        ? getDirectorySize(element) 
        : getFileSize(element);
      
      if (options.dryRun) {
        console.log(`   📄 ${relativePath} (${formatBytes(size)})`);
        successCount++;
      } else {
        process.stdout.write(`   Eliminando: ${relativePath}... `);
        
        if (deleteFileOrDirectory(element, options.dryRun)) {
          console.log(`✅ (${formatBytes(size)})`);
          successCount++;
        } else {
          console.log('❌');
          failCount++;
        }
      }
    }
  }
  
  // Eliminar todos los elementos por categoría
  deleteElements(targets.nodeModules, 'dependencies (node_modules)');
  deleteElements(targets.nextDirs, 'next.js builds (.next)');
  deleteElements(targets.distDirs, 'distribution builds (dist)');
  deleteElements(targets.buildDirs, 'build outputs (build/out)');
  deleteElements(targets.coverageDirs, 'test coverage');
  deleteElements(targets.testDirs, 'test cache');
  deleteElements(targets.tempDirs, 'temporary files');
  deleteElements(targets.lockFiles, 'lock files');
  deleteElements(targets.cacheFiles, 'cache files');
  deleteElements(targets.logFiles, 'log files');
  deleteElements(targets.envFiles, 'local env files');
  
  console.log('\n📊 Resumen final:');
  if (options.dryRun) {
    console.log(`   🔍 Elementos que se eliminarían: ${successCount}`);
    console.log(`   💾 Espacio que se liberaría: ${formatBytes(totalSize)}`);
    console.log('\n💡 Para ejecutar la limpieza real, quita la opción --dry-run');
  } else {
    console.log(`   ✅ Eliminados exitosamente: ${successCount}`);
    if (failCount > 0) {
      console.log(`   ❌ Fallos: ${failCount}`);
    }
    console.log(`   💾 Espacio liberado: ${formatBytes(totalSize)}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Limpieza completada! Comandos útiles:');
      console.log('   pnpm install              - Reinstalar dependencias');
      console.log('   pnpm clean:complete        - Limpiar y reinstalar automáticamente');
      console.log('   pnpm fresh-install         - Reinstalar con lockfile congelado');
    }
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { findCleanupTargets, deleteFileOrDirectory, formatBytes, calculateTotalSize };
