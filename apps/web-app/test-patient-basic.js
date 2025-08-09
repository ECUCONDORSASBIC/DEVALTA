/**
 * Test básico de navegación con Playwright
 * Ejecutar con: node test-patient-basic.js
 */

const { chromium } = require('playwright');

async function runTest() {
  console.log('🎭 Iniciando test básico de paciente...\n');
  
  const browser = await chromium.launch({
    headless: false, // Mostrar navegador
    slowMo: 500 // Hacer las acciones más lentas para poder ver
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navegar a la página principal
    console.log('1️⃣ Navegando a http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página cargada\n');
    
    // 2. Buscar y hacer clic en "Soy Paciente"
    console.log('2️⃣ Buscando botón "Soy Paciente"...');
    const patientButton = page.locator('button:has-text("Soy Paciente")');
    const buttonCount = await patientButton.count();
    console.log(`   Encontrados ${buttonCount} botones`);
    
    if (buttonCount > 0) {
      console.log('   Haciendo clic en el botón...');
      await patientButton.first().click();
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`✅ URL actual: ${currentUrl}\n`);
      
      // Captura después del clic
      await page.screenshot({ 
        path: 'test-screenshots/after-patient-click.png',
        fullPage: true 
      });
    }
    
    // 3. Navegar directamente al login
    console.log('3️⃣ Navegando a la página de login...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Página de login cargada\n');
    
    // 4. Llenar formulario de login
    console.log('4️⃣ Llenando formulario de login...');
    
    // Buscar campos de forma más flexible
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    
    if (emailInput && passwordInput) {
      await emailInput.fill('paciente.demo@altamedica.com');
      console.log('   ✅ Email ingresado');
      
      await passwordInput.fill('Demo123!@#');
      console.log('   ✅ Password ingresada');
      
      // Captura del formulario lleno
      await page.screenshot({ 
        path: 'test-screenshots/login-form-ready.png' 
      });
      
      // Buscar botón de submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();
      if (await submitButton.count() > 0) {
        console.log('   🔄 Enviando formulario...');
        await submitButton.click();
        
        // Esperar respuesta
        await page.waitForTimeout(5000);
        
        const finalUrl = page.url();
        console.log(`✅ URL final: ${finalUrl}\n`);
        
        // Captura final
        await page.screenshot({ 
          path: 'test-screenshots/after-login.png',
          fullPage: true 
        });
      }
    }
    
    console.log('🎉 Test completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    
    // Captura de error
    await page.screenshot({ 
      path: 'test-screenshots/error-state.png',
      fullPage: true 
    });
  }
  
  // Mantener navegador abierto 5 segundos para revisión
  console.log('\n⏱️  Cerrando en 5 segundos...');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

// Crear directorio de screenshots si no existe
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

// Ejecutar test
runTest().catch(console.error);