// @ts-check
const { test, expect } = require('@playwright/test');

// Configuración de cuentas de prueba
const testAccounts = [
  {
    role: 'PATIENT',
    email: 'paciente@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3003',
    displayName: 'Ana María García'
  },
  {
    role: 'DOCTOR', 
    email: 'doctor@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3002',
    displayName: 'Dr. Juan Carlos Rodríguez'
  },
  {
    role: 'COMPANY',
    email: 'empresa@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3004',
    displayName: 'Hospital San Carlos'
  },
  {
    role: 'ADMIN',
    email: 'admin@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3005',
    displayName: 'Eduardo Marques (Admin)'
  }
];

// Aumentar timeout global para dar tiempo a cargar
test.setTimeout(120000); // 2 minutos por test

test.describe('🔐 Pruebas Manuales de Autenticación SSO', () => {
  
  test('Prueba interactiva de todas las cuentas', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('🔐 INICIANDO PRUEBAS DE AUTENTICACIÓN');
    console.log('========================================\n');
    
    // Configurar la página para no cerrar automáticamente
    page.setDefaultTimeout(30000); // 30 segundos para cada acción
    
    for (const account of testAccounts) {
      console.log(`\n📋 PROBANDO ${account.role}: ${account.email}`);
      console.log('----------------------------------------');
      
      try {
        // 1. Navegar a login con tiempo suficiente
        console.log('⏳ Navegando a http://localhost:3000/login...');
        await page.goto('http://localhost:3000/login', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // 2. Esperar que la página esté completamente cargada
        console.log('⏳ Esperando que la página cargue completamente...');
        await page.waitForTimeout(3000);
        
        // 3. Verificar que estamos en login
        const title = await page.title();
        console.log(`📄 Título de página: ${title}`);
        
        // 4. Buscar campos de formulario
        console.log('🔍 Buscando campos del formulario...');
        
        // Intentar diferentes selectores para email
        let emailFilled = false;
        const emailSelectors = [
          'input[type="email"]',
          'input[name="email"]',
          '#email',
          'input[placeholder*="email" i]',
          'input[placeholder*="correo" i]',
          'input[id*="email" i]'
        ];
        
        for (const selector of emailSelectors) {
          try {
            const emailInput = await page.locator(selector).first();
            if (await emailInput.isVisible()) {
              await emailInput.clear();
              await emailInput.fill(account.email);
              emailFilled = true;
              console.log(`✅ Email ingresado usando selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continuar con siguiente selector
          }
        }
        
        if (!emailFilled) {
          console.log('❌ No se pudo encontrar campo de email');
        }
        
        // Intentar diferentes selectores para password
        let passwordFilled = false;
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
          '#password',
          'input[placeholder*="password" i]',
          'input[placeholder*="contraseña" i]',
          'input[id*="password" i]'
        ];
        
        for (const selector of passwordSelectors) {
          try {
            const passInput = await page.locator(selector).first();
            if (await passInput.isVisible()) {
              await passInput.clear();
              await passInput.fill(account.password);
              passwordFilled = true;
              console.log(`✅ Password ingresado usando selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continuar con siguiente selector
          }
        }
        
        if (!passwordFilled) {
          console.log('❌ No se pudo encontrar campo de password');
        }
        
        // 5. Esperar un momento antes de hacer click
        await page.waitForTimeout(1000);
        
        // 6. Buscar y hacer click en botón de submit
        console.log('🔍 Buscando botón de submit...');
        let clicked = false;
        const buttonSelectors = [
          'button[type="submit"]',
          'button:text("Login")',
          'button:text("Iniciar")',
          'button:text("Ingresar")',
          'button:text("Entrar")',
          'input[type="submit"]'
        ];
        
        for (const selector of buttonSelectors) {
          try {
            const button = await page.locator(selector).first();
            if (await button.isVisible()) {
              await button.click();
              clicked = true;
              console.log(`✅ Click en botón usando selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continuar con siguiente selector
          }
        }
        
        if (!clicked) {
          // Intentar hacer click en cualquier botón visible
          const allButtons = await page.locator('button:visible').all();
          for (const btn of allButtons) {
            const text = await btn.textContent();
            if (text && (text.toLowerCase().includes('login') || 
                        text.toLowerCase().includes('iniciar') ||
                        text.toLowerCase().includes('entrar'))) {
              await btn.click();
              clicked = true;
              console.log(`✅ Click en botón con texto: ${text}`);
              break;
            }
          }
        }
        
        if (!clicked) {
          console.log('❌ No se pudo hacer click en botón de login');
        }
        
        // 7. Esperar respuesta con tiempo suficiente
        console.log('⏳ Esperando respuesta del servidor (10 segundos)...');
        await page.waitForTimeout(10000);
        
        // 8. Verificar URL actual
        const currentUrl = page.url();
        console.log(`\n📍 URL actual: ${currentUrl}`);
        
        // 9. Analizar resultado
        if (currentUrl.startsWith(account.expectedRedirect)) {
          console.log(`✅ ÉXITO: Redirección correcta al portal de ${account.role}`);
        } else if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
          console.log(`✅ ÉXITO: Usuario autenticado correctamente`);
        } else if (currentUrl.includes('/login')) {
          console.log(`⚠️ ADVERTENCIA: Aún en página de login`);
          
          // Buscar mensajes de error
          const errorMessages = await page.locator('.error, .alert, [role="alert"], .text-red-500').allTextContents();
          if (errorMessages.length > 0) {
            console.log('Mensajes de error encontrados:', errorMessages);
          }
        } else {
          console.log(`ℹ️ URL diferente a la esperada`);
        }
        
        // 10. Verificar cookies httpOnly
        console.log('\n🍪 Verificando cookies de sesión...');
        const cookies = await context.cookies();
        const authCookies = cookies.filter(c => 
          c.name.toLowerCase().includes('auth') || 
          c.name.toLowerCase().includes('session') || 
          c.name.toLowerCase().includes('token') ||
          c.name.toLowerCase().includes('jwt')
        );
        
        if (authCookies.length > 0) {
          console.log(`✅ Encontradas ${authCookies.length} cookies de autenticación:`);
          authCookies.forEach(cookie => {
            console.log(`   - ${cookie.name}:`);
            console.log(`     • HttpOnly: ${cookie.httpOnly ? '✅' : '❌'} ${cookie.httpOnly ? '(Seguro)' : '(INSEGURO!)'}`);
            console.log(`     • Secure: ${cookie.secure ? '✅' : '⚠️'} ${cookie.secure ? '(Solo HTTPS)' : '(Permite HTTP)'}`);
            console.log(`     • SameSite: ${cookie.sameSite || 'None'}`);
            console.log(`     • Domain: ${cookie.domain}`);
            console.log(`     • Path: ${cookie.path}`);
          });
        } else {
          console.log('❌ No se encontraron cookies de autenticación');
        }
        
        // 11. Tomar screenshot
        const screenshotPath = `test-auth-${account.role.toLowerCase()}-${Date.now()}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`📸 Screenshot guardado: ${screenshotPath}`);
        
        // 12. Intentar logout antes de probar siguiente cuenta
        console.log('\n🚪 Intentando cerrar sesión...');
        try {
          // Intentar diferentes formas de logout
          const logoutSelectors = [
            'button:text("Logout")',
            'button:text("Cerrar sesión")',
            'button:text("Salir")',
            'a:text("Logout")',
            'a:text("Cerrar sesión")',
            '[aria-label*="logout" i]'
          ];
          
          let loggedOut = false;
          for (const selector of logoutSelectors) {
            try {
              const logoutBtn = await page.locator(selector).first();
              if (await logoutBtn.isVisible({ timeout: 2000 })) {
                await logoutBtn.click();
                loggedOut = true;
                console.log('✅ Sesión cerrada');
                await page.waitForTimeout(2000);
                break;
              }
            } catch {
              // Continuar
            }
          }
          
          if (!loggedOut) {
            // Intentar ir directamente a /logout
            await page.goto('http://localhost:3000/logout', { waitUntil: 'domcontentloaded' }).catch(() => {});
          }
        } catch {
          console.log('ℹ️ No se pudo cerrar sesión');
        }
        
        // Limpiar cookies para siguiente prueba
        await context.clearCookies();
        
      } catch (error) {
        console.log(`❌ ERROR en prueba de ${account.role}:`, error.message);
      }
      
      console.log('\n' + '='.repeat(50));
      
      // Pausa entre pruebas
      await page.waitForTimeout(2000);
    }
    
    console.log('\n✅ PRUEBAS COMPLETADAS');
    console.log('\n📊 RESUMEN DE SEGURIDAD:');
    console.log('• Las cookies de autenticación DEBEN ser HttpOnly ✅');
    console.log('• Las cookies DEBEN tener flag Secure para producción ✅');
    console.log('• NO usar localStorage para tokens de autenticación ❌');
    console.log('• Usar SameSite=Strict o Lax para prevenir CSRF ✅');
  });
});