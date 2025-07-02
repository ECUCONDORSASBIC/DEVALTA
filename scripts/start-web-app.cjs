#!/usr/bin/env node

/**
 * 🚀 ALTAMEDICA WEB-APP STARTER - OPTIMIZADO
 * 
 * Script unificado y optimizado para iniciar la aplicación web
 * Compatible con Windows, Linux y macOS
 * 
 * Uso:
 *   node start-web-app.cjs [puerto] [--clean] [--help]
 * 
 * Ejemplos:
 *   node start-web-app.cjs 3008
 *   node start-web-app.cjs --clean
 *   node start-web-app.cjs --help
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración
const DEFAULT_PORT = 3008;
const WEB_APP_DIR = path.join(__dirname, 'apps', 'web-app');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  log('\n🏥 ALTAMEDICA WEB-APP STARTER', 'bright');
  log('================================\n', 'cyan');

  log('Uso:', 'yellow');
  log('  node start-web-app.cjs [opciones]\n', 'reset');

  log('Opciones:', 'yellow');
  log('  [puerto]     Puerto del servidor (default: 3008)', 'reset');
  log('  --clean      Limpiar caché antes de iniciar', 'reset');
  log('  --help       Mostrar esta ayuda', 'reset');
  log('  --install    Instalar dependencias antes de iniciar', 'reset');

  log('\nEjemplos:', 'yellow');
  log('  node start-web-app.cjs', 'reset');
  log('  node start-web-app.cjs 3010', 'reset');
  log('  node start-web-app.cjs --clean', 'reset');
  log('  node start-web-app.cjs 3008 --install\n', 'reset');

  log('URLs de Acceso:', 'yellow');
  log('  Local:  http://localhost:[puerto]', 'green');
  log('  Red:    http://192.168.0.37:[puerto]\n', 'green');

  process.exit(0);
}

function validatePort(port) {
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
    log(`❌ Puerto inválido: ${port}. Debe ser entre 1024 y 65535`, 'red');
    process.exit(1);
  }
  return portNum;
}

function checkDependencies() {
  const packageJsonPath = path.join(WEB_APP_DIR, 'package.json');
  const nodeModulesPath = path.join(WEB_APP_DIR, 'node_modules');

  if (!fs.existsSync(packageJsonPath)) {
    log('❌ No se encontró package.json en apps/web-app', 'red');
    process.exit(1);
  }

  if (!fs.existsSync(nodeModulesPath)) {
    log('⚠️  node_modules no encontrado. Instalando dependencias...', 'yellow');
    return false;
  }

  return true;
}

function installDependencies() {
  log('📦 Instalando dependencias...', 'cyan');

  return new Promise((resolve, reject) => {
    const installProcess = spawn('pnpm', ['install'], {
      stdio: 'inherit',
      shell: true,
      cwd: WEB_APP_DIR
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Dependencias instaladas correctamente', 'green');
        resolve();
      } else {
        log('❌ Error instalando dependencias', 'red');
        reject(new Error(`Install failed with code ${code}`));
      }
    });

    installProcess.on('error', (error) => {
      log(`❌ Error en instalación: ${error.message}`, 'red');
      reject(error);
    });
  });
}

function cleanCache() {
  log('🧹 Limpiando caché...', 'cyan');

  const cacheDirs = [
    path.join(WEB_APP_DIR, '.next'),
    path.join(WEB_APP_DIR, 'dist'),
    path.join(WEB_APP_DIR, 'build')
  ];

  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        log(`✅ Caché eliminado: ${path.basename(dir)}`, 'green');
      } catch (error) {
        log(`⚠️  No se pudo eliminar: ${path.basename(dir)}`, 'yellow');
      }
    }
  });
}

function startServer(port) {
  log('\n🚀 INICIANDO ALTAMEDICA WEB-APP', 'bright');
  log('================================\n', 'cyan');

  log(`📁 Directorio: ${WEB_APP_DIR}`, 'blue');
  log(`🌐 Puerto: ${port}`, 'blue');
  log(`🔗 URL Local: http://localhost:${port}`, 'green');
  log(`🌍 URL Red: http://192.168.0.37:${port}`, 'green');
  log('\n⏳ Iniciando servidor de desarrollo...\n', 'yellow');

  const devProcess = spawn('pnpm', ['dev', '--port', port.toString()], {
    stdio: 'inherit',
    shell: true,
    cwd: WEB_APP_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      FAST_REFRESH: 'true',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });

  devProcess.on('error', (error) => {
    log(`❌ Error al iniciar el servidor: ${error.message}`, 'red');
    process.exit(1);
  });

  devProcess.on('close', (code) => {
    log(`\n📊 Proceso terminado con código: ${code}`, 'blue');
    process.exit(code);
  });

  // Manejo de señales para cerrar limpiamente
  process.on('SIGINT', () => {
    log('\n🛑 Deteniendo servidor...', 'yellow');
    devProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('\n🛑 Terminando servidor...', 'yellow');
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  let port = DEFAULT_PORT;
  let shouldClean = false;
  let shouldInstall = false;

  // Procesar argumentos
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp();
    } else if (arg === '--clean') {
      shouldClean = true;
    } else if (arg === '--install') {
      shouldInstall = true;
    } else if (!isNaN(arg)) {
      port = validatePort(arg);
    } else {
      log(`⚠️  Argumento desconocido: ${arg}`, 'yellow');
      showHelp();
    }
  }

  // Verificar directorio
  if (!fs.existsSync(WEB_APP_DIR)) {
    log('❌ Directorio apps/web-app no encontrado', 'red');
    process.exit(1);
  }

  // Limpiar caché si se solicita
  if (shouldClean) {
    cleanCache();
  }

  // Verificar/instalar dependencias
  const depsOk = checkDependencies();
  if (!depsOk || shouldInstall) {
    try {
      await installDependencies();
    } catch (error) {
      process.exit(1);
    }
  }

  // Iniciar servidor
  startServer(port);
}

// Ejecutar
main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
}); 