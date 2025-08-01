#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

console.log('🔥 Probando inicialización de Firebase Admin...\n');

// Verificar variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('📋 Variables de entorno:');
console.log('   Project ID:', projectId);
console.log('   Client Email:', clientEmail);
console.log('   Private Key length:', privateKey ? privateKey.length : 0);

if (privateKey) {
  console.log('\n🔑 Análisis de Private Key:');
  console.log('   Empieza con:', privateKey.substring(0, 30) + '...');
  console.log('   Termina con:', '...' + privateKey.substring(privateKey.length - 30));
  console.log('   Contiene \\n literal:', privateKey.includes('\\n'));
  console.log('   Contiene salto de línea real:', privateKey.includes('\n'));
  
  // Probar el replace
  const processedKey = privateKey.replace(/\\n/g, '\n');
  console.log('\n📝 Después de procesar:');
  console.log('   Longitud original:', privateKey.length);
  console.log('   Longitud procesada:', processedKey.length);
  console.log('   Diferencia:', processedKey.length - privateKey.length);
}

process.exit(0);