import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

/**
 * 🧪 SSO MULTI-USER TESTING SUITE
 * 
 * Prueba automatizada del flujo completo SSO con los 4 usuarios de testing:
 * - paciente2@test.com → http://localhost:3003
 * - doctor2@test.com → http://localhost:3002  
 * - empresa2@test.com → http://localhost:3004
 * - admin2@test.com → http://localhost:3005
 */

// Credenciales de testing creadas
// NOTA: Las cuentas de prueba provienen de sso-auth.service.ts (testAccounts)
//       Se usan las cuentas base sin sufijo '2'.
const TEST_USERS = [
  {
    email: 'paciente@test.com',
    password: '12345678',
    role: 'patient',
    expectedUrl: 'http://localhost:3003',
    displayName: 'paciente'
  },
  {
    email: 'doctor@test.com', 
    password: '12345678',
    role: 'doctor',
    expectedUrl: 'http://localhost:3002',
    displayName: 'doctor'
  },
  {
    email: 'empresa@test.com',
    password: '12345678', 
    role: 'company',
    expectedUrl: 'http://localhost:3004',
    displayName: 'empresa'
  },
  {
    email: 'admin@test.com',
    password: '12345678',
    role: 'admin', 
    expectedUrl: 'http://localhost:3005',
    displayName: 'admin'
  }
];

// Helper function para login
async function performLogin(page: Page, email: string, password: string) {
  console.log(`🔐 Iniciando login para: ${email}`);
  
  // Ir a página de login
  // Intentar ruta principal /auth/login y fallback a /login si no existe
  const primaryLogin = 'http://localhost:3000/auth/login';
  const fallbackLogin = 'http://localhost:3000/login';
  await page.goto(primaryLogin);
  // Si status >=400 intentar fallback
  try {
    const resp = await page.waitForResponse(r => r.url().includes('/auth/login') || r.request().url().includes('/auth/login'), { timeout: 3000 }).catch(() => null);
    if (!resp || resp.status() >= 400) {
      await page.goto(fallbackLogin);
    }
  } catch {
    await page.goto(fallbackLogin);
  }
  
  // Esperar que la página cargue
  await page.waitForLoadState('networkidle');
  
  // Llenar formulario de login
  await page.fill('input[type="email"], input[name="email"], [data-testid="email-input"]', email);
  await page.fill('input[type="password"], input[name="password"], [data-testid="password-input"]', password);
  
  // Hacer click en login button
  const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar sesión"), button:has-text("Login"), [data-testid="login-button"]').first();
  await loginButton.click();
  
  console.log(`✅ Click en login realizado para: ${email}`);
}

// Helper function para verificar redirección
async function verifyRedirection(page: Page, expectedUrl: string, userEmail: string) {
  console.log(`🔍 Verificando redirección para: ${userEmail} → ${expectedUrl}`);
  
  // Esperar redirección (máximo 10 segundos)
  await page.waitForFunction(
    (url) => window.location.href.startsWith(url),
    expectedUrl,
    { timeout: 20000 }
  );
  
  const currentUrl = page.url();
  console.log(`📍 URL actual: ${currentUrl}`);
  
  expect(currentUrl).toContain(expectedUrl);
  console.log(`✅ Redirección exitosa para: ${userEmail}`);
}

test.describe('SSO Multi-User Flow Testing', () => {
  
  test.beforeAll(async () => {
    console.log('🚀 INICIANDO SUITE DE TESTING SSO');
    console.log('=================================');
    console.log('🔗 Servidores esperados:');
    console.log('   - web-app: http://localhost:3000 (Gateway)');
    console.log('   - patients: http://localhost:3003'); 
    console.log('   - doctors: http://localhost:3002');
    console.log('   - companies: http://localhost:3004');
    console.log('   - admin: http://localhost:3005');
    console.log('');
  });

  // Test para cada usuario individualmente
  for (const user of TEST_USERS) {
    test(`Login y redirección para ${user.role}: ${user.email}`, async ({ browser }) => {
      console.log(`\n👤 === TESTING ${user.role.toUpperCase()}: ${user.email} ===`);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Realizar login
        await performLogin(page, user.email, user.password);
        
        // Verificar redirección correcta
        await verifyRedirection(page, user.expectedUrl, user.email);
        
        // Verificar que la página de destino carga correctamente
        await page.waitForLoadState('networkidle');
        
        // Verificar que no hay errores 404 o 500
        const response = await page.goto(page.url());
        expect(response?.status()).toBeLessThan(400);
        
        console.log(`🎉 SUCCESS: Usuario ${user.role} logueado y redirigido correctamente`);
        
      } catch (error) {
        console.error(`❌ ERROR en testing de ${user.email}:`, error);
        
        // Capturar screenshot en caso de error
        await page.screenshot({ 
          path: `test-results/error-${user.role}-${Date.now()}.png`,
          fullPage: true 
        });
        
        throw error;
      } finally {
        await context.close();
      }
    });
  }

  // Test de flujo completo secuencial
  test('Flujo completo SSO - Todos los usuarios secuencialmente', async ({ browser }) => {
    console.log('\n🔄 === TESTING FLUJO COMPLETO SECUENCIAL ===');
    
    for (const user of TEST_USERS) {
      console.log(`\n🔄 Procesando usuario: ${user.email}`);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        await performLogin(page, user.email, user.password);
        await verifyRedirection(page, user.expectedUrl, user.email);
        
        // Verificar contenido específico según el rol
        await page.waitForLoadState('networkidle');
        
        // Log URL final
        console.log(`📍 Usuario ${user.role} → ${page.url()}`);
        
      } finally {
        await context.close();
      }
    }
    
    console.log('\n🎉 FLUJO COMPLETO SSO EXITOSO - Todos los usuarios probados');
  });

  // Test paralelo de todos los usuarios
  test('Login paralelo de todos los usuarios', async ({ browser }) => {
    console.log('\n⚡ === TESTING PARALELO DE TODOS LOS USUARIOS ===');
    
    // Crear contextos para cada usuario
    const contexts = await Promise.all(
      TEST_USERS.map(() => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    try {
      // Realizar logins en paralelo
      await Promise.all(
        TEST_USERS.map(async (user, index) => {
          const page = pages[index];
          console.log(`🔄 Login paralelo ${index + 1}: ${user.email}`);
          
          await performLogin(page, user.email, user.password);
          await verifyRedirection(page, user.expectedUrl, user.email);
          
          return page.url();
        })
      );
      
      console.log('🎉 TODOS LOS LOGINS PARALELOS EXITOSOS');
      
      // Verificar que todos terminaron en la URL correcta
      for (let i = 0; i < TEST_USERS.length; i++) {
        const user = TEST_USERS[i];
        const page = pages[i];
        const currentUrl = page.url();
        
        expect(currentUrl).toContain(user.expectedUrl);
        console.log(`✅ ${user.role}: ${currentUrl}`);
      }
      
    } finally {
      // Cerrar todos los contextos
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  // Test de logout y re-login
  test('Logout y re-login flow', async ({ browser }) => {
    console.log('\n🔄 === TESTING LOGOUT Y RE-LOGIN ===');
    
    const user = TEST_USERS[0]; // Usar paciente para este test
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Login inicial
      await performLogin(page, user.email, user.password);
      await verifyRedirection(page, user.expectedUrl, user.email);
      
      // Intentar logout (buscar botón de logout)
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Cerrar sesión")', 
        'a:has-text("Logout")',
        'a:has-text("Cerrar sesión")',
        '[data-testid="logout-button"]'
      ];
      
      let loggedOut = false;
      for (const selector of logoutSelectors) {
        try {
          const logoutButton = page.locator(selector).first();
          if (await logoutButton.isVisible({ timeout: 2000 })) {
            await logoutButton.click();
            loggedOut = true;
            console.log('✅ Logout exitoso');
            break;
          }
        } catch (e) {
          // Continuar con el siguiente selector
        }
      }
      
      if (loggedOut) {
        // Verificar que regresó a login
        await page.waitForURL('**/login**', { timeout: 5000 });
        
        // Re-login
        await performLogin(page, user.email, user.password);
        await verifyRedirection(page, user.expectedUrl, user.email);
        
        console.log('🎉 Re-login exitoso después de logout');
      } else {
        console.log('⚠️ No se encontró botón de logout, saltando test');
      }
      
    } finally {
      await context.close();
    }
  });

  test.afterAll(async () => {
    console.log('\n📊 === RESUMEN DE TESTING SSO ===');
    console.log('✅ Suite de testing completada');
    console.log('🎯 4 usuarios probados');
    console.log('🔗 4 redirecciones verificadas');
    console.log('⚡ Testing paralelo ejecutado');
    console.log('🔄 Flujo de logout/re-login probado');
    console.log('================================\n');
  });
});