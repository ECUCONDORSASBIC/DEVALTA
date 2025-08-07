#!/usr/bin/env node

/**
 * Script para levantar automáticamente todos los servidores de AltaMedica
 * Usado por Playwright para tests E2E completos
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuración de servidores
const servers = [
  {
    name: 'api-server',
    command: 'pnpm',
    args: ['--filter', 'api-server', 'dev'],
    port: 3001,
    cwd: __dirname,
    color: '\x1b[31m', // Rojo
  },
  {
    name: 'web-app',
    command: 'pnpm',
    args: ['--filter', 'web-app', 'dev'],
    port: 3000,
    cwd: __dirname,
    color: '\x1b[32m', // Verde
  },
  {
    name: 'doctors',
    command: 'pnpm',
    args: ['--filter', 'doctors', 'dev'],
    port: 3002,
    cwd: __dirname,
    color: '\x1b[33m', // Amarillo
  },
  {
    name: 'patients',
    command: 'pnpm',
    args: ['--filter', 'patients', 'dev'],
    port: 3003,
    cwd: __dirname,
    color: '\x1b[34m', // Azul
  },
  {
    name: 'companies',
    command: 'pnpm',
    args: ['--filter', 'companies', 'dev'],
    port: 3004,
    cwd: __dirname,
    color: '\x1b[35m', // Magenta
  },
  {
    name: 'admin',
    command: 'pnpm',
    args: ['--filter', 'admin', 'dev'],
    port: 3005,
    cwd: __dirname,
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'signaling-server',
    command: 'pnpm',
    args: ['--filter', 'signaling-server', 'dev'],
    port: 8888,
    cwd: __dirname,
    color: '\x1b[37m', // Blanco
  }
];

const processes = [];
const startedServers = new Set();

// Función para verificar si un puerto está libre
const isPortFree = async (port) => {
  const net = require('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Función para esperar que un puerto esté disponible
const waitForPort = async (port, maxRetries = 60) => {
  const net = require('net');
  
  for (let i = 0; i < maxRetries; i++) {
    const isReady = await new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, 'localhost');
    });
    
    if (isReady) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
};

// Función para iniciar un servidor
const startServer = async (server) => {
  const isPortFreeResult = await isPortFree(server.port);
  
  if (!isPortFreeResult) {
    console.log(`${server.color}[${server.name}] Puerto ${server.port} ya está en uso, saltando...\x1b[0m`);
    startedServers.add(server.name);
    return null;
  }
  
  console.log(`${server.color}[${server.name}] Iniciando en puerto ${server.port}...\x1b[0m`);
  
  const process = spawn(server.command, server.args, {
    cwd: server.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    detached: false
  });
  
  // Capturar salida del proceso
  process.stdout.on('data', (data) => {
    const output = data.toString();
    // Filtrar líneas innecesarias
    if (output.includes('ready') || output.includes('started') || output.includes('listening') || output.includes('Local:')) {
      console.log(`${server.color}[${server.name}] ${output.trim()}\x1b[0m`);
      
      // Marcar como iniciado cuando vemos patrones de éxito
      if (output.includes('ready') || output.includes('started') || output.includes('Local:')) {
        startedServers.add(server.name);
      }
    }
  });
  
  process.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('ExperimentalWarning') && !error.includes('punycode')) {
      console.error(`${server.color}[${server.name}] ERROR: ${error.trim()}\x1b[0m`);
    }
  });
  
  process.on('error', (error) => {
    console.error(`${server.color}[${server.name}] Error iniciando: ${error.message}\x1b[0m`);
  });
  
  process.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`${server.color}[${server.name}] Proceso terminado con código ${code} (señal: ${signal})\x1b[0m`);
    }
    startedServers.delete(server.name);
  });
  
  return process;
};

// Función principal
const startAllServers = async () => {
  console.log('\x1b[1m🚀 Iniciando todos los servidores de AltaMedica...\x1b[0m\n');
  
  // Iniciar servidores secuencialmente para evitar conflictos
  for (const server of servers) {
    const process = await startServer(server);
    if (process) {
      processes.push({ process, server });
    }
    
    // Esperar un poco entre inicios
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\x1b[1m⏳ Esperando que todos los servidores estén listos...\x1b[0m');
  
  // Esperar que todos los puertos estén disponibles
  const allServersReady = await Promise.all(
    servers.map(async (server) => {
      const isReady = await waitForPort(server.port);
      if (isReady) {
        console.log(`✅ ${server.name} (puerto ${server.port}) está listo`);
      } else {
        console.log(`❌ ${server.name} (puerto ${server.port}) no respondió a tiempo`);
      }
      return isReady;
    })
  );
  
  const readyCount = allServersReady.filter(Boolean).length;
  console.log(`\n\x1b[1m🎯 ${readyCount}/${servers.length} servidores están listos\x1b[0m`);
  
  if (readyCount >= 4) { // Mínimo API, web-app, doctors, patients
    console.log('\x1b[32m✅ Suficientes servidores listos para ejecutar tests E2E\x1b[0m\n');
  } else {
    console.log('\x1b[31m❌ No hay suficientes servidores listos\x1b[0m\n');
    process.exit(1);
  }
};

// Manejo de señales para limpieza
const cleanup = () => {
  console.log('\n\x1b[1m🛑 Deteniendo servidores...\x1b[0m');
  
  processes.forEach(({ process, server }) => {
    if (process && !process.killed) {
      console.log(`Deteniendo ${server.name}...`);
      process.kill('SIGTERM');
    }
  });
  
  setTimeout(() => {
    processes.forEach(({ process, server }) => {
      if (process && !process.killed) {
        console.log(`Forzando cierre de ${server.name}...`);
        process.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Iniciar
startAllServers().catch((error) => {
  console.error('Error iniciando servidores:', error);
  process.exit(1);
});

// Mantener el proceso vivo
process.stdin.resume();