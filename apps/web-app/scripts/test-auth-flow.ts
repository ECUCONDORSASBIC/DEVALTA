#!/usr/bin/env ts-node
/**
 * Script para probar el flujo completo de autenticación
 * Incluye: registro, login, logout y protección de rutas
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `test.user.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+34612345678'
};

// Helper para capturar logs de consola
async function setupConsoleCapture(page: Page) {
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  return consoleLogs;
}

// Helper para esperar a que la página esté lista
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Dar tiempo extra para renders
}

test.describe('Flujo completo de autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleCapture(page);
  });

  test('1. Registro de nuevo usuario', async ({ page }) => {
    console.log('🧪 Probando registro de nuevo usuario...');
    
    // Navegar a la página de registro
    await page.goto(`${BASE_URL}/register`);
    await waitForPageReady(page);
    
    // Llenar el formulario
    await page.fill('input[name="firstName"]', TEST_USER.firstName);
    await page.fill('input[name="lastName"]', TEST_USER.lastName);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="phone"]', TEST_USER.phone);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    
    // Seleccionar tipo de usuario
    await page.click('button[value="patient"]');
    
    // Aceptar términos
    await page.check('input[name="acceptTerms"]');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=¡Registro exitoso!')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Registro completado exitosamente');
  });

  test('2. Login con credenciales correctas', async ({ page }) => {
    console.log('🧪 Probando login con credenciales correctas...');
    
    // Navegar a login
    await page.goto(`${BASE_URL}/login`);
    await waitForPageReady(page);
    
    // Llenar credenciales
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    
    // Verificar que el dashboard se carga correctamente
    await expect(page.locator('text=Mi Portal de Salud')).toBeVisible();
    await expect(page.locator(`text=${TEST_USER.firstName}`)).toBeVisible();
    
    console.log('✅ Login exitoso y redirección al dashboard');
  });

  test('3. Acceso a rutas protegidas', async ({ page }) => {
    console.log('🧪 Probando acceso a rutas protegidas...');
    
    // Primero hacer login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Intentar acceder a la página de perfil (ruta protegida)
    await page.goto(`${BASE_URL}/profile`);
    await waitForPageReady(page);
    
    // Verificar que se puede acceder al perfil
    await expect(page.locator('h1:has-text("Mi Perfil")')).toBeVisible();
    await expect(page.locator(`input[value="${TEST_USER.firstName}"]`)).toBeVisible();
    
    console.log('✅ Acceso a rutas protegidas funcionando');
  });

  test('4. Logout y redirección', async ({ page }) => {
    console.log('🧪 Probando logout...');
    
    // Login primero
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Hacer logout
    await page.click('button[title="Cerrar Sesión"]');
    await waitForPageReady(page);
    
    // Verificar redirección al login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // Intentar acceder a una ruta protegida
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Debe redirigir al login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    console.log('✅ Logout exitoso y protección de rutas activa');
  });

  test('5. Login con credenciales incorrectas', async ({ page }) => {
    console.log('🧪 Probando login con credenciales incorrectas...');
    
    await page.goto(`${BASE_URL}/login`);
    await waitForPageReady(page);
    
    // Intentar login con contraseña incorrecta
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=Credenciales incorrectas')).toBeVisible({ timeout: 5000 });
    
    // Verificar que NO se redirige
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    console.log('✅ Manejo de errores de login funcionando');
  });

  test('6. Protección de rutas sin autenticación', async ({ page }) => {
    console.log('🧪 Probando protección de rutas sin autenticación...');
    
    // Intentar acceder directamente a rutas protegidas
    await page.goto(`${BASE_URL}/dashboard`);
    await waitForPageReady(page);
    
    // Debe redirigir al login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // Intentar acceder al perfil
    await page.goto(`${BASE_URL}/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    console.log('✅ Rutas protegidas correctamente');
  });

  test('7. Redirección después del login', async ({ page }) => {
    console.log('🧪 Probando redirección después del login...');
    
    // Intentar acceder a una ruta protegida sin autenticación
    await page.goto(`${BASE_URL}/profile`);
    
    // Debe redirigir al login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // Hacer login
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Debe redirigir de vuelta al perfil (la ruta original)
    await expect(page).toHaveURL(`${BASE_URL}/profile`, { timeout: 10000 });
    
    console.log('✅ Redirección post-login funcionando');
  });

  test('8. Login con Google OAuth', async ({ page }) => {
    console.log('🧪 Probando login con Google OAuth...');
    
    await page.goto(`${BASE_URL}/login`);
    await waitForPageReady(page);
    
    // Click en el botón de Google
    const googleButton = page.locator('button:has-text("Continuar con Google")');
    await expect(googleButton).toBeVisible();
    
    // Nota: En un ambiente de testing real, aquí se simularía el flujo OAuth
    // Por ahora solo verificamos que el botón existe y es clickeable
    await expect(googleButton).toBeEnabled();
    
    console.log('✅ Botón de Google OAuth presente y activo');
  });
});

// Ejecutar los tests si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando pruebas del flujo de autenticación...\n');
  console.log('⚠️  Asegúrate de que la aplicación esté corriendo en http://localhost:3000\n');
  
  // Nota: Para ejecutar estos tests, usa:
  // npx playwright test scripts/test-auth-flow.ts
}