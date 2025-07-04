#!/usr/bin/env node

/**
 * Script para arreglar la configuración de la aplicación doctors
 * Soluciona problemas de Next.js 15+ y variables de entorno
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCTORS_DIR = path.join(__dirname, '..', 'apps', 'doctors');

function createEnvFile() {
  const envPath = path.join(DOCTORS_DIR, '.env.local');
  const envContent = `# Variables de entorno para ALTAMEDICA Doctors
# Configuración de APIs médicas

# URL del servidor FHIR (Fast Healthcare Interoperability Resources)
NEXT_PUBLIC_FHIR_SERVER_URL=https://hapi.fhir.org/baseR4

# URL de la API externa de ALTAMEDICA
NEXT_PUBLIC_API_URL=https://api.altamedica.com

# Configuración de desarrollo
NODE_ENV=development
ANALYZE=false
ENABLE_PWA=false

# Configuración de seguridad médica
NEXT_PUBLIC_MEDICAL_APP_VERSION=2.0.0
NEXT_PUBLIC_ENABLE_DEBUG=false
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local creado en doctors/');
  } else {
    console.log('ℹ️  Archivo .env.local ya existe');
  }
}

function installDependencies() {
  console.log('📦 Instalando dependencias...');
  try {
    execSync('npm install', { 
      cwd: DOCTORS_DIR, 
      stdio: 'inherit' 
    });
    console.log('✅ Dependencias instaladas correctamente');
  } catch (error) {
    console.log('❌ Error al instalar dependencias:', error.message);
  }
}

function verifyConfig() {
  console.log('🔍 Verificando configuración...');
  
  // Verificar next.config.js
  const nextConfigPath = path.join(DOCTORS_DIR, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    
    const issues = [];
    
    if (content.includes('swcMinify')) {
      issues.push('swcMinify está obsoleto en Next.js 15+');
    }
    
    if (content.includes('experimental.turbo')) {
      issues.push('experimental.turbo debe moverse a turbopack');
    }
    
    if (content.includes('buildActivityPosition')) {
      issues.push('buildActivityPosition debe ser position');
    }
    
    if (issues.length > 0) {
      console.log('⚠️  Problemas encontrados en next.config.js:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ next.config.js está actualizado');
    }
  }
  
  // Verificar variables de entorno
  const envPath = path.join(DOCTORS_DIR, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (!envContent.includes('NEXT_PUBLIC_FHIR_SERVER_URL')) {
      console.log('⚠️  Falta NEXT_PUBLIC_FHIR_SERVER_URL en .env.local');
    } else {
      console.log('✅ Variables de entorno configuradas');
    }
  } else {
    console.log('❌ Falta archivo .env.local');
  }
}

function testBuild() {
  console.log('🏗️  Probando build...');
  try {
    execSync('npm run build', { 
      cwd: DOCTORS_DIR, 
      stdio: 'pipe',
      timeout: 60000 
    });
    console.log('✅ Build exitoso');
    return true;
  } catch (error) {
    console.log('❌ Error en build:', error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Arreglando configuración de doctors...\n');
  
  createEnvFile();
  installDependencies();
  verifyConfig();
  
  console.log('\n🧪 Probando aplicación...');
  const buildSuccess = testBuild();
  
  if (buildSuccess) {
    console.log('\n🎉 ¡Configuración arreglada exitosamente!');
    console.log('💡 Para ejecutar la aplicación:');
    console.log('   cd apps/doctors');
    console.log('   npm run dev');
  } else {
    console.log('\n⚠️  Hay problemas que necesitan atención manual');
  }
}

if (require.main === module) {
  main();
}

module.exports = { createEnvFile, installDependencies, verifyConfig, testBuild }; 