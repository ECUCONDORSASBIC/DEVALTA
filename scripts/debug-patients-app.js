// Script para ejecutar en la consola del navegador en localhost:3003
// Esto ayudará a diagnosticar por qué no carga

console.log('🔍 Iniciando diagnóstico de Patients App...\n');

// 1. Verificar Firebase
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase está disponible');
  
  // Verificar autenticación
  const auth = firebase.auth();
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    console.log('✅ Usuario autenticado:', {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified
    });
  } else {
    console.log('❌ No hay usuario autenticado');
  }
} else {
  console.log('❌ Firebase no está disponible');
}

// 2. Verificar Firestore
if (typeof firebase !== 'undefined' && firebase.firestore) {
  console.log('\n📊 Verificando acceso a Firestore...');
  
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    
    if (currentUser) {
      // Intentar leer el perfil del usuario
      db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data();
            console.log('✅ Perfil de usuario encontrado:', {
              email: data.email,
              role: data.role,
              firstName: data.firstName,
              lastName: data.lastName,
              isActive: data.isActive
            });
            
            // Verificar rol
            if (data.role === 'patient' || data.role === 'paciente') {
              console.log('✅ Rol válido para Patients App');
            } else {
              console.log('❌ Rol inválido:', data.role, '- Esta app es solo para pacientes');
            }
          } else {
            console.log('❌ No se encontró perfil de usuario en Firestore');
          }
        })
        .catch(error => {
          console.error('❌ Error leyendo Firestore:', error);
        });
    }
  } catch (error) {
    console.error('❌ Error accediendo a Firestore:', error);
  }
}

// 3. Verificar contexto de React
console.log('\n⚛️ Verificando React y componentes...');

// Buscar el root de React
const reactRoot = document.getElementById('__next');
if (reactRoot) {
  console.log('✅ React root encontrado');
  
  // Verificar si hay contenido
  if (reactRoot.innerHTML.trim()) {
    console.log('✅ React ha renderizado contenido');
    
    // Buscar indicadores de carga
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      console.log(`⏳ ${loadingElements.length} elementos de carga encontrados`);
    }
    
    // Buscar mensajes de error
    const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
    if (errorElements.length > 0) {
      console.log(`❌ ${errorElements.length} elementos de error encontrados:`);
      errorElements.forEach(el => {
        console.log('  -', el.textContent);
      });
    }
  } else {
    console.log('❌ React root está vacío');
  }
} else {
  console.log('❌ No se encontró React root (#__next)');
}

// 4. Verificar estado del AuthProvider
console.log('\n🔐 Verificando AuthProvider...');
// Esto solo funciona si el componente expone el estado globalmente (development)
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ React DevTools detectado - Puedes inspeccionar el estado en la pestaña Components');
}

// 5. Verificar localStorage/sessionStorage
console.log('\n💾 Verificando almacenamiento local...');
const authToken = sessionStorage.getItem('altamedica_auth_token');
const customToken = sessionStorage.getItem('altamedica_custom_token');
const userEmail = sessionStorage.getItem('altamedica_user_email');

console.log('SessionStorage:', {
  hasAuthToken: !!authToken,
  hasCustomToken: !!customToken,
  userEmail: userEmail
});

// 6. Verificar cookies
console.log('\n🍪 Verificando cookies...');
const cookies = document.cookie.split(';').map(c => c.trim());
const relevantCookies = cookies.filter(c => 
  c.includes('altamedica') || 
  c.includes('auth') || 
  c.includes('session')
);
console.log('Cookies relevantes:', relevantCookies.length ? relevantCookies : 'Ninguna');

// 7. Verificar consola de errores
console.log('\n📋 Resumen del diagnóstico:');
console.log('- Firebase:', typeof firebase !== 'undefined' ? '✅' : '❌');
console.log('- Usuario autenticado:', firebase?.auth?.()?.currentUser ? '✅' : '❌');
console.log('- React renderizado:', document.getElementById('__next')?.innerHTML ? '✅' : '❌');
console.log('- Tokens en storage:', authToken || customToken ? '✅' : '❌');

console.log('\n💡 Sugerencias:');
console.log('1. Abre la pestaña Network y busca errores 401/403');
console.log('2. Revisa la consola para errores de JavaScript');
console.log('3. Verifica que el API server esté corriendo en puerto 3001');
console.log('4. Intenta refrescar la página con F5');