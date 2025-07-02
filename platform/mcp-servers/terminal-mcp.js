#!/usr/bin/env node

// 🖥️ TERMINAL MCP SERVER - EJECUCIÓN REAL DE COMANDOS
// Permite a Claude ejecutar comandos indirectamente a través de Copilot Agent

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { execSync, spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class TerminalMCPServer {
  constructor() {
    this.executionLog = [];
    this.securityConfig = {
      allowedCommands: [
        'node', 'npm', 'pnpm', 'powershell', 'cmd',
        'git', 'docker', 'kubectl', 'terraform'
      ],
      blockedPatterns: [
        'rm -rf', 'del /f', 'format', 'fdisk',
        'shutdown', 'reboot', 'halt'
      ],
      maxExecutionTime: 30000, // 30 segundos
      logAllCommands: true
    };
    this.activeProcesses = new Map();
  }

  // 🔒 VALIDACIÓN DE SEGURIDAD
  validateCommand(command, args = []) {
    const fullCommand = `${command} ${args.join(' ')}`.toLowerCase();
    
    // Verificar comandos permitidos
    const isAllowed = this.securityConfig.allowedCommands.some(cmd => 
      command.toLowerCase().includes(cmd)
    );
    
    if (!isAllowed) {
      throw new Error(`Comando no permitido: ${command}`);
    }
    
    // Verificar patrones bloqueados
    const isBlocked = this.securityConfig.blockedPatterns.some(pattern =>
      fullCommand.includes(pattern.toLowerCase())
    );
    
    if (isBlocked) {
      throw new Error(`Comando bloqueado por seguridad: ${command}`);
    }
    
    return true;
  }

  // 📝 LOGGING DE EJECUCIÓN
  logExecution(command, args, result, duration) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      command,
      args,
      duration,
      success: result.success,
      stdout: result.stdout?.substring(0, 500),
      stderr: result.stderr?.substring(0, 500),
      exitCode: result.exitCode
    };
    
    this.executionLog.push(logEntry);
    
    if (this.executionLog.length > 100) {
      this.executionLog = this.executionLog.slice(-100);
    }
  }

  // ⚡ EJECUCIÓN SÍNCRONA
  executeSync(command, args = [], options = {}) {
    this.validateCommand(command, args);
    
    const startTime = Date.now();
    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
    
    try {
      const stdout = execSync(fullCommand, {
        encoding: 'utf8',
        timeout: options.timeout || this.securityConfig.maxExecutionTime,
        maxBuffer: 1024 * 1024,
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env }
      });
      
      const duration = Date.now() - startTime;
      const result = {
        success: true,
        stdout: stdout.toString(),
        stderr: '',
        exitCode: 0,
        duration
      };
      
      this.logExecution(command, args, result, duration);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        success: false,
        stdout: '',
        stderr: error.message,
        exitCode: error.status || 1,
        duration
      };
      
      this.logExecution(command, args, result, duration);
      return result;
    }
  }

  // 📊 SCRIPTS ESPECIALIZADOS
  async runPowerShellScript(scriptPath, args = []) {
    const fullPath = existsSync(scriptPath) ? scriptPath : join(process.cwd(), scriptPath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`Script no encontrado: ${scriptPath}`);
    }
    
    return this.executeSync('powershell', [
      '-ExecutionPolicy', 'Bypass',
      '-File', fullPath,
      ...args
    ]);
  }

  async runNodeScript(scriptPath, args = []) {
    const fullPath = existsSync(scriptPath) ? scriptPath : join(process.cwd(), scriptPath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`Script no encontrado: ${scriptPath}`);
    }
    
    return this.executeSync('node', [fullPath, ...args]);
  }

  // 🔍 UTILIDADES DE SISTEMA
  async getSystemInfo() {
    const results = {};
    
    try {
      results.node = this.executeSync('node', ['--version']);
      results.npm = this.executeSync('npm', ['--version']);
      
      try {
        results.pnpm = this.executeSync('pnpm', ['--version']);
      } catch (e) {
        results.pnpm = { success: false, stderr: 'pnpm no instalado' };
      }
      
      try {
        results.git = this.executeSync('git', ['--version']);
      } catch (e) {
        results.git = { success: false, stderr: 'git no instalado' };
      }
      
    } catch (error) {
      results.error = error.message;
    }
    
    return results;
  }

  // 📈 ESTADÍSTICAS DE EJECUCIÓN
  getExecutionStats() {
    const recentLogs = this.executionLog.slice(-50);
    
    return {
      totalExecutions: this.executionLog.length,
      recentExecutions: recentLogs.length,
      successRate: recentLogs.length > 0 ? recentLogs.filter(log => log.success).length / recentLogs.length * 100 : 0,
      averageDuration: recentLogs.length > 0 ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length : 0,
      activeProcesses: this.activeProcesses.size,
      lastExecution: this.executionLog[this.executionLog.length - 1]
    };
  }
}

// 🔧 CONFIGURACIÓN DEL SERVIDOR MCP
const server = new Server(
  {
    name: "terminal-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const terminalServer = new TerminalMCPServer();

// 📋 LISTA DE HERRAMIENTAS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_command",
        description: "🖥️ Ejecutar comando del sistema de forma segura",
        inputSchema: {
          type: "object",
          properties: {
            command: { 
              type: "string", 
              description: "Comando a ejecutar (node, npm, pnpm, powershell, etc.)" 
            },
            args: { 
              type: "array", 
              items: { type: "string" },
              description: "Argumentos del comando" 
            },
            options: {
              type: "object",
              properties: {
                cwd: { type: "string", description: "Directorio de trabajo" },
                timeout: { type: "number", description: "Timeout en milisegundos" }
              }
            }
          },
          required: ["command"]
        }
      },
      {
        name: "run_powershell_script",
        description: "📜 Ejecutar script PowerShell con validación de seguridad",
        inputSchema: {
          type: "object",
          properties: {
            scriptPath: { type: "string", description: "Ruta al script .ps1" },
            args: { 
              type: "array", 
              items: { type: "string" },
              description: "Argumentos para el script" 
            }
          },
          required: ["scriptPath"]
        }
      },
      {
        name: "run_node_script",
        description: "🟢 Ejecutar script Node.js con manejo de errores",
        inputSchema: {
          type: "object",
          properties: {
            scriptPath: { type: "string", description: "Ruta al script .js" },
            args: { 
              type: "array", 
              items: { type: "string" },
              description: "Argumentos para el script" 
            }
          },
          required: ["scriptPath"]
        }
      },
      {
        name: "get_system_info",
        description: "💻 Obtener información del sistema y herramientas instaladas",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_execution_stats",
        description: "📊 Obtener estadísticas de ejecución de comandos",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// 🛠️ IMPLEMENTACIÓN DE HERRAMIENTAS
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "execute_command":
        const { command, args: cmdArgs = [], options = {} } = args;
        
        const result = terminalServer.executeSync(command, cmdArgs, options);
        
        return {
          content: [
            {
              type: "text",
              text: `🖥️ **COMANDO EJECUTADO: ${command} ${cmdArgs.join(' ')}**

**Estado:** ${result.success ? '✅ Exitoso' : '❌ Error'}
**Tiempo:** ${result.duration}ms
**Código de salida:** ${result.exitCode}

**Salida estándar:**
\`\`\`
${result.stdout || 'Sin salida'}
\`\`\`

${result.stderr ? `**Errores:**
\`\`\`
${result.stderr}
\`\`\`` : ''}

**🔒 Comando ejecutado de forma segura con validación y logging automático**`
            }
          ]
        };

      case "run_powershell_script":
        const psResult = await terminalServer.runPowerShellScript(args.scriptPath, args.args || []);
        
        return {
          content: [
            {
              type: "text",
              text: `📜 **SCRIPT POWERSHELL EJECUTADO: ${args.scriptPath}**

**Estado:** ${psResult.success ? '✅ Exitoso' : '❌ Error'}
**Tiempo:** ${psResult.duration}ms

**Resultado:**
\`\`\`powershell
${psResult.stdout || psResult.stderr}
\`\`\`

**🔐 Script ejecutado con PolicyBypass y validación de seguridad**`
            }
          ]
        };

      case "run_node_script":
        const nodeResult = await terminalServer.runNodeScript(args.scriptPath, args.args || []);
        
        return {
          content: [
            {
              type: "text",
              text: `🟢 **SCRIPT NODE.JS EJECUTADO: ${args.scriptPath}**

**Estado:** ${nodeResult.success ? '✅ Exitoso' : '❌ Error'}
**Tiempo:** ${nodeResult.duration}ms

**Resultado:**
\`\`\`javascript
${nodeResult.stdout || nodeResult.stderr}
\`\`\`

**⚡ Script ejecutado con manejo avanzado de errores y logging**`
            }
          ]
        };

      case "get_system_info":
        const sysInfo = await terminalServer.getSystemInfo();
        
        return {
          content: [
            {
              type: "text",
              text: `💻 **INFORMACIÓN DEL SISTEMA**

**Node.js:** ${sysInfo.node?.success ? sysInfo.node.stdout.trim() : 'No disponible'}
**npm:** ${sysInfo.npm?.success ? sysInfo.npm.stdout.trim() : 'No disponible'}
**pnpm:** ${sysInfo.pnpm?.success ? sysInfo.pnpm.stdout.trim() : 'No disponible'}
**Git:** ${sysInfo.git?.success ? sysInfo.git.stdout.trim() : 'No disponible'}

**🔧 Sistema listo para ejecución de comandos de desarrollo**`
            }
          ]
        };

      case "get_execution_stats":
        const stats = terminalServer.getExecutionStats();
        
        return {
          content: [
            {
              type: "text",
              text: `📊 **ESTADÍSTICAS DE EJECUCIÓN**

**Total de ejecuciones:** ${stats.totalExecutions}
**Ejecuciones recientes:** ${stats.recentExecutions}
**Tasa de éxito:** ${stats.successRate.toFixed(1)}%
**Tiempo promedio:** ${stats.averageDuration.toFixed(0)}ms
**Procesos activos:** ${stats.activeProcesses}

**Última ejecución:**
${stats.lastExecution ? `${stats.lastExecution.command} (${stats.lastExecution.success ? 'Exitoso' : 'Error'})` : 'Ninguna'}

**📈 Terminal MCP operativo y monitoreado**`
            }
          ]
        };

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ **Error en Terminal MCP:** ${error.message}

**🔒 Error capturado por sistema de seguridad. Verificar permisos y sintaxis del comando.**`
        }
      ]
    };
  }
});

// 🚀 INICIAR SERVIDOR
const transport = new StdioServerTransport();
server.connect(transport);

console.error("🖥️ Terminal MCP Server iniciado - EJECUCIÓN REAL DE COMANDOS HABILITADA! 🚀");
