const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISIS DE CONSOLIDACIÓN useAppointments\n');

const appointmentFiles = [
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\useAppointments.ts',
    type: 'TanStack Centralizado (Robusto)',
    priority: 1
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\medical-hooks\\src\\useAppointments.ts',
    type: 'Hook Personalizado Básico',
    priority: 4
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useAppointmentsIntegrated.ts',
    type: 'Implementación Local Pacientes',
    priority: 3
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\api\\useAppointments.ts',
    type: 'Implementación Local Doctors API',
    priority: 3
  },
  {
    path: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\queries\\useAppointments.ts',
    type: 'Implementación Local Doctors Queries',
    priority: 3
  }
];

let analysis = {
  existing: [],
  missing: [],
  strategies: []
};

console.log('📋 ARCHIVOS ENCONTRADOS:');
appointmentFiles.forEach((file, index) => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    const lines = content.split('\n').length;
    const hasZod = content.includes('z.object');
    const hasTanstack = content.includes('useQuery');
    const hasTypes = content.includes('interface Appointment') || content.includes('type Appointment');
    
    console.log(`${index + 1}. ✅ ${path.basename(file.path)}`);
    console.log(`   Tipo: ${file.type}`);
    console.log(`   Líneas: ${lines}`);
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
      content: content.substring(0, 500) // Primeras 500 caracteres
    });
  } else {
    console.log(`${index + 1}. ❌ ${path.basename(file.path)} - NO ENCONTRADO`);
    analysis.missing.push(file);
  }
});

console.log('🎯 ESTRATEGIA DE CONSOLIDACIÓN:');

// Encontrar la implementación más robusta
const mostRobust = analysis.existing.reduce((best, current) => {
  const score = (current.hasZod ? 10 : 0) + 
                (current.hasTanstack ? 10 : 0) + 
                (current.hasTypes ? 5 : 0) + 
                (current.priority === 1 ? 20 : 0);
  
  if (!best || score > best.score) {
    return { ...current, score };
  }
  return best;
}, null);

if (mostRobust) {
  console.log(`✅ IMPLEMENTACIÓN BASE: ${mostRobust.type}`);
  console.log(`   Archivo: ${path.basename(mostRobust.path)}`);
  console.log(`   Score: ${mostRobust.score}/45`);
  console.log('');
}

console.log('📝 PLAN DE MIGRACIÓN:');
console.log('1. Usar packages/api-client/src/hooks/useAppointments.ts como base');
console.log('2. Migrar implementaciones locales a import centralizado');
console.log('3. Deprecar hooks duplicados en medical-hooks');
console.log('4. Actualizar exports en packages/hooks/src/index.ts');

const localImplementations = analysis.existing.filter(f => f.path.includes('/apps/'));
console.log(`\n📊 ARCHIVOS A MIGRAR: ${localImplementations.length}`);
localImplementations.forEach(impl => {
  console.log(`   - ${path.basename(impl.path)} (${impl.lines} líneas)`);
});

console.log('\n🎯 ANÁLISIS COMPLETADO');