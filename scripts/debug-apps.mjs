import { spawn } from 'child_process';
import http from 'http';

// Configuración de apps
const APPS = [
  { name: 'web-app', port: 3000, dir: 'apps/web-app' },
  { name: 'api-server', port: 3001, dir: 'apps/api-server' },
  { name: 'doctors', port: 3002, dir: 'apps/doctors' },
  { name: 'patients', port: 3003, dir: 'apps/patients' },
  { name: 'admin', port: 3004, dir: 'apps/admin' },
  { name: 'companies', port: 3005, dir: 'apps/companies' }
];

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.substring(0, 100),
          working: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', () => resolve({ status: 'error', working: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'timeout', working: false });
    });

    req.end();
  });
}

async function getSystemStatus() {
  console.log(`${colors.bright}${colors.blue}🔍 DIAGNÓSTICO SISTEMA ALTAMEDICA${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════${colors.reset}\n`);

  const results = [];
  
  for (const app of APPS) {
    process.stdout.write(`${colors.cyan}⏳ ${app.name.padEnd(12)}${colors.reset}`);
    
    const result = await checkPort(app.port);
    
    let icon = '❌';
    let statusText = 'DOWN';
    let colorCode = colors.red;
    
    if (result.working) {
      icon = '✅';
      statusText = 'UP';
      colorCode = colors.green;
    } else if (result.status === 'timeout') {
      icon = '⏰';
      statusText = 'TIMEOUT';
      colorCode = colors.yellow;
    } else if (result.status >= 500) {
      icon = '💥';
      statusText = 'ERROR';
      colorCode = colors.red;
    }
    
    console.log(`\r${icon} ${app.name.padEnd(12)} ${colorCode}${statusText.padEnd(8)}${colors.reset} :${app.port}`);
    
    results.push({
      ...app,
      ...result,
      icon,
      statusText
    });
  }

  return results;
}

function startApp(app) {
  return new Promise((resolve) => {
    console.log(`${colors.cyan}🚀 Iniciando ${app.name}...${colors.reset}`);
    
    const child = spawn('pnpm', ['dev'], {
      cwd: app.dir,
      stdio: 'pipe',
      shell: true
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        resolve({ success: false, error: 'Timeout' });
      }
    }, 60000);

    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          resolve({ success: true, pid: child.pid });
        }
      }
    });

    child.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') && !started) {
        started = true;
        clearTimeout(timeout);
        resolve({ success: false, error: error.substring(0, 200) });
      }
    });
  });
}

async function main() {
  // Diagnóstico inicial
  const status = await getSystemStatus();
  
  console.log(`\n${colors.bright}📊 RESUMEN:${colors.reset}`);
  const working = status.filter(s => s.working).length;
  const total = status.length;
  
  console.log(`   🟢 Funcionando: ${working}/${total}`);
  console.log(`   🔴 Problemáticas: ${total - working}/${total}`);
  
  const healthPercent = Math.round((working / total) * 100);
  let healthIcon = '💔';
  if (healthPercent >= 80) healthIcon = '❤️';
  else if (healthPercent >= 50) healthIcon = '💛';
  
  console.log(`\n${healthIcon} ${colors.bright}SALUD DEL SISTEMA: ${healthPercent}%${colors.reset}`);
  
  // Mostrar apps problemáticas
  const broken = status.filter(s => !s.working);
  if (broken.length > 0) {
    console.log(`\n${colors.yellow}⚠️ APPS PROBLEMÁTICAS:${colors.reset}`);
    broken.forEach(app => {
      console.log(`   ${app.icon} ${app.name} - ${app.statusText}`);
      if (app.data && app.data.includes('Error')) {
        console.log(`     └─ ${app.data.substring(0, 60)}...`);
      }
    });
    
    console.log(`\n${colors.cyan}💡 COMANDOS RÁPIDOS:${colors.reset}`);
    broken.forEach(app => {
      console.log(`   cd ${app.dir} && pnpm dev`);
    });
  }
  
  // Información adicional
  console.log(`\n${colors.blue}ℹ️  INFORMACIÓN ADICIONAL:${colors.reset}`);
  console.log(`   • Script de validación: node scripts/validate-apps.js`);
  console.log(`   • Diagnóstico completo: node scripts/debug-apps.mjs`);
  console.log(`   • PowerShell HTML: powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000'"`);
}

// Ejecutar
main().catch(console.error);