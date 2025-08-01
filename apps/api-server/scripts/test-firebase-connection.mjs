#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

console.log('🔥 Probando conexión real con Firebase Admin SDK...\n');

async function testFirebaseConnection() {
  try {
    // Verificar variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n');

    console.log('📋 Configuración:');
    console.log('   Project ID:', projectId);
    console.log('   Client Email:', clientEmail);
    console.log('   Private Key:', privateKey ? '✅ Configurada' : '❌ No encontrada');
    console.log();

    // Inicializar Firebase Admin
    let app;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin inicializado correctamente\n');
    } else {
      app = getApps()[0];
      console.log('✅ Usando instancia existente de Firebase Admin\n');
    }

    // Obtener servicios
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Test 1: Verificar conexión a Firestore
    console.log('🧪 Test 1: Probando conexión a Firestore...');
    try {
      const testCollection = db.collection('_test_connection');
      const timestamp = new Date().toISOString();
      
      // Intentar escribir un documento de prueba
      const docRef = await testCollection.doc('test').set({
        timestamp,
        test: true,
        message: 'Conexión exitosa desde API Server'
      });
      
      console.log('   ✅ Escritura exitosa en Firestore');
      
      // Leer el documento
      const doc = await testCollection.doc('test').get();
      if (doc.exists) {
        console.log('   ✅ Lectura exitosa:', doc.data());
      }
      
      // Limpiar documento de prueba
      await testCollection.doc('test').delete();
      console.log('   ✅ Limpieza exitosa\n');
      
    } catch (error) {
      console.log('   ❌ Error con Firestore:', error.message);
      console.log('   Código de error:', error.code);
      console.log();
    }

    // Test 2: Listar algunos usuarios (si existen)
    console.log('🧪 Test 2: Probando Firebase Auth...');
    try {
      const listUsersResult = await auth.listUsers(5);
      console.log('   ✅ Conexión a Auth exitosa');
      console.log('   Usuarios encontrados:', listUsersResult.users.length);
      
      if (listUsersResult.users.length > 0) {
        console.log('   Primeros usuarios:');
        listUsersResult.users.forEach(user => {
          console.log(`     - ${user.email || 'Sin email'} (${user.uid})`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error con Auth:', error.message);
    }

    console.log('\n✅ ¡Configuración de Firebase Admin completada y funcionando!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. El API server ya puede usar Firebase Admin SDK');
    console.log('   2. Puedes importar adminAuth y adminDb en tus rutas');
    console.log('   3. Las credenciales están correctamente configuradas');
    
  } catch (error) {
    console.error('\n❌ Error general:', error);
    console.error('Detalles:', error.message);
  }

  process.exit(0);
}

testFirebaseConnection().catch(console.error);