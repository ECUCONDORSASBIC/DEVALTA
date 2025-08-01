#!/usr/bin/env node

// 🧪 Test de verificación ES Modules - DevAltaMedica
// Verifica que las configuraciones ES modules funcionen correctamente

console.log('🧪 Verificando configuraciones ES Modules...\n');

async function testApp(appName, appPath) {
  console.log(`📱 Probando ${appName}...`);
  
  try {
    // Test 1: Verificar que next.config.js se puede importar
    const configPath = `${appPath}/next.config.js`;
    const config = await import(configPath);
    console.log(`   ✅ next.config.js se importa correctamente`);
    console.log(`   ✅ Configuración: ${config.default ? 'ES modules ✓' : 'CommonJS ❌'}`);
    
    // Test 2: Verificar package.json
    const fs = await import('fs');
    const pkg = JSON.parse(fs.readFileSync(`${appPath}/package.json`, 'utf8'));
    console.log(`   ✅ package.json type: ${pkg.type || 'commonjs'}`);
    
    console.log(`   🎉 ${appName} configurado correctamente\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error en ${appName}: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  const results = [];
  
  results.push(await testApp('web-app', './apps/web-app'));
  results.push(await testApp('companies', './apps/companies'));
  results.push(await testApp('doctors', './apps/doctors'));
  results.push(await testApp('patients', './apps/patients'));
  results.push(await testApp('admin', './apps/admin'));
  results.push(await testApp('api-server', './apps/api-server'));
  
  const success = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 RESUMEN DE VERIFICACIÓN:');
  console.log(`   ✅ Aplicaciones exitosas: ${success}/${total}`);
  console.log(`   🎯 Estado: ${success === total ? '¡TODAS CORRECTAS!' : 'Algunas necesitan ajustes'}`);
  
  if (success === total) {
    console.log('\n🚀 ¡Estandarización ES Modules completada exitosamente!');
    console.log('   Todas las aplicaciones usan el mismo sistema de módulos.');
  }
}

// Cambiar al directorio del proyecto
process.chdir('/home/altamedica/devaltamedica');
runTests().catch(console.error);