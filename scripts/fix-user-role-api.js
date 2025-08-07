// Script para corregir el rol del usuario usando el API server local
const fetch = require('node-fetch');

async function fixUserRole() {
  const userId = '4oWIETuRzgZbXxtVSlhzJywm1103';
  const userEmail = 'eeecucondor@gmail.com';
  
  console.log('🔧 Corrigiendo rol de usuario vía API...');
  console.log('👤 Usuario:', userEmail);
  console.log('🆔 UID:', userId);
  
  try {
    // Primero hacer login para obtener un token
    console.log('\n🔐 Obteniendo token de autenticación...');
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'eeecucondor@gmail.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Error al hacer login:', loginData.error?.message);
      return;
    }
    
    const token = loginData.data?.token;
    console.log('✅ Token obtenido');
    
    // Ahora actualizar el perfil
    console.log('\n📝 Actualizando perfil del usuario...');
    const updateResponse = await fetch(`http://localhost:3001/api/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'patient',
        userType: 'patient'
      })
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Perfil actualizado exitosamente');
      console.log('📄 Nuevos datos:', updateData.data);
      console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión y serás redirigido a http://localhost:3003');
    } else {
      const errorData = await updateResponse.json();
      console.error('❌ Error al actualizar:', errorData.error?.message);
      
      // Si el endpoint no existe, intentar con un endpoint alternativo
      console.log('\n🔄 Intentando método alternativo...');
      // Aquí podrías implementar otra estrategia
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n❌ El API Server no está respondiendo en http://localhost:3001');
      console.log('💡 Asegúrate de que esté ejecutándose con: cd apps/api-server && npm run dev');
    }
  }
}

// Verificar si node-fetch está instalado
try {
  require.resolve('node-fetch');
  fixUserRole();
} catch (e) {
  console.log('❌ node-fetch no está instalado\n');
  console.log('Instalándolo ahora...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install node-fetch@2', { stdio: 'inherit' });
    console.log('✅ node-fetch instalado. Ejecutando script...\n');
    delete require.cache[require.resolve('./fix-user-role-api.js')];
    require('./fix-user-role-api.js');
  } catch (installError) {
    console.error('Error al instalar node-fetch:', installError.message);
  }
}