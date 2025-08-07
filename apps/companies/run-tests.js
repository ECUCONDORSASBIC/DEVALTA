#!/usr/bin/env node

/**
 * Script de ejecución de pruebas Playwright para AltaMedica Companies App
 * Proporciona diferentes opciones de ejecución y configuración
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración por defecto
const DEFAULT_CONFIG = {
  headed: false,
  project: 'chromium',
  workers: 4,
  retries: 0,
  timeout: 60000,
  baseUrl: 'http://localhost:3006'
};

// Argumentos de línea de comandos
const args = process.argv.slice(2);

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas E2E de AltaMedica Companies App\n');
  
  try {
    // Parsear argumentos
    const config = parseArguments(args);
    
    // Mostrar configuración
    displayConfig(config);
    
    // Verificar prerequisitos
    await checkPrerequisites();
    
    // Preparar entorno
    await prepareEnvironment(config);
    
    // Ejecutar pruebas
    await runTests(config);
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
    process.exit(1);
  }
}

/**
 * Parsear argumentos de línea de comandos
 */
function parseArguments(args) {
  const config = { ...DEFAULT_CONFIG };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--headed':
      case '-h':
        config.headed = true;
        break;
        
      case '--project':
      case '-p':
        config.project = args[++i];
        break;
        
      case '--workers':
      case '-w':
        config.workers = parseInt(args[++i]);
        break;
        
      case '--retries':
      case '-r':
        config.retries = parseInt(args[++i]);
        break;
        
      case '--timeout':
      case '-t':
        config.timeout = parseInt(args[++i]);
        break;
        
      case '--base-url':
      case '-u':
        config.baseUrl = args[++i];
        break;
        
      case '--test':
        config.testPattern = args[++i];
        break;
        
      case '--debug':
        config.debug = true;
        config.headed = true;
        config.workers = 1;
        config.timeout = 0;
        break;
        
      case '--mobile':
        config.project = 'mobile-chrome';
        break;
        
      case '--tablet':
        config.project = 'tablet';
        break;
        
      case '--firefox':
        config.project = 'firefox';
        break;
        
      case '--webkit':
        config.project = 'webkit';
        break;
        
      case '--ui':
        config.ui = true;
        break;
        
      case '--help':
        displayHelp();
        process.exit(0);
        break;
        
      default:
        if (!arg.startsWith('-')) {
          config.testPattern = arg;
        }
        break;
    }
  }
  
  return config;
}

/**
 * Mostrar ayuda
 */
function displayHelp() {
  console.log(`
🧪 AltaMedica Companies App - Test Runner

Uso: node run-tests.js [opciones] [patrón-de-prueba]

Opciones:
  -h, --headed              Ejecutar navegador visible
  -p, --project <name>      Proyecto a ejecutar (chromium, firefox, webkit, mobile-chrome, tablet)
  -w, --workers <number>    Número de workers paralelos
  -r, --retries <number>    Número de reintentos por prueba fallida
  -t, --timeout <ms>        Timeout global para pruebas
  -u, --base-url <url>      URL base de la aplicación
      --test <pattern>      Patrón de archivos de prueba
      --debug               Modo debug (headed, 1 worker, sin timeout)
      --mobile              Ejecutar en dispositivo móvil
      --tablet              Ejecutar en tablet
      --firefox             Ejecutar en Firefox
      --webkit              Ejecutar en Safari/WebKit
      --ui                  Ejecutar en modo UI interactivo
      --help                Mostrar esta ayuda

Ejemplos:
  node run-tests.js                          # Ejecutar todas las pruebas
  node run-tests.js --headed                 # Ejecutar con navegador visible
  node run-tests.js --debug                  # Modo debug
  node run-tests.js --mobile                 # Pruebas móviles
  node run-tests.js dashboard.spec.ts        # Ejecutar prueba específica
  node run-tests.js --project firefox        # Ejecutar en Firefox
  node run-tests.js --workers 2 --retries 1 # Configuración personalizada

Patrones de prueba disponibles:
  dashboard     - Pruebas del dashboard principal
  employees     - Gestión de empleados
  doctors       - Gestión de doctores
  appointments  - Sistema de citas
  patients      - Gestión de pacientes
  marketplace   - Marketplace de servicios
  analytics     - Sistema de analytics
`);
}

/**
 * Mostrar configuración actual
 */
function displayConfig(config) {
  console.log('⚙️ Configuración de pruebas:');
  console.log(`   Proyecto: ${config.project}`);
  console.log(`   Modo: ${config.headed ? 'headed' : 'headless'}`);
  console.log(`   Workers: ${config.workers}`);
  console.log(`   Reintentos: ${config.retries}`);
  console.log(`   Timeout: ${config.timeout}ms`);
  console.log(`   URL Base: ${config.baseUrl}`);
  if (config.testPattern) {
    console.log(`   Patrón: ${config.testPattern}`);
  }
  if (config.debug) {
    console.log(`   🐛 Modo DEBUG activado`);
  }
  console.log('');
}

/**
 * Verificar prerequisitos
 */
async function checkPrerequisites() {
  console.log('🔍 Verificando prerequisitos...');
  
  // Verificar que existe playwright.config.ts
  if (!fs.existsSync('playwright.config.ts')) {
    throw new Error('No se encontró playwright.config.ts');
  }
  
  // Verificar que existe el directorio de pruebas
  if (!fs.existsSync('tests')) {
    throw new Error('No se encontró el directorio tests');
  }
  
  // Verificar que pnpm está disponible
  try {
    await execCommand('pnpm', ['--version']);
  } catch (error) {
    throw new Error('pnpm no está disponible');
  }
  
  console.log('✅ Prerequisitos verificados');
}

/**
 * Preparar entorno de pruebas
 */
async function prepareEnvironment(config) {
  console.log('🛠️ Preparando entorno...');
  
  // Establecer variables de entorno
  process.env.PLAYWRIGHT_BASE_URL = config.baseUrl;
  process.env.NODE_ENV = 'test';
  
  if (config.debug) {
    process.env.PWDEBUG = '1';
    process.env.DEBUG = 'pw:api*';
  }
  
  // Crear directorios necesarios
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('✅ Entorno preparado');
}

/**
 * Ejecutar pruebas
 */
async function runTests(config) {
  console.log('🧪 Ejecutando pruebas...\n');
  
  const playwrightArgs = ['playwright', 'test'];
  
  // Configurar argumentos
  if (config.project) {
    playwrightArgs.push('--project', config.project);
  }
  
  if (config.headed) {
    playwrightArgs.push('--headed');
  }
  
  if (config.workers) {
    playwrightArgs.push('--workers', config.workers.toString());
  }
  
  if (config.retries) {
    playwrightArgs.push('--retries', config.retries.toString());
  }
  
  if (config.timeout) {
    playwrightArgs.push('--timeout', config.timeout.toString());
  }
  
  if (config.ui) {
    playwrightArgs.push('--ui');
  }
  
  if (config.debug) {
    playwrightArgs.push('--debug');
  }
  
  if (config.testPattern) {
    playwrightArgs.push(config.testPattern);
  }
  
  // Ejecutar comando
  try {
    await execCommand('pnpm', playwrightArgs, { stdio: 'inherit' });
    console.log('\n✅ Pruebas completadas exitosamente');
  } catch (error) {
    console.log('\n❌ Algunas pruebas fallaron');
    throw error;
  }
}

/**
 * Ejecutar comando de forma asíncrona
 */
function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    if (process.stdout) {
      process.stdout.on('data', (data) => {
        stdout += data.toString();
        if (options.stdio === 'inherit') {
          console.log(data.toString());
        }
      });
    }
    
    if (process.stderr) {
      process.stderr.on('data', (data) => {
        stderr += data.toString();
        if (options.stdio === 'inherit') {
          console.error(data.toString());
        }
      });
    }
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Ejecutar script si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArguments, runTests };
