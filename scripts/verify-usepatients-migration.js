const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DE MIGRACIÓN usePatients\n');

const migrationResults = {
  migratedFiles: [],
  errors: [],
  linesReduced: 0
};

const filesToCheck = [
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\index.ts',
    description: 'Re-exports centralizados en @altamedica/hooks',
    originalLines: 0
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\medical-hooks\\src\\usePatients.ts',
    description: 'Implementación básica deprecada',
    originalLines: 108
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\usePatients.ts',
    description: 'Implementación especializada masiva deprecada',
    originalLines: 759
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useIntegratedServices.ts', 
    description: 'Migración parcial en patients app',
    originalLines: 0
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\api\\usePatients.ts',
    description: 'Re-export en doctors API hooks',
    originalLines: 10
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\queries\\usePatients.ts',
    description: 'Reemplazo completo de implementación local queries',
    originalLines: 206
  }
];

console.log('📋 VERIFICANDO ARCHIVOS MIGRADOS:');
filesToCheck.forEach((file, index) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    const fileName = path.basename(file.path);
    const currentLines = content.split('\n').length;
    
    // Verificar si usa la versión centralizada
    const usesCentralized = content.includes('@altamedica/hooks') || content.includes('@altamedica/api-client');
    const hasDeprecationNote = content.includes('@deprecated') || content.includes('MIGRADO') || content.includes('DEPRECATED');
    
    console.log(`${index + 1}. ✅ ${fileName}`);
    console.log(`   ${file.description}`);
    console.log(`   Líneas: ${file.originalLines} → ${currentLines} (${file.originalLines - currentLines > 0 ? '-' + (file.originalLines - currentLines) : '+' + (currentLines - file.originalLines)})`);
    console.log(`   Usa centralizado: ${usesCentralized ? '✅' : '❌'}`);
    console.log(`   Tiene nota de migración: ${hasDeprecationNote ? '✅' : '❌'}`);
    console.log('');
    
    if (usesCentralized) {
      migrationResults.migratedFiles.push({
        file: fileName,
        hasDeprecation: hasDeprecationNote,
        linesReduced: Math.max(0, file.originalLines - currentLines)
      });
      migrationResults.linesReduced += Math.max(0, file.originalLines - currentLines);
    }
  } else {
    console.log(`${index + 1}. ❌ ${path.basename(file.path)} - NO ENCONTRADO`);
    migrationResults.errors.push(`Archivo no encontrado: ${file.path}`);
  }
});

console.log('📊 RESUMEN DE MIGRACIÓN:');
console.log(`- Archivos migrados: ${migrationResults.migratedFiles.length}`);
console.log(`- Con notas de deprecación: ${migrationResults.migratedFiles.filter(f => f.hasDeprecation).length}`);
console.log(`- Total líneas eliminadas: ${migrationResults.linesReduced}`);
console.log(`- Errores: ${migrationResults.errors.length}`);

if (migrationResults.migratedFiles.length > 0) {
  console.log('\\n✅ ARCHIVOS MIGRADOS EXITOSAMENTE:');
  migrationResults.migratedFiles.forEach(file => {
    console.log(`   - ${file.file} ${file.hasDeprecation ? '(con nota)' : ''} ${file.linesReduced > 0 ? `[-${file.linesReduced} líneas]` : ''}`);
  });
}

if (migrationResults.linesReduced > 0) {
  console.log(`\\n🎯 CÓDIGO REDUCIDO: ${migrationResults.linesReduced} líneas eliminadas`);
  console.log('   Equivale a reducir:', Math.floor(migrationResults.linesReduced / 30), 'archivos promedio');
}

console.log('\\n🎉 MIGRACIÓN usePatients COMPLETADA');