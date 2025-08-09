#!/usr/bin/env node

/**
 * 🚀 SCRIPT PARA LEVANTAR SERVIDORES SSO TESTING
 * 
 * Levanta todos los servidores necesarios para testing completo:
 * - web-app (3000) - Gateway y autenticación
 * - patients (3003) - Portal de pacientes  
 * - doctors (3002) - Portal de doctores
 * - companies (3004) - Portal de empresas
 * - admin (3005) - Panel administrativo
 * - api-server (3001) - API central
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO SERVIDORES PARA TESTING SSO');
console.log('=========================================\n');

// Configuración de servidores
const servers = [
  {
    name: 'API Server',
    port: 3001,
    path: '../../api-server',
    command: 'pnpm',
    args: ['dev'],
    color: '\x1b[32m', // Verde
    required: true
  },
  {
    name: 'Web App (Gateway)',
    port: 3000, 
    path: './',
    command: 'pnpm',
    args: ['dev'],
    color: '\x1b[34m', // Azul
    required: true
  },
  {
    name: 'Patients Portal',
    port: 3003,
    path: '../../patients', 
    command: 'pnpm',
    args: ['dev'],
    color: '\x1b[35m', // Magenta
    required: true
  },
  {
    name: 'Doctors Portal',
    port: 3002,
    path: '../../doctors',
    command: 'pnpm', 
    args: ['dev'],
    color: '\x1b[33m', // Amarillo
    required: true
  },
  {
    name: 'Companies Portal',
    port: 3004,
    path: '../../companies',
    command: 'pnpm',
    args: ['dev'], 
    color: '\x1b[36m', // Cyan
    required: true
  },
  {
    name: 'Admin Panel',
    port: 3005,
    path: '../../admin',
    command: 'pnpm',
    args: ['dev'],
    color: '\x1b[31m', // Rojo
    required: false // No crítico para testing básico
  }
];

const processes = [];
const startedServers = [];

// Función para verificar si un puerto está disponible
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Función para verificar si un servidor está corriendo
async function checkServerHealth(port) {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode < 400);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Función para iniciar un servidor
async function startServer(server) {
  const serverPath = path.resolve(__dirname, server.path);
  
  console.log(`${server.color}🔄 Iniciando ${server.name} en puerto ${server.port}...`);
  console.log(`📁 Directorio: ${serverPath}\x1b[0m`);
  
  // Verificar si el puerto ya está en uso
  const isRunning = await checkServerHealth(server.port);
  if (isRunning) {
    console.log(`${server.color}✅ ${server.name} ya está corriendo en puerto ${server.port}\x1b[0m`);
    startedServers.push(server);
    return null;
  }
  
  const process = spawn(server.command, server.args, {
    cwd: serverPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });
  
  let serverReady = false;
  
  process.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Detectar cuando el servidor está listo
    if (output.includes('Ready') || 
        output.includes('ready') || 
        output.includes(`localhost:${server.port}`) ||
        output.includes(`127.0.0.1:${server.port}`) ||
        output.includes('compiled successfully')) {
      if (!serverReady) {
        serverReady = true;
        console.log(`${server.color}✅ ${server.name} LISTO en http://localhost:${server.port}\x1b[0m`);
        startedServers.push(server);
      }
    }
    
    // Mostrar logs importantes
    if (output.includes('Error') || output.includes('error')) {
      console.log(`${server.color}❌ ${server.name}: ${output.trim()}\x1b[0m`);
    }
  });
  
  process.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('ExperimentalWarning')) {
      console.log(`${server.color}⚠️ ${server.name} stderr: ${output.trim()}\x1b[0m`);
    }
  });
  
  process.on('close', (code) => {
    console.log(`${server.color}🔴 ${server.name} terminado con código ${code}\x1b[0m`);
  });
  
  process.on('error', (error) => {
    console.error(`${server.color}❌ Error iniciando ${server.name}: ${error.message}\x1b[0m`);
  });
  
  return process;
}

// Función para esperar a que todos los servidores estén listos
async function waitForServers(timeout = 120000) {
  console.log('\n⏳ Esperando que todos los servidores estén listos...');
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    let allReady = true;
    
    for (const server of servers.filter(s => s.required)) {
      const isReady = await checkServerHealth(server.port);
      if (!isReady) {
        allReady = false;
        break;
      }
    }
    
    if (allReady) {
      console.log('\n🎉 TODOS LOS SERVIDORES ESTÁN LISTOS!\n');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n⚠️ Timeout esperando servidores. Continuando...\n');
  return false;
}

// Función principal
async function main() {
  try {
    console.log('📋 Servidores a iniciar:');
    servers.forEach(server => {
      const status = server.required ? '(Requerido)' : '(Opcional)';
      console.log(`   ${server.color}• ${server.name} - Puerto ${server.port} ${status}\x1b[0m`);
    });
    console.log('');
    
    // Iniciar servidores
    for (const server of servers) {
      const process = await startServer(server);
      if (process) {
        processes.push({ process, server });
        // Esperar un poco entre inicios para evitar conflictos
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Esperar a que estén listos
    await waitForServers();
    
    // Mostrar resumen
    console.log('📊 ESTADO DE SERVIDORES:');
    console.log('========================');
    for (const server of servers) {
      const isHealthy = await checkServerHealth(server.port);
      const status = isHealthy ? '✅ ACTIVO' : '❌ INACTIVO';
      console.log(`${server.color}${status} ${server.name} - http://localhost:${server.port}\x1b[0m`);
    }
    console.log('');
    
    // Mostrar URLs de testing
    console.log('🧪 URLS PARA TESTING SSO:');
    console.log('=========================');
    console.log('🔐 Login Gateway: http://localhost:3000/login');
    console.log('👤 Paciente → http://localhost:3003 (paciente2@test.com)');
    console.log('👨‍⚕️ Doctor → http://localhost:3002 (doctor2@test.com)');  
    console.log('🏢 Empresa → http://localhost:3004 (empresa2@test.com)');
    console.log('🔧 Admin → http://localhost:3005 (admin2@test.com)');
    console.log('');
    
    console.log('🎯 EJECUTAR TESTING:');
    console.log('====================');
    console.log('npm run test:e2e        # Testing básico');
    console.log('npm run test:sso        # Testing SSO específico');
    console.log('npx playwright test sso-multi-user-flow.spec.ts');
    console.log('');
    
    console.log('⚠️ Para detener todos los servidores, presiona Ctrl+C');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error iniciando servidores:', error);
    process.exit(1);
  }
}

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n🔴 Deteniendo servidores...');
  
  processes.forEach(({ process, server }) => {
    console.log(`🔴 Deteniendo ${server.name}...`);
    process.kill('SIGINT');
  });
  
  setTimeout(() => {
    console.log('✅ Servidores detenidos');
    process.exit(0);
  }, 2000);
});

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { startServer, checkServerHealth, waitForServers };