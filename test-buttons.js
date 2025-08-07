/**
 * Script de prueba para verificar que las aplicaciones y endpoints responden
 */

const webAppUrl = 'http://localhost:3000';
const apiServerUrl = 'http://localhost:3011';

async function testEndpoint(url, name) {
  console.log(`🔍 Probando ${name}: ${url}`);
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'AltaMedica-Test-Bot' }
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`   ✅ ${name} responde correctamente`);
      return true;
    } else {
      console.log(`   ⚠️ ${name} responde con error ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name} no responde: ${error.message}`);
    return false;
  }
}

async function testSSOEndpoint() {
  console.log(`\n🔐 Probando endpoint SSO...`);
  
  try {
    // Test de verificación SSO (debería dar 401 sin token)
    const response = await fetch(`${apiServerUrl}/api/v1/auth/sso`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   GET /api/v1/auth/sso Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log(`   ✅ Endpoint SSO responde correctamente (401 sin token es esperado)`);
      return true;
    } else {
      console.log(`   ⚠️ Endpoint SSO responde con ${response.status} (esperado 401)`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Endpoint SSO no responde: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 === PRUEBA DE BOTONES Y ENDPOINTS ===\n');
  
  const tests = [
    { url: webAppUrl, name: 'Web App' },
    { url: `${webAppUrl}/login`, name: 'Página de Login' },
    { url: `${webAppUrl}/register`, name: 'Página de Registro' },
    { url: `${apiServerUrl}/api/health`, name: 'API Health Check' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    results.push({ ...test, success: result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre tests
  }
  
  // Test especial para endpoint SSO
  const ssoResult = await testSSOEndpoint();
  results.push({ url: `${apiServerUrl}/api/v1/auth/sso`, name: 'SSO Endpoint', success: ssoResult });
  
  console.log('\n📊 === RESUMEN DE RESULTADOS ===');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.url}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Resultado: ${successCount}/${totalCount} servicios funcionando`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ¡Todos los servicios están funcionando correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Visitar http://localhost:3000 en el navegador');
    console.log('   2. Hacer clic en "Iniciar Sesión" para probar navegación');
    console.log('   3. Hacer clic en "Registrarse" para probar registro');
    console.log('   4. Probar login con credenciales de prueba');
  } else {
    console.log('\n⚠️ Algunos servicios no están funcionando. Verificar:');
    console.log('   - Que los servidores estén iniciados');
    console.log('   - Que los puertos no estén ocupados');
    console.log('   - Que no haya errores en la consola');
  }
}

// Ejecutar tests
runTests().catch(console.error);