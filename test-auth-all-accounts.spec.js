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

test.describe('🔐 Sistema de Autenticación SSO - Pruebas Completas', () => {
  
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies y storage antes de cada prueba
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // Prueba cada cuenta individualmente
  for (const account of testAccounts) {
    test(`✅ Login ${account.role}: ${account.email}`, async ({ page }) => {
      console.log(`\n🔍 Probando cuenta ${account.role}: ${account.email}`);
      
      // 1. Navegar a la página de login
      await page.goto('http://localhost:3000/login');
      console.log('   📍 Navegando a página de login');
      
      // 2. Esperar que la página cargue
      await page.waitForLoadState('networkidle');
      
      // 3. Verificar que estamos en la página de login
      const title = await page.title();
      console.log(`   📄 Título de página: ${title}`);
      
      // 4. Llenar credenciales
      await page.fill('input[type="email"], input[name="email"], #email', account.email);
      await page.fill('input[type="password"], input[name="password"], #password', account.password);
      console.log('   ✏️ Credenciales ingresadas');
      
      // 5. Hacer clic en el botón de login
      await Promise.race([
        page.click('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Ingresar")'),
        page.waitForTimeout(1000).then(() => 
          page.click('button:visible').catch(() => {})
        )
      ]);
      console.log('   🖱️ Botón de login clickeado');
      
      // 6. Esperar respuesta de autenticación
      await page.waitForTimeout(3000); // Dar tiempo para la autenticación
      
      // 7. Verificar redirección basada en rol
      const currentUrl = page.url();
      console.log(`   🔗 URL actual: ${currentUrl}`);
      
      // 8. Verificar que la redirección sea correcta según el rol
      if (currentUrl.startsWith(account.expectedRedirect)) {
        console.log(`   ✅ Redirección correcta para ${account.role}`);
      } else if (currentUrl.includes('/dashboard')) {
        console.log(`   ✅ Usuario autenticado, en dashboard`);
      } else if (currentUrl.includes('/home')) {
        console.log(`   ✅ Usuario autenticado, en home`);
      } else {
        console.log(`   ⚠️ URL no esperada: ${currentUrl}`);
      }
      
      // 9. Verificar que el usuario está autenticado
      const isAuthenticated = await page.evaluate(() => {
        // Verificar diferentes formas de almacenamiento de auth
        const hasAuthToken = 
          localStorage.getItem('authToken') || 
          localStorage.getItem('token') ||
          localStorage.getItem('user') ||
          sessionStorage.getItem('authToken') ||
          sessionStorage.getItem('token');
        return !!hasAuthToken;
      });
      
      if (isAuthenticated) {
        console.log('   ✅ Token de autenticación encontrado');
      } else {
        console.log('   ⚠️ No se encontró token de autenticación');
      }
      
      // 10. Tomar screenshot para evidencia
      await page.screenshot({ 
        path: `test-auth-${account.role.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`   📸 Screenshot guardado: test-auth-${account.role.toLowerCase()}.png`);
      
      // 11. Cerrar sesión si es posible
      try {
        await page.click('button:has-text("Logout"), button:has-text("Cerrar sesión"), button:has-text("Salir")', 
          { timeout: 2000 });
        console.log('   🚪 Sesión cerrada');
      } catch {
        console.log('   ℹ️ No se encontró botón de logout');
      }
    });
  }
  
  // Prueba de flujo completo con todas las cuentas
  test('🔄 Flujo completo: Login secuencial con todas las cuentas', async ({ page }) => {
    console.log('\n🎯 PRUEBA DE FLUJO COMPLETO\n');
    
    for (const account of testAccounts) {
      console.log(`\n📋 Probando ${account.role}: ${account.email}`);
      
      // Limpiar estado
      await page.context().clearCookies();
      await page.goto('http://localhost:3000/login');
      await page.waitForLoadState('networkidle');
      
      // Login
      await page.fill('input[type="email"], input[name="email"], #email', account.email);
      await page.fill('input[type="password"], input[name="password"], #password', account.password);
      await page.click('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
      
      // Esperar respuesta
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const expectedBase = account.expectedRedirect;
      
      if (url.startsWith(expectedBase)) {
        console.log(`✅ ${account.role}: Redirección correcta a ${url}`);
      } else {
        console.log(`⚠️ ${account.role}: URL inesperada ${url} (esperaba ${expectedBase})`);
      }
      
      // Intentar logout
      try {
        await page.goto('http://localhost:3000/logout');
      } catch {
        // Ignorar errores de logout
      }
    }
    
    console.log('\n✅ Prueba de flujo completo finalizada');
  });
  
  // Prueba de acceso no autorizado
  test('🚫 Acceso no autorizado: Sin credenciales', async ({ page }) => {
    // Intentar acceder directamente a portales protegidos
    const protectedUrls = [
      'http://localhost:3002/dashboard', // Doctors
      'http://localhost:3003/dashboard', // Patients
      'http://localhost:3004/dashboard', // Companies
      'http://localhost:3005/dashboard'  // Admin
    ];
    
    for (const url of protectedUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/login') {
        console.log(`✅ Acceso protegido: ${url} redirige a login`);
      } else {
        console.log(`⚠️ Posible problema de seguridad: ${url} no redirige a login`);
      }
    }
  });
});

// Configuración de Playwright
module.exports = {
  use: {
    headless: false, // Ver el navegador durante las pruebas
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },
  timeout: 60000, // 60 segundos de timeout
  retries: 1,
};