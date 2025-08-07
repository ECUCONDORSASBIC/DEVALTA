// Script para corregir TODOS los usuarios sin rol en Firestore
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../apps/api-server/altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'altamedic-20f69'
});

const db = admin.firestore();

async function fixAllUsersWithoutRole() {
  console.log('🔧 Iniciando corrección masiva de usuarios sin rol...\n');
  
  try {
    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`📊 Total de usuarios encontrados: ${usersSnapshot.size}\n`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Procesar cada usuario
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Verificar si el usuario no tiene rol
      if (!userData.role) {
        console.log(`🔍 Usuario sin rol encontrado:`);
        console.log(`   - UID: ${userId}`);
        console.log(`   - Email: ${userData.email}`);
        console.log(`   - Nombre: ${userData.displayName || userData.firstName || 'Sin nombre'}`);
        
        try {
          // Actualizar el usuario con rol 'patient' por defecto
          await db.collection('users').doc(userId).update({
            role: 'patient',
            userType: 'patient',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   ✅ Rol actualizado a: patient\n`);
          fixedCount++;
        } catch (error) {
          console.error(`   ❌ Error actualizando usuario: ${error.message}\n`);
          errorCount++;
        }
      }
    }
    
    console.log('='.repeat(50));
    console.log('📊 RESUMEN DE LA MIGRACIÓN:');
    console.log(`   - Usuarios totales: ${usersSnapshot.size}`);
    console.log(`   - Usuarios sin rol corregidos: ${fixedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log(`   - Usuarios con rol existente: ${usersSnapshot.size - fixedCount - errorCount}`);
    console.log('='.repeat(50));
    
    if (fixedCount > 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('💡 Todos los usuarios sin rol ahora tienen el rol "patient" por defecto.');
    } else {
      console.log('\n✅ No se encontraron usuarios sin rol. Todo está correcto.');
    }
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    // Cerrar la conexión
    await admin.app().delete();
  }
}

// Función para mostrar usuarios por rol (estadísticas)
async function showUserStatsByRole() {
  console.log('\n📊 ESTADÍSTICAS DE USUARIOS POR ROL:');
  console.log('='.repeat(50));
  
  try {
    const roles = ['patient', 'doctor', 'company', 'admin'];
    
    for (const role of roles) {
      const count = await db.collection('users')
        .where('role', '==', role)
        .get()
        .then(snapshot => snapshot.size);
      
      console.log(`   ${role.toUpperCase()}: ${count} usuarios`);
    }
    
    // Contar usuarios sin rol
    const allUsers = await db.collection('users').get();
    let noRoleCount = 0;
    
    allUsers.forEach(doc => {
      if (!doc.data().role) {
        noRoleCount++;
      }
    });
    
    if (noRoleCount > 0) {
      console.log(`   ⚠️  SIN ROL: ${noRoleCount} usuarios`);
    }
    
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
}

// Ejecutar
console.log('🏥 ALTAMEDICA - Script de Migración de Usuarios\n');

// Mostrar estadísticas antes de la migración
showUserStatsByRole().then(() => {
  console.log('\n🚀 Iniciando migración...\n');
  fixAllUsersWithoutRole();
});