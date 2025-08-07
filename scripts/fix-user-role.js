// Script para corregir el rol del usuario en Firestore
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../apps/api-server/altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'altamedic-20f69'
});

const db = admin.firestore();

async function fixUserRole() {
  const userId = '4oWIETuRzgZbXxtVSlhzJywm1103';
  const userEmail = 'eeecucondor@gmail.com';
  
  console.log('🔧 Corrigiendo rol de usuario...');
  console.log('👤 Usuario:', userEmail);
  console.log('🆔 UID:', userId);
  
  try {
    // Obtener el documento actual
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('❌ Usuario no encontrado en Firestore');
      return;
    }
    
    const currentData = userDoc.data();
    console.log('\n📄 Datos actuales del usuario:');
    console.log('- Email:', currentData.email);
    console.log('- Role:', currentData.role || 'UNDEFINED');
    console.log('- UserType:', currentData.userType);
    
    // Actualizar el rol a 'patient'
    await db.collection('users').doc(userId).update({
      role: 'patient',
      userType: 'patient',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('\n✅ Rol actualizado exitosamente a: patient');
    
    // Verificar la actualización
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n📄 Datos actualizados:');
    console.log('- Role:', updatedData.role);
    console.log('- UserType:', updatedData.userType);
    
    console.log('\n🎉 ¡Listo! Ahora el usuario debería poder iniciar sesión y ser redirigido a http://localhost:3003');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar la conexión
    await admin.app().delete();
  }
}

// Ejecutar
fixUserRole();