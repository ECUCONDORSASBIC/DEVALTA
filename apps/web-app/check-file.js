const fs = require('fs');

const filePath = './src/components/hospital3d/Hospital3DSimulator.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Verificar las primeras 5 líneas
const lines = content.split('\n').slice(0, 5);
console.log('=== PRIMERAS 5 LÍNEAS ===');
lines.forEach((line, index) => {
  console.log(`${index + 1}: ${line}`);
});

// Verificar si tiene caracteres \n literales
const hasLiteralNewlines = content.includes('\\n');
console.log(`\n=== VERIFICACIÓN ===`);
console.log(`Tiene caracteres \\n literales: ${hasLiteralNewlines ? '❌ SÍ' : '✅ NO'}`);
console.log(`Total de líneas reales: ${content.split('\n').length}`);

if (hasLiteralNewlines) {
  console.log('\n⚠️  PROBLEMA DETECTADO: El archivo contiene \\n literales');
  console.log('   Necesita ser corregido');
} else {
  console.log('\n✅ ARCHIVO CORRECTO: Tiene saltos de línea reales');
}