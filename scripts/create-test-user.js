// Script para crear usuario de prueba en Firebase Auth Emulator
const fetch = require('node-fetch');

async function createTestUser() {
  const authEmulatorUrl = 'http://localhost:9099';
  const projectId = 'demo-project';
  
  // Crear usuario
  const signUpUrl = `${authEmulatorUrl}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
  
  const userData = {
    email: 'test@altamedica.com',
    password: 'test123',
    returnSecureToken: true
  };

  try {
    console.log('Creando usuario de prueba...');
    const response = await fetch(signUpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Usuario creado exitosamente!');
      console.log('Email:', userData.email);
      console.log('Password:', userData.password);
      console.log('ID:', result.localId);
    } else {
      console.error('❌ Error creando usuario:', result.error);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

createTestUser();