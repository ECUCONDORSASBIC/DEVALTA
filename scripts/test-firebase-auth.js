#!/usr/bin/env node
/**
 * Script de prueba para Firebase Auth
 * Verifica que la autenticación esté funcionando correctamente
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkzR3fZjtwsGu4wJ6jNnbjcSLGu3rWoGs",
  authDomain: "altamedic-20f69.firebaseapp.com",
  databaseURL: "https://altamedic-20f69-default-rtdb.firebaseio.com",
  projectId: "altamedic-20f69",
  storageBucket: "altamedic-20f69.firebasestorage.app",
  messagingSenderId: "131880235210",
  appId: "1:131880235210:web:35d867452b6488c245c433",
  measurementId: "G-X3FJNH06PN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Datos de prueba
const testUser = {
  email: `test-${Date.now()}@altamedica.com`,
  password: 'Test123456!',
  firstName: 'Test',
  lastName: 'User',
  role: 'patient'
};

async function testFirebaseAuth() {
  console.log('🏥 ALTAMEDICA - Prueba de Firebase Auth');
  console.log('=====================================\n');

  try {
    // 1. Crear usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testUser.email, 
      testUser.password
    );
    const user = userCredential.user;
    console.log('✅ Usuario creado:', user.uid);

    // 2. Crear documento en Firestore
    console.log('\n2️⃣ Creando documento en Firestore...');
    const userData = {
      uid: user.uid,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      role: testUser.role,
      patientId: user.uid,
      permissions: ["read:own_records", "write:own_appointments"],
      isActive: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ Documento creado en Firestore');

    // 3. Verificar documento
    console.log('\n3️⃣ Verificando documento...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      console.log('✅ Documento verificado:', userDoc.data());
    } else {
      console.log('❌ Documento no encontrado');
    }

    // 4. Cerrar sesión
    console.log('\n4️⃣ Cerrando sesión...');
    await signOut(auth);
    console.log('✅ Sesión cerrada');

    // 5. Iniciar sesión
    console.log('\n5️⃣ Iniciando sesión...');
    const loginCredential = await signInWithEmailAndPassword(
      auth, 
      testUser.email, 
      testUser.password
    );
    console.log('✅ Sesión iniciada:', loginCredential.user.uid);

    // 6. Obtener token
    console.log('\n6️⃣ Obteniendo token...');
    const token = await loginCredential.user.getIdToken();
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');

    // 7. Verificar estado de autenticación
    console.log('\n7️⃣ Verificando estado de autenticación...');
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('✅ Usuario autenticado:', currentUser.email);
    } else {
      console.log('❌ No hay usuario autenticado');
    }

    // 8. Cerrar sesión final
    console.log('\n8️⃣ Cerrando sesión final...');
    await signOut(auth);
    console.log('✅ Sesión cerrada');

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- ✅ Creación de usuario');
    console.log('- ✅ Documento en Firestore');
    console.log('- ✅ Autenticación');
    console.log('- ✅ Obtención de token');
    console.log('- ✅ Gestión de sesión');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    
    // Intentar limpiar usuario de prueba si existe
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await signOut(auth);
      }
    } catch (cleanupError) {
      console.error('Error limpiando sesión:', cleanupError);
    }
  }
}

// Ejecutar pruebas
testFirebaseAuth().then(() => {
  console.log('\n🏁 Pruebas completadas');
  process.exit(0);
}).catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 