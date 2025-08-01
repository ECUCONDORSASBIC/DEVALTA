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

console.log('🔥 Test de Firebase Admin con JSON completo...\n');

try {
  // Probar con el JSON completo
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('📋 Parseando FIREBASE_SERVICE_ACCOUNT...');
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    console.log('✅ JSON parseado correctamente');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);
    console.log('   Private Key ID:', serviceAccount.private_key_id);
    
    console.log('\n🔧 Inicializando Firebase Admin...');
    
    const app = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      })
    });
    
    console.log('✅ ¡Firebase Admin inicializado exitosamente!');
    console.log('   Nombre del proyecto:', app.name);
    
    // Probar que funcione obteniendo la configuración
    console.log('\n🧪 Verificando funcionamiento...');
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth(app);
    
    // Intentar listar algunos usuarios (solo para verificar que funciona)
    const listResult = await auth.listUsers(1);
    console.log('✅ Conexión verificada - Firebase Admin está funcionando correctamente');
    
  } else {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT no está definido en .env.local');
  }
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  
  if (error.message.includes('Invalid PEM')) {
    console.error('\n⚠️  El formato de la private key es incorrecto');
    console.error('   Verifica que los saltos de línea estén correctamente formateados');
  }
  
  if (error.code === 'app/invalid-credential') {
    console.error('\n⚠️  Las credenciales son inválidas');
    console.error('   Verifica que el archivo JSON sea correcto');
  }
}

process.exit(0);