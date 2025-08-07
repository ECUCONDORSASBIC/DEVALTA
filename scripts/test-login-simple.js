// Script simple para probar el login usando fetch nativo de Node.js
// No requiere instalaciones adicionales

async function testLogin() {
  console.log('🚀 Probando login con petición HTTP directa...\n');
  
  const loginData = {
    email: 'eeecucondor@gmail.com',
    password: 'test123'
  };
  
  try {
    // Primero, obtener la página de login para verificar que está activa
    console.log('📍 Verificando página de login...');
    const pageResponse = await fetch('http://localhost:3000/login');
    console.log('✅ Página de login responde:', pageResponse.status);
    
    // Intentar login directamente al API
    console.log('\n🔐 Intentando login en API...');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', '*'.repeat(loginData.password.length - 3) + loginData.password.slice(-3));
    
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('\n📨 Respuesta del servidor:');
    console.log('- Status:', loginResponse.status);
    console.log('- Status Text:', loginResponse.statusText);
    
    const responseData = await loginResponse.json();
    console.log('- Datos:', JSON.stringify(responseData, null, 2));
    
    if (loginResponse.ok && responseData.success) {
      console.log('\n✅ Login exitoso en el API!');
      console.log('🎫 Token recibido:', responseData.data?.token ? 'Sí' : 'No');
      console.log('👤 Usuario:', responseData.data?.user?.email);
      console.log('🎭 Rol:', responseData.data?.user?.role);
      
      // Verificar cookies recibidas
      const cookies = loginResponse.headers.get('set-cookie');
      if (cookies) {
        console.log('\n🍪 Cookies recibidas:', cookies);
      }
      
      console.log('\n💡 El login funciona correctamente en el API.');
      console.log('💡 El problema está en el frontend (AuthContext permanece en loading).');
      
    } else {
      console.log('\n❌ Error en el login:', responseData.error?.message || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('\n💥 Error al hacer la petición:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n❌ El API Server no está respondiendo en http://localhost:3001');
      console.log('💡 Asegúrate de que esté ejecutándose con: cd apps/api-server && npm run dev');
    }
  }
  
  // Probar también el health check del API
  console.log('\n🏥 Verificando health check del API...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.text();
    console.log('✅ API Health:', healthResponse.status, '-', healthData);
  } catch (error) {
    console.log('❌ Health check falló:', error.message);
  }
}

// Ejecutar el test
console.log('='.repeat(50));
console.log('TEST DE LOGIN DIRECTO AL API');
console.log('='.repeat(50));
testLogin();