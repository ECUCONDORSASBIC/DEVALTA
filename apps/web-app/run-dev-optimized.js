#!/usr/bin/env node

/**
 * 🚀 OPTIMIZED DEVELOPMENT SERVER FOR WEB-APP
 * 
 * Este script optimiza el servidor de desarrollo con:
 * - Incremento de memoria Node.js
 * - Variables de entorno de desarrollo
 * - Turbo mode activado
 * - Optimizaciones para componentes 3D
 */

const { spawn } = require('child_process');
const path = require('path');

// 🔧 CONFIGURACIÓN DE OPTIMIZACIÓN
const NODE_OPTIONS = [
  '--max-old-space-size=8192',          // 8GB memoria para componentes 3D
  '--max-semi-space-size=512',          // Optimización GC
  '--optimize-for-size',                // Optimización de memoria
].join(' ');

// 🌍 VARIABLES DE ENTORNO OPTIMIZADAS
const ENV_VARS = {
  NODE_ENV: 'development',
  NODE_OPTIONS,
  
  // Next.js optimizations
  NEXT_TELEMETRY_DISABLED: '1',
  TURBOPACK: '1',                       // Activar Turbopack
  TURBOPACK_LOG_LEVEL: 'error',        // Solo errores en logs
  
  // Three.js y WebGL optimizations
  FORCE_COLOR: '1',
  WEBGL_POWER_PREFERENCE: 'high-performance',
  
  // TypeScript optimizations
  TSC_NONPOLLING_WATCHER: 'true',
  TSC_COMPILE_ON_ERROR: 'true',
  
  // Desarrollo específico
  FAST_REFRESH: 'true',
  DISABLE_ESLINT_PLUGIN: 'true',        // Deshabilitar ESLint en dev para velocidad
  
  // AltaMedica específico
  NEXT_PUBLIC_DEV_MODE: 'true',
  NEXT_PUBLIC_ENABLE_3D_OPTIMIZATION: 'true',
  
  ...process.env // Mantener variables existentes
};

console.log('🚀 Iniciando servidor de desarrollo optimizado...');
console.log(`📊 Memoria asignada: ${NODE_OPTIONS.match(/--max-old-space-size=(\d+)/)[1]}MB`);
console.log('⚡ Turbopack: ACTIVADO');
console.log('🎯 Optimizaciones 3D: ACTIVADAS\n');

// 🏃‍♂️ EJECUTAR NEXT DEV CON OPTIMIZACIONES
const nextDev = spawn('npx', ['next', 'dev', '--turbo', '--port=3000'], {
  stdio: 'inherit',
  env: ENV_VARS,
  shell: true,
  cwd: __dirname
});

// 🎯 MANEJO DE EVENTOS
nextDev.on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
});

nextDev.on('close', (code) => {
  console.log(`\n🔚 Servidor cerrado con código: ${code}`);
  process.exit(code);
});

// Manejo graceful de señales
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de desarrollo...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor de desarrollo...');
  nextDev.kill('SIGTERM');
});

// 📈 MOSTRAR INFORMACIÓN DE OPTIMIZACIÓN
setTimeout(() => {
  console.log('\n📊 OPTIMIZACIONES APLICADAS:');
  console.log('✅ Memoria Node.js aumentada a 8GB');
  console.log('✅ Turbopack activado');
  console.log('✅ TypeScript errors ignorados en desarrollo');
  console.log('✅ ESLint deshabilitado para velocidad');
  console.log('✅ Fast Refresh habilitado');
  console.log('✅ Optimizaciones WebGL aplicadas');
  console.log('\n🌐 Servidor disponible en: http://localhost:3000');
  console.log('📱 Para testing mobile: http://[your-ip]:3000\n');
}, 1000);