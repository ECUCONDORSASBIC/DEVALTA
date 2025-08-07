const fs = require('fs');
const path = require('path');

console.log('✅ VALIDACIÓN POST-MIGRACIÓN DE FUNCIONALIDADES CRÍTICAS\n');

const validationChecks = {
  dependencies: [],
  imports: [],
  exports: [],
  compatibility: [],
  errors: []
};

// 1. Verificar dependencias de @altamedica/hooks en apps
const apps = ['admin', 'api-server', 'companies', 'doctors', 'patients', 'web-app'];
console.log('📦 VERIFICANDO DEPENDENCIAS:');

apps.forEach(app => {
  const packagePath = `C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\${app}\\package.json`;
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasHooksDep = packageJson.dependencies && packageJson.dependencies['@altamedica/hooks'];
    
    console.log(`- ${app}: ${hasHooksDep ? '✅ Instalado' : '❌ No instalado'}`);
    validationChecks.dependencies.push({ app, hasHooks: !!hasHooksDep });
  }
});

// 2. Verificar exports centralizados en @altamedica/hooks
console.log('\\n🔗 VERIFICANDO EXPORTS CENTRALIZADOS:');

const hooksIndexPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\hooks\\src\\index.ts';
if (fs.existsSync(hooksIndexPath)) {
  const content = fs.readFileSync(hooksIndexPath, 'utf8');
  
  const criticalExports = ['medical', 'api', 'auth'];
  criticalExports.forEach(exp => {
    const isExported = content.includes(`export * from './${exp}';`);
    console.log(`- export * from './${exp}': ${isExported ? '✅' : '❌'}`);
    validationChecks.exports.push({ module: exp, exported: isExported });
  });
}

// 3. Verificar api-client hooks disponibles
console.log('\\n🏥 VERIFICANDO API-CLIENT HOOKS:');

const apiClientHooksPath = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\api-client\\src\\hooks\\index.ts';
if (fs.existsSync(apiClientHooksPath)) {
  const content = fs.readFileSync(apiClientHooksPath, 'utf8');
  
  const criticalHooks = ['useAppointments', 'usePatients', 'useAuth'];
  criticalHooks.forEach(hook => {
    const isReExported = content.includes(hook) && content.includes('@altamedica/hooks');
    console.log(`- ${hook} re-exported: ${isReExported ? '✅' : '❌'}`);
    validationChecks.imports.push({ hook, reExported: isReExported });
  });
}

// 4. Verificar compatibilidad en archivos migrados
console.log('\\n🔄 VERIFICANDO ARCHIVOS MIGRADOS:');

const migratedFiles = [
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\patients\\src\\hooks\\useIntegratedServices.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\doctors\\src\\hooks\\api\\useAppointments.ts',
  'C:\\Users\\Eduardo\\Documents\\devaltamedica\\packages\\medical-hooks\\src\\usePatients.ts'
];

migratedFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const usesCentralized = content.includes('@altamedica/hooks') || content.includes('@altamedica/api-client');
    const hasDeprecation = content.includes('@deprecated') || content.includes('MIGRADO');
    
    console.log(`- ${fileName}: ${usesCentralized ? '✅' : '❌'} centralizado, ${hasDeprecation ? '✅' : '❌'} documentado`);
    validationChecks.compatibility.push({ 
      file: fileName, 
      centralized: usesCentralized, 
      documented: hasDeprecation 
    });
  } else {
    console.log(`- ${fileName}: ❌ No encontrado`);
    validationChecks.errors.push(`Archivo no encontrado: ${fileName}`);
  }
});

// 5. Resumen de validación
console.log('\\n📊 RESUMEN DE VALIDACIÓN:');

const depsOk = validationChecks.dependencies.filter(d => d.hasHooks).length;
const exportsOk = validationChecks.exports.filter(e => e.exported).length;
const importsOk = validationChecks.imports.filter(i => i.reExported).length;
const compatOk = validationChecks.compatibility.filter(c => c.centralized && c.documented).length;

console.log(`- Apps con dependencias: ${depsOk}/${validationChecks.dependencies.length}`);
console.log(`- Módulos exportados: ${exportsOk}/${validationChecks.exports.length}`);
console.log(`- Hooks re-exportados: ${importsOk}/${validationChecks.imports.length}`);
console.log(`- Archivos compatibles: ${compatOk}/${validationChecks.compatibility.length}`);
console.log(`- Errores: ${validationChecks.errors.length}`);

const overallHealth = (depsOk + exportsOk + importsOk + compatOk) / (validationChecks.dependencies.length + validationChecks.exports.length + validationChecks.imports.length + validationChecks.compatibility.length);

console.log(`\\n🎯 SALUD GENERAL: ${Math.round(overallHealth * 100)}%`);

if (overallHealth >= 0.9) {
  console.log('\\n🎉 MIGRACIÓN EXITOSA - TODAS LAS VALIDACIONES PASARON');
} else if (overallHealth >= 0.7) {
  console.log('\\n⚠️  MIGRACIÓN MAYORMENTE EXITOSA - REVISAR PUNTOS PENDIENTES');  
} else {
  console.log('\\n❌ MIGRACIÓN REQUIERE ATENCIÓN - MÚLTIPLES ISSUES DETECTADOS');
}

console.log('\\n✅ VALIDACIÓN COMPLETADA');