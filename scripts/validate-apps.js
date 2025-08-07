const http = require('http');
const https = require('https');

// Configuración de las apps
const APPS = [
  { name: 'web-app', port: 3000, endpoints: ['/api/health', '/'] },
  { name: 'api-server', port: 3001, endpoints: ['/api/health', '/api/v1/auth/login'] },
  { name: 'doctors', port: 3002, endpoints: ['/api/health', '/'] },
  { name: 'patients', port: 3003, endpoints: ['/api/health', '/'] },
  { name: 'companies', port: 3004, endpoints: ['/api/health', '/'] },
  { name: 'admin', port: 3005, endpoints: ['/api/health', '/'] },
  { name: 'signaling-server', port: 8888, endpoints: ['/health', '/'] }
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

function checkEndpoint(hostname, port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port,
      path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // Primeros 200 caracteres
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'timeout', error: 'Request timeout' });
    });

    req.end();
  });
}

async function validateApp(app) {
  console.log(`\n${colors.cyan}🔍 Validando ${app.name} (puerto ${app.port})...${colors.reset}`);
  
  const results = {
    name: app.name,
    port: app.port,
    status: 'unknown',
    endpoints: []
  };

  for (const endpoint of app.endpoints) {
    const result = await checkEndpoint('localhost', app.port, endpoint);
    
    let statusIcon = '❓';
    let statusColor = colors.yellow;
    
    if (result.status === 'error' || result.status === 'timeout') {
      statusIcon = '❌';
      statusColor = colors.red;
      results.status = 'down';
    } else if (result.status >= 200 && result.status < 300) {
      statusIcon = '✅';
      statusColor = colors.green;
      if (results.status !== 'down') results.status = 'up';
    } else if (result.status >= 500) {
      statusIcon = '💥';
      statusColor = colors.red;
      if (results.status === 'unknown') results.status = 'error';
    } else {
      statusIcon = '⚠️';
      statusColor = colors.yellow;
      if (results.status === 'unknown') results.status = 'warning';
    }
    
    console.log(`  ${statusIcon} ${endpoint}: ${statusColor}${result.status}${colors.reset}`);
    
    if (result.error) {
      console.log(`     └─ Error: ${result.error}`);
    } else if (result.data) {
      const preview = result.data.substring(0, 60).replace(/\n/g, ' ');
      console.log(`     └─ Preview: ${preview}...`);
    }
    
    results.endpoints.push({
      path: endpoint,
      status: result.status,
      error: result.error
    });
  }

  return results;
}

async function validateAllApps() {
  console.log(`${colors.bright}${colors.blue}🏥 VALIDACIÓN DE SISTEMA ALTAMEDICA${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════${colors.reset}`);
  
  const startTime = Date.now();
  const results = [];
  
  for (const app of APPS) {
    const result = await validateApp(app);
    results.push(result);
  }
  
  // Resumen
  console.log(`\n${colors.bright}📊 RESUMEN DEL SISTEMA:${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════${colors.reset}`);
  
  const stats = {
    up: results.filter(r => r.status === 'up').length,
    down: results.filter(r => r.status === 'down').length,
    error: results.filter(r => r.status === 'error').length,
    warning: results.filter(r => r.status === 'warning').length
  };
  
  results.forEach(app => {
    let icon = '🔴';
    let color = colors.red;
    
    if (app.status === 'up') {
      icon = '🟢';
      color = colors.green;
    } else if (app.status === 'warning') {
      icon = '🟡';
      color = colors.yellow;
    } else if (app.status === 'error') {
      icon = '🔥';
      color = colors.red;
    }
    
    console.log(`${icon} ${color}${app.name.padEnd(15)}${colors.reset} Puerto ${app.port}`);
  });
  
  console.log(`\n${colors.bright}📈 ESTADÍSTICAS:${colors.reset}`);
  console.log(`   🟢 Activas: ${stats.up}/${APPS.length}`);
  console.log(`   🟡 Advertencias: ${stats.warning}/${APPS.length}`);
  console.log(`   🔥 Errores: ${stats.error}/${APPS.length}`);
  console.log(`   🔴 Inactivas: ${stats.down}/${APPS.length}`);
  
  const duration = Date.now() - startTime;
  console.log(`\n⏱️  Tiempo total: ${duration}ms`);
  
  // Recomendaciones
  if (stats.down > 0 || stats.error > 0) {
    console.log(`\n${colors.yellow}💡 RECOMENDACIONES:${colors.reset}`);
    
    results.forEach(app => {
      if (app.status === 'down') {
        console.log(`   - Iniciar ${app.name}: cd apps/${app.name} && pnpm dev`);
      } else if (app.status === 'error') {
        console.log(`   - Revisar logs de ${app.name} para errores 500`);
      }
    });
  }
  
  // Estado general
  const healthScore = (stats.up / APPS.length) * 100;
  let healthIcon = '❤️';
  let healthColor = colors.green;
  
  if (healthScore < 50) {
    healthIcon = '💔';
    healthColor = colors.red;
  } else if (healthScore < 80) {
    healthIcon = '💛';
    healthColor = colors.yellow;
  }
  
  console.log(`\n${healthIcon} ${colors.bright}SALUD DEL SISTEMA: ${healthColor}${healthScore.toFixed(0)}%${colors.reset}`);
  
  return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  validateAllApps()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { validateApp, validateAllApps };