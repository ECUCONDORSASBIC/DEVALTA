console.log(`
🔍 INSTRUCCIONES PARA DIAGNOSTICAR PATIENTS APP
==============================================

1. Abre http://localhost:3003 en Chrome
2. Abre la consola del navegador (F12)
3. Copia y pega el siguiente código:

// Verificar estado de autenticación
if (firebase && firebase.auth().currentUser) {
  const user = firebase.auth().currentUser;
  console.log('Usuario actual:', {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified
  });
  
  // Verificar perfil en Firestore
  firebase.firestore().collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        console.log('Perfil:', doc.data());
      } else {
        console.log('❌ No hay perfil en Firestore');
      }
    });
} else {
  console.log('❌ No hay usuario autenticado');
}

// Verificar si hay errores de carga
const loadingElements = document.querySelectorAll('.animate-spin, .loading');
console.log('Elementos cargando:', loadingElements.length);

// Buscar mensajes de error
const errorText = document.body.innerText;
if (errorText.includes('error') || errorText.includes('Error')) {
  console.log('Posibles errores en la página:', errorText.substring(0, 200));
}

4. Comparte el resultado
`);