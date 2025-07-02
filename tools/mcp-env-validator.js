#!/usr/bin/env node
// 🔒 VALIDADOR DEFINITIVO - Previene errores undefined

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar dotenv si está disponible
try {
  const { config } = await import('dotenv');
  config({ 
    path: path.join(__dirname, '..', 'apps', 'api-server', '.env.local') 
  });
} catch (e) {
  console.log('⚠️  dotenv no disponible, usando variables del sistema');
}

function validateMcpEnvironment() {
  console.log('🔒 VALIDACIÓN COMPLETA DE ENTORNO MCP');
  console.log('=====================================');
  
  // 1. Verificar Node.js
  console.log(`📦 Node.js: ${process.version}`);
  
  // 2. Verificar paths críticos
  const criticalPaths = [
    'C:\\Users\\Eduardo\\Documents\\altamedicadev',
    'C:\\Users\\Eduardo\\GTABA\\node_modules',
    'C:\\Users\\Eduardo\\AppData\\Roaming\\Claude'
  ];
  
  let pathsValid = true;
  criticalPaths.forEach(p => {
    const exists = fs.existsSync(p);
    console.log(`📁 ${p}: ${exists ? '✅' : '❌'}`);
    if (!exists) pathsValid = false;
  });
  
  // 3. Verificar variables de entorno de forma segura
  const envVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];
  
  let envValid = true;
  envVars.forEach(varName => {
    const value = process.env[varName];
    const isValid = value && value !== 'undefined' && value.length > 0;
    console.log(`🔑 ${varName}: ${isValid ? '✅' : '❌'}`);
    if (!isValid) envValid = false;
  });
  
  // 4. Función segura para procesar FIREBASE_PRIVATE_KEY
  function safeProcessPrivateKey() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!privateKey || privateKey === 'undefined') {
      return null;
    }
    
    try {
      return privateKey.replace(/\\n/g, '\n');
    } catch (error) {
      console.log(`❌ Error procesando FIREBASE_PRIVATE_KEY: ${error.message}`);
      return null;
    }
  }
  
  const processedKey = safeProcessPrivateKey();
  console.log(`🔐 Private key procesada: ${processedKey ? '✅' : '❌'}`);
  
  // 5. Verificar configuración MCP
  const mcpConfigPath = 'C:\\Users\\Eduardo\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
  let mcpValid = false;
  
  if (fs.existsSync(mcpConfigPath)) {
    try {
      const configContent = fs.readFileSync(mcpConfigPath, 'utf8');
      const config = JSON.parse(configContent);
      const hasAltamedicadev = configContent.includes('altamedicadev');
      mcpValid = hasAltamedicadev;
      console.log(`📋 MCP Config: ${mcpValid ? '✅' : '❌'}`);
      console.log(`📊 MCP Servers: ${Object.keys(config.mcpServers || {}).length}`);
    } catch (e) {
      console.log(`📋 MCP Config: ❌ Error leyendo`);
    }
  } else {
    console.log(`📋 MCP Config: ❌ No existe`);
  }
  
  // 6. Resultado final
  const allValid = pathsValid && envValid && processedKey && mcpValid;
  console.log('');
  console.log('📊 RESULTADO FINAL:');
  console.log(`   Paths: ${pathsValid ? '✅' : '❌'}`);
  console.log(`   Variables: ${envValid ? '✅' : '❌'}`);
  console.log(`   Private Key: ${processedKey ? '✅' : '❌'}`);
  console.log(`   MCP Config: ${mcpValid ? '✅' : '❌'}`);
  console.log(`   SISTEMA LISTO: ${allValid ? '✅ SÍ' : '❌ NO'}`);
  
  return allValid;
}

// Exportar para uso en otros scripts
export { validateMcpEnvironment };

// Ejecutar si es el script principal
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  const isValid = validateMcpEnvironment();
  process.exit(isValid ? 0 : 1);
}
