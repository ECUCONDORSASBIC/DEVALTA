/**
 * 🧪 SCRIPT DE EJECUCIÓN - TESTS E2E DE PACIENTE
 * 
 * Script que facilita la ejecución de tests E2E del flujo de paciente
 * con configuraciones optimizadas para desarrollo y CI/CD
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colores para consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verificar que los servidores necesarios estén disponibles
async function checkServers() {
  log('\n🔍 Verificando servidores necesarios...', 'blue');
  
  const servers = [
    { name: 'Web App', url: 'http://localhost:3000', required: true },
    { name: 'API Server', url: 'http://localhost:3001', required: true },
    { name: 'Patients App', url: 'http://localhost:3003', required: false }
  ];
  
  for (const server of servers) {
    try {
      const response = await fetch(server.url, { method: 'HEAD' });
      if (response.ok || response.status < 500) {
        log(`✅ ${server.name} está disponible en ${server.url}`, 'green');
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      if (server.required) {
        log(`❌ ${server.name} NO está disponible en ${server.url}`, 'red');
        log(`   Por favor, inicia el servidor con: pnpm dev`, 'yellow');
        process.exit(1);
      } else {
        log(`⚠️  ${server.name} no está disponible (opcional)`, 'yellow');
      }
    }
  }
  
  log('\n✅ Todos los servidores requeridos están listos', 'green');
}

// Crear directorio de screenshots si no existe
function setupDirectories() {
  const dirs = [
    'tests/screenshots',
    'test-results',
    'test-results/playwright-report'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`📁 Creado directorio: ${dir}`, 'cyan');
    }
  });
}

// Ejecutar los tests
async function runTests() {
  log('\n🎭 EJECUTANDO TESTS E2E DE PACIENTE', 'bold');
  log('=====================================', 'bold');
  
  // Verificar servidores primero
  await checkServers();
  
  // Preparar directorios
  setupDirectories();
  
  // Argumentos para Playwright
  const args = [
    'playwright',
    'test',
    'patient-flow.spec.ts',
    '--project=chromium', // Usar solo Chrome por defecto
    '--reporter=list',
    '--reporter=html'
  ];
  
  // Agregar flags según el entorno
  if (process.argv.includes('--headed')) {
    args.push('--headed');
    log('\n🖥️  Ejecutando en modo HEADED (con navegador visible)', 'cyan');
  }
  
  if (process.argv.includes('--debug')) {
    args.push('--debug');
    log('\n🐛 Ejecutando en modo DEBUG', 'yellow');
  }
  
  if (process.argv.includes('--ui')) {
    args.push('--ui');
    log('\n🎨 Ejecutando con UI interactiva de Playwright', 'cyan');
  }
  
  if (process.argv.includes('--update-snapshots')) {
    args.push('--update-snapshots');
    log('\n📸 Actualizando snapshots', 'yellow');
  }
  
  // Ejecutar Playwright
  log('\n▶️  Ejecutando comando:', 'blue');
  log(`   npx ${args.join(' ')}`, 'cyan');
  log('');
  
  const playwright = spawn('npx', args, {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  playwright.on('error', (error) => {
    log(`\n❌ Error ejecutando Playwright: ${error.message}`, 'red');
    process.exit(1);
  });
  
  playwright.on('close', (code) => {
    if (code === 0) {
      log('\n✅ Tests completados exitosamente!', 'green');
      log('\n📊 Reporte HTML disponible en: test-results/playwright-report/index.html', 'blue');
      
      // Abrir reporte si se solicita
      if (process.argv.includes('--show-report')) {
        log('\n🌐 Abriendo reporte en el navegador...', 'cyan');
        const reportPath = path.join(__dirname, '..', 'test-results/playwright-report/index.html');
        const openCmd = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
        spawn(openCmd, [reportPath], { shell: true });
      }
    } else {
      log(`\n❌ Tests fallaron con código: ${code}`, 'red');
      log('\n💡 Sugerencias:', 'yellow');
      log('   - Revisa los screenshots en tests/screenshots/', 'yellow');
      log('   - Ejecuta con --headed para ver el navegador', 'yellow');
      log('   - Usa --debug para pausar en los errores', 'yellow');
      process.exit(code);
    }
  });
}

// Mostrar ayuda
function showHelp() {
  log('\n🧪 SCRIPT DE TESTS E2E - FLUJO DE PACIENTE', 'bold');
  log('==========================================', 'bold');
  
  log('\nUSO:', 'cyan');
  log('  node scripts/run-patient-tests.js [opciones]');
  
  log('\nOPCIONES:', 'cyan');
  log('  --headed          Muestra el navegador durante los tests', 'yellow');
  log('  --debug           Pausa en los errores para debugging', 'yellow');
  log('  --ui              Abre la UI interactiva de Playwright', 'yellow');
  log('  --show-report     Abre el reporte HTML al finalizar', 'yellow');
  log('  --update-snapshots Actualiza los snapshots de comparación', 'yellow');
  log('  --help            Muestra esta ayuda', 'yellow');
  
  log('\nEJEMPLOS:', 'cyan');
  log('  node scripts/run-patient-tests.js --headed');
  log('  node scripts/run-patient-tests.js --debug --show-report');
  log('  node scripts/run-patient-tests.js --ui');
  
  log('\nREQUISITOS:', 'red');
  log('  - Web App corriendo en http://localhost:3000');
  log('  - API Server corriendo en http://localhost:3001');
  log('  - Playwright instalado (pnpm playwright:install)');
  
  process.exit(0);
}

// Main
async function main() {
  if (process.argv.includes('--help')) {
    showHelp();
  }
  
  try {
    await runTests();
  } catch (error) {
    log(`\n❌ Error inesperado: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar
main();