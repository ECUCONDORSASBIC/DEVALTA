// Diagnóstico Médico del Sistema de Autenticación AltaMedica
// Como un médico: Hipótesis → Pruebas → Diagnóstico → Tratamiento

const { chromium } = require('playwright');

async function diagnosticarSistemaAuth() {
  console.log('🏥 DIAGNÓSTICO MÉDICO - SISTEMA DE AUTENTICACIÓN ALTAMEDICA');
  console.log('='.repeat(60));
  console.log('👨‍⚕️ Dr. Playwright iniciando consulta...\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: false
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Recolectar síntomas (errores y logs importantes)
  const sintomas = [];
  const diagnosticos = [];
  
  // Monitorear console solo para errores críticos
  page.on('console', msg => {
    if (msg.type() === 'error') {
      sintomas.push(`❌ ERROR: ${msg.text()}`);
    } else if (msg.text().includes('role:') || msg.text().includes('Redirigiendo') || msg.text().includes('PACIENTE DETECTADO')) {
      diagnosticos.push(`✅ ${msg.text()}`);
    }
  });

  // HIPÓTESIS 1: El sistema de login funciona correctamente
  console.log('📋 HIPÓTESIS 1: El sistema de login funciona\n');
  console.log('🔬 Prueba 1: Verificar página de login');
  
  try {
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    console.log('✅ Página de login carga correctamente\n');
  } catch (error) {
    console.log('❌ FALLO: Página de login no responde\n');
    await browser.close();
    return;
  }

  // HIPÓTESIS 2: Las credenciales son válidas
  console.log('📋 HIPÓTESIS 2: Las credenciales del paciente son válidas\n');
  console.log('🔬 Prueba 2: Intentar login con credenciales');
  
  await page.fill('input[type="email"]', 'eeecucondor@gmail.com');
  await page.fill('input[type="password"]', 'Ab.123456'); // Contraseña correcta
  
  // Capturar respuesta de Firebase
  const loginPromise = page.waitForResponse(response => 
    response.url().includes('identitytoolkit.googleapis.com') && 
    response.url().includes('signInWithPassword')
  );
  
  await page.click('button[type="submit"]');
  
  const firebaseResponse = await loginPromise;
  const firebaseStatus = firebaseResponse.status();
  
  if (firebaseStatus === 200) {
    console.log('✅ Credenciales válidas - Firebase autenticó correctamente\n');
  } else {
    console.log(`❌ FALLO: Credenciales inválidas - Firebase respondió con ${firebaseStatus}`);
    console.log('💊 TRATAMIENTO: Verificar contraseña o resetearla\n');
    await browser.close();
    return;
  }

  // HIPÓTESIS 3: El usuario tiene rol asignado en Firestore
  console.log('📋 HIPÓTESIS 3: El usuario tiene rol asignado\n');
  console.log('🔬 Prueba 3: Verificar perfil en Firestore');
  
  // Esperar a que se cargue el perfil
  await page.waitForTimeout(2000);
  
  // Verificar si hubo redirección
  const currentUrl = page.url();
  
  if (currentUrl.includes('localhost:3003')) {
    console.log('✅ Redirección exitosa a app de pacientes\n');
    
    // HIPÓTESIS 4: La app de pacientes carga correctamente
    console.log('📋 HIPÓTESIS 4: La app de pacientes funciona\n');
    console.log('🔬 Prueba 4: Verificar carga de dashboard');
    
    // Esperar a que cargue el contenido
    await page.waitForTimeout(3000);
    
    // Buscar indicadores de éxito
    const tieneDashboard = await page.locator('text=/dashboard|bienvenido|citas|appointments/i').count() > 0;
    const tieneSpinner = await page.locator('.animate-spin, .loading').count() > 0;
    const tieneError = await page.locator('text=/error|access denied|unauthorized/i').count() > 0;
    
    if (tieneDashboard) {
      console.log('✅ Dashboard cargado correctamente');
      
      // Tomar screenshot de éxito
      await page.screenshot({ path: 'dashboard-exitoso.png' });
      console.log('📸 Screenshot guardado: dashboard-exitoso.png\n');
    } else if (tieneSpinner) {
      console.log('⏳ SÍNTOMA: Dashboard atascado cargando');
      console.log('💊 TRATAMIENTO: Verificar conexión al API server (puerto 3001)');
      
      // Verificar API
      try {
        const apiResponse = await page.evaluate(async () => {
          const res = await fetch('http://localhost:3001/api/health');
          return res.ok;
        });
        
        if (!apiResponse) {
          console.log('❌ API server no responde');
          console.log('💊 TRATAMIENTO: Ejecutar "cd apps/api-server && npm run dev"\n');
        }
      } catch (e) {
        console.log('❌ No se puede conectar al API server\n');
      }
    } else if (tieneError) {
      console.log('❌ SÍNTOMA: Error de acceso en dashboard');
      console.log('💊 TRATAMIENTO: Verificar rol del usuario en Firestore\n');
    }
  } else if (currentUrl.includes('localhost:3000')) {
    console.log('❌ SÍNTOMA: No hubo redirección (quedó en login)');
    console.log('💡 Posibles causas:');
    console.log('   - Usuario sin rol en Firestore');
    console.log('   - Error en AuthContext');
    console.log('💊 TRATAMIENTO: Ejecutar script fix-user-role-client.js\n');
  }

  // DIAGNÓSTICO FINAL
  console.log('📋 DIAGNÓSTICO FINAL');
  console.log('='.repeat(60));
  
  if (sintomas.length > 0) {
    console.log('\n🔴 SÍNTOMAS DETECTADOS:');
    sintomas.forEach(s => console.log(`   ${s}`));
  }
  
  if (diagnosticos.length > 0) {
    console.log('\n🟢 SIGNOS VITALES NORMALES:');
    diagnosticos.forEach(d => console.log(`   ${d}`));
  }
  
  // Resumen ejecutivo
  console.log('\n👨‍⚕️ RESUMEN MÉDICO:');
  if (currentUrl.includes('localhost:3003') && !sintomas.find(s => s.includes('ERROR'))) {
    console.log('✅ PACIENTE SANO - Sistema funcionando correctamente');
  } else {
    console.log('🔴 PACIENTE REQUIERE TRATAMIENTO');
    console.log('\n💊 PLAN DE TRATAMIENTO:');
    if (!currentUrl.includes('localhost:3003')) {
      console.log('1. Verificar rol del usuario en Firestore');
      console.log('2. Ejecutar: node scripts/fix-user-role-client.js');
    }
    if (sintomas.find(s => s.includes('CORS'))) {
      console.log('3. Verificar CORS en API server');
    }
  }
  
  console.log('\n🏥 Fin del diagnóstico');
  
  // Mantener navegador abierto para inspección manual
  console.log('\n💡 Navegador abierto para inspección. Ciérralo manualmente.');
}

// Verificar Playwright
try {
  require.resolve('playwright');
  diagnosticarSistemaAuth().catch(console.error);
} catch (e) {
  console.log('❌ Playwright no instalado');
  console.log('💊 TRATAMIENTO: npm install --save-dev playwright');
}