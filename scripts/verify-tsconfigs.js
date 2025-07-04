#!/usr/bin/env node

/**
 * Script para verificar configuraciones de TypeScript en el proyecto ALTAMEDICA
 * Verifica que todos los tsconfig.json tengan las configuraciones correctas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APPS_DIR = path.join(__dirname, '..', 'apps');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

function checkTsConfig(dirPath, name) {
  const tsConfigPath = path.join(dirPath, 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    console.log(`❌ ${name}: No existe tsconfig.json`);
    return false;
  }

  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Verificar configuraciones esenciales
    const issues = [];
    
    if (!tsConfig.compilerOptions) {
      issues.push('Falta compilerOptions');
    } else {
      if (!tsConfig.compilerOptions.types || !tsConfig.compilerOptions.types.includes('node')) {
        issues.push('Falta types: ["node"]');
      }
      
      if (tsConfig.compilerOptions.moduleResolution === 'node') {
        issues.push('moduleResolution debería ser "bundler" para Next.js 15+');
      }
    }
    
    if (!tsConfig.include || tsConfig.include.length === 0) {
      issues.push('Falta include o está vacío');
    }
    
    if (issues.length > 0) {
      console.log(`⚠️  ${name}: ${issues.join(', ')}`);
      return false;
    }
    
    // Verificar que TypeScript compile sin errores
    try {
      execSync('npx tsc --noEmit', { 
        cwd: dirPath, 
        stdio: 'pipe',
        timeout: 10000 
      });
      console.log(`✅ ${name}: Configuración correcta`);
      return true;
    } catch (error) {
      console.log(`❌ ${name}: Errores de compilación TypeScript`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ${name}: Error al parsear tsconfig.json: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Verificando configuraciones de TypeScript...\n');
  
  let totalApps = 0;
  let validApps = 0;
  
  // Verificar apps
  if (fs.existsSync(APPS_DIR)) {
    const apps = fs.readdirSync(APPS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('📱 Aplicaciones:');
    for (const app of apps) {
      totalApps++;
      const appPath = path.join(APPS_DIR, app);
      if (checkTsConfig(appPath, app)) {
        validApps++;
      }
    }
  }
  
  // Verificar packages
  if (fs.existsSync(PACKAGES_DIR)) {
    const packages = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('\n📦 Paquetes:');
    for (const pkg of packages) {
      totalApps++;
      const pkgPath = path.join(PACKAGES_DIR, pkg);
      if (checkTsConfig(pkgPath, pkg)) {
        validApps++;
      }
    }
  }
  
  console.log(`\n📊 Resumen: ${validApps}/${totalApps} configuraciones válidas`);
  
  if (validApps === totalApps) {
    console.log('🎉 Todas las configuraciones de TypeScript están correctas!');
    process.exit(0);
  } else {
    console.log('⚠️  Algunas configuraciones necesitan corrección');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkTsConfig }; 