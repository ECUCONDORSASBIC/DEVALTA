#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

console.log('🔥 Test directo de Firebase Admin...\n');

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('📋 Credenciales:');
  console.log('   Project ID:', projectId);
  console.log('   Client Email:', clientEmail);
  console.log('   Private Key:', privateKey ? '✅ Presente' : '❌ Faltante');

  console.log('\n🔧 Intentando inicializar Firebase Admin...');
  
  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  console.log('✅ ¡Firebase Admin inicializado exitosamente!');
  console.log('   Nombre del proyecto:', app.name);
  
} catch (error) {
  console.error('\n❌ Error al inicializar Firebase Admin:');
  console.error('   Mensaje:', error.message);
  console.error('   Código:', error.code);
  
  if (error.message.includes('Invalid PEM')) {
    console.error('\n⚠️  El formato de la private key parece incorrecto.');
    console.error('   Asegúrate de que:');
    console.error('   1. La key comience con -----BEGIN PRIVATE KEY-----');
    console.error('   2. La key termine con -----END PRIVATE KEY-----');
    console.error('   3. Los saltos de línea estén en formato \\n');
  }
}

process.exit(0);