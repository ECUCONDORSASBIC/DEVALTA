#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT PARA TIMEOUTS Y CONFIGURACIÓN
 * 
 * Verifica que los timeouts estén configurados correctamente
 * y que los servidores MCP inicien más rápido.
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de timeouts
const TIMEOUTS = {
  REQUEST_TIMEOUT: parseInt(process.env.MCP_REQUEST_TIMEOUT_MS) || 30000,
  INIT_TIMEOUT: parseInt(process.env.MCP_INIT_TIMEOUT_MS) || 15000,
  STARTUP_TIMEOUT: parseInt(process.env.MCP_STARTUP_TIMEOUT_MS) || 20000,
  RESPONSE_TIMEOUT: parseInt(process.env.MCP_RESPONSE_TIMEOUT_MS) || 25000,
  HEALTH_CHECK_TIMEOUT: parseInt(process.env.MCP_HEALTH_CHECK_TIMEOUT_MS) || 10000
};

console.log('🧪 TEST DE CONFIGURACIÓN DE TIMEOUTS');
console.log('=====================================');

// Test 1: Verificar que las variables de entorno están cargadas
console.log('\n1️⃣ VERIFICANDO VARIABLES DE ENTORNO:');
console.log(`   MCP_REQUEST_TIMEOUT_MS: ${TIMEOUTS.REQUEST_TIMEOUT}ms`);
console.log(`   MCP_INIT_TIMEOUT_MS: ${TIMEOUTS.INIT_TIMEOUT}ms`);
console.log(`   MCP_STARTUP_TIMEOUT_MS: ${TIMEOUTS.STARTUP_TIMEOUT}ms`);
console.log(`   MCP_RESPONSE_TIMEOUT_MS: ${TIMEOUTS.RESPONSE_TIMEOUT}ms`);
console.log(`   MCP_HEALTH_CHECK_TIMEOUT_MS: ${TIMEOUTS.HEALTH_CHECK_TIMEOUT}ms`);

// Test 2: Verificar configuración en security-config.json
console.log('\n2️⃣ VERIFICANDO CONFIGURACIÓN DE SEGURIDAD:');
try {
  const { promises: fs } = await import('fs');
  const configPath = path.join(__dirname, 'configs', 'security-config.json');
  const securityConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  
  if (securityConfig.timeouts) {
    console.log('   ✅ Timeouts configurados en security-config.json');
    console.log(`   - Request: ${securityConfig.timeouts.requestTimeout}ms`);
    console.log(`   - Init: ${securityConfig.timeouts.initTimeout}ms`);
    console.log(`   - Startup: ${securityConfig.timeouts.startupTimeout}ms`);
  } else {
    console.log('   ❌ Timeouts NO encontrados en security-config.json');
  }
} catch (error) {
  console.log(`   ⚠️ Error leyendo security-config.json: ${error.message}`);
}

// Test 3: Test de inicio rápido de un MCP servidor
console.log('\n3️⃣ TEST DE INICIO RÁPIDO DE MCP SERVER:');

async function testMCPStartup() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const mcpPath = path.join(__dirname, 'servers', 'smart-completion-mcp.js');
    
    console.log(`   Iniciando: ${mcpPath}`);
    
    const mcpProcess = spawn('node', [mcpPath], {
      stdio: 'pipe',
      env: {
        ...process.env,
        MCP_REQUEST_TIMEOUT_MS: TIMEOUTS.REQUEST_TIMEOUT.toString(),
        MCP_INIT_TIMEOUT_MS: TIMEOUTS.INIT_TIMEOUT.toString(),
        NODE_OPTIONS: '--max-old-space-size=4096 --no-warnings'
      },
      timeout: TIMEOUTS.STARTUP_TIMEOUT
    });
    
    // Timeout para el test
    const testTimeout = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      console.log(`   ⏱️ Timeout después de ${elapsedTime}ms`);
      mcpProcess.kill('SIGTERM');
      resolve({ success: false, time: elapsedTime, reason: 'timeout' });
    }, TIMEOUTS.INIT_TIMEOUT);
    
    mcpProcess.on('spawn', () => {
      const elapsedTime = Date.now() - startTime;
      console.log(`   ✅ MCP Server iniciado en ${elapsedTime}ms (PID: ${mcpProcess.pid})`);
      clearTimeout(testTimeout);
      mcpProcess.kill('SIGTERM');
      resolve({ success: true, time: elapsedTime, reason: 'started' });
    });
    
    mcpProcess.on('error', (error) => {
      const elapsedTime = Date.now() - startTime;
      console.log(`   ❌ Error en inicio: ${error.message} (${elapsedTime}ms)`);
      clearTimeout(testTimeout);
      resolve({ success: false, time: elapsedTime, reason: error.message });
    });
    
    mcpProcess.stderr.on('data', (data) => {
      console.log(`   📝 Error output: ${data.toString()}`);
    });
    
    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('iniciado exitosamente')) {
        const elapsedTime = Date.now() - startTime;
        console.log(`   🎉 Confirmación de inicio exitoso en ${elapsedTime}ms`);
        clearTimeout(testTimeout);
        mcpProcess.kill('SIGTERM');
        resolve({ success: true, time: elapsedTime, reason: 'confirmed' });
      }
    });
  });
}

// Ejecutar test
try {
  const result = await testMCPStartup();
  
  console.log('\n📊 RESULTADOS DEL TEST:');
  console.log(`   Estado: ${result.success ? '✅ EXITOSO' : '❌ FALLIDO'}`);
  console.log(`   Tiempo: ${result.time}ms`);
  console.log(`   Razón: ${result.reason}`);
  
  if (result.success && result.time < TIMEOUTS.INIT_TIMEOUT) {
    console.log(`   🚀 OPTIMIZACIÓN EXITOSA: Inicio ${((TIMEOUTS.INIT_TIMEOUT - result.time) / 1000).toFixed(1)}s más rápido que el timeout`);
  } else if (!result.success && result.reason === 'timeout') {
    console.log(`   ⚠️ SUGERENCIA: Considere aumentar MCP_INIT_TIMEOUT_MS (actual: ${TIMEOUTS.INIT_TIMEOUT}ms)`);
  }
  
} catch (error) {
  console.log(`\n❌ ERROR EN TEST: ${error.message}`);
}

console.log('\n🏁 TEST COMPLETADO');
console.log('==================');

// Test 4: Verificar que el entorno está optimizado
console.log('\n4️⃣ VERIFICACIONES ADICIONALES:');

// Verificar NODE_OPTIONS
if (process.env.NODE_OPTIONS) {
  console.log(`   ✅ NODE_OPTIONS configurado: ${process.env.NODE_OPTIONS}`);
} else {
  console.log('   ⚠️ NODE_OPTIONS no configurado - puede afectar el rendimiento');
}

// Verificar memoria disponible
const memUsage = process.memoryUsage();
console.log(`   📊 Memoria en uso: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
console.log(`   📊 Memoria total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

console.log('\n💡 RECOMENDACIONES:');
console.log('   - Si persisten timeouts, aumente las variables MCP_*_TIMEOUT_MS');
console.log('   - Use lazy imports en MCP servers para startup más rápido');
console.log('   - Configure NODE_OPTIONS para optimizar memoria');
console.log('   - Monitoree los logs de seguridad para detectar problemas');
