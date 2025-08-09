#!/usr/bin/env node

/**
 * 🔍 BUNDLE ANALYZER FOR WEB-APP
 * 
 * Herramienta para analizar el bundle de la aplicación y identificar:
 * - Componentes más pesados
 * - Dependencias que consumen más espacio
 * - Oportunidades de optimización
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analizando bundle de web-app...\n');

// Verificar si @next/bundle-analyzer está instalado
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const hasAnalyzer = packageJson.devDependencies && 
  packageJson.devDependencies['@next/bundle-analyzer'];

if (!hasAnalyzer) {
  console.log('📦 Instalando @next/bundle-analyzer...');
  const install = spawn('npm', ['install', '--save-dev', '@next/bundle-analyzer'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  install.on('close', (code) => {
    if (code === 0) {
      runAnalysis();
    } else {
      console.error('❌ Error al instalar bundle analyzer');
      process.exit(1);
    }
  });
} else {
  runAnalysis();
}

function runAnalysis() {
  console.log('\n🚀 Ejecutando análisis de bundle...');
  
  // Configurar next.config.js temporalmente para análisis
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  const nextConfigBackup = path.join(__dirname, 'next.config.js.backup');
  
  // Hacer backup del config actual
  if (fs.existsSync(nextConfigPath)) {
    fs.copyFileSync(nextConfigPath, nextConfigBackup);
  }

  // Crear configuración temporal con bundle analyzer
  const analyzerConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true
});

// Importar configuración actual
const nextConfig = require('./next.config.js.backup');

module.exports = withBundleAnalyzer(nextConfig);
  `;

  fs.writeFileSync(path.join(__dirname, 'next.config.analyzer.js'), analyzerConfig);

  // Ejecutar build con análisis
  const env = {
    ...process.env,
    ANALYZE: 'true',
    NODE_ENV: 'production'
  };

  const build = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env,
    shell: true,
    cwd: __dirname
  });

  build.on('close', (code) => {
    // Limpiar archivos temporales
    if (fs.existsSync(path.join(__dirname, 'next.config.analyzer.js'))) {
      fs.unlinkSync(path.join(__dirname, 'next.config.analyzer.js'));
    }

    if (code === 0) {
      console.log('\n✅ Análisis completado');
      console.log('📊 El reporte se abrirá automáticamente en tu navegador');
      
      // Mostrar recomendaciones
      setTimeout(() => {
        showRecommendations();
      }, 2000);
    } else {
      console.error('\n❌ Error durante el análisis');
    }

    // Restaurar configuración original
    if (fs.existsSync(nextConfigBackup)) {
      fs.unlinkSync(nextConfigBackup);
    }
  });
}

function showRecommendations() {
  console.log('\n🎯 RECOMENDACIONES DE OPTIMIZACIÓN:\n');
  
  console.log('🔍 QUÉ BUSCAR EN EL REPORTE:');
  console.log('• Chunks de Three.js/Fiber mayores a 500KB');
  console.log('• Dependencias duplicadas');
  console.log('• Componentes no utilizados');
  console.log('• Librerías de desarrollo en producción');
  
  console.log('\n⚡ ACCIONES INMEDIATAS:');
  console.log('• Si Three.js > 1MB: Implementar tree shaking');
  console.log('• Si Firebase > 500KB: Verificar imports específicos');
  console.log('• Si vendor chunk > 2MB: Dividir en chunks más pequeños');
  
  console.log('\n📈 MÉTRICAS OBJETIVO:');
  console.log('• First Contentful Paint: < 1.5s');
  console.log('• Largest Contentful Paint: < 2.5s'); 
  console.log('• Bundle total: < 1MB (sin 3D assets)');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Identificar chunks más grandes');
  console.log('2. Implementar code splitting adicional');
  console.log('3. Optimizar imports de Three.js');
  console.log('4. Verificar que solo se carguen assets necesarios');
}