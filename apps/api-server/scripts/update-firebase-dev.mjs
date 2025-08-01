/**
 * Script Directo para Actualizar Firebase - Desarrollo
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Actualizando configuración de Firebase para desarrollo...\n');

const envFilePath = path.join(__dirname, '..', '.env.local');

try {
  if (!existsSync(envFilePath)) {
    console.log('❌ Archivo .env.local no encontrado');
    process.exit(1);
  }

  let contenido = readFileSync(envFilePath, 'utf8');
  
  // Reemplazos directos
  const reemplazos = [
    {
      buscar: /FIREBASE_PROJECT_ID=altamedica-prod/g,
      reemplazar: 'FIREBASE_PROJECT_ID=altamedica-medical'
    },
    {
      buscar: /FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_FIREBASE\n-----END PRIVATE KEY-----"/g,
      reemplazar: 'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nDEMO-KEY-FOR-DEVELOPMENT\n-----END PRIVATE KEY-----"'
    },
    {
      buscar: /FIREBASE_CLIENT_EMAIL=firebase-adminsdk@altamedica-prod\.iam\.gserviceaccount\.com/g,
      reemplazar: 'FIREBASE_CLIENT_EMAIL=firebase-adminsdk-demo@altamedica-medical.iam.gserviceaccount.com'
    },
    {
      buscar: /FIREBASE_STORAGE_BUCKET=altamedica-prod\.appspot\.com/g,
      reemplazar: 'FIREBASE_STORAGE_BUCKET=altamedica-medical.appspot.com'
    }
  ];

  let cambiosRealizados = 0;
  
  reemplazos.forEach(({ buscar, reemplazar }) => {
    if (contenido.match(buscar)) {
      contenido = contenido.replace(buscar, reemplazar);
      cambiosRealizados++;
      console.log(`✅ Variable actualizada`);
    }
  });

  // Agregar FIREBASE_DATABASE_URL si no existe
  if (!contenido.includes('FIREBASE_DATABASE_URL')) {
    contenido = contenido.replace(
      'FIREBASE_STORAGE_BUCKET=altamedica-medical.appspot.com',
      'FIREBASE_STORAGE_BUCKET=altamedica-medical.appspot.com\nFIREBASE_DATABASE_URL=https://altamedica-medical-default-rtdb.firebaseio.com'
    );
    cambiosRealizados++;
    console.log(`✅ FIREBASE_DATABASE_URL agregada`);
  }

  writeFileSync(envFilePath, contenido, 'utf8');
  
  console.log(`\n✅ ${cambiosRealizados} cambios realizados`);
  console.log('📝 Archivo actualizado:', envFilePath);
  console.log('\n🚀 Reinicia el servidor api-server para aplicar los cambios');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 