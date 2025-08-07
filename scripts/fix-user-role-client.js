// Script para corregir el rol del usuario usando Firebase Client SDK
// Este script debe ejecutarse en el navegador

const script = `
// Función para actualizar el rol del usuario
async function fixUserRole() {
  const userId = '4oWIETuRzgZbXxtVSlhzJywm1103';
  const userEmail = 'eeecucondor@gmail.com';
  
  console.log('🔧 Corrigiendo rol de usuario...');
  console.log('👤 Usuario:', userEmail);
  console.log('🆔 UID:', userId);
  
  try {
    // Verificar que Firebase esté inicializado
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase no está disponible. Asegúrate de estar en la página de login.');
      return;
    }
    
    const db = firebase.firestore();
    
    // Obtener el documento actual
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('❌ Usuario no encontrado en Firestore');
      return;
    }
    
    const currentData = userDoc.data();
    console.log('\\n📄 Datos actuales del usuario:');
    console.log('- Email:', currentData.email);
    console.log('- Role:', currentData.role || 'UNDEFINED');
    console.log('- UserType:', currentData.userType);
    
    // Actualizar el rol a 'patient'
    await db.collection('users').doc(userId).update({
      role: 'patient',
      userType: 'patient',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('\\n✅ Rol actualizado exitosamente a: patient');
    
    // Verificar la actualización
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\\n📄 Datos actualizados:');
    console.log('- Role:', updatedData.role);
    console.log('- UserType:', updatedData.userType);
    
    console.log('\\n🎉 ¡Listo! Ahora puedes intentar iniciar sesión nuevamente.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
fixUserRole();
`;

console.log('📋 Script generado para ejecutar en el navegador.\n');
console.log('Instrucciones:');
console.log('1. Abre http://localhost:3000/login en Chrome');
console.log('2. Abre la consola del navegador (F12)');
console.log('3. Copia y pega el siguiente código:\n');
console.log('='.repeat(50));
console.log(script);
console.log('='.repeat(50));
console.log('\n4. Presiona Enter para ejecutar');
console.log('5. Una vez actualizado, intenta iniciar sesión nuevamente');