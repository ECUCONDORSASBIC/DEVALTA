#!/usr/bin/env node

/**
 * 📊 PERFORMANCE MONITOR FOR WEB-APP
 * 
 * Monitor en tiempo real del rendimiento durante desarrollo:
 * - Memoria Node.js
 * - Tiempo de builds
 * - Hot reload performance  
 * - Bundle size tracking
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let startTime = Date.now();
let lastBuildTime = 0;
let buildCount = 0;

console.log('📊 PERFORMANCE MONITOR - WEB-APP');
console.log('=====================================\n');

// Mostrar configuración inicial
showSystemInfo();

// Monitor de memoria cada 10 segundos
setInterval(monitorMemory, 10000);

// Monitor de archivos para detectar cambios
monitorFileChanges();

function showSystemInfo() {
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  const nodeOptions = process.env.NODE_OPTIONS || 'No configurado';
  
  console.log('🖥️  INFORMACIÓN DEL SISTEMA:');
  console.log(`   Node.js: ${nodeVersion}`);
  console.log(`   Plataforma: ${platform} ${arch}`);
  console.log(`   NODE_OPTIONS: ${nodeOptions}`);
  console.log(`   Puerto: 3000`);
  console.log('');
}

function monitorMemory() {
  const memUsage = process.memoryUsage();
  const used = Math.round(memUsage.heapUsed / 1024 / 1024);
  const total = Math.round(memUsage.heapTotal / 1024 / 1024);
  const external = Math.round(memUsage.external / 1024 / 1024);
  
  console.log(`🔋 MEMORIA: ${used}MB / ${total}MB (External: ${external}MB)`);
  
  // Advertencia si la memoria es alta
  if (used > 2000) {
    console.log('⚠️  ADVERTENCIA: Alto uso de memoria. Considera reiniciar el servidor.');
  }
  
  // Información adicional cada minuto
  if (Date.now() - startTime > 60000 && (Date.now() - startTime) % 60000 < 10000) {
    showPerformanceStats();
  }
}

function showPerformanceStats() {
  const uptime = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(uptime / 60);
  const seconds = uptime % 60;
  
  console.log('\n📈 ESTADÍSTICAS DE RENDIMIENTO:');
  console.log(`   Tiempo activo: ${minutes}m ${seconds}s`);
  console.log(`   Builds realizados: ${buildCount}`);
  
  if (buildCount > 0) {
    const avgBuildTime = lastBuildTime / buildCount;
    console.log(`   Tiempo promedio de build: ${avgBuildTime.toFixed(2)}ms`);
  }
  
  // Verificar tamaño de la carpeta .next
  checkNextFolderSize();
  console.log('');
}

function checkNextFolderSize() {
  const nextPath = path.join(__dirname, '.next');
  
  if (fs.existsSync(nextPath)) {
    exec(`du -sh "${nextPath}" 2>/dev/null || dir "${nextPath}" /-c 2>nul`, (error, stdout) => {
      if (!error && stdout) {
        const size = stdout.split('\n')[0].split('\t')[0] || 'N/A';
        console.log(`   Tamaño .next: ${size}`);
      }
    });
  }
}

function monitorFileChanges() {
  const srcPath = path.join(__dirname, 'src');
  
  if (fs.existsSync(srcPath)) {
    console.log('👁️  Monitoreando cambios en src/...\n');
    
    // Simple file watcher para detectar builds
    fs.watchFile(path.join(__dirname, '.next', 'build-manifest.json'), (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        buildCount++;
        const buildTime = Date.now();
        
        if (lastBuildTime > 0) {
          const timeDiff = buildTime - lastBuildTime;
          console.log(`🔄 Build #${buildCount} completado en ${timeDiff}ms`);
        }
        
        lastBuildTime = buildTime;
      }
    });
  }
}

// Manejo graceful de señales
process.on('SIGINT', () => {
  console.log('\n📊 RESUMEN FINAL:');
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`   Tiempo total de desarrollo: ${totalTime}s`);
  console.log(`   Builds totales: ${buildCount}`);
  console.log('\n✅ Monitor cerrado correctamente');
  process.exit(0);
});

// Mostrar consejos de optimización cada 5 minutos
setInterval(() => {
  showOptimizationTips();
}, 300000);

function showOptimizationTips() {
  const tips = [
    '💡 TIP: Usa Ctrl+C y reinicia si la memoria supera los 3GB',
    '💡 TIP: Borra .next/ si los builds se vuelven lentos',
    '💡 TIP: Usa dev:direct para desarrollo sin optimizaciones',
    '💡 TIP: Chrome DevTools > Performance para profiling detallado',
    '💡 TIP: Verifica Network tab para assets pesados'
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  console.log(`\n${randomTip}\n`);
}

// Inicio del monitor
console.log('🚀 Monitor iniciado. Presiona Ctrl+C para ver resumen final.\n');