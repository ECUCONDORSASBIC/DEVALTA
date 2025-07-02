#!/usr/bin/env node
// 🔒 VALIDADOR SEGURO DE VARIABLES DE ENTORNO
// Previene errores de "Cannot read properties of undefined"

const path = require('path');
const fs = require('fs');

function safeEnvLoader() {
  console.log('🔒 Cargando variables de entorno de forma segura...');
  
  // Intentar cargar desde diferentes ubicaciones
  const envPaths = [
    path.join(__dirname, '..', 'apps', 'api-server', '.env.local'),
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '.env.local')
  ];
  
  let loaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`   ✅ Cargando desde: ${envPath}`);
      require('dotenv').config({ path: envPath });
      loaded = true;
      break;
    }
  }
  
  if (!loaded) {
    console.log('   ⚠️  No se encontró archivo .env.local');
  }
  
  // Validar variables críticas de Firebase
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  const missing = [];
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value === '') {
      missing.push(varName);
    } else {
      console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`);
    }
  }
  
  if (missing.length > 0) {
    console.log('   ❌ Variables faltantes:', missing.join(', '));
    return false;
  }
  
  return true;
}

// Función segura para procesar FIREBASE_PRIVATE_KEY
function safeProcessPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('   ❌ FIREBASE_PRIVATE_KEY is undefined');
    return null;
  }
  
  if (typeof privateKey !== 'string') {
    console.log('   ❌ FIREBASE_PRIVATE_KEY is not a string');
    return null;
  }
  
  try {
    return privateKey.replace(/\\n/g, '\n');
  } catch (error) {
    console.log('   ❌ Error processing FIREBASE_PRIVATE_KEY:', error.message);
    return null;
  }
}

module.exports = {
  safeEnvLoader,
  safeProcessPrivateKey
};

// Si se ejecuta directamente
if (require.main === module) {
  console.log('🔒 VALIDADOR SEGURO DE VARIABLES DE ENTORNO');
  console.log('==========================================');
  
  const isValid = safeEnvLoader();
  const processedKey = safeProcessPrivateKey();
  
  console.log('');
  console.log('📊 RESULTADO:');
  console.log(`   Variables válidas: ${isValid ? '✅' : '❌'}`);
  console.log(`   Private key procesada: ${processedKey ? '✅' : '❌'}`);
  
  process.exit(isValid && processedKey ? 0 : 1);
}
