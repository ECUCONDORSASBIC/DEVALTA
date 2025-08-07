const fs = require('fs');

console.log('🔍 VERIFICACIÓN DE MIGRACIÓN TANSTACK\n');

// Verificar si quedan imports directos de TanStack
const filesToCheck = [
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useAppointmentsIntegrated.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useMedicalRecordsIntegrated.ts', 
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useTelemedicineIntegrated.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useIntegratedServices.ts'
];

let remainingTanstack = [];

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@tanstack/react-query')) {
      remainingTanstack.push(filePath);
      console.log(`⚠️  Encontrado TanStack directo en: ${filePath.split('\\').pop()}`);
      
      // Mostrar la línea específica
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('@tanstack/react-query')) {
          console.log(`   Línea ${index + 1}: ${line.trim()}`);
        }
      });
      console.log('');
    }
  }
});

if (remainingTanstack.length === 0) {
  console.log('✅ No se encontraron imports directos de TanStack pendientes');
} else {
  console.log(`📊 Se encontraron ${remainingTanstack.length} archivos con TanStack directo pendientes de migrar`);
}

// Verificar que @altamedica/hooks esté correctamente configurado
console.log('\n🔍 Verificando configuración de @altamedica/hooks...');

const hooksPackagePath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\api\\index.ts';
if (fs.existsSync(hooksPackagePath)) {
  const content = fs.readFileSync(hooksPackagePath, 'utf8');
  if (content.includes('useTanstackQuery')) {
    console.log('✅ @altamedica/hooks exporta correctamente useTanstackQuery');
  } else {
    console.log('❌ @altamedica/hooks NO exporta useTanstackQuery');
  }
} else {
  console.log('❌ No se encuentra el archivo de hooks');
}

console.log('\n🎯 VERIFICACIÓN COMPLETADA');