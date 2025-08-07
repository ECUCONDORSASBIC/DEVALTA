// Script para probar el endpoint SSO
const fetch = require('node-fetch');

async function testSSOEndpoint() {
  console.log('🔍 Probando endpoint SSO...\n');

  const endpoints = [
    {
      name: 'API Health Check',
      url: 'http://localhost:3001/api/health',
      method: 'GET'
    },
    {
      name: 'SSO Verify (sin cookie)',
      url: 'http://localhost:3001/api/v1/auth/verify-sso',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3003',
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'SSO Verify OPTIONS (preflight)',
      url: 'http://localhost:3001/api/v1/auth/verify-sso',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3003',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type'
      }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📍 Probando: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    console.log(`   Método: ${endpoint.method}`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: endpoint.headers || {}
      });

      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      
      // Mostrar headers CORS
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-credentials',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      console.log('   📋 Headers CORS:');
      corsHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          console.log(`      ${header}: ${value}`);
        }
      });

      // Para endpoints que devuelven JSON
      if (endpoint.method === 'GET' && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        console.log('   📄 Respuesta:', JSON.stringify(data, null, 2));
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n💡 Próximos pasos:');
  console.log('1. Si el API server no responde, ejecuta: npm run dev:api-server');
  console.log('2. Si CORS falla, verifica que el endpoint tenga los headers correctos');
  console.log('3. Para probar con cookie SSO, primero haz login en http://localhost:3000');
}

// Ejecutar prueba
testSSOEndpoint().catch(console.error);