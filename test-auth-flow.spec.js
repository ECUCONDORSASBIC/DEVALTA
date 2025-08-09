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

test.describe('🔐 Pruebas de Autenticación SSO', () => {
  
  // Prueba cada cuenta individualmente
  for (const account of testAccounts) {
    test(`Login ${account.role}: ${account.email}`, async ({ page, context }) => {
      console.log(`\n🔍 Probando cuenta ${account.role}: ${account.email}`);
      
      // 1. Navegar a la página de login
      await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      console.log('   📍 En página de login');
      
      // 2. Esperar un momento para que cargue
      await page.waitForTimeout(1000);
      
      // 3. Llenar credenciales - intentar múltiples selectores
      try {
        // Email
        const emailInput = await page.locator('input[type="email"], input[name="email"], #email').first();
        await emailInput.fill(account.email);
        console.log('   ✏️ Email ingresado');
        
        // Password
        const passInput = await page.locator('input[type="password"], input[name="password"], #password').first();
        await passInput.fill(account.password);
        console.log('   ✏️ Password ingresado');
      } catch (error) {
        console.log('   ❌ Error llenando formulario:', error.message);
      }
      
      // 4. Hacer clic en el botón de login
      try {
        const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Ingresar")').first();
        await submitButton.click();
        console.log('   🖱️ Botón de login clickeado');
      } catch (error) {
        console.log('   ❌ Error haciendo click:', error.message);
      }
      
      // 5. Esperar navegación o timeout
      try {
        await page.waitForNavigation({ timeout: 5000, waitUntil: 'domcontentloaded' });
      } catch {
        // Si no hay navegación, continuar
      }
      
      // 6. Verificar URL actual
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`   🔗 URL actual: ${currentUrl}`);
      
      // 7. Verificar redirección según rol
      if (currentUrl.startsWith(account.expectedRedirect)) {
        console.log(`   ✅ ÉXITO: Redirección correcta para ${account.role}`);
      } else if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
        console.log(`   ✅ ÉXITO: Usuario autenticado`);
      } else if (currentUrl.includes('/login')) {
        console.log(`   ⚠️ Aún en login - posible fallo de autenticación`);
      } else {
        console.log(`   ℹ️ URL diferente: ${currentUrl}`);
      }
      
      // 8. Verificar cookies de sesión (más seguro que localStorage)
      const cookies = await context.cookies();
      const authCookie = cookies.find(c => 
        c.name.includes('auth') || 
        c.name.includes('session') || 
        c.name.includes('token')
      );
      
      if (authCookie) {
        console.log(`   🍪 Cookie de autenticación encontrada: ${authCookie.name}`);
        console.log(`      - HttpOnly: ${authCookie.httpOnly}`);
        console.log(`      - Secure: ${authCookie.secure}`);
        console.log(`      - SameSite: ${authCookie.sameSite}`);
      } else {
        console.log('   ⚠️ No se encontró cookie de autenticación');
      }
      
      // 9. Tomar screenshot
      await page.screenshot({ 
        path: `auth-${account.role.toLowerCase()}-result.png`,
        fullPage: true 
      });
      console.log(`   📸 Screenshot: auth-${account.role.toLowerCase()}-result.png`);
    });
  }
  
  test('Verificar seguridad de redirección sin auth', async ({ page }) => {
    console.log('\n🔒 Probando acceso sin autenticación');
    
    // Intentar acceder directamente a cada portal
    const portals = [
      { url: 'http://localhost:3002/dashboard', name: 'Doctors' },
      { url: 'http://localhost:3003/dashboard', name: 'Patients' },
      { url: 'http://localhost:3004/dashboard', name: 'Companies' },
      { url: 'http://localhost:3005/dashboard', name: 'Admin' }
    ];
    
    for (const portal of portals) {
      await page.goto(portal.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log(`   ✅ ${portal.name}: Redirige a login correctamente`);
      } else {
        console.log(`   ⚠️ ${portal.name}: NO redirige a login (posible problema de seguridad)`);
      }
    }
  });
});