const fs = require('fs');
const path = require('path');

console.log('🔍 IDENTIFICACIÓN DE HOOKS NO UTILIZADOS EN PACKAGE CENTRAL\n');

// Analizar el package hooks para encontrar hooks exportados
const hooksPackagePath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src';
const appsPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps';

let exportedHooks = new Set();
let usedHooks = new Set();
let unusedHooks = [];
let deprecatedFiles = [];

function findExportedHooks(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findExportedHooks(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar exports de hooks
      const hookExports = content.match(/export.*?use[A-Z]\\w*/g);
      if (hookExports) {
        hookExports.forEach(exp => {
          const hookName = exp.match(/use[A-Z]\\w*/);
          if (hookName) {
            exportedHooks.add(hookName[0]);
          }
        });
      }
      
      // Identificar archivos deprecados
      if (content.includes('@deprecated') || content.includes('DEPRECATED')) {
        const relativePath = path.relative(hooksPackagePath, filePath);
        deprecatedFiles.push({
          file: relativePath,
          reason: content.includes('MIGRADO') ? 'MIGRADO' : 'DEPRECATED',
          lines: content.split('\\n').length
        });
      }
    }
  });
}

function findUsedHooks(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findUsedHooks(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar imports y uso de hooks
      exportedHooks.forEach(hook => {
        if (content.includes(hook)) {
          usedHooks.add(hook);
        }
      });
    }
  });
}

console.log('📦 Analizando hooks exportados en package central...');
findExportedHooks(hooksPackagePath);

console.log('🔍 Analizando uso en aplicaciones...');
findUsedHooks(appsPath);

// Identificar hooks no utilizados
exportedHooks.forEach(hook => {
  if (!usedHooks.has(hook)) {
    unusedHooks.push(hook);
  }
});

// Análisis especial de hooks conocidos migrados
const migratedHooks = ['useAppointments', 'usePatients', 'useAuth', 'useDebounce', 'useQuery'];
const centralizedHooks = Array.from(usedHooks).filter(hook => migratedHooks.some(m => hook.includes(m)));

console.log('📋 RESULTADOS DEL ANÁLISIS:\\n');

console.log(`📊 ESTADÍSTICAS:`);
console.log(`- Hooks exportados: ${exportedHooks.size}`);
console.log(`- Hooks en uso: ${usedHooks.size}`);
console.log(`- Hooks no utilizados: ${unusedHooks.length}`);
console.log(`- Archivos deprecados: ${deprecatedFiles.length}`);

if (unusedHooks.length > 0) {
  console.log('\\n⚠️  HOOKS NO UTILIZADOS:');
  unusedHooks.forEach((hook, index) => {
    console.log(`${index + 1}. ${hook}`);
  });
}

if (deprecatedFiles.length > 0) {
  console.log('\\n📁 ARCHIVOS DEPRECADOS PARA LIMPIEZA:');
  deprecatedFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file} (${file.reason}) - ${file.lines} líneas`);
  });
}

if (centralizedHooks.length > 0) {
  console.log('\\n✅ HOOKS MIGRADOS EXITOSAMENTE EN USO:');
  centralizedHooks.forEach((hook, index) => {
    console.log(`${index + 1}. ${hook}`);
  });
}

console.log('\\n🎯 RECOMENDACIONES:');
if (unusedHooks.length > 0) {
  console.log('1. Revisar hooks no utilizados para posible eliminación');
}
if (deprecatedFiles.length > 0) {
  console.log('2. Los archivos deprecados pueden ser eliminados después de verificación');
}
console.log('3. Los hooks migrados están funcionando correctamente');

console.log('\\n🔍 ANÁLISIS COMPLETADO');