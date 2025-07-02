#!/usr/bin/env node
// 🔧 PARCHE PARA SERVIDORES MCP - Previene errores de variables undefined

const fs = require('fs');
const path = require('path');

console.log('🔧 APLICANDO PARCHE A SERVIDORES MCP');
console.log('==================================');

const filesToPatch = [
  'tools/firestore-diagnostic.js',
  'tools/firestore-field-correction.js',
  'tools/migrate-firestore-fields.js'
];

const safePatch = `
// 🔒 SAFE ENV PROCESSING - Previene errores de undefined
function safeProcessPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('❌ FIREBASE_PRIVATE_KEY is undefined');
    return null;
  }
  
  if (typeof privateKey !== 'string') {
    console.log('❌ FIREBASE_PRIVATE_KEY is not a string');
    return null;
  }
  
  try {
    return privateKey.replace(/\\\\n/g, '\\n');
  } catch (error) {
    console.log('❌ Error processing FIREBASE_PRIVATE_KEY:', error.message);
    return null;
  }
}
`;

filesToPatch.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`🔧 Parcheando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar líneas problemáticas
    const problematicLine = 'privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, \'\\n\'),';
    const safeLine = 'privateKey: safeProcessPrivateKey(),';
    
    if (content.includes(problematicLine)) {
      // Agregar función segura al inicio
      content = safePatch + '\n\n' + content;
      // Reemplazar línea problemática
      content = content.replace(problematicLine, safeLine);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   ✅ ${filePath} parcheado correctamente`);
    } else {
      console.log(`   ⚠️  ${filePath} no contiene la línea problemática`);
    }
  } else {
    console.log(`   ❌ ${filePath} no existe`);
  }
});

console.log('\n🎉 PARCHE COMPLETADO');
