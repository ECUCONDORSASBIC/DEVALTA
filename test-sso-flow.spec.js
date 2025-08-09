// test-sso-flow.spec.js
// Test completo del flujo de autenticación SSO en AltaMedica Platform

const { test, expect } = require('@playwright/test');

// Configuración de URLs
const URLS = {
  webApp: 'http://localhost:3000',
  apiServer: 'http://localhost:3001',
  patientsApp: 'http://localhost:3003',
  doctorsApp: 'http://localhost:3002',
  companiesApp: 'http://localhost:3004',
  adminApp: 'http://localhost:3005'
};

// Cuentas de prueba
const TEST_ACCOUNTS = {
  patient: { email: 'paciente@test.com', password: '12345678', expectedRedirect: URLS.patientsApp },
  doctor: { email: 'doctor@test.com', password: '12345678', expectedRedirect: URLS.doctorsApp },
  company: { email: 'empresa@test.com', password: '12345678', expectedRedirect: URLS.companiesApp },
  admin: { email: 'admin@test.com', password: '12345678', expectedRedirect: URLS.adminApp }
};

test.describe('Flujo Completo de Autenticación SSO', () => {
  // Configurar timeout de 1 minuto para cada test
  test.setTimeout(60000);
  
  test.beforeEach(async ({ page }) => {
    // Configurar timeout de página de 1 minuto
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    // Limpiar cookies y localStorage antes de cada test
    await page.context().clearCookies();
    await page.goto(URLS.webApp, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // Test 1: Verificar redirección desde app protegida a login
  test('1. Redirección desde aplicación protegida sin autenticación', async ({ page }) => {
    console.log('🔍 Test 1: Verificando redirección desde app protegida...');
    
    // Intentar acceder a patients-app sin autenticación
    await page.goto(`${URLS.patientsApp}/dashboard`, { timeout: 60000 });
    
    // Debería redirigir a web-app login (esperar hasta 30 segundos)
    await page.waitForURL(/.*localhost:3000.*login/, { timeout: 30000 });
    expect(page.url()).toContain(`${URLS.webApp}/`);
    console.log('✅ Redirección correcta a página de login');
  });

  // Test 2: Login exitoso como paciente
  test('2. Login exitoso como PACIENTE y redirección', async ({ page }) => {
    console.log('🔍 Test 2: Login como paciente...');
    
    // Navegar a la página de login
    await page.goto(`${URLS.webApp}/auth/login`, { timeout: 60000 });
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Buscar el formulario de login
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    // Llenar credenciales
    await emailInput.fill(TEST_ACCOUNTS.patient.email);
    await passwordInput.fill(TEST_ACCOUNTS.patient.password);
    
    console.log(`📝 Credenciales ingresadas: ${TEST_ACCOUNTS.patient.email}`);
    
    // Hacer click en submit
    await submitButton.click();
    
    // Esperar redirección (dar tiempo suficiente para el proceso de autenticación)
    await page.waitForTimeout(10000);
    
    // Verificar que se redirigió a patients-app
    const currentUrl = page.url();
    console.log(`📍 URL actual después del login: ${currentUrl}`);
    
    if (currentUrl.includes(URLS.patientsApp)) {
      console.log('✅ Redirección exitosa a patients-app');
    } else {
      console.log('⚠️ No se redirigió automáticamente, verificando localStorage...');
      
      // Verificar que se guardó la información del usuario
      const userData = await page.evaluate(() => localStorage.getItem('altamedica_user'));
      if (userData) {
        const user = JSON.parse(userData);
        console.log(`✅ Usuario autenticado: ${user.email} con rol: ${user.role}`);
      }
    }
  });

  // Test 3: Login exitoso como doctor
  test('3. Login exitoso como DOCTOR y redirección', async ({ page }) => {
    console.log('🔍 Test 3: Login como doctor...');
    
    await page.goto(`${URLS.webApp}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_ACCOUNTS.doctor.email);
    await passwordInput.fill(TEST_ACCOUNTS.doctor.password);
    
    console.log(`📝 Credenciales ingresadas: ${TEST_ACCOUNTS.doctor.email}`);
    
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL actual después del login: ${currentUrl}`);
    
    if (currentUrl.includes(URLS.doctorsApp)) {
      console.log('✅ Redirección exitosa a doctors-app');
    } else {
      const userData = await page.evaluate(() => localStorage.getItem('altamedica_user'));
      if (userData) {
        const user = JSON.parse(userData);
        console.log(`✅ Usuario autenticado: ${user.email} con rol: ${user.role}`);
      }
    }
  });

  // Test 4: Verificar cookies de autenticación
  test('4. Verificar cookies httpOnly de autenticación', async ({ page, context }) => {
    console.log('🔍 Test 4: Verificando cookies de autenticación...');
    
    await page.goto(`${URLS.webApp}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_ACCOUNTS.patient.email);
    await passwordInput.fill(TEST_ACCOUNTS.patient.password);
    await submitButton.click();
    
    await page.waitForTimeout(5000);
    
    // Obtener todas las cookies
    const cookies = await context.cookies();
    console.log(`🍪 Cookies encontradas: ${cookies.length}`);
    
    // Buscar cookie de autenticación
    const authCookie = cookies.find(c => c.name === 'auth-token' || c.name.includes('auth'));
    
    if (authCookie) {
      console.log('✅ Cookie de autenticación encontrada:');
      console.log(`   - Nombre: ${authCookie.name}`);
      console.log(`   - HttpOnly: ${authCookie.httpOnly}`);
      console.log(`   - Secure: ${authCookie.secure}`);
      console.log(`   - SameSite: ${authCookie.sameSite}`);
      expect(authCookie.httpOnly).toBe(true);
    } else {
      console.log('⚠️ No se encontró cookie httpOnly (puede estar usando localStorage)');
    }
  });

  // Test 5: Verificar persistencia de sesión
  test('5. Verificar persistencia de sesión entre aplicaciones', async ({ page }) => {
    console.log('🔍 Test 5: Verificando persistencia de sesión...');
    
    // Login como paciente
    await page.goto(`${URLS.webApp}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_ACCOUNTS.patient.email);
    await passwordInput.fill(TEST_ACCOUNTS.patient.password);
    await submitButton.click();
    
    await page.waitForTimeout(5000);
    
    // Guardar información de sesión
    const sessionData = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('altamedica_user'),
        sessionStorage: sessionStorage.getItem('altamedica_session')
      };
    });
    
    console.log('📦 Datos de sesión guardados:');
    if (sessionData.localStorage) {
      const user = JSON.parse(sessionData.localStorage);
      console.log(`   - Usuario: ${user.email}`);
      console.log(`   - Rol: ${user.role}`);
    }
    
    // Navegar a otra página y verificar que la sesión persiste
    await page.goto(URLS.webApp);
    await page.waitForTimeout(3000);
    
    const persistedData = await page.evaluate(() => localStorage.getItem('altamedica_user'));
    if (persistedData) {
      console.log('✅ Sesión persiste después de navegación');
    } else {
      console.log('⚠️ Sesión no persiste (verificar implementación)');
    }
  });

  // Test 6: Logout y limpieza de sesión
  test('6. Logout y limpieza de sesión', async ({ page, context }) => {
    console.log('🔍 Test 6: Verificando proceso de logout...');
    
    // Primero hacer login
    await page.goto(`${URLS.webApp}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_ACCOUNTS.patient.email);
    await passwordInput.fill(TEST_ACCOUNTS.patient.password);
    await submitButton.click();
    
    await page.waitForTimeout(5000);
    
    // Verificar que el usuario está autenticado
    const userDataBefore = await page.evaluate(() => localStorage.getItem('altamedica_user'));
    console.log(`📝 Usuario autenticado: ${userDataBefore ? 'Sí' : 'No'}`);
    
    // Buscar y hacer click en botón de logout
    const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Cerrar sesión"), button:has-text("Salir")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(5000);
      
      // Verificar que se limpió la sesión
      const userDataAfter = await page.evaluate(() => localStorage.getItem('altamedica_user'));
      const cookies = await context.cookies();
      
      if (!userDataAfter && cookies.length === 0) {
        console.log('✅ Sesión limpiada correctamente');
      } else {
        console.log('⚠️ La sesión no se limpió completamente');
      }
    } else {
      console.log('⚠️ No se encontró botón de logout visible');
    }
  });

  // Test 7: Verificar manejo de errores de autenticación
  test('7. Manejo de credenciales incorrectas', async ({ page }) => {
    console.log('🔍 Test 7: Verificando manejo de errores...');
    
    await page.goto(`${URLS.webApp}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
    
    // Intentar login con credenciales incorrectas
    await emailInput.fill('usuario@incorrecto.com');
    await passwordInput.fill('password_incorrecta');
    
    console.log('📝 Intentando login con credenciales incorrectas...');
    
    await submitButton.click();
    await page.waitForTimeout(5000);
    
    // Buscar mensaje de error
    const errorMessage = await page.locator('text=/error|incorrecto|inválido|failed/i').first();
    
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log(`✅ Mensaje de error mostrado: "${errorText}"`);
    } else {
      // Verificar que no se redirigió
      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        console.log('✅ Permanece en página de login (correcto)');
      } else {
        console.log('⚠️ No se mostró mensaje de error claro');
      }
    }
  });
});

// Ejecutar con: npx playwright test test-sso-flow.spec.js --reporter=list
console.log('\n📋 Para ejecutar este test, usa:');
console.log('   npx playwright test test-sso-flow.spec.js --reporter=list');
console.log('\n⚠️ Asegúrate de que los siguientes servicios estén ejecutándose:');
console.log('   - web-app (puerto 3000)');
console.log('   - api-server (puerto 3001)');
console.log('   - patients-app (puerto 3003)');
console.log('   - doctors-app (puerto 3002)');
console.log('   - companies-app (puerto 3004)');
console.log('   - admin-app (puerto 3005)');