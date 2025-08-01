/**
 * Script para Corregir Configuración de Firebase - Altamedica API Server
 * Actualiza las variables de entorno de Firebase para desarrollo
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Corrigiendo configuración de Firebase para desarrollo...\n');

// Configuración de Firebase para desarrollo
const firebaseConfig = {
  FIREBASE_PROJECT_ID: 'altamedica-medical',
  FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nDEMO-KEY-FOR-DEVELOPMENT\n-----END PRIVATE KEY-----\n',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-demo@altamedica-medical.iam.gserviceaccount.com',
  FIREBASE_STORAGE_BUCKET: 'altamedica-medical.appspot.com',
  FIREBASE_DATABASE_URL: 'https://altamedica-medical-default-rtdb.firebaseio.com'
};

// Ruta al archivo .env.local
const envFilePath = path.join(__dirname, '..', '.env.local');

function actualizarConfiguracionFirebase() {
  try {
    // Verificar si el archivo existe
    if (!existsSync(envFilePath)) {
      console.log('❌ Archivo .env.local no encontrado');
      console.log('💡 Crea el archivo .env.local basado en .env.example');
      return false;
    }

    // Leer el archivo actual
    const contenidoActual = readFileSync(envFilePath, 'utf8');
    
    // Actualizar las variables de Firebase
    let contenidoActualizado = contenidoActual;
    
    // Reemplazar cada variable de Firebase
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      const nuevaLinea = `${key}=${value}`;
      
      if (contenidoActualizado.match(regex)) {
        contenidoActualizado = contenidoActualizado.replace(regex, nuevaLinea);
        console.log(`✅ ${key} actualizada`);
      } else {
        // Si no existe, agregar después de la sección de Firebase
        const firebaseSection = contenidoActualizado.indexOf('# Firebase (Autenticación y Notificaciones)');
        if (firebaseSection !== -1) {
          const endOfSection = contenidoActualizado.indexOf('\n\n', firebaseSection);
          const insertPosition = endOfSection !== -1 ? endOfSection + 2 : firebaseSection;
          contenidoActualizado = contenidoActualizado.slice(0, insertPosition) + 
                                `${key}=${value}\n` + 
                                contenidoActualizado.slice(insertPosition);
          console.log(`✅ ${key} agregada`);
        } else {
          // Agregar al final del archivo
          contenidoActualizado += `\n# Firebase Development Configuration\n${key}=${value}\n`;
          console.log(`✅ ${key} agregada al final`);
        }
      }
    });

    // Escribir el archivo actualizado
    writeFileSync(envFilePath, contenidoActualizado, 'utf8');
    
    console.log('\n✅ Configuración de Firebase actualizada exitosamente');
    console.log('📝 Archivo actualizado:', envFilePath);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error.message);
    return false;
  }
}

function mostrarInstrucciones() {
  console.log('\n📋 INSTRUCCIONES MANUALES (si el script falla):');
  console.log('================================================');
  console.log('1. Abre el archivo apps/api-server/.env.local');
  console.log('2. Busca la sección "Firebase (Autenticación y Notificaciones)"');
  console.log('3. Actualiza las siguientes variables:');
  console.log('');
  console.log('   FIREBASE_PROJECT_ID=altamedica-medical');
  console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nDEMO-KEY-FOR-DEVELOPMENT\n-----END PRIVATE KEY-----\n"');
  console.log('   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-demo@altamedica-medical.iam.gserviceaccount.com');
  console.log('   FIREBASE_STORAGE_BUCKET=altamedica-medical.appspot.com');
  console.log('   FIREBASE_DATABASE_URL=https://altamedica-medical-default-rtdb.firebaseio.com');
  console.log('');
  console.log('4. Guarda el archivo');
  console.log('5. Reinicia el servidor api-server');
}

function verificarConfiguracion() {
  try {
    if (!existsSync(envFilePath)) {
      console.log('❌ Archivo .env.local no encontrado');
      return false;
    }

    const contenido = readFileSync(envFilePath, 'utf8');
    
    // Verificar que todas las variables estén presentes
    const variablesRequeridas = Object.keys(firebaseConfig);
    const variablesFaltantes = variablesRequeridas.filter(key => !contenido.includes(key));
    
    if (variablesFaltantes.length > 0) {
      console.log('⚠️ Variables faltantes:', variablesFaltantes.join(', '));
      return false;
    }
    
    console.log('✅ Todas las variables de Firebase están configuradas');
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar configuración:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔍 Verificando configuración actual...');
  
  if (verificarConfiguracion()) {
    console.log('✅ La configuración ya está correcta');
    return;
  }
  
  console.log('🔄 Actualizando configuración...');
  
  if (actualizarConfiguracionFirebase()) {
    console.log('\n🎯 CONFIGURACIÓN COMPLETADA');
    console.log('============================');
    console.log('✅ Firebase configurado para desarrollo');
    console.log('✅ Clave privada de demostración configurada');
    console.log('✅ Variables de entorno actualizadas');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('1. Reinicia el servidor api-server');
    console.log('2. Verifica que no hay errores de Firebase');
    console.log('3. Prueba las APIs de appointments');
  } else {
    console.log('\n❌ No se pudo actualizar automáticamente');
    mostrarInstrucciones();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { actualizarConfiguracionFirebase, verificarConfiguracion }; 