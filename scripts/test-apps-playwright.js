const { chromium } = require('playwright');

// Configuración de las apps de AltaMedica
const APPS = [
  { name: 'web-app', port: 3000, healthCheck: '/api/health' },
  { name: 'api-server', port: 3001, healthCheck: '/api/health' },
  { name: 'doctors', port: 3002, healthCheck: '/' },
  { name: 'patients', port: 3003, healthCheck: '/' },
  { name: 'admin', port: 3004, healthCheck: '/' },
  { name: 'companies', port: 3005, healthCheck: '/' }
];

async function testApp(app) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    name: app.name,
    port: app.port,
    status: 'unknown',
    html: null,
    error: null,
    responseTime: 0
  };

  try {
    const startTime = Date.now();
    const url = `http://localhost:${app.port}${app.healthCheck}`;
    
    // Intentar cargar la página con timeout de 30 segundos
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    results.responseTime = Date.now() - startTime;
    results.status = response.status();
    
    // Capturar HTML renderizado
    results.html = await page.content();
    
    // Verificar si es una página de error
    const title = await page.title();
    if (title.includes('Error') || results.status >= 400) {
      results.error = `HTTP ${results.status} - ${title}`;
    }
    
    // Capturar screenshot para depuración
    await page.screenshot({ 
      path: `./screenshots/${app.name}-${app.port}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    results.status = 'error';
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  return results;
}

async function testAllApps() {
  console.log('🔍 Iniciando pruebas de AltaMedica con Playwright...\n');
  
  // Crear directorio de screenshots
  const fs = require('fs');
  if (!fs.existsSync('./screenshots')) {
    fs.mkdirSync('./screenshots');
  }
  
  const results = [];
  
  for (const app of APPS) {
    console.log(`⏳ Probando ${app.name} en puerto ${app.port}...`);
    const result = await testApp(app);
    results.push(result);
    
    // Mostrar resultado
    if (result.status === 'error') {
      console.log(`❌ ${app.name}: ERROR - ${result.error}`);
    } else if (result.status >= 200 && result.status < 300) {
      console.log(`✅ ${app.name}: OK (${result.status}) - ${result.responseTime}ms`);
    } else {
      console.log(`⚠️  ${app.name}: HTTP ${result.status} - ${result.error || 'Respuesta no exitosa'}`);
    }
  }
  
  // Resumen final
  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('========================');
  
  const working = results.filter(r => r.status >= 200 && r.status < 300).length;
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status >= 300 && r.status !== 'error').length;
  
  console.log(`✅ Funcionando: ${working}/${APPS.length}`);
  console.log(`⚠️  Advertencias: ${warnings}/${APPS.length}`);
  console.log(`❌ Errores: ${errors}/${APPS.length}`);
  
  // Guardar resultados detallados
  fs.writeFileSync('./test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-results.json');
  console.log('📸 Screenshots guardados en ./screenshots/');
  
  return results;
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testAllApps()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error fatal:', err);
      process.exit(1);
    });
}

module.exports = { testApp, testAllApps };