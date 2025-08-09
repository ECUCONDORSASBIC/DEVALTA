/**
 * 🔥 REGISTRO AUTOMATIZADO DE USUARIOS DE PRUEBA
 * 
 * Script que registra usuarios directamente usando el formulario web
 * para asegurar que todo funciona como en el flujo real
 */

const { chromium } = require('playwright');

// Usuarios de prueba
const TEST_USERS = {
  patient: {
    email: 'paciente.test@altamedica.com',
    password: 'Test123!@#',
    firstName: 'Juan',
    lastName: 'Pérez Test',
    phone: '+54 11 5555-0001',
    dni: '12345678',
    role: 'patient'
  },
  doctor: {
    email: 'doctor.test@altamedica.com', 
    password: 'Test123!@#',
    firstName: 'Dr. Carlos',
    lastName: 'Martínez Test',
    phone: '+54 11 5555-1001',
    licenseNumber: 'MN 12345',
    specialties: ['Medicina General'],
    role: 'doctor'
  }
};

async function registerUser(page, userData) {
  console.log(`\n🔄 Registrando ${userData.role}: ${userData.email}`);
  
  try {
    // 1. Navegar al registro
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 2. Seleccionar rol
    const roleButton = userData.role === 'patient' ? 
      'button:has-text("Soy Paciente")' : 
      'button:has-text("Soy Médico")';
    
    await page.click(roleButton);
    await page.waitForURL(`**/register?role=${userData.role}`, { timeout: 10000 });
    
    // 3. Llenar formulario
    await page.waitForTimeout(2000);
    
    // Campos básicos
    await page.fill('input[name="email"], input[type="email"]', userData.email);
    await page.fill('input[name="password"], input[type="password"]', userData.password);
    
    // Confirmar password si existe el campo
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill(userData.password);
    }
    
    await page.fill('input[name="firstName"]', userData.firstName);
    await page.fill('input[name="lastName"]', userData.lastName);
    await page.fill('input[name="phone"]', userData.phone);
    
    // Campos específicos por rol
    if (userData.role === 'patient') {
      await page.fill('input[name="dni"]', userData.dni);
      
      // Seleccionar género si existe
      const genderSelect = page.locator('select[name="gender"]');
      if (await genderSelect.count() > 0) {
        await genderSelect.selectOption('male');
      }
      
      // Fecha de nacimiento si existe
      const birthDateField = page.locator('input[name="birthDate"], input[type="date"]');
      if (await birthDateField.count() > 0) {
        await birthDateField.fill('1990-01-15');
      }
    } else if (userData.role === 'doctor') {
      await page.fill('input[name="licenseNumber"]', userData.licenseNumber);
      
      // Especialidades si existe
      const specialtiesField = page.locator('input[name="specialties"], select[name="specialty"]');
      if (await specialtiesField.count() > 0) {
        if (await page.locator('select[name="specialty"]').count() > 0) {
          await page.selectOption('select[name="specialty"]', { index: 1 });
        } else {
          await specialtiesField.fill('Medicina General');
        }
      }
    }
    
    // 4. Aceptar términos
    const termsCheckbox = page.locator('input[name="acceptTerms"], input[type="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }
    
    // 5. Captura antes de enviar
    await page.screenshot({ 
      path: `test-screenshots/register-${userData.role}-form.png`,
      fullPage: true 
    });
    
    // 6. Enviar formulario
    const submitButton = page.locator('button[type="submit"], button:has-text("Registrarse")');
    await submitButton.click();
    
    // 7. Esperar resultado
    await page.waitForTimeout(5000);
    
    // Captura del resultado
    await page.screenshot({ 
      path: `test-screenshots/register-${userData.role}-result.png`,
      fullPage: true 
    });
    
    const currentUrl = page.url();
    console.log(`✅ Registro completado. URL: ${currentUrl}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error registrando ${userData.role}: ${error.message}`);
    
    // Captura de error
    await page.screenshot({ 
      path: `test-screenshots/register-${userData.role}-error.png`,
      fullPage: true 
    });
    
    return false;
  }
}

async function registerAllUsers() {
  console.log('🚀 REGISTRO AUTOMATIZADO DE USUARIOS DE PRUEBA');
  console.log('==============================================\n');
  
  const browser = await chromium.launch({
    headless: false, // Mostrar navegador para ver el proceso
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  try {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      const page = await context.newPage();
      
      const success = await registerUser(page, userData);
      
      if (success) {
        console.log(`✅ ${userType.toUpperCase()} registrado exitosamente`);
      } else {
        console.log(`❌ Error registrando ${userType.toUpperCase()}`);
      }
      
      await page.close();
      await page.waitForTimeout(2000); // Pausa entre registros
    }
    
    console.log('\n🎉 Proceso de registro completado');
    console.log('\n📝 Usuarios creados:');
    console.log(`   👤 Paciente: ${TEST_USERS.patient.email} / ${TEST_USERS.patient.password}`);
    console.log(`   👨‍⚕️ Doctor: ${TEST_USERS.doctor.email} / ${TEST_USERS.doctor.password}`);
    
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Verificar que los usuarios se registraron correctamente');
    console.log('   2. Ejecutar el test E2E completo');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  // Mantener abierto 5 segundos para revisión
  console.log('\n⏱️  Cerrando en 5 segundos...');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

// Verificar que los directorios existan
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

// Ejecutar
registerAllUsers().catch(console.error);