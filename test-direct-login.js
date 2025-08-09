// Script simple para probar login directamente
const { chromium } = require('@playwright/test');

async function testLogin() {
  console.log('🔐 TEST DE LOGIN DIRECTO\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Hacer las acciones más lentas para ver qué pasa
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Cuentas a probar
  const accounts = [
    { role: 'DOCTOR', email: 'doctor@test.com', password: '12345678', port: 3002 },
    { role: 'PATIENT', email: 'paciente@test.com', password: '12345678', port: 3003 },
  ];
  
  for (const account of accounts) {
    console.log(`\n📋 Probando ${account.role} en puerto ${account.port}`);
    console.log('=' .repeat(40));
    
    try {
      // Ir directamente al puerto donde está la app
      const url = `http://localhost:${account.port}`;
      console.log(`Navegando a ${url}...`);
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`URL actual: ${currentUrl}`);
      
      // Si ya hay una página de login, usarla
      if (currentUrl.includes('/login')) {
        console.log('✅ Ya en página de login');
      } else {
        // Buscar botón de login
        console.log('Buscando botón de login...');
        const loginButtons = [
          'a:has-text("Login")',
          'button:has-text("Login")',
          'a:has-text("Iniciar")',
          'button:has-text("Iniciar")',
          'a[href*="login"]'
        ];
        
        for (const selector of loginButtons) {
          try {
            if (await page.locator(selector).count() > 0) {
              await page.click(selector);
              console.log('Click en botón de login');
              await page.waitForTimeout(2000);
              break;
            }
          } catch {}
        }
      }
      
      // Intentar login
      console.log('Ingresando credenciales...');
      
      // Email
      const emailInputs = await page.locator('input[type="email"], input[name="email"], #email').all();
      if (emailInputs.length > 0) {
        await emailInputs[0].fill(account.email);
        console.log('✅ Email ingresado');
      }
      
      // Password
      const passInputs = await page.locator('input[type="password"], input[name="password"], #password').all();
      if (passInputs.length > 0) {
        await passInputs[0].fill(account.password);
        console.log('✅ Password ingresado');
      }
      
      // Submit
      const submitBtns = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")').all();
      if (submitBtns.length > 0) {
        await submitBtns[0].click();
        console.log('✅ Formulario enviado');
      }
      
      // Esperar respuesta
      console.log('Esperando respuesta...');
      await page.waitForTimeout(5000);
      
      // Verificar resultado
      const finalUrl = page.url();
      console.log(`\nURL final: ${finalUrl}`);
      
      if (!finalUrl.includes('/login')) {
        console.log('✅ LOGIN EXITOSO - Redirigido fuera de login');
      } else {
        console.log('⚠️ Aún en página de login');
      }
      
      // Verificar cookies
      const cookies = await context.cookies();
      const authCookies = cookies.filter(c => 
        c.name.toLowerCase().includes('auth') || 
        c.name.toLowerCase().includes('token') ||
        c.name.toLowerCase().includes('session')
      );
      
      if (authCookies.length > 0) {
        console.log(`\n🍪 ${authCookies.length} cookies de auth encontradas:`);
        authCookies.forEach(c => {
          console.log(`  • ${c.name}: HttpOnly=${c.httpOnly}, Secure=${c.secure}`);
        });
      } else {
        console.log('\n❌ No hay cookies de autenticación');
      }
      
      // Screenshot
      await page.screenshot({ path: `login-${account.role.toLowerCase()}.png` });
      console.log(`📸 Screenshot: login-${account.role.toLowerCase()}.png`);
      
      // Limpiar cookies para siguiente prueba
      await context.clearCookies();
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n\nPresiona ENTER para cerrar el navegador...');
  await page.waitForTimeout(10000); // Esperar 10 segundos antes de cerrar
  
  await browser.close();
}

testLogin().catch(console.error);