const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISIS DE CONSOLIDACIÓN usePatients\n');

const patientsFiles = [
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\usePatients.ts',
    type: 'TanStack Centralizado API Client',
    priority: 1
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\medical\\usePatients.ts',
    type: 'Hook Médico Especializado',
    priority: 2
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\medical-hooks\\src\\usePatients.ts',
    type: 'Hook Básico Medical-Hooks',
    priority: 4
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\useAltamedicaAPI.ts',
    type: 'Hook en AltaMedica API',
    priority: 3
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\usePatientsIntegrated.ts',
    type: 'Implementación Local Patients',
    priority: 3
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\api\\usePatients.ts',
    type: 'Implementación Local Doctors',
    priority: 3
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\queries\\usePatients.ts',
    type: 'Queries Local Doctors',
    priority: 3
  }
];

let analysis = {
  existing: [],
  missing: [],
  totalLines: 0
};

console.log('📋 ARCHIVOS ENCONTRADOS:');
patientsFiles.forEach((file, index) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    const lines = content.split('\n').length;
    const hasZod = content.includes('z.object') || content.includes('.refine(');
    const hasTanstack = content.includes('useQuery') && content.includes('@tanstack') || content.includes('useTanstackQuery');
    const hasTypes = content.includes('interface Patient') || content.includes('type Patient') || content.includes('PatientSchema');
    const hasHooks = (content.match(/export function use/g) || []).length;
    
    console.log(`${index + 1}. ✅ ${path.basename(file.path)}`);
    console.log(`   Tipo: ${file.type}`);
    console.log(`   Líneas: ${lines}`);
    console.log(`   Hooks exportados: ${hasHooks}`);
    console.log(`   Schema Zod: ${hasZod ? '✅' : '❌'}`);
    console.log(`   TanStack Query: ${hasTanstack ? '✅' : '❌'}`);
    console.log(`   TypeScript Types: ${hasTypes ? '✅' : '❌'}`);
    console.log('');
    
    analysis.existing.push({
      ...file,
      lines,
      hasZod,
      hasTanstack,
      hasTypes,
      hasHooks,
      content: content.substring(0, 300)
    });
    
    analysis.totalLines += lines;
  } else {
    console.log(`${index + 1}. ❌ ${path.basename(file.path)} - NO ENCONTRADO`);
    analysis.missing.push(file);
  }
});

// Encontrar la implementación más robusta
const mostRobust = analysis.existing.reduce((best, current) => {
  const score = (current.hasZod ? 15 : 0) + 
                (current.hasTanstack ? 15 : 0) + 
                (current.hasTypes ? 10 : 0) + 
                (current.hasHooks * 2) +
                (current.priority === 1 ? 25 : current.priority === 2 ? 15 : 5);
  
  if (!best || score > best.score) {
    return { ...current, score };
  }
  return best;
}, null);

console.log('🎯 ESTRATEGIA DE CONSOLIDACIÓN:');
if (mostRobust) {
  console.log(`✅ IMPLEMENTACIÓN BASE: ${mostRobust.type}`);
  console.log(`   Archivo: ${path.basename(mostRobust.path)}`);
  console.log(`   Score: ${mostRobust.score} puntos`);
  console.log(`   Líneas: ${mostRobust.lines}`);
  console.log(`   Hooks: ${mostRobust.hasHooks}`);
  console.log('');
}

console.log('📝 PLAN DE MIGRACIÓN:');
console.log('1. Usar la implementación más robusta como base');
console.log('2. Re-exportar desde @altamedica/hooks');
console.log('3. Migrar implementaciones locales');
console.log('4. Deprecar versiones duplicadas');

const localImplementations = analysis.existing.filter(f => f.path.includes('/apps/'));
console.log(`\\n📊 RESUMEN:`);
console.log(`- Total de implementaciones: ${analysis.existing.length}`);
console.log(`- Líneas de código total: ${analysis.totalLines}`);
console.log(`- Implementaciones locales: ${localImplementations.length}`);

console.log('\\n🎯 ANÁLISIS COMPLETADO');