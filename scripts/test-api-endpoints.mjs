#!/usr/bin/env node

/**
 * Script de Prueba Automatizada de Endpoints API Altamedica
 * Verifica que todos los endpoints críticos estén funcionando
 */

const API_BASE_URL = 'http://localhost:3001';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function testEndpoint(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (response.status === expectedStatus) {
      log(`✅ ${method} ${endpoint} - ${response.status}`, 'green');
      return { success: true, data: responseData };
    } else {
      log(`❌ ${method} ${endpoint} - Expected ${expectedStatus}, got ${response.status}`, 'red');
      return { success: false, error: responseData };
    }
  } catch (error) {
    log(`❌ ${method} ${endpoint} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log(`${COLORS.bright}🧪 PRUEBAS AUTOMATIZADAS DE API ALTAMEDICA${COLORS.reset}`, 'magenta');
  log('Verificando endpoints críticos...', 'blue');
  log('');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Endpoint de prueba básico
  log(`${COLORS.bright}1. Endpoint de Prueba Básico${COLORS.reset}`, 'cyan');
  const test1 = await testEndpoint('GET', '/api/test');
  results.total++;
  if (test1.success) {
    results.passed++;
    log(`   ✅ API funcionando correctamente`, 'green');
  } else {
    results.failed++;
    log(`   ❌ API no responde`, 'red');
  }
  log('');

  // Test 2: Registro de usuario
  log(`${COLORS.bright}2. Registro de Usuario${COLORS.reset}`, 'cyan');
  const testUser = {
    email: `test-${Date.now()}@altamedica.com`,
    password: 'TestPassword123!',
    role: 'patient',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890'
  };
  
  const test2 = await testEndpoint('POST', '/api/auth/register', testUser, 201);
  results.total++;
  if (test2.success) {
    results.passed++;
    log(`   ✅ Registro exitoso`, 'green');
  } else {
    results.failed++;
    log(`   ❌ Error en registro: ${test2.error?.error || 'Unknown error'}`, 'red');
  }
  log('');

  // Test 3: Login de usuario
  log(`${COLORS.bright}3. Login de Usuario${COLORS.reset}`, 'cyan');
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const test3 = await testEndpoint('POST', '/api/auth/login', loginData);
  results.total++;
  let authToken = null;
  
  if (test3.success) {
    results.passed++;
    authToken = test3.data.token;
    log(`   ✅ Login exitoso`, 'green');
  } else {
    results.failed++;
    log(`   ❌ Error en login: ${test3.error?.error || 'Unknown error'}`, 'red');
  }
  log('');

  // Test 4: Obtener citas (requiere autenticación)
  log(`${COLORS.bright}4. Obtener Citas${COLORS.reset}`, 'cyan');
  if (authToken) {
    const test4 = await testEndpoint('GET', '/api/appointments', null, 200);
    results.total++;
    if (test4.success) {
      results.passed++;
      log(`   ✅ Citas obtenidas correctamente`, 'green');
    } else {
      results.failed++;
      log(`   ❌ Error obteniendo citas: ${test4.error?.error || 'Unknown error'}`, 'red');
    }
  } else {
    results.total++;
    results.failed++;
    log(`   ❌ No se pudo probar - sin token de autenticación`, 'yellow');
  }
  log('');

  // Test 5: Crear cita (requiere autenticación)
  log(`${COLORS.bright}5. Crear Cita${COLORS.reset}`, 'cyan');
  if (authToken) {
    const appointmentData = {
      doctor_id: '1', // Mock doctor ID
      appointment_type: 'consultation',
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration_minutes: 30,
      reason: 'Consulta de prueba'
    };
    
    const test5 = await testEndpoint('POST', '/api/appointments', appointmentData, 201);
    results.total++;
    if (test5.success) {
      results.passed++;
      log(`   ✅ Cita creada exitosamente`, 'green');
    } else {
      results.failed++;
      log(`   ❌ Error creando cita: ${test5.error?.error || 'Unknown error'}`, 'red');
    }
  } else {
    results.total++;
    results.failed++;
    log(`   ❌ No se pudo probar - sin token de autenticación`, 'yellow');
  }
  log('');

  // Test 6: Notificaciones (requiere autenticación)
  log(`${COLORS.bright}6. Obtener Notificaciones${COLORS.reset}`, 'cyan');
  if (authToken) {
    const test6 = await testEndpoint('GET', '/api/v1/notifications', null, 200);
    results.total++;
    if (test6.success) {
      results.passed++;
      log(`   ✅ Notificaciones obtenidas correctamente`, 'green');
    } else {
      results.failed++;
      log(`   ❌ Error obteniendo notificaciones: ${test6.error?.error || 'Unknown error'}`, 'red');
    }
  } else {
    results.total++;
    results.failed++;
    log(`   ❌ No se pudo probar - sin token de autenticación`, 'yellow');
  }
  log('');

  // Generar reporte final
  log(`${COLORS.bright}📊 REPORTE FINAL${COLORS.reset}`, 'magenta');
  log('='.repeat(50), 'magenta');
  log(`Total de pruebas: ${results.total}`, 'cyan');
  log(`✅ Exitosas: ${results.passed}`, 'green');
  log(`❌ Fallidas: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`📈 Tasa de éxito: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'cyan');
  log('');

  if (results.failed === 0) {
    log(`🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.`, 'green');
  } else {
    log(`⚠️ ${results.failed} prueba(s) fallaron. Revisa los logs para más detalles.`, 'yellow');
  }

  log('');
  log(`${COLORS.bright}💡 RECOMENDACIONES${COLORS.reset}`, 'cyan');
  log('1. Verifica que el servidor API esté ejecutándose en http://localhost:3001', 'blue');
  log('2. Asegúrate de que la base de datos esté conectada', 'blue');
  log('3. Revisa los logs del servidor para errores específicos', 'blue');
  log('4. Ejecuta las migraciones de la base de datos si es necesario', 'blue');

  return results;
}

// Ejecutar pruebas si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log(`Error ejecutando pruebas: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runTests }; 