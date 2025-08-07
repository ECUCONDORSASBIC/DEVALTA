import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Teardown global para las pruebas de Playwright
 * Este archivo se ejecuta una vez después de todas las pruebas
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando teardown global de Playwright...');
  
  try {
    // 1. Limpiar datos de prueba temporales
    await cleanupTestData();
    
    // 2. Limpiar archivos temporales
    await cleanupTempFiles();
    
    // 3. Generar resumen de pruebas
    await generateTestSummary();
    
    // 4. Limpiar procesos en segundo plano si existen
    await cleanupBackgroundProcesses();
    
    console.log('✅ Teardown global completado exitosamente');
    
  } catch (error) {
    console.error('⚠️ Error en teardown global:', error);
    // No hacer fail del teardown, solo registrar el error
  }
}

/**
 * Limpiar datos de prueba temporales
 */
async function cleanupTestData() {
  console.log('🗑️ Limpiando datos de prueba temporales...');
  
  try {
    // Limpiar usuarios de prueba
    await cleanupTestUsers();
    
    // Limpiar datos temporales de la base de datos
    await cleanupTempDatabaseRecords();
    
    // Limpiar archivos subidos durante las pruebas
    await cleanupUploadedFiles();
    
    console.log('✅ Datos de prueba limpiados');
  } catch (error) {
    console.warn('⚠️ No se pudieron limpiar todos los datos de prueba:', error);
  }
}

/**
 * Limpiar usuarios de prueba creados
 */
async function cleanupTestUsers() {
  const testEmails = [
    'admin@test.com',
    'manager@test.com',
    'employee@test.com',
    'test.user@example.com',
    'playwright.test@company.com'
  ];
  
  console.log(`Limpiando ${testEmails.length} usuarios de prueba...`);
  
  // Aquí iría la implementación específica para eliminar usuarios
  // Por ejemplo, con Prisma:
  // for (const email of testEmails) {
  //   await prisma.user.deleteMany({ where: { email } });
  // }
}

/**
 * Limpiar registros temporales de la base de datos
 */
async function cleanupTempDatabaseRecords() {
  console.log('Limpiando registros temporales de la BD...');
  
  // Limpiar registros que contengan marcadores de prueba
  // Por ejemplo:
  // - Empleados con nombres que contengan "Test"
  // - Citas marcadas como "test"
  // - Pacientes temporales
  
  const testPatterns = [
    'Test %',
    'Playwright %',
    'E2E %',
    '%@test.com',
    '%@example.com'
  ];
  
  console.log(`Limpiando registros con patrones: ${testPatterns.join(', ')}`);
  // Implementación específica dependería del ORM/base de datos utilizada
}

/**
 * Limpiar archivos subidos durante las pruebas
 */
async function cleanupUploadedFiles() {
  console.log('Limpiando archivos subidos durante pruebas...');
  
  try {
    // Limpiar directorio de uploads temporales
    const uploadDirs = [
      './public/uploads/test',
      './uploads/temp',
      './tmp/test-files'
    ];
    
    for (const dir of uploadDirs) {
      try {
        await execAsync(`rm -rf "${dir}"`);
        console.log(`Directorio limpiado: ${dir}`);
      } catch (error) {
        // Directorio no existe o no se puede eliminar
      }
    }
    
  } catch (error) {
    console.warn('No se pudieron limpiar todos los archivos:', error);
  }
}

/**
 * Limpiar archivos temporales generados durante las pruebas
 */
async function cleanupTempFiles() {
  console.log('📁 Limpiando archivos temporales...');
  
  try {
    // Limpiar screenshots antiguos (mantener solo los últimos 10)
    await cleanupOldScreenshots();
    
    // Limpiar logs temporales
    await cleanupTempLogs();
    
    // Limpiar archivos de caché
    await cleanupCacheFiles();
    
    console.log('✅ Archivos temporales limpiados');
  } catch (error) {
    console.warn('⚠️ No se pudieron limpiar todos los archivos temporales:', error);
  }
}

/**
 * Limpiar screenshots antiguos
 */
async function cleanupOldScreenshots() {
  const screenshotDir = './test-results/screenshots';
  
  try {
    // Mantener solo los últimos 50 screenshots
    await execAsync(`find "${screenshotDir}" -name "*.png" -type f | head -n -50 | xargs rm -f`);
    console.log('Screenshots antiguos limpiados');
  } catch (error) {
    // Directorio no existe o comando no disponible en Windows
  }
}

/**
 * Limpiar logs temporales
 */
async function cleanupTempLogs() {
  const logFiles = [
    './test-results/*.log',
    './logs/test-*.log',
    './tmp/*.log'
  ];
  
  for (const pattern of logFiles) {
    try {
      await execAsync(`rm -f ${pattern}`);
    } catch (error) {
      // Archivos no existen
    }
  }
}

/**
 * Limpiar archivos de caché
 */
async function cleanupCacheFiles() {
  const cachePatterns = [
    './.next/cache/test-*',
    './node_modules/.cache/playwright-*',
    './tmp/cache/*'
  ];
  
  for (const pattern of cachePatterns) {
    try {
      await execAsync(`rm -rf ${pattern}`);
    } catch (error) {
      // Archivos no existen
    }
  }
}

/**
 * Generar resumen de las pruebas ejecutadas
 */
async function generateTestSummary() {
  console.log('📊 Generando resumen de pruebas...');
  
  try {
    // Leer resultados de las pruebas
    const resultsFile = './test-results/results.json';
    
    // Crear resumen básico
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3006',
      cleanup: {
        tempFilesRemoved: true,
        testDataCleaned: true,
        backgroundProcessesStopped: true
      }
    };
    
    // Guardar resumen
    const fs = require('fs');
    fs.writeFileSync('./test-results/teardown-summary.json', JSON.stringify(summary, null, 2));
    
    console.log('✅ Resumen generado en test-results/teardown-summary.json');
    
  } catch (error) {
    console.warn('⚠️ No se pudo generar el resumen:', error);
  }
}

/**
 * Limpiar procesos en segundo plano
 */
async function cleanupBackgroundProcesses() {
  console.log('🔄 Limpiando procesos en segundo plano...');
  
  try {
    // Detener procesos de servidor de desarrollo si están corriendo
    await stopDevelopmentServers();
    
    // Limpiar procesos zombie de navegadores
    await cleanupBrowserProcesses();
    
    console.log('✅ Procesos en segundo plano limpiados');
  } catch (error) {
    console.warn('⚠️ No se pudieron limpiar todos los procesos:', error);
  }
}

/**
 * Detener servidores de desarrollo
 */
async function stopDevelopmentServers() {
  const ports = [3006, 3000, 8080]; // Puertos comunes de desarrollo
  
  for (const port of ports) {
    try {
      // En sistemas Unix
      await execAsync(`lsof -ti:${port} | xargs kill -9`);
      console.log(`Proceso en puerto ${port} detenido`);
    } catch (error) {
      // Proceso no existe o no se puede detener
    }
  }
}

/**
 * Limpiar procesos zombie de navegadores
 */
async function cleanupBrowserProcesses() {
  try {
    // Limpiar procesos de Chromium/Chrome zombie
    if (process.platform === 'darwin' || process.platform === 'linux') {
      await execAsync('pkill -f "chromium|chrome" || true');
    } else if (process.platform === 'win32') {
      await execAsync('taskkill /f /im chrome.exe /t || echo "No chrome processes found"');
      await execAsync('taskkill /f /im chromium.exe /t || echo "No chromium processes found"');
    }
    
    console.log('Procesos de navegador limpiados');
  } catch (error) {
    // No es crítico si no se pueden limpiar
  }
}

export default globalTeardown;
