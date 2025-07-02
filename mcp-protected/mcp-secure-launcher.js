#!/usr/bin/env node

/**
 * 🚀 MCP SECURE LAUNCHER
 * 
 * Launcher seguro para ejecutar MCPs desde la zona protegida
 * sin comprometer el código fuente principal.
 */

import { default as MCPProtectionSystem } from './mcp-protection-system.js';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);

class MCPSecureLauncher {
  constructor() {
    this.protectionSystem = new MCPProtectionSystem();
    this.runningMCPs = new Map();
  }

  async startMCP(mcpName, options = {}) {
    try {
      console.log(`🔐 Iniciando MCP protegido: ${mcpName}`);

      const mcpProcess = await this.protectionSystem.startMCPSafely(mcpName);

      // Configurar listeners para el proceso
      mcpProcess.stdout.on('data', (data) => {
        if (options.verbose) {
          console.log(`[${mcpName}] ${data.toString()}`);
        }
      });

      mcpProcess.stderr.on('data', (data) => {
        console.error(`[${mcpName}] ERROR: ${data.toString()}`);
      });

      mcpProcess.on('close', (code) => {
        console.log(`[${mcpName}] Proceso terminado con código ${code}`);
        this.runningMCPs.delete(mcpName);
      });

      // Registrar proceso en ejecución
      this.runningMCPs.set(mcpName, mcpProcess);

      console.log(`✅ ${mcpName} iniciado exitosamente (PID: ${mcpProcess.pid})`);
      return mcpProcess;

    } catch (error) {
      console.error(`❌ Error iniciando ${mcpName}: ${error.message}`);
      throw error;
    }
  }

  async startAllMCPs() {
    console.log('🚀 Iniciando todos los MCPs protegidos...');

    const mcps = [
      'smart-completion-mcp.js',
      'codebase-intelligence-mcp.js',
      'context-memory-mcp.js',
      'multi-agent-composer-mcp.js',
      'ai-flow-orchestrator-mcp.js',
      'medical-mcp-server.js'
    ];

    const results = [];

    for (const mcpName of mcps) {
      try {
        await this.startMCP(mcpName, { verbose: false });
        results.push({ mcp: mcpName, status: 'started' });

        // Esperar un poco entre inicios para evitar conflictos
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.push({ mcp: mcpName, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  stopMCP(mcpName) {
    const process = this.runningMCPs.get(mcpName);

    if (process) {
      console.log(`🛑 Deteniendo ${mcpName}...`);
      process.kill('SIGTERM');
      this.runningMCPs.delete(mcpName);
      return true;
    } else {
      console.warn(`⚠️ ${mcpName} no está en ejecución`);
      return false;
    }
  }

  stopAllMCPs() {
    console.log('🛑 Deteniendo todos los MCPs...');

    for (const [mcpName, process] of this.runningMCPs) {
      try {
        process.kill('SIGTERM');
        console.log(`✅ ${mcpName} detenido`);
      } catch (error) {
        console.error(`❌ Error deteniendo ${mcpName}: ${error.message}`);
      }
    }

    this.runningMCPs.clear();
  }

  getRunningMCPs() {
    return Array.from(this.runningMCPs.keys());
  }

  async getStatus() {
    const securityReport = await this.protectionSystem.getSecurityReport();

    return {
      running: Array.from(this.runningMCPs.keys()),
      total: this.runningMCPs.size,
      security: securityReport,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI Interface
if (process.argv[1] === __filename) {
  const launcher = new MCPSecureLauncher();
  const command = process.argv[2];
  const mcpName = process.argv[3];

  switch (command) {
    case 'start':
      if (mcpName) {
        launcher.startMCP(mcpName, { verbose: true });
      } else {
        launcher.startAllMCPs();
      }
      break;

    case 'stop':
      if (mcpName) {
        launcher.stopMCP(mcpName);
      } else {
        launcher.stopAllMCPs();
      }
      break;

    case 'status':
      launcher.getStatus().then(status => {
        console.log('📊 Estado del Sistema MCP:');
        console.log(JSON.stringify(status, null, 2));
      });
      break;

    case 'list':
      const running = launcher.getRunningMCPs();
      console.log('📋 MCPs en ejecución:', running);
      break;

    default:
      console.log(`
🚀 MCP Secure Launcher

Uso:
  node mcp-secure-launcher.js start [mcp-name]  # Iniciar MCP(s)
  node mcp-secure-launcher.js stop [mcp-name]   # Detener MCP(s)
  node mcp-secure-launcher.js status            # Ver estado
  node mcp-secure-launcher.js list              # Listar MCPs activos

Ejemplos:
  node mcp-secure-launcher.js start smart-completion-mcp.js
  node mcp-secure-launcher.js start  # Iniciar todos
  node mcp-secure-launcher.js stop   # Detener todos
      `);
  }

  // Manejo graceful de shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando Launcher Seguro...');
    launcher.stopAllMCPs();
    process.exit(0);
  });
}

export { MCPSecureLauncher };
