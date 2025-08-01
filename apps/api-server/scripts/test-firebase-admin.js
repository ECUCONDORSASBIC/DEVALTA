#!/usr/bin/env node

// Script para probar la configuración de Firebase Admin
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

// Importar Firebase Admin
import { getAuthAdmin, getFirestoreAdmin } from '../src/lib/firebase-admin.js';

async function testFirebaseAdmin() {
  console.log('🧪 Probando configuración de Firebase Admin...\n');

  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '❌ No configurado');
  console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ No configurado');
  console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ No configurado');
  console.log();

  try {
    // Test 1: Obtener instancia de Auth
    console.log('🔐 Test 1: Obteniendo instancia de Auth...');
    const auth = getAuthAdmin();
    if (auth) {
      console.log('   ✅ Firebase Auth inicializado correctamente');
    } else {
      console.log('   ❌ Error al inicializar Firebase Auth');
      return;
    }

    // Test 2: Obtener instancia de Firestore
    console.log('\n📊 Test 2: Obteniendo instancia de Firestore...');
    const db = getFirestoreAdmin();
    if (db) {
      console.log('   ✅ Firestore inicializado correctamente');
    } else {
      console.log('   ❌ Error al inicializar Firestore');
      return;
    }

    // Test 3: Intentar una operación simple de Firestore
    console.log('\n🔍 Test 3: Probando operación de Firestore...');
    try {
      const testCollection = db.collection('_test_connection');
      const testDoc = await testCollection.doc('test').get();
      console.log('   ✅ Conexión a Firestore exitosa');
      console.log('   📄 Documento existe:', testDoc.exists);
    } catch (error) {
      console.log('   ⚠️  Error conectando a Firestore:', error.message);
      console.log('   ℹ️  Esto es normal si no tienes acceso completo aún');
    }

    // Test 4: Verificar el proyecto
    console.log('\n🏗️  Test 4: Información del proyecto:');
    console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

    console.log('\n✅ Pruebas completadas!');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Actualiza FIREBASE_CLIENT_EMAIL con el email correcto de tu service account');
    console.log('   2. El email debe ser algo como: firebase-adminsdk-XXXXX@altamedic-20f69.iam.gserviceaccount.com');
    console.log('   3. Lo puedes encontrar en tu archivo JSON de Firebase en el campo "client_email"');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
  }

  process.exit(0);
}

// Ejecutar las pruebas
testFirebaseAdmin().catch(console.error);