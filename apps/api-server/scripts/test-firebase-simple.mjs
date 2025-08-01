#!/usr/bin/env node

// Script simple para verificar la configuración de Firebase
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

console.log('🧪 Verificando configuración de Firebase...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno configuradas:');
console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '❌ No configurado');
console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || '❌ No configurado');
console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado (longitud: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '❌ No configurado');
console.log('   FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || '❌ No configurado');
console.log('   FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL || '❌ No configurado');

console.log('\n⚠️  IMPORTANTE:');
console.log('   Necesitas actualizar FIREBASE_CLIENT_EMAIL con el valor correcto de tu archivo JSON');
console.log('   Debería ser algo como: firebase-adminsdk-XXXXX@altamedic-20f69.iam.gserviceaccount.com');
console.log('\n   En tu archivo JSON de Firebase, busca el campo "client_email" y copia ese valor');

// Verificar si la private key parece válida
if (process.env.FIREBASE_PRIVATE_KEY) {
  const hasBegin = process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----');
  const hasEnd = process.env.FIREBASE_PRIVATE_KEY.includes('-----END PRIVATE KEY-----');
  const hasNewlines = process.env.FIREBASE_PRIVATE_KEY.includes('\\\\n');
  
  console.log('\n🔑 Validación de Private Key:');
  console.log('   Contiene BEGIN:', hasBegin ? '✅' : '❌');
  console.log('   Contiene END:', hasEnd ? '✅' : '❌');
  console.log('   Contiene saltos de línea:', hasNewlines ? '✅' : '❌');
  
  if (hasBegin && hasEnd && hasNewlines) {
    console.log('   ✅ La private key parece estar en el formato correcto');
  } else {
    console.log('   ❌ La private key podría tener problemas de formato');
  }
}