#!/usr/bin/env node

/**
 * Script para detectar dependencias circulares en el proyecto
 * Uso: node scripts/check-circular-deps.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Analizando dependencias circulares...\n');

try {
  // Instalar madge si no está instalado
  try {
    require.resolve('madge');
  } catch (e) {
    console.log('📦 Instalando madge...');
    execSync('npm install --save-dev madge', { stdio: 'inherit' });
  }

  // Analizar el directorio src
  console.log('📊 Analizando src/...');
  const result = execSync('npx madge --circular src/', { 
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..')
  });

  if (result.trim()) {
    console.log('❌ Dependencias circulares encontradas:\n');
    console.log(result);
    process.exit(1);
  } else {
    console.log('✅ No se encontraron dependencias circulares\n');
  }

  // Analizar específicamente page.tsx
  console.log('📊 Analizando page.tsx específicamente...');
  const pageResult = execSync('npx madge --circular src/app/page.tsx', { 
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..')
  });

  if (pageResult.trim()) {
    console.log('❌ Dependencias circulares en page.tsx:\n');
    console.log(pageResult);
  } else {
    console.log('✅ page.tsx no tiene dependencias circulares\n');
  }

} catch (error) {
  console.error('❌ Error al analizar dependencias:', error.message);
  process.exit(1);
}