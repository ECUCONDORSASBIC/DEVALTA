/**
 * Script simple para probar autenticación con las 4 cuentas
 * Ejecutar con: node test-auth-simple.js
 */

const puppeteer = require('puppeteer');

// Configuración de cuentas
const accounts = [
  { role: 'PATIENT', email: 'paciente@test.com', password: '12345678', expectedPort: 3003 },
  { role: 'DOCTOR', email: 'doctor@test.com', password: '12345678', expectedPort: 3002 },
  { role: 'COMPANY', email: 'empresa@test.com', password: '12345678', expectedPort: 3004 },
  { role: 'ADMIN', email: 'admin@test.com', password: '12345678', expectedPort: 3005 }
];

// Función para esperar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función principal de prueba
async function testAuthentication() {
  console.log('🔐 INICIANDO PRUEBAS DE AUTENTICACIÓN SSO\n');
  console.log('=' .repeat(50));
  
  // Lanzar navegador
  const browser = await puppeteer.launch({
    headless: false, // Ver el navegador
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const account of accounts) {
    console.log(`\n📋 Probando ${account.role}: ${account.email}`);
    console.log('-'.repeat(40));
    
    const page = await browser.newPage();
    
    try {
      // 1. Navegar a la página de login
      console.log('  1. Navegando a http://localhost:3000/login');
      await page.goto('http://localhost:3000/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // 2. Esperar que cargue el formulario
      await wait(2000);
      
      // 3. Buscar y llenar el campo de email
      console.log(`  2. Ingresando email: ${account.email}`);
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        '#email',
        'input[placeholder*="email" i]',
        'input[placeholder*="correo" i]'
      ];
      
      for (const selector of emailSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 1000 });
          await page.type(selector, account.email);
          break;
        } catch (e) {
          // Intentar siguiente selector
        }
      }
      
      // 4. Buscar y llenar el campo de password
      console.log('  3. Ingresando contraseña');
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        '#password',
        'input[placeholder*="password" i]',
        'input[placeholder*="contraseña" i]'
      ];
      
      for (const selector of passwordSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 1000 });
          await page.type(selector, account.password);
          break;
        } catch (e) {
          // Intentar siguiente selector
        }
      }
      
      // 5. Hacer click en el botón de login
      console.log('  4. Haciendo click en botón de login');
      const buttonSelectors = [
        'button[type="submit"]',
        'button:contains("Iniciar")',
        'button:contains("Login")',
        'button:contains("Ingresar")',
        'button:contains("Entrar")'
      ];
      
      let clicked = false;
      for (const selector of buttonSelectors) {
        try {
          await page.click(selector);
          clicked = true;
          break;
        } catch (e) {
          // Intentar siguiente selector
        }
      }
      
      if (!clicked) {
        // Buscar cualquier botón visible
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            const text = btn.textContent.toLowerCase();
            if (text.includes('login') || text.includes('iniciar') || 
                text.includes('entrar') || text.includes('ingresar')) {
              btn.click();
              return;
            }
          }
        });
      }
      
      // 6. Esperar respuesta de autenticación
      console.log('  5. Esperando respuesta de autenticación...');
      await wait(5000);
      
      // 7. Verificar URL actual
      const currentUrl = page.url();
      console.log(`  6. URL actual: ${currentUrl}`);
      
      // 8. Analizar resultado
      if (currentUrl.includes(`localhost:${account.expectedPort}`)) {
        console.log(`  ✅ ÉXITO: Redirección correcta al portal de ${account.role}`);
      } else if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
        console.log(`  ✅ ÉXITO: Usuario autenticado (en ${currentUrl})`);
      } else if (currentUrl.includes('/login')) {
        console.log(`  ❌ ERROR: Aún en página de login. Posible fallo de autenticación`);
      } else {
        console.log(`  ⚠️ ADVERTENCIA: URL no esperada: ${currentUrl}`);
      }
      
      // 9. Verificar si hay token de autenticación
      const hasAuth = await page.evaluate(() => {
        return !!(
          localStorage.getItem('authToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('user') ||
          sessionStorage.getItem('authToken') ||
          sessionStorage.getItem('token')
        );
      });
      
      if (hasAuth) {
        console.log('  ✅ Token de autenticación encontrado en storage');
      } else {
        console.log('  ⚠️ No se encontró token de autenticación');
      }
      
      // 10. Tomar screenshot
      await page.screenshot({ 
        path: `auth-test-${account.role.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`  📸 Screenshot guardado: auth-test-${account.role.toLowerCase()}.png`);
      
    } catch (error) {
      console.log(`  ❌ ERROR en prueba de ${account.role}:`, error.message);
    } finally {
      await page.close();
    }
  }
  
  // Cerrar navegador
  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ PRUEBAS DE AUTENTICACIÓN COMPLETADAS');
  console.log('\nResumen de URLs esperadas:');
  console.log('  PATIENT  → http://localhost:3003');
  console.log('  DOCTOR   → http://localhost:3002');
  console.log('  COMPANY  → http://localhost:3004');
  console.log('  ADMIN    → http://localhost:3005');
}

// Verificar si puppeteer está instalado
try {
  require.resolve('puppeteer');
  // Ejecutar pruebas
  testAuthentication().catch(console.error);
} catch(e) {
  console.log('❌ Puppeteer no está instalado.');
  console.log('Instalando puppeteer...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ Puppeteer instalado. Ejecuta el script nuevamente.');
}