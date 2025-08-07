const http = require('http');
const fs = require('fs');

// Apps para capturar HTML
const APPS = [
  { name: 'web-app', port: 3000 },
  { name: 'api-server', port: 3001 },
  { name: 'doctors', port: 3002 },
  { name: 'patients', port: 3003 },
  { name: 'admin', port: 3004 },
  { name: 'companies', port: 3005 }
];

function captureHTML(app) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: app.port,
      path: '/',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'AltaMedica-Debug-Tool/1.0'
      }
    }, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        resolve({
          app: app.name,
          port: app.port,
          status: res.statusCode,
          html,
          size: html.length,
          success: true
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        app: app.name,
        port: app.port,
        status: 'error',
        error: err.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        app: app.name,
        port: app.port,
        status: 'timeout',
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function captureAllHTML() {
  console.log('🎭 CAPTURADOR DE HTML - ALTAMEDICA');
  console.log('═══════════════════════════════════\n');

  // Crear directorio de salida
  const outputDir = './html-captures';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  for (const app of APPS) {
    console.log(`📄 Capturando ${app.name} (puerto ${app.port})...`);
    
    const result = await captureHTML(app);
    results.push(result);

    if (result.success) {
      // Guardar HTML
      const filename = `${outputDir}/${app.name}-${app.port}-${timestamp}.html`;
      fs.writeFileSync(filename, result.html);
      
      // Análisis básico
      const hasTitle = result.html.includes('<title>');
      const hasReact = result.html.includes('__NEXT_DATA__') || result.html.includes('react');
      const hasError = result.html.includes('Error') || result.html.includes('error');
      
      console.log(`   ✅ Guardado: ${filename}`);
      console.log(`   📊 Tamaño: ${(result.size / 1024).toFixed(1)}KB`);
      console.log(`   🏷️  Título: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   ⚛️  React: ${hasReact ? '✅' : '❌'}`);
      console.log(`   🚨 Errores: ${hasError ? '⚠️' : '✅'}`);
      
      // Preview del contenido
      const preview = result.html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 100)
        .trim();
      console.log(`   👀 Preview: ${preview}...`);
      
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }
    
    console.log('');
  }

  // Resumen
  console.log('📋 RESUMEN DE CAPTURAS:');
  console.log('═══════════════════════');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`✅ Exitosas: ${successful}/${results.length}`);
  console.log(`❌ Fallidas: ${failed}/${results.length}`);
  
  // Guardar reporte JSON
  const reportFile = `${outputDir}/capture-report-${timestamp}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Reporte guardado: ${reportFile}`);
  
  return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  captureAllHTML()
    .then(() => {
      console.log('\n🎉 Captura completada!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { captureHTML, captureAllHTML };