// Script de Puppeteer para automatizar y diagnosticar el login
const puppeteer = require('puppeteer');

async function testLogin() {
  console.log('🚀 Iniciando test de login con Puppeteer...\n');
  
  try {
    // Lanzar navegador
    const browser = await puppeteer.launch({ 
      headless: false, // Mostrar el navegador
      devtools: true,  // Abrir DevTools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Escuchar logs de consola
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AuthContext')) {
        console.log('🔐 [AUTH]:', text);
      } else if (text.includes('Firebase')) {
        console.log('🔥 [FIREBASE]:', text);
      } else if (msg.type() === 'error') {
        console.log('❌ [ERROR]:', text);
      } else {
        console.log('📝 [LOG]:', text);
      }
    });
    
    // Navegar a la página de login
    console.log('📍 Navegando a http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Página cargada\n');
    
    // Tomar screenshot inicial
    await page.screenshot({ path: 'login-inicial-puppeteer.png' });
    
    // Verificar estado del botón
    const buttonDisabled = await page.$eval('button[type="submit"]', btn => btn.disabled);
    console.log('🔘 Estado inicial del botón:', buttonDisabled ? 'DESHABILITADO' : 'HABILITADO');
    
    // Llenar formulario
    console.log('\n📝 Llenando formulario...');
    await page.type('input[type="email"]', 'eeecucondor@gmail.com');
    await page.type('input[type="password"]', 'test123');
    
    // Verificar estado después de llenar
    const buttonDisabledAfter = await page.$eval('button[type="submit"]', btn => btn.disabled);
    console.log('🔘 Estado después de llenar:', buttonDisabledAfter ? 'DESHABILITADO' : 'HABILITADO');
    
    if (buttonDisabledAfter) {
      console.log('⚠️  Habilitando botón forzadamente...');
      await page.evaluate(() => {
        document.querySelector('button[type="submit"]').disabled = false;
      });
    }
    
    // Hacer clic
    console.log('\n🖱️ Haciendo clic en login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);
    
    // Verificar resultado
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('\n📍 URL actual:', currentUrl);
    
    if (currentUrl.includes('localhost:3003')) {
      console.log('✅ ¡LOGIN EXITOSO!');
    } else {
      console.log('❌ Login no completado');
      
      // Buscar errores
      const errors = await page.$$eval('.text-red-600', elements => 
        elements.map(el => el.textContent)
      );
      if (errors.length > 0) {
        console.log('\nErrores encontrados:', errors);
      }
    }
    
    // Mantener abierto
    console.log('\n💡 Navegador abierto para inspección. Ciérralo manualmente.');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n❌ Puppeteer no está instalado o hubo un error');
    console.log('Instálalo con: npm install --save-dev puppeteer');
  }
}

// Verificar si Puppeteer está instalado
try {
  require.resolve('puppeteer');
  testLogin();
} catch (e) {
  console.log('❌ Puppeteer no está instalado\n');
  console.log('Instálalo con:');
  console.log('  npm install --save-dev puppeteer');
}