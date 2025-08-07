// Script de Playwright para automatizar y diagnosticar el login
const { chromium } = require('playwright');

async function testLogin() {
  console.log('🚀 Iniciando test de login con Playwright...\n');
  
  // Lanzar navegador
  const browser = await chromium.launch({ 
    headless: false, // Mostrar el navegador para ver qué pasa
    devtools: true   // Abrir DevTools automáticamente
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Escuchar logs de consola
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    // Colorear según el tipo
    if (type === 'error') {
      console.log('❌ [CONSOLE ERROR]:', text);
    } else if (text.includes('AuthContext')) {
      console.log('🔐 [AUTH]:', text);
    } else if (text.includes('Firebase')) {
      console.log('🔥 [FIREBASE]:', text);
    } else if (type === 'warning') {
      console.log('⚠️  [WARNING]:', text);
    } else {
      console.log('📝 [CONSOLE]:', text);
    }
  });
  
  // Escuchar errores de página
  page.on('pageerror', error => {
    console.log('💥 [PAGE ERROR]:', error.message);
  });
  
  // Escuchar solicitudes de red
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('auth')) {
      console.log('📡 [REQUEST]:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('auth')) {
      console.log('📨 [RESPONSE]:', response.status(), response.url());
    }
  });
  
  try {
    console.log('📍 Navegando a http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Página cargada\n');
    
    // Esperar a que el formulario esté visible
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // Verificar estado inicial del botón
    const buttonDisabledInitial = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn ? btn.disabled : null;
    });
    console.log('🔘 Estado inicial del botón:', buttonDisabledInitial ? 'DESHABILITADO' : 'HABILITADO');
    
    // Tomar screenshot inicial
    await page.screenshot({ path: 'login-initial.png' });
    console.log('📸 Screenshot inicial guardado: login-initial.png\n');
    
    // Llenar el formulario
    console.log('📝 Llenando formulario...');
    await page.fill('input[type="email"]', 'eeecucondor@gmail.com');
    console.log('   ✓ Email ingresado');
    
    await page.fill('input[type="password"]', 'test123');
    console.log('   ✓ Password ingresado\n');
    
    // Verificar estado del botón después de llenar
    const buttonDisabledAfter = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn ? btn.disabled : null;
    });
    console.log('🔘 Estado del botón después de llenar:', buttonDisabledAfter ? 'DESHABILITADO' : 'HABILITADO');
    
    // Si el botón sigue deshabilitado, intentar habilitarlo
    if (buttonDisabledAfter) {
      console.log('⚠️  Botón sigue deshabilitado. Intentando habilitar...');
      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.disabled = false;
      });
      console.log('✅ Botón habilitado forzadamente\n');
    }
    
    // Tomar screenshot antes de hacer clic
    await page.screenshot({ path: 'login-filled.png' });
    console.log('📸 Screenshot con formulario lleno: login-filled.png\n');
    
    // Obtener información del Login Debugger si existe
    const debugInfo = await page.evaluate(() => {
      const debugDiv = document.querySelector('.fixed.bottom-4.right-4');
      if (debugDiv) {
        const text = debugDiv.innerText;
        return text;
      }
      return null;
    });
    
    if (debugInfo) {
      console.log('🐛 Login Debugger Info:');
      console.log(debugInfo);
      console.log('');
    }
    
    // Hacer clic en el botón
    console.log('🖱️ Haciendo clic en el botón de login...');
    
    // Preparar para capturar la navegación
    const navigationPromise = page.waitForNavigation({ 
      waitUntil: 'networkidle',
      timeout: 10000 
    }).catch(() => null);
    
    await page.click('button[type="submit"]');
    console.log('✅ Clic realizado\n');
    
    // Esperar un poco para ver cambios
    await page.waitForTimeout(2000);
    
    // Verificar si hubo navegación
    const navigation = await navigationPromise;
    if (navigation) {
      console.log('🔄 Navegación detectada a:', page.url());
    } else {
      console.log('⚠️  No se detectó navegación');
      console.log('📍 URL actual:', page.url());
    }
    
    // Verificar el contenido del botón
    const buttonContent = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn ? btn.innerText : null;
    });
    console.log('🔘 Texto del botón:', buttonContent);
    
    // Buscar mensajes de error
    const errorMessages = await page.evaluate(() => {
      const errors = document.querySelectorAll('.text-red-600, .error, [role="alert"]');
      return Array.from(errors).map(el => el.innerText);
    });
    
    if (errorMessages.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errorMessages.forEach(err => console.log('  -', err));
    }
    
    // Tomar screenshot final
    await page.screenshot({ path: 'login-final.png' });
    console.log('\n📸 Screenshot final guardado: login-final.png');
    
    // Esperar un poco más para ver si hay redirección tardía
    console.log('\n⏳ Esperando 5 segundos por si hay redirección tardía...');
    await page.waitForTimeout(5000);
    
    console.log('📍 URL final:', page.url());
    
    // Si llegamos a la página de pacientes, es éxito
    if (page.url().includes('localhost:3003')) {
      console.log('\n✅ ¡LOGIN EXITOSO! Redirigido a la app de pacientes');
    } else {
      console.log('\n❌ Login no completado. Permanece en:', page.url());
      
      // Intentar obtener más información del estado
      const authState = await page.evaluate(() => {
        // Intentar acceder al estado de React si es posible
        const root = document.getElementById('root');
        if (root && root._reactRootContainer) {
          return 'React app detectada';
        }
        return 'Estado desconocido';
      });
      console.log('🔍 Estado de la aplicación:', authState);
    }
    
  } catch (error) {
    console.error('\n💥 Error durante el test:', error.message);
  } finally {
    // Mantener el navegador abierto para inspección
    console.log('\n💡 Navegador mantenido abierto para inspección manual');
    console.log('💡 Cierra el navegador manualmente cuando termines');
    
    // Descomentar para cerrar automáticamente
    // await browser.close();
  }
}

// Verificar si Playwright está instalado
try {
  require.resolve('playwright');
  testLogin();
} catch (e) {
  console.log('❌ Playwright no está instalado\n');
  console.log('Instálalo con uno de estos comandos:');
  console.log('  npm install --save-dev playwright');
  console.log('  npm install --save-dev @playwright/test');
  console.log('\nO usa el instalador global:');
  console.log('  npm install -g playwright');
  console.log('  npx playwright install chromium');
}