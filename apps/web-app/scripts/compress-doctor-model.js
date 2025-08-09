#!/usr/bin/env node

/**
 * 🎯 SCRIPT ESPECÍFICO: Comprimir doctor_male.glb con DRACO
 * 
 * Optimiza únicamente el modelo doctor_male.glb que se está usando
 * en Medical3DCanvas.tsx para mejorar performance de carga.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 ALTAMEDICA - Doctor Model DRACO Compression');
console.log('===============================================\n');

// Rutas específicas para doctor_male.glb
const modelsDir = path.join(__dirname, '../public/models');
const originalModel = path.join(modelsDir, 'doctor_male.glb');
const compressedModel = path.join(modelsDir, 'doctor_male_draco.glb');

// Verificar que existe el modelo original
if (!fs.existsSync(originalModel)) {
  console.error('❌ Error: doctor_male.glb no encontrado en:', originalModel);
  process.exit(1);
}

// Obtener tamaño original
const originalSize = fs.statSync(originalModel).size;
console.log(`📦 Modelo original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

try {
  console.log('🔄 Comprimiendo doctor_male.glb con DRACO...\n');

  // Comando optimizado para modelos médicos 3D
  const command = [
    'npx gltf-transform',
    'draco',
    `"${originalModel}"`,
    `"${compressedModel}"`,
    '--method edgebreaker',      // Método óptimo para modelos orgánicos
    '--encodeSpeed 1',           // Máxima compresión
    '--decodeSpeed 10',          // Decodificación rápida para UX
    '--quantizePosition 14',     // Alta precisión para modelos médicos
    '--quantizeNormal 10',       // Normales precisas para lighting médico
    '--quantizeTexcoord 12',     // Texturas médicas detalladas
    '--quantizeColor 8',         // Colores suficientes para piel
    '--quantizeGeneric 12'       // Atributos genéricos optimizados
  ].join(' ');

  console.log('Ejecutando comando:');
  console.log(command, '\n');

  execSync(command, { 
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 60000 // 1 minuto timeout
  });

  // Verificar resultado
  if (!fs.existsSync(compressedModel)) {
    throw new Error('El modelo comprimido no fue generado');
  }

  const compressedSize = fs.statSync(compressedModel).size;
  const savings = ((originalSize - compressedSize) / originalSize * 100);

  console.log('\n✅ COMPRESIÓN COMPLETADA:');
  console.log(`├── Original:    ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`├── Comprimido:  ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`├── Ahorrado:    ${(originalSize - compressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`└── Reducción:   ${savings.toFixed(1)}%\n`);

  // Generar reporte detallado
  const report = {
    timestamp: new Date().toISOString(),
    originalFile: 'doctor_male.glb',
    compressedFile: 'doctor_male_draco.glb',
    originalSize: originalSize,
    compressedSize: compressedSize,
    compressionRatio: savings,
    method: 'DRACO with medical optimizations',
    expectedLoadTimeImprovement: `${(savings * 0.8).toFixed(0)}%`,
    estimatedBandwidthSaved: `${((originalSize - compressedSize) / 1024).toFixed(0)} KB per user`,
    recommendations: [
      'Use doctor_male_draco.glb in production',
      'Keep original as fallback for unsupported devices',
      'Monitor WebGL performance metrics',
      'Consider A/B testing compression settings'
    ]
  };

  // Guardar reporte
  const reportPath = path.join(__dirname, '../reports/doctor-model-compression.json');
  const reportsDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Reporte guardado en: ${reportPath}`);

  // Generar código de implementación
  console.log('\n🚀 CÓDIGO PARA IMPLEMENTAR:');
  console.log('// En Medical3DCanvas.tsx, usar:');
  console.log('const DOCTOR_MODEL_PATH_COMPRESSED = "/models/doctor_male_draco.glb";');
  console.log('// Y configurar DRACOLoader como se mostró anteriormente\n');

  // Verificar decodificadores DRACO
  const dracoDir = path.join(__dirname, '../public/draco');
  if (!fs.existsSync(dracoDir)) {
    console.log('⚠️  Siguiente paso: Crear carpeta /public/draco/ con decodificadores');
    console.log('   Ejecutar: npm install -g gltf-transform && npx gltf-transform draco --help');
  }

  console.log('🎯 ¡Optimización de doctor_male.glb completada exitosamente!');

} catch (error) {
  console.error('\n❌ Error durante la compresión:');
  console.error(error.message);
  
  if (error.message.includes('gltf-transform')) {
    console.log('\n💡 Solución:');
    console.log('Instalar gltf-transform globalmente:');
    console.log('npm install -g gltf-transform');
    console.log('O localmente en el proyecto:');
    console.log('cd apps/web-app && npm install gltf-transform');
  }
  
  process.exit(1);
}