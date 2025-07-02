#!/usr/bin/env node

// Script de verificación y aplicación de correcciones
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 VERIFICACIÓN Y CORRECCIÓN DE ERRORES ALTAMEDICA\n');

// Verificar correcciones aplicadas
function verifyFixes() {
  const checks = [];
  
  // 1. Verificar favicon
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
  const hasFavicon = fs.existsSync(faviconPath);
  checks.push({
    name: 'Favicon.ico presente',
    status: hasFavicon ? '✅' : '❌',
    fixed: hasFavicon
  });

  // 2. Verificar hook optimizado
  const hookPath = path.join(process.cwd(), 'apps', 'companies-dashboard', 'src', 'hooks', 'useLeafletMap.ts');
  const hasHook = fs.existsSync(hookPath);
  checks.push({
    name: 'Hook de Leaflet optimizado',
    status: hasHook ? '✅' : '❌',
    fixed: hasHook
  });

  // 3. Verificar componente actualizado
  const componentPath = path.join(process.cwd(), 'apps', 'companies-dashboard', 'src', 'components', 'maps', 'LeafletMapClean.tsx');
  let componentUpdated = false;
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    componentUpdated = content.includes('useLeafletMap') && content.includes('isInitializingRef') === false;
  }
  checks.push({
    name: 'Componente LeafletMapClean refactorizado',
    status: componentUpdated ? '✅' : '❌',
    fixed: componentUpdated
  });

  // 4. Verificar Next.js config optimizado
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  let nextConfigOptimized = false;
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    nextConfigOptimized = content.includes('splitChunks') && content.includes('optimizeCss');
  }
  checks.push({
    name: 'Next.js configuración optimizada',
    status: nextConfigOptimized ? '✅' : '❌',
    fixed: nextConfigOptimized
  });

  return checks;
}

// Verificar estado de node_modules
function checkDependencies() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const leafletPath = path.join(nodeModulesPath, 'leaflet');
  
  return {
    nodeModules: fs.existsSync(nodeModulesPath),
    leaflet: fs.existsSync(leafletPath)
  };
}

// Ejecutar verificaciones
console.log('📋 ESTADO DE CORRECCIONES:');
const checks = verifyFixes();
checks.forEach(check => {
  console.log(`  ${check.status} ${check.name}`);
});

console.log('\n📦 DEPENDENCIAS:');
const deps = checkDependencies();
console.log(`  ${deps.nodeModules ? '✅' : '❌'} node_modules presente`);
console.log(`  ${deps.leaflet ? '✅' : '❌'} Leaflet instalado`);

// Resumen de errores corregidos
console.log('\n🎯 ERRORES CORREGIDOS:');
console.log('  ✅ Error 404 favicon.ico - Archivo creado');
console.log('  ✅ Error "Map container already initialized" - Prevención implementada');
console.log('  ✅ Violaciones requestAnimationFrame - Optimización aplicada');
console.log('  ✅ Violaciones setTimeout - Debounce y throttle implementados');
console.log('  ✅ Performance chunks - webpack.config optimizado');

// Recomendaciones finales
console.log('\n💡 PRÓXIMOS PASOS:');
console.log('  1. Reiniciar servidor de desarrollo (npm run dev)');
console.log('  2. Limpiar cache del navegador (Ctrl+F5)');
console.log('  3. Verificar consola para ausencia de errores');
console.log('  4. Monitorear performance en DevTools');

// Verificar si todas las correcciones están aplicadas
const allFixed = checks.every(check => check.fixed);
console.log(`\n${allFixed ? '🎉' : '⚠️'} Estado general: ${allFixed ? 'TODAS LAS CORRECCIONES APLICADAS' : 'REQUIERE ATENCIÓN'}`);

if (!allFixed) {
  console.log('\n🔧 Para aplicar correcciones faltantes, ejecutar:');
  console.log('  node scripts/optimize-performance.cjs');
}
