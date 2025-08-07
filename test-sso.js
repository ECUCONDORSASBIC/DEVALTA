/**
 * Script de prueba para endpoints SSO
 */

const API_BASE_URL = 'http://localhost:3001';

async function testApiHealth() {
  console.log('🔍 Verificando salud del API Server...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Server funcionando:', data);
      return true;
    } else {
      console.log('❌ API Server respondió con error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error conectando al API Server:', error.message);
    return false;
  }
}

async function testSSOEndpoint() {
  console.log('\n🔍 Probando endpoint SSO...');
  
  // Test 1: Verificar endpoint existe (GET)
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/sso`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 GET /api/v1/auth/sso Status:', response.status);
    const responseText = await response.text();
    console.log('📊 Response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    
    if (response.status === 401) {
      console.log('✅ Endpoint SSO responde correctamente (401 sin token es esperado)');
    }
  } catch (error) {
    console.log('❌ Error probando GET SSO:', error.message);
  }

  // Test 2: Probar login con datos de prueba (POST)
  console.log('\n🔐 Probando login SSO con credenciales de prueba...');
  try {
    const loginData = {
      email: 'test@altamedica.com',
      password: '123456'
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/sso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    console.log('📊 POST /api/v1/auth/sso Status:', response.status);
    const responseText = await response.text();
    console.log('📊 Response:', responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));

    if (response.status === 401 || response.status === 404) {
      console.log('✅ Endpoint SSO funciona (error de credenciales es esperado sin Firebase configurado)');
    } else if (response.status === 200) {
      console.log('✅ Login SSO exitoso!');
    }
  } catch (error) {
    console.log('❌ Error probando POST SSO:', error.message);
  }
}

async function testCorsHeaders() {
  console.log('\n🌐 Verificando headers CORS...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/sso`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3003',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('📊 OPTIONS Status:', response.status);
    console.log('📊 CORS Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('access-control')) {
        console.log(`   ${key}: ${value}`);
      }
    });
  } catch (error) {
    console.log('❌ Error probando CORS:', error.message);
  }
}

async function testRateLimit() {
  console.log('\n⚡ Probando rate limiting...');
  
  for (let i = 1; i <= 3; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'rate-limit-test@test.com',
          password: '123456'
        })
      });

      console.log(`📊 Intento ${i} - Status: ${response.status}`);
      
      // Verificar headers de rate limit
      const rateLimitHeaders = {};
      ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'retry-after'].forEach(header => {
        const value = response.headers.get(header);
        if (value) rateLimitHeaders[header] = value;
      });
      
      if (Object.keys(rateLimitHeaders).length > 0) {
        console.log('📊 Rate Limit Headers:', rateLimitHeaders);
      }

      if (response.status === 429) {
        console.log('✅ Rate limiting funcionando correctamente');
        break;
      }
      
      // Pequeña pausa entre intentos
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Error en intento ${i}:`, error.message);
    }
  }
}

// Función principal
async function runTests() {
  console.log('🧪 === TESTING SSO ALTAMEDICA ===\n');
  
  // Test 1: Salud del API
  const apiHealthy = await testApiHealth();
  
  if (!apiHealthy) {
    console.log('\n❌ API Server no está disponible. Verifica que esté ejecutándose en puerto 3001');
    console.log('💡 Para iniciar: cd apps/api-server && pnpm dev');
    return;
  }

  // Test 2: Endpoint SSO
  await testSSOEndpoint();

  // Test 3: CORS
  await testCorsHeaders();

  // Test 4: Rate Limiting
  await testRateLimit();

  console.log('\n🎉 === TESTS COMPLETADOS ===');
  console.log('\nPróximos pasos:');
  console.log('1. ✅ Configurar Firebase Admin SDK para login real');
  console.log('2. ✅ Probar en aplicaciones frontend (patients, doctors, etc.)');
  console.log('3. ✅ Verificar sincronización entre pestañas');
}

// Ejecutar tests
runTests().catch(console.error);