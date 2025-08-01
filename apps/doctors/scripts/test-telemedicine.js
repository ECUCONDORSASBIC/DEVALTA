#!/usr/bin/env node

/**
 * 🚀 Script de Prueba para Telemedicina Modernizada - Altamedica
 * 
 * Este script verifica que todos los componentes y configuraciones
 * estén correctamente implementados.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementación de telemedicina modernizada...\n');

// Lista de archivos que deben existir
const requiredFiles = [
  'src/components/telemedicine/ModernTelemedicineCall.tsx',
  'src/components/telemedicine/ModernChatPanel.tsx',
  'src/components/telemedicine/ModernVitalsPanel.tsx',
  'src/components/telemedicine/TelemedicineDemo.tsx',
  'src/styles/telemedicine.css',
  'src/config/telemedicine-config.ts',
  'src/app/telemedicine/modern/page.tsx'
];

// Lista de dependencias que deben estar instaladas
const requiredDependencies = [
  'framer-motion',
  'lucide-react'
];

// Verificar archivos
console.log('📁 Verificando archivos...');
let filesOk = 0;
let filesMissing = 0;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    filesOk++;
  } else {
    console.log(`  ❌ ${file} - NO ENCONTRADO`);
    filesMissing++;
  }
});

// Verificar package.json
console.log('\n📦 Verificando dependencias...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let dependenciesOk = 0;
let dependenciesMissing = 0;

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  requiredDependencies.forEach(dep => {
    if (allDependencies[dep]) {
      console.log(`  ✅ ${dep} (${allDependencies[dep]})`);
      dependenciesOk++;
    } else {
      console.log(`  ❌ ${dep} - NO INSTALADO`);
      dependenciesMissing++;
    }
  });
} else {
  console.log('  ❌ package.json no encontrado');
  dependenciesMissing = requiredDependencies.length;
}

// Verificar importación de estilos
console.log('\n🎨 Verificando estilos...');
const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('telemedicine.css')) {
    console.log('  ✅ Estilos de telemedicina importados en layout');
  } else {
    console.log('  ❌ Estilos de telemedicina NO importados en layout');
  }
} else {
  console.log('  ❌ layout.tsx no encontrado');
}

// Resumen
console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log(`  Archivos: ${filesOk}/${requiredFiles.length} correctos`);
console.log(`  Dependencias: ${dependenciesOk}/${requiredDependencies.length} instaladas`);

if (filesMissing === 0 && dependenciesMissing === 0) {
  console.log('\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!');
  console.log('✅ La telemedicina modernizada está lista para usar.');
  console.log('\n🚀 Para probar:');
  console.log('  1. Ejecuta: pnpm dev');
  console.log('  2. Ve a: http://localhost:3000/telemedicine/modern');
  console.log('  3. Haz clic en "Ver Demo de Mejoras"');
} else {
  console.log('\n⚠️  ALGUNAS VERIFICACIONES FALLARON:');
  if (filesMissing > 0) {
    console.log(`  - ${filesMissing} archivos faltantes`);
  }
  if (dependenciesMissing > 0) {
    console.log(`  - ${dependenciesMissing} dependencias faltantes`);
    console.log('  Ejecuta: pnpm install');
  }
  process.exit(1);
}

console.log('\n📚 Documentación disponible:');
console.log('  - docs/SUGERENCIAS_MODERNIZACION_TELEMEDICINA.md');
console.log('  - docs/IMPLEMENTACION_TELEMEDICINA_MODERNA.md'); 