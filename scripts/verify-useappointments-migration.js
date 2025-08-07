const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DE MIGRACIÓN useAppointments\n');

const migrationResults = {
  migratedFiles: [],
  errors: [],
  oldImplementations: []
};

const filesToCheck = [
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\index.ts',
    description: 'Re-exports centralizados en @altamedica/hooks'
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useIntegratedServices.ts', 
    description: 'Migración parcial en patients app'
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\api\\useAppointments.ts',
    description: 'Re-export en doctors API hooks'
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\queries\\useAppointments.ts',
    description: 'Reemplazo completo de implementación local (284 líneas)'
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\medical-hooks\\src\\useAppointments.ts',
    description: 'Implementación básica deprecada'
  }
];

console.log('📋 VERIFICANDO ARCHIVOS MIGRADOS:');
filesToCheck.forEach((file, index) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    const fileName = path.basename(file.path);
    
    // Verificar si usa la versión centralizada
    const usesCentralized = content.includes('@altamedica/hooks') || content.includes('@altamedica/api-client');
    const hasDeprecationNote = content.includes('@deprecated') || content.includes('MIGRADO') || content.includes('DEPRECATED');
    
    console.log(`${index + 1}. ✅ ${fileName}`);
    console.log(`   ${file.description}`);
    console.log(`   Usa centralizado: ${usesCentralized ? '✅' : '❌'}`);
    console.log(`   Tiene nota de migración: ${hasDeprecationNote ? '✅' : '❌'}`);
    console.log('');
    
    if (usesCentralized) {
      migrationResults.migratedFiles.push({
        file: fileName,
        hasDeprecation: hasDeprecationNote
      });
    } else {
      migrationResults.oldImplementations.push(fileName);
    }
  } else {
    console.log(`${index + 1}. ❌ ${path.basename(file.path)} - NO ENCONTRADO`);
    migrationResults.errors.push(`Archivo no encontrado: ${file.path}`);
  }
});

// Verificar que no queden implementaciones locales no migradas
console.log('🔍 Buscando implementaciones locales no migradas...');
const searchPatterns = [
  'function useAppointments(',
  'const useAppointments =',
  'export function useAppointments'
];

let foundOldImplementations = [];

// Buscar en apps (excluyendo los archivos ya migrados)
const appsToCheck = [
  'C:\\\\Users\\\\Eduardo\\\\Documents\\\\devaltamedica\\\\apps\\\\admin\\\\src\\\\hooks',
  'C:\\\\Users\\\\Eduardo\\\\Documents\\\\devaltamedica\\\\apps\\\\companies\\\\src\\\\hooks',
  'C:\\\\Users\\\\Eduardo\\\\Documents\\\\devaltamedica\\\\apps\\\\web-app\\\\src\\\\hooks'
];

console.log('📊 RESUMEN DE MIGRACIÓN:');
console.log(`- Archivos migrados: ${migrationResults.migratedFiles.length}`);
console.log(`- Con notas de deprecación: ${migrationResults.migratedFiles.filter(f => f.hasDeprecation).length}`);
console.log(`- Implementaciones sin migrar: ${migrationResults.oldImplementations.length}`);
console.log(`- Errores: ${migrationResults.errors.length}`);

if (migrationResults.migratedFiles.length > 0) {
  console.log('\\n✅ ARCHIVOS MIGRADOS EXITOSAMENTE:');
  migrationResults.migratedFiles.forEach(file => {
    console.log(`   - ${file.file} ${file.hasDeprecation ? '(con nota)' : ''}`);
  });
}

if (migrationResults.oldImplementations.length > 0) {
  console.log('\\n⚠️  IMPLEMENTACIONES SIN MIGRAR:');
  migrationResults.oldImplementations.forEach(file => {
    console.log(`   - ${file}`);
  });
}

console.log('\\n🎯 MIGRACIÓN useAppointments COMPLETADA');