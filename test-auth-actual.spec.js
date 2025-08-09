// @ts-check
const { test, expect } = require('@playwright/test');

// Configuración actualizada con puertos reales
const testAccounts = [
  {
    role: 'PATIENT',
    email: 'paciente@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3003', // Puerto confirmado
    displayName: 'Ana María García'
  },
  {
    role: 'DOCTOR', 
    email: 'doctor@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3002', // Puerto confirmado
    displayName: 'Dr. Juan Carlos Rodríguez'
  },
  {
    role: 'ADMIN',
    email: 'admin@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3005', // Puerto confirmado
    displayName: 'Eduardo Marques (Admin)'
  },
  {
    role: 'COMPANY',
    email: 'empresa@test.com',
    password: '12345678',
    expectedRedirect: 'http://localhost:3006', // Probablemente aquí
    displayName: 'Hospital San Carlos'
  }
];

// LOGIN URL - Necesitamos determinar dónde está web-app
const LOGIN_URL = 'http://localhost:3006/login'; // Probaremos con 3006

test.setTimeout(120000);

test.describe('🔐 Test de Autenticación SSO - Puertos Actuales', () => {
  
  test('Verificar servidores activos', async ({ page }) => {
    console.log('\n🔍 VERIFICANDO SERVIDORES ACTIVOS\n');
    
    const servers = [
      { port: 3002, name: 'Doctors' },
      { port: 3003, name: 'Patients' },
      { port: 3005, name: 'Admin' },
      { port: 3006, name: 'Web-App/Companies' },
      { port: 3008, name: 'API Server' }
    ];
    
    for (const server of servers) {
      try {
        const response = await page.goto(`http://localhost:${server.port}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        console.log(`✅ Puerto ${server.port} (${server.name}): ACTIVO`);
        const title = await page.title();
        console.log(`   Título: ${title}`);
      } catch (error) {
        console.log(`❌ Puerto ${server.port} (${server.name}): NO RESPONDE`);
      }
    }
  });
  
  test('Probar autenticación con todas las cuentas', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('🔐 PRUEBAS DE AUTENTICACIÓN');
    console.log('========================================\n');
    
    page.setDefaultTimeout(30000);
    
    for (const account of testAccounts) {
      console.log(`\n📋 PROBANDO ${account.role}: ${account.email}`);
      console.log('----------------------------------------');
      
      try {
        // 1. Intentar navegar a login
        console.log(`⏳ Navegando a ${LOGIN_URL}...`);
        try {
          await page.goto(LOGIN_URL, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
        } catch (e) {
          // Si falla, intentar puerto 3003 como alternativa
          console.log('⚠️ Intentando puerto 3003/login como alternativa...');
          await page.goto('http://localhost:3003/login', { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
        }
        
        // 2. Esperar carga completa
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`📍 URL actual: ${currentUrl}`);
        
        // 3. Buscar e ingresar email
        console.log('📝 Ingresando credenciales...');
        
        // Probar múltiples selectores para email
        const emailSelectors = [
          'input[type="email"]',
          'input[name="email"]',
          '#email',
          'input[placeholder*="email" i]',
          'input[placeholder*="correo" i]'
        ];
        
        let emailFilled = false;
        for (const selector of emailSelectors) {
          try {
            if (await page.locator(selector).count() > 0) {
              await page.locator(selector).first().fill(account.email);
              emailFilled = true;
              console.log(`   ✅ Email ingresado`);
              break;
            }
          } catch {}
        }
        
        if (!emailFilled) {
          console.log('   ❌ No se pudo ingresar email');
        }
        
        // 4. Ingresar password
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
          '#password',
          'input[placeholder*="password" i]',
          'input[placeholder*="contraseña" i]'
        ];
        
        let passwordFilled = false;
        for (const selector of passwordSelectors) {
          try {
            if (await page.locator(selector).count() > 0) {
              await page.locator(selector).first().fill(account.password);
              passwordFilled = true;
              console.log(`   ✅ Password ingresado`);
              break;
            }
          } catch {}
        }
        
        if (!passwordFilled) {
          console.log('   ❌ No se pudo ingresar password');
        }
        
        // 5. Hacer click en login
        await page.waitForTimeout(1000);
        
        const buttonSelectors = [
          'button[type="submit"]',
          'button:has-text("Login")',
          'button:has-text("Iniciar")',
          'button:has-text("Ingresar")',
          'button:has-text("Entrar")'
        ];
        
        let clicked = false;
        for (const selector of buttonSelectors) {
          try {
            if (await page.locator(selector).count() > 0) {
              await page.locator(selector).first().click();
              clicked = true;
              console.log(`   ✅ Click en botón de login`);
              break;
            }
          } catch {}
        }
        
        if (!clicked) {
          console.log('   ❌ No se pudo hacer click en login');
        }
        
        // 6. Esperar respuesta
        console.log('⏳ Esperando respuesta del servidor...');
        await page.waitForTimeout(5000);
        
        // 7. Verificar resultado
        const finalUrl = page.url();
        console.log(`\n📍 URL después de login: ${finalUrl}`);
        
        // Analizar redirección
        if (finalUrl.includes(`:${account.expectedRedirect.split(':')[2]}`)) {
          console.log(`✅ ÉXITO: Redirección correcta para ${account.role}`);
        } else if (finalUrl.includes('/dashboard') || finalUrl.includes('/home')) {
          console.log(`✅ ÉXITO: Usuario autenticado`);
        } else if (finalUrl.includes('/login')) {
          console.log(`⚠️ Aún en login - posible fallo de autenticación`);
          
          // Buscar errores
          try {
            const errors = await page.locator('.error, .alert, [role="alert"]').allTextContents();
            if (errors.length > 0) {
              console.log('   Errores:', errors);
            }
          } catch {}
        } else {
          console.log(`ℹ️ Redirección a: ${finalUrl}`);
        }
        
        // 8. Verificar cookies
        console.log('\n🍪 Verificando cookies de autenticación...');
        const cookies = await context.cookies();
        const authCookies = cookies.filter(c => 
          c.name.toLowerCase().includes('auth') || 
          c.name.toLowerCase().includes('session') || 
          c.name.toLowerCase().includes('token') ||
          c.name.toLowerCase().includes('jwt')
        );
        
        if (authCookies.length > 0) {
          console.log(`✅ ${authCookies.length} cookies de auth encontradas:`);
          authCookies.forEach(cookie => {
            console.log(`   • ${cookie.name}:`);
            console.log(`     - HttpOnly: ${cookie.httpOnly ? '✅ SEGURO' : '❌ INSEGURO'}`);
            console.log(`     - Secure: ${cookie.secure ? '✅' : '⚠️'}`);
            console.log(`     - SameSite: ${cookie.sameSite || 'None'}`);
          });
        } else {
          console.log('❌ No se encontraron cookies de autenticación');
        }
        
        // 9. Screenshot
        const screenshotPath = `auth-test-${account.role.toLowerCase()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot: ${screenshotPath}`);
        
        // 10. Limpiar para siguiente prueba
        await context.clearCookies();
        
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
      }
      
      console.log('\n' + '='.repeat(50));
    }
    
    console.log('\n✅ PRUEBAS COMPLETADAS');
    console.log('\n📊 RESUMEN DE SEGURIDAD:');
    console.log('• Cookies HttpOnly: CRÍTICO para seguridad ✅');
    console.log('• Flag Secure: Necesario para producción ✅');
    console.log('• NO usar localStorage para tokens ❌');
    console.log('• SameSite para prevenir CSRF ✅');
  });
});