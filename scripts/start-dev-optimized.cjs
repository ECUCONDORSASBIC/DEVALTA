#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO SERVIDOR DE DESARROLLO OPTIMIZADO\n');

// Verificar configuraciones críticas
function verifySetup() {
  const checks = [
    {
      name: 'Favicon presente',
      check: () => fs.existsSync('public/favicon.ico'),
      fix: 'Favicon creado automáticamente'
    },
    {
      name: 'Hook de Leaflet optimizado',
      check: () => fs.existsSync('apps/companies-dashboard/src/hooks/useLeafletMap.ts'),
      fix: 'Hook optimizado disponible'
    },
    {
      name: 'CSS de Leaflet actualizado',
      check: () => {
        const cssPath = 'apps/companies-dashboard/src/styles/leaflet-custom.css';
        if (!fs.existsSync(cssPath)) return false;
        const content = fs.readFileSync(cssPath, 'utf8');
        return content.includes('leaflet-container') && content.includes('_leaflet_pos');
      },
      fix: 'CSS con correcciones específicas aplicado'
    },
    {
      name: 'Componente refactorizado',
      check: () => {
        const compPath = 'apps/companies-dashboard/src/components/maps/LeafletMapClean.tsx';
        if (!fs.existsSync(compPath)) return false;
        const content = fs.readFileSync(compPath, 'utf8');
        return content.includes('circleMarker') && content.includes('whenReady');
      },
      fix: 'Componente con manejo robusto de inicialización'
    }
  ];

  console.log('🔍 VERIFICANDO CONFIGURACIÓN:');
  checks.forEach(check => {
    const status = check.check() ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (check.check()) {
      console.log(`      ${check.fix}`);
    }
  });
  
  const allGood = checks.every(check => check.check());
  
  if (allGood) {
    console.log('\n✅ Todas las verificaciones pasaron');
  } else {
    console.log('\n⚠️  Algunas verificaciones fallaron, pero continuando...');
  }
  
  return allGood;
}

// Limpiar caché y archivos temporales
function cleanCache() {
  console.log('\n🧹 LIMPIANDO CACHÉ:');
  
  const pathsToClean = [
    '.next',
    'apps/companies-dashboard/.next',
    'node_modules/.cache'
  ];
  
  pathsToClean.forEach(p => {
    if (fs.existsSync(p)) {
      try {
        execSync(`rmdir /s /q "${p}"`, { stdio: 'ignore' });
        console.log(`  ✅ Limpiado: ${p}`);
      } catch (e) {
        console.log(`  ⚠️  No se pudo limpiar: ${p}`);
      }
    } else {
      console.log(`  ℹ️  No existe: ${p}`);
    }
  });
}

// Función principal
function startDevelopmentServer() {
  console.log('\n🎯 OBJETIVOS:');
  console.log('  • Renderizar mapa Leaflet sin errores');
  console.log('  • Eliminar violaciones de performance');
  console.log('  • Resolver problemas de inicialización');
  console.log('  • Mostrar marcadores de doctores correctamente');

  // Verificar configuración
  verifySetup();
  
  // Limpiar caché si es necesario
  const shouldClean = process.argv.includes('--clean');
  if (shouldClean) {
    cleanCache();
  }

  console.log('\n🔥 INICIANDO SERVIDOR...');
  console.log('   URL: http://localhost:3010');
  console.log('   Presiona Ctrl+C para detener\n');

  try {
    // Ejecutar servidor de desarrollo
    execSync('npm run dev', { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'development',
        FAST_REFRESH: 'true',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });
  } catch (error) {
    console.error('\n❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
}

// Mostrar información útil
console.log('💡 COMANDOS ÚTILES:');
console.log('  • node scripts/start-dev-optimized.cjs --clean   (limpiar caché)');
console.log('  • node scripts/verify-fixes.cjs                 (verificar estado)');
console.log('  • npm run build                                 (build producción)');

// Verificar argumentos
if (process.argv.includes('--help')) {
  console.log('\n📖 AYUDA:');
  console.log('  Este script inicia el servidor de desarrollo con optimizaciones');
  console.log('  específicas para resolver los errores de Leaflet y performance.');
  console.log('  \n  Opciones:');
  console.log('    --clean    Limpiar caché antes de iniciar');
  console.log('    --help     Mostrar esta ayuda');
  process.exit(0);
}

// Ejecutar
startDevelopmentServer();
