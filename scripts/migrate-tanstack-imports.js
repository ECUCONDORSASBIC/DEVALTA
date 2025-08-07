const fs = require('fs');
const path = require('path');

console.log('🔄 MIGRACIÓN MASIVA DE TANSTACK IMPORTS A @altamedica/hooks\n');

// Archivos a migrar (excluyendo el que ya migramos)
const filesToMigrate = [
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useAppointments.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useAnalytics.ts', 
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useCompanies.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useDoctors.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useMarketplace.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useNotifications.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\usePatients.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\usePrescriptions.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useTelemedicine.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\optimistic\\useOptimisticAppointments.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\useAltamedicaAPI.ts'
];

const migrations = [
  // Patrón 1: useQuery individual
  {
    from: /import { useQuery, useMutation, useQueryClient } from '@tanstack\/react-query';/g,
    to: "import { useTanstackQuery as useQuery, useMutation, useQueryClient } from '@altamedica/hooks';"
  },
  // Patrón 2: useMutation primero
  {
    from: /import { useMutation, useQuery, useQueryClient } from '@tanstack\/react-query';/g,
    to: "import { useMutation, useTanstackQuery as useQuery, useQueryClient } from '@altamedica/hooks';"
  },
  // Patrón 3: Solo useMutation y useQueryClient
  {
    from: /import { useMutation, useQueryClient } from '@tanstack\/react-query';/g,
    to: "import { useMutation, useQueryClient } from '@altamedica/hooks';"
  },
  // Patrón 4: Solo useQuery y useMutation
  {
    from: /import { useQuery, useMutation } from '@tanstack\/react-query';/g,
    to: "import { useTanstackQuery as useQuery, useMutation } from '@altamedica/hooks';"
  }
];

let totalMigrated = 0;
let errors = [];

filesToMigrate.forEach(filePath => {
  const fileName = path.basename(filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${fileName}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    migrations.forEach(migration => {
      if (migration.from.test(content)) {
        content = content.replace(migration.from, migration.to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrado: ${fileName}`);
      totalMigrated++;
    } else {
      console.log(`🔍 Sin cambios necesarios: ${fileName}`);
    }
    
  } catch (error) {
    console.log(`❌ Error en ${fileName}:`, error.message);
    errors.push({ file: fileName, error: error.message });
  }
});

console.log(`\n📊 RESUMEN DE MIGRACIÓN:`);
console.log(`- Archivos migrados: ${totalMigrated}`);
console.log(`- Errores: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ ERRORES:');
  errors.forEach(err => {
    console.log(`   - ${err.file}: ${err.error}`);
  });
}

console.log('\n🎯 MIGRACIÓN COMPLETADA');