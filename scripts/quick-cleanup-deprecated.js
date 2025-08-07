const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPIEZA RÁPIDA DE ARCHIVOS DEPRECADOS\n');

// Archivos que sabemos están deprecados/migrados
const deprecatedFiles = [
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\useAppointments.ts',
    originalName: 'useAppointments.ts (médico)',
    reason: 'MIGRADO a api-client',
    canDelete: false  // Mantener por compatibilidad temporal
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\usePrescriptions.ts',
    originalName: 'usePrescriptions.ts',
    reason: 'Verificar si existe implementación robusta',
    canDelete: false
  }
];

// Hooks UI que probablemente no se usan
const unusedUIHooks = [
  'useDragDrop',
  'useResizable', 
  'useHotkeys',
  'useSpring',
  'useAnimation',
  'useScroll',
  'useColor',
  'useCallbackRef',
  'useMergeRefs'
];

// Verificar archivos deprecados
console.log('📁 VERIFICANDO ARCHIVOS DEPRECADOS:');
deprecatedFiles.forEach((file, index) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    const isDeprecated = content.includes('@deprecated') || content.includes('DEPRECATED');
    const lines = content.split('\\n').length;
    
    console.log(`${index + 1}. ✅ ${file.originalName}`);
    console.log(`   Líneas: ${lines}`);
    console.log(`   Deprecado: ${isDeprecated ? '✅' : '❌'}`);
    console.log(`   Razón: ${file.reason}`);
    console.log(`   Puede eliminar: ${file.canDelete ? 'SÍ' : 'NO (mantener por compatibilidad)'}`);
    console.log('');
  }
});

// Análisis de hooks UI no utilizados
console.log('🎨 HOOKS UI POTENCIALMENTE NO UTILIZADOS:');
const uiIndexPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\ui\\index.ts';
if (fs.existsSync(uiIndexPath)) {
  const content = fs.readFileSync(uiIndexPath, 'utf8');
  
  unusedUIHooks.forEach((hook, index) => {
    const isExported = content.includes(`export { ${hook} }`);
    console.log(`${index + 1}. ${hook} - ${isExported ? 'Exportado' : 'No encontrado'}`);
  });
}

// Recomendaciones inmediatas
console.log('\\n📋 RECOMENDACIONES DE LIMPIEZA:');
console.log('1. MANTENER archivos deprecados con notas por compatibilidad durante migración');
console.log('2. REVISAR hooks UI no utilizados para posible eliminación futura'); 
console.log('3. FOCUS en validar que funcionalidades siguen operando post-migración');

console.log('\\n✅ LIMPIEZA CONSERVADORA COMPLETADA');
console.log('   Se mantuvieron archivos deprecados con notas para compatibilidad');