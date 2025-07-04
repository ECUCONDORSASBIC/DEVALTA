#!/usr/bin/env node
// 🎯 ALTAMEDICA MCP BRIDGE - Integración para Claude, Cursor y Warp
// Permite usar `-m` desde cualquier entorno de desarrollo

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🏥 CONFIGURACIÓN UNIVERSAL
const ALTAMEDICA_CONFIG = {
  workspace: 'C:\\Users\\Eduardo\\Documents\\devaltamedica',
  mcpServer: 'enhanced-multi-agent-mcp.js',
  cliScript: 'altamedica-cli.js',
  port: 3001,
  bridgePort: 3002
};

// 🌉 BRIDGE PARA MÚLTIPLES ENTORNOS
class AltamedicaBridge {
  constructor() {
    this.workspace = ALTAMEDICA_CONFIG.workspace;
    this.isClaudeContext = this.detectClaudeContext();
    this.isCursorContext = this.detectCursorContext();
    this.isWarpContext = this.detectWarpContext();
    this.mcpProcess = null;
  }

  // 🕵️ DETECTAR CONTEXTO DE EJECUCIÓN
  detectClaudeContext() {
    return process.env.CLAUDE_CONTEXT === 'true' || 
           process.env.MCP_SERVER_NAME === 'enhanced-multi-agent' ||
           process.cwd().includes('claude');
  }

  detectCursorContext() {
    return process.env.CURSOR_CONTEXT === 'true' ||
           process.env.VSCODE_CONTEXT === 'cursor' ||
           process.cwd().includes('cursor') ||
           process.env.TERM_PROGRAM === 'vscode';
  }

  detectWarpContext() {
    return process.env.WARP_CONTEXT === 'true' ||
           process.env.TERM_PROGRAM === 'WarpTerminal' ||
           process.env.WARP === 'true';
  }

  // 🎨 FORMATEO ESPECÍFICO POR ENTORNO
  formatOutput(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    
    if (this.isClaudeContext) {
      // Formato para Claude (markdown-friendly)
      switch (type) {
        case 'success':
          return `✅ **[${timestamp}]** ${message}`;
        case 'error':
          return `❌ **[${timestamp}]** ${message}`;
        case 'warning':
          return `⚠️ **[${timestamp}]** ${message}`;
        case 'info':
          return `ℹ️ **[${timestamp}]** ${message}`;
        default:
          return `📋 **[${timestamp}]** ${message}`;
      }
    } else if (this.isCursorContext) {
      // Formato para Cursor (VSCode-style)
      const prefix = type === 'error' ? '[ERROR]' : 
                    type === 'warning' ? '[WARN]' : 
                    type === 'success' ? '[SUCCESS]' : '[INFO]';
      return `${prefix} [${timestamp}] Altamedica: ${message}`;
    } else if (this.isWarpContext) {
      // Formato para Warp (moderno terminal)
      const icon = type === 'error' ? '🚨' : 
                  type === 'warning' ? '⚠️' : 
                  type === 'success' ? '🎉' : '💡';
      return `${icon} Altamedica [${timestamp}]: ${message}`;
    } else {
      // Formato por defecto
      return `[${timestamp}] ${message}`;
    }
  }

  // 📤 OUTPUT UNIVERSAL
  output(message, type = 'info') {
    const formatted = this.formatOutput(message, type);
    
    if (type === 'error') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  // 🚀 EJECUTAR COMANDO MCP
  async executeMCPCommand(command, args = []) {
    try {
      // Cambiar al workspace
      process.chdir(this.workspace);
      
      this.output(`Ejecutando comando: -m ${command} ${args.join(' ')}`, 'info');
      
      // Ejecutar el CLI original
      const cliPath = path.join(this.workspace, ALTAMEDICA_CONFIG.cliScript);
      const { stdout, stderr } = await execAsync(`node "${cliPath}" ${command} ${args.join(' ')}`);
      
      if (stdout) {
        this.output('Salida del comando:', 'success');
        console.log(stdout);
      }
      
      if (stderr) {
        this.output('Información del sistema:', 'info');
        console.log(stderr);
      }
      
      return { success: true, stdout, stderr };
      
    } catch (error) {
      this.output(`Error ejecutando comando: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // 🎼 MÉTODOS ESPECÍFICOS PARA CLAUDE
  async startForClaude() {
    this.output('🏥 Iniciando Enhanced Multi-Agent MCP para Claude...', 'info');
    
    try {
      // Iniciar servidor MCP en modo background para Claude
      const mcpPath = path.join(this.workspace, 'mcp-servers', ALTAMEDICA_CONFIG.mcpServer);
      
      this.mcpProcess = spawn('node', [mcpPath], {
        cwd: this.workspace,
        detached: false,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mcpProcess.stdout.on('data', (data) => {
        this.output(`MCP: ${data.toString().trim()}`, 'info');
      });

      this.mcpProcess.stderr.on('data', (data) => {
        this.output(`MCP Sistema: ${data.toString().trim()}`, 'info');
      });

      this.mcpProcess.on('close', (code) => {
        this.output(`Servidor MCP terminado con código ${code}`, code === 0 ? 'success' : 'error');
      });

      // Esperar un momento para que se inicie
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.output('✅ Servidor MCP iniciado para Claude', 'success');
      this.output('🔗 Claude puede ahora usar las herramientas MCP', 'info');
      
      return { success: true, pid: this.mcpProcess.pid };
      
    } catch (error) {
      this.output(`Error iniciando MCP para Claude: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // 🛑 DETENER SERVIDOR MCP
  async stopMCPServer() {
    if (this.mcpProcess) {
      this.output('🛑 Deteniendo servidor MCP...', 'info');
      this.mcpProcess.kill('SIGTERM');
      this.mcpProcess = null;
      this.output('✅ Servidor MCP detenido', 'success');
      return { success: true };
    } else {
      this.output('⚠️ No hay servidor MCP ejecutándose', 'warning');
      return { success: false, message: 'No hay servidor ejecutándose' };
    }
  }

  // 📊 INFORMACIÓN DEL ENTORNO
  async getEnvironmentInfo() {
    const info = {
      context: {
        claude: this.isClaudeContext,
        cursor: this.isCursorContext,
        warp: this.isWarpContext
      },
      workspace: this.workspace,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      env: {
        CLAUDE_CONTEXT: process.env.CLAUDE_CONTEXT,
        CURSOR_CONTEXT: process.env.CURSOR_CONTEXT,
        WARP_CONTEXT: process.env.WARP_CONTEXT,
        TERM_PROGRAM: process.env.TERM_PROGRAM,
        MCP_SERVER_NAME: process.env.MCP_SERVER_NAME
      }
    };

    this.output('📊 Información del entorno:', 'info');
    
    if (this.isClaudeContext) {
      this.output('🤖 **Contexto detectado: Claude AI**', 'success');
      this.output('- Formato de salida optimizado para Claude', 'info');
      this.output('- Integración MCP disponible', 'info');
    }
    
    if (this.isCursorContext) {
      this.output('💻 **Contexto detectado: Cursor IDE**', 'success');
      this.output('- Formato de salida optimizado para Cursor', 'info');
      this.output('- Integración con terminal de Cursor', 'info');
    }
    
    if (this.isWarpContext) {
      this.output('🚀 **Contexto detectado: Warp Terminal**', 'success');
      this.output('- Formato de salida optimizado para Warp', 'info');
      this.output('- Funciones avanzadas de terminal disponibles', 'info');
    }
    
    this.output(`📁 Workspace: ${this.workspace}`, 'info');
    this.output(`🟢 Node.js: ${process.version}`, 'info');
    this.output(`🏗️ Plataforma: ${process.platform} ${process.arch}`, 'info');
    
    return info;
  }

  // 🤖 LISTAR AGENTES OPTIMIZADO PARA CLAUDE
  async listAgentsForClaude() {
    this.output('🤖 **Agentes de Altamedica Disponibles**', 'info');
    
    const agents = [
      { id: 'project_manager_001', name: 'Project Manager', specialty: 'Gestión médica', status: '✅' },
      { id: 'system_architect_001', name: 'System Architect', specialty: 'Arquitectura healthcare', status: '✅' },
      { id: 'backend_developer_001', name: 'Backend Developer', specialty: 'APIs médicas', status: '✅' },
      { id: 'frontend_developer_001', name: 'Frontend Developer', specialty: 'Interfaces médicas', status: '✅' },
      { id: 'devops_engineer_001', name: 'DevOps Engineer', specialty: 'Infraestructura médica', status: '✅' },
      { id: 'qa_specialist_001', name: 'QA Specialist', specialty: 'Testing médico', status: '✅' },
      { id: 'security_compliance_officer_001', name: 'Security & Compliance', specialty: 'HIPAA/GDPR', status: '✅' },
      { id: 'data_engineer_001', name: 'Data Engineer', specialty: 'Datos médicos', status: '✅' },
      { id: 'support_specialist_001', name: 'Support Specialist', specialty: 'Soporte médico', status: '✅' },
      { id: 'uxui_designer_001', name: 'UX/UI Designer', specialty: 'Diseño médico', status: '✅' },
      { id: 'medical_lead_001', name: 'Medical Lead', specialty: 'Validación clínica', status: '✅' },
      { id: 'product_owner_001', name: 'Product Owner', specialty: 'Producto médico', status: '✅' },
      { id: 'business_analyst_001', name: 'Business Analyst', specialty: 'Análisis médico', status: '✅' },
      { id: 'technical_writer_001', name: 'Technical Writer', specialty: 'Documentación médica', status: '✅' },
      { id: 'scrum_master_001', name: 'Scrum Master', specialty: 'Agilidad médica', status: '✅' },
      { id: 'database_specialist_001', name: 'Database Specialist', specialty: 'BD médicas', status: '✅' },
      { id: 'api_architect_001', name: 'API Architect', specialty: 'APIs FHIR/HL7', status: '✅' }
    ];

    console.log(`\n**📋 Total de Agentes: ${agents.length}**\n`);
    
    agents.forEach((agent, index) => {
      console.log(`**${(index + 1).toString().padStart(2, '0')}. ${agent.name}** ${agent.status}`);
      console.log(`   - **ID:** \`${agent.id}\``);
      console.log(`   - **Especialidad:** ${agent.specialty}`);
      console.log('');
    });
    
    return agents;
  }

  // 🎯 EJECUTOR PRINCIPAL
  async executeCommand(command, args = []) {
    // Comandos específicos para contextos
    switch (command) {
      case 'claude-start':
        return await this.startForClaude();
      case 'claude-stop':
        return await this.stopMCPServer();
      case 'env':
      case 'environment':
        return await this.getEnvironmentInfo();
      case 'agents-claude':
        return await this.listAgentsForClaude();
      default:
        return await this.executeMCPCommand(command, args);
    }
  }
}

// 🎯 FUNCIÓN PRINCIPAL
async function main() {
  const bridge = new AltamedicaBridge();
  
  // Obtener argumentos
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    bridge.output('🏥 **Altamedica MCP Bridge**', 'info');
    bridge.output('Integración universal para Claude, Cursor y Warp', 'info');
    bridge.output('', 'info');
    bridge.output('**Comandos disponibles:**', 'info');
    bridge.output('- `node altamedica-bridge.js start` - Iniciar servidor MCP', 'info');
    bridge.output('- `node altamedica-bridge.js claude-start` - Iniciar para Claude', 'info');
    bridge.output('- `node altamedica-bridge.js agents` - Listar agentes', 'info');
    bridge.output('- `node altamedica-bridge.js env` - Información del entorno', 'info');
    bridge.output('- `node altamedica-bridge.js status` - Estado del sistema', 'info');
    return;
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  // Detectar entorno al inicio
  await bridge.getEnvironmentInfo();
  
  // Ejecutar comando
  const result = await bridge.executeCommand(command, commandArgs);
  
  if (result && !result.success) {
    process.exit(1);
  }
}

// 🚀 EJECUTAR
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AltamedicaBridge };
