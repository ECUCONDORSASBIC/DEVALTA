#!/usr/bin/env node
// 🎯 ALTAMEDICA MCP TOOLS - Herramientas MCP Extendidas para Claude

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// 🏥 CONFIGURACIÓN
const ALTAMEDICA_CONFIG = {
  workspace: 'C:\\Users\\Eduardo\\Documents\\devaltamedica',
  cliScript: 'altamedica-cli.js',
  bridgeScript: 'altamedica-bridge.js'
};

// 🛠️ SERVIDOR MCP PARA HERRAMIENTAS ALTAMEDICA
class AltamedicaMCPTools {
  constructor() {
    this.server = new Server(
      {
        name: "altamedica-mcp-tools",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    this.workspace = ALTAMEDICA_CONFIG.workspace;
    this.setupTools();
    this.setupHandlers();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "altamedica_command",
            description: "🏥 Ejecutar comandos Altamedica usando -m desde Claude",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "Comando a ejecutar (start, stop, status, agents, compose, intel, logs, etc.)",
                  enum: [
                    "start", "stop", "restart", "status", "agents", "compose", 
                    "intel", "logs", "health", "performance", "config", "version", 
                    "help", "negotiate", "alert", "backup"
                  ]
                },
                args: {
                  type: "array",
                  items: { type: "string" },
                  description: "Argumentos adicionales para el comando"
                },
                context: {
                  type: "string",
                  description: "Contexto de ejecución (claude, cursor, warp)",
                  enum: ["claude", "cursor", "warp", "auto"],
                  default: "claude"
                }
              },
              required: ["command"]
            }
          },
          {
            name: "altamedica_bridge_command",
            description: "🌉 Ejecutar comandos del bridge para integración multi-entorno",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "Comando del bridge",
                  enum: ["claude-start", "claude-stop", "env", "agents-claude"]
                },
                args: {
                  type: "array",
                  items: { type: "string" },
                  description: "Argumentos adicionales"
                }
              },
              required: ["command"]
            }
          },
          {
            name: "altamedica_quick_status",
            description: "📊 Estado rápido del sistema Altamedica",
            inputSchema: {
              type: "object",
              properties: {
                detailed: {
                  type: "boolean",
                  description: "Mostrar información detallada",
                  default: false
                }
              }
            }
          },
          {
            name: "altamedica_agents_list",
            description: "🤖 Listar agentes médicos especializados de Altamedica",
            inputSchema: {
              type: "object",
              properties: {
                filter: {
                  type: "string",
                  description: "Filtrar por tipo de agente o especialidad"
                },
                format: {
                  type: "string",
                  enum: ["table", "list", "json"],
                  default: "table",
                  description: "Formato de salida"
                }
              }
            }
          },
          {
            name: "altamedica_compose_app",
            description: "🎼 Componer nueva aplicación médica usando Enhanced Multi-Agent",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Nombre de la aplicación médica"
                },
                type: {
                  type: "string",
                  enum: ["frontend", "backend", "fullstack", "mobile", "api"],
                  description: "Tipo de aplicación"
                },
                features: {
                  type: "array",
                  items: { type: "string" },
                  description: "Características deseadas (ej: authentication, patient-portal, emr-integration)"
                },
                framework: {
                  type: "string",
                  description: "Framework preferido (React, Vue, Angular, etc.)"
                },
                medical_compliance: {
                  type: "array",
                  items: { 
                    type: "string",
                    enum: ["HIPAA", "GDPR", "FHIR", "HL7", "ICD-10", "FDA"]
                  },
                  description: "Requerimientos de compliance médico"
                }
              },
              required: ["name", "type"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "altamedica_command":
            return await this.executeAltamedicaCommand(args);
          case "altamedica_bridge_command":
            return await this.executeBridgeCommand(args);
          case "altamedica_quick_status":
            return await this.getQuickStatus(args);
          case "altamedica_agents_list":
            return await this.listAgents(args);
          case "altamedica_compose_app":
            return await this.composeApplication(args);
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error ejecutando ${name}: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async executeAltamedicaCommand(args) {
    const { command, args: cmdArgs = [], context = "claude" } = args;
    
    try {
      // Establecer variables de entorno según contexto
      const env = { ...process.env };
      if (context === "claude") {
        env.CLAUDE_CONTEXT = "true";
      } else if (context === "cursor") {
        env.CURSOR_CONTEXT = "true";
      } else if (context === "warp") {
        env.WARP_CONTEXT = "true";
      }

      // Ejecutar comando usando el bridge
      const bridgePath = path.join(this.workspace, ALTAMEDICA_CONFIG.bridgeScript);
      const fullCommand = `node "${bridgePath}" ${command} ${cmdArgs.join(' ')}`;
      
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: this.workspace,
        env
      });

      let output = `# 🏥 Comando Altamedica: -m ${command}\n\n`;
      
      if (stdout) {
        output += `## 📤 Resultado:\n\`\`\`\n${stdout}\n\`\`\`\n\n`;
      }
      
      if (stderr) {
        output += `## ℹ️ Información del Sistema:\n\`\`\`\n${stderr}\n\`\`\`\n\n`;
      }
      
      output += `✅ **Comando ejecutado exitosamente desde Claude**\n`;
      output += `🎯 **Contexto:** ${context}\n`;
      output += `⏰ **Tiempo:** ${new Date().toLocaleString()}\n`;

      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error ejecutando comando Altamedica**\n\n` +
                  `**Comando:** -m ${command}\n` +
                  `**Error:** ${error.message}\n\n` +
                  `**Sugerencias:**\n` +
                  `- Verificar que el workspace existe: \`${this.workspace}\`\n` +
                  `- Confirmar que Node.js está instalado\n` +
                  `- Intentar con: \`-m status\` para verificar el sistema`
          }
        ]
      };
    }
  }

  async executeBridgeCommand(args) {
    const { command, args: cmdArgs = [] } = args;
    
    try {
      const bridgePath = path.join(this.workspace, ALTAMEDICA_CONFIG.bridgeScript);
      const { stdout, stderr } = await execAsync(`node "${bridgePath}" ${command} ${cmdArgs.join(' ')}`, {
        cwd: this.workspace,
        env: { ...process.env, CLAUDE_CONTEXT: "true" }
      });

      return {
        content: [
          {
            type: "text",
            text: `# 🌉 Bridge Command: ${command}\n\n` +
                  `${stdout || ''}\n` +
                  `${stderr ? `\n**Sistema:** ${stderr}` : ''}\n\n` +
                  `✅ Bridge command ejecutado desde Claude`
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error en bridge command: ${error.message}`
          }
        ]
      };
    }
  }

  async getQuickStatus(args) {
    const { detailed = false } = args;
    
    try {
      // Verificar archivos del sistema
      const mcpPath = path.join(this.workspace, 'mcp-servers', 'enhanced-multi-agent-mcp.js');
      const cliPath = path.join(this.workspace, ALTAMEDICA_CONFIG.cliScript);
      const bridgePath = path.join(this.workspace, ALTAMEDICA_CONFIG.bridgeScript);
      
      const mcpExists = await fs.access(mcpPath).then(() => true).catch(() => false);
      const cliExists = await fs.access(cliPath).then(() => true).catch(() => false);
      const bridgeExists = await fs.access(bridgePath).then(() => true).catch(() => false);
      
      let status = `# 📊 Estado Rápido - Altamedica\n\n`;
      status += `## 🔍 Verificación de Sistema\n\n`;
      status += `| Componente | Estado | Ruta |\n`;
      status += `|------------|--------|------|\n`;
      status += `| Enhanced MCP | ${mcpExists ? '✅' : '❌'} | \`enhanced-multi-agent-mcp.js\` |\n`;
      status += `| CLI Tool | ${cliExists ? '✅' : '❌'} | \`altamedica-cli.js\` |\n`;
      status += `| Bridge | ${bridgeExists ? '✅' : '❌'} | \`altamedica-bridge.js\` |\n\n`;
      
      status += `## 🏥 Información del Workspace\n\n`;
      status += `- **📁 Workspace:** \`${this.workspace}\`\n`;
      status += `- **🟢 Node.js:** \`${process.version}\`\n`;
      status += `- **🏗️ Plataforma:** \`${process.platform} ${process.arch}\`\n`;
      status += `- **⏰ Timestamp:** \`${new Date().toLocaleString()}\`\n\n`;
      
      if (detailed) {
        status += `## 📋 Comandos Disponibles\n\n`;
        status += `- \`-m start\` - Iniciar servidor MCP\n`;
        status += `- \`-m agents\` - Listar 17 agentes médicos\n`;
        status += `- \`-m compose\` - Crear aplicación médica\n`;
        status += `- \`-m intel\` - Reporte de inteligencia\n`;
        status += `- \`-m status\` - Estado completo del sistema\n\n`;
      }
      
      status += `🎯 **Estado general:** ${mcpExists && cliExists && bridgeExists ? '🟢 OPERATIVO' : '🔴 REQUIERE ATENCIÓN'}`;

      return {
        content: [
          {
            type: "text",
            text: status
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error obteniendo estado: ${error.message}`
          }
        ]
      };
    }
  }

  async listAgents(args) {
    const { filter = "", format = "table" } = args;
    
    const agents = [
      { id: 'project_manager_001', name: 'Project Manager', type: 'management', specialty: 'Gestión médica', status: '✅' },
      { id: 'system_architect_001', name: 'System Architect', type: 'architecture', specialty: 'Arquitectura healthcare', status: '✅' },
      { id: 'backend_developer_001', name: 'Backend Developer', type: 'development', specialty: 'APIs médicas', status: '✅' },
      { id: 'frontend_developer_001', name: 'Frontend Developer', type: 'development', specialty: 'Interfaces médicas', status: '✅' },
      { id: 'devops_engineer_001', name: 'DevOps Engineer', type: 'infrastructure', specialty: 'Infraestructura médica', status: '✅' },
      { id: 'qa_specialist_001', name: 'QA Specialist', type: 'quality', specialty: 'Testing médico', status: '✅' },
      { id: 'security_compliance_officer_001', name: 'Security & Compliance', type: 'security', specialty: 'HIPAA/GDPR', status: '✅' },
      { id: 'data_engineer_001', name: 'Data Engineer', type: 'data', specialty: 'Datos médicos', status: '✅' },
      { id: 'support_specialist_001', name: 'Support Specialist', type: 'support', specialty: 'Soporte médico', status: '✅' },
      { id: 'uxui_designer_001', name: 'UX/UI Designer', type: 'design', specialty: 'Diseño médico', status: '✅' },
      { id: 'medical_lead_001', name: 'Medical Lead', type: 'medical', specialty: 'Validación clínica', status: '✅' },
      { id: 'product_owner_001', name: 'Product Owner', type: 'product', specialty: 'Producto médico', status: '✅' },
      { id: 'business_analyst_001', name: 'Business Analyst', type: 'analysis', specialty: 'Análisis médico', status: '✅' },
      { id: 'technical_writer_001', name: 'Technical Writer', type: 'documentation', specialty: 'Documentación médica', status: '✅' },
      { id: 'scrum_master_001', name: 'Scrum Master', type: 'agile', specialty: 'Agilidad médica', status: '✅' },
      { id: 'database_specialist_001', name: 'Database Specialist', type: 'data', specialty: 'BD médicas', status: '✅' },
      { id: 'api_architect_001', name: 'API Architect', type: 'architecture', specialty: 'APIs FHIR/HL7', status: '✅' }
    ];

    // Filtrar agentes si se especifica
    let filteredAgents = agents;
    if (filter) {
      filteredAgents = agents.filter(agent => 
        agent.name.toLowerCase().includes(filter.toLowerCase()) ||
        agent.type.toLowerCase().includes(filter.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (format === "json") {
      return {
        content: [
          {
            type: "text",
            text: `# 🤖 Agentes Altamedica (JSON)\n\n\`\`\`json\n${JSON.stringify(filteredAgents, null, 2)}\n\`\`\`\n\n**Total:** ${filteredAgents.length} agentes`
          }
        ]
      };
    }

    if (format === "list") {
      let output = `# 🤖 Agentes de Altamedica\n\n`;
      output += `**Total de agentes:** ${filteredAgents.length}\n\n`;
      
      filteredAgents.forEach((agent, index) => {
        output += `**${index + 1}. ${agent.name}** ${agent.status}\n`;
        output += `   - **ID:** \`${agent.id}\`\n`;
        output += `   - **Tipo:** ${agent.type}\n`;
        output += `   - **Especialidad:** ${agent.specialty}\n\n`;
      });
      
      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };
    }

    // Formato tabla (por defecto)
    let output = `# 🤖 Agentes Especializados de Altamedica\n\n`;
    output += `| # | Agente | Tipo | Especialidad | Estado |\n`;
    output += `|---|--------|------|--------------|--------|\n`;
    
    filteredAgents.forEach((agent, index) => {
      output += `| ${(index + 1).toString().padStart(2, '0')} | **${agent.name}** | ${agent.type} | ${agent.specialty} | ${agent.status} |\n`;
    });
    
    output += `\n**Total:** ${filteredAgents.length} agentes especializados en salud digital\n`;
    
    if (filter) {
      output += `**Filtro aplicado:** "${filter}"\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output
        }
      ]
    };
  }

  async composeApplication(args) {
    const { 
      name, 
      type, 
      features = [], 
      framework = "React", 
      medical_compliance = ["HIPAA"] 
    } = args;
    
    try {
      // Ejecutar comando de composición usando el bridge
      const bridgePath = path.join(this.workspace, ALTAMEDICA_CONFIG.bridgeScript);
      const { stdout, stderr } = await execAsync(`node "${bridgePath}" compose "${name}"`, {
        cwd: this.workspace,
        env: { ...process.env, CLAUDE_CONTEXT: "true" }
      });

      let output = `# 🎼 Composición de Aplicación Médica\n\n`;
      output += `## 📋 Especificaciones\n\n`;
      output += `- **📱 Nombre:** ${name}\n`;
      output += `- **🏗️ Tipo:** ${type}\n`;
      output += `- **⚛️ Framework:** ${framework}\n`;
      output += `- **🏥 Compliance:** ${medical_compliance.join(', ')}\n\n`;
      
      if (features.length > 0) {
        output += `## ✨ Características Solicitadas\n\n`;
        features.forEach(feature => {
          output += `- ${feature}\n`;
        });
        output += `\n`;
      }
      
      output += `## 🤖 Agentes Asignados\n\n`;
      output += `Los siguientes agentes especializados trabajarán en tu aplicación médica:\n\n`;
      
      // Agentes relevantes según el tipo
      const relevantAgents = this.getRelevantAgents(type, features);
      relevantAgents.forEach(agent => {
        output += `- **${agent.name}** - ${agent.role}\n`;
      });
      
      output += `\n## 🚀 Próximos Pasos\n\n`;
      output += `1. **Validación médica** por Medical Lead\n`;
      output += `2. **Arquitectura** definida por System Architect\n`;
      output += `3. **Desarrollo** por equipos especializados\n`;
      output += `4. **Testing de compliance** por Security & Compliance\n`;
      output += `5. **Despliegue** por DevOps Engineer\n\n`;
      
      if (stdout) {
        output += `## 📤 Resultado del Sistema\n\n\`\`\`\n${stdout}\n\`\`\`\n\n`;
      }
      
      output += `✅ **Composición iniciada exitosamente desde Claude**\n`;
      output += `🏥 **Enfoque:** Aplicación médica con compliance ${medical_compliance.join(', ')}\n`;
      output += `⏰ **Timestamp:** ${new Date().toLocaleString()}`;

      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Error componiendo aplicación médica**\n\n` +
                  `**Aplicación:** ${name}\n` +
                  `**Error:** ${error.message}\n\n` +
                  `**Sugerencia:** Verificar que el servidor MCP esté ejecutándose con \`-m start\``
          }
        ]
      };
    }
  }

  getRelevantAgents(type, features) {
    const baseAgents = [
      { name: "Project Manager", role: "Coordinación general del proyecto" },
      { name: "Medical Lead", role: "Validación clínica y compliance médico" },
      { name: "Security & Compliance", role: "Asegurar cumplimiento HIPAA/GDPR" }
    ];

    if (type === "frontend" || type === "fullstack") {
      baseAgents.push(
        { name: "Frontend Developer", role: "Desarrollo de interfaces médicas" },
        { name: "UX/UI Designer", role: "Diseño centrado en usuarios médicos" }
      );
    }

    if (type === "backend" || type === "fullstack" || type === "api") {
      baseAgents.push(
        { name: "Backend Developer", role: "APIs y lógica de negocio médica" },
        { name: "API Architect", role: "Integración FHIR/HL7" },
        { name: "Database Specialist", role: "Gestión de datos médicos" }
      );
    }

    if (features.includes("data-analytics") || features.includes("reporting")) {
      baseAgents.push(
        { name: "Data Engineer", role: "Analytics y reportes médicos" }
      );
    }

    baseAgents.push(
      { name: "QA Specialist", role: "Testing especializado médico" },
      { name: "DevOps Engineer", role: "Infraestructura y despliegue" }
    );

    return baseAgents;
  }

  setupHandlers() {
    // Manejadores de eventos del servidor
    console.error('🏥 Altamedica MCP Tools initialized');
    console.error('🔗 Claude integration ready');
  }

  async start() {
    console.error('🚀 Iniciando Altamedica MCP Tools...');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('✅ Altamedica MCP Tools server iniciado');
    console.error('🎯 Herramientas disponibles para Claude:');
    console.error('   - altamedica_command (ejecutar -m desde Claude)');
    console.error('   - altamedica_bridge_command (comandos bridge)');
    console.error('   - altamedica_quick_status (estado rápido)');
    console.error('   - altamedica_agents_list (listar agentes)');
    console.error('   - altamedica_compose_app (componer aplicación)');
  }
}

// 🎯 FUNCIÓN PRINCIPAL
async function main() {
  try {
    const mcpTools = new AltamedicaMCPTools();
    await mcpTools.start();
  } catch (error) {
    console.error('💥 Error crítico iniciando Altamedica MCP Tools:', error);
    process.exit(1);
  }
}

// 🚀 EJECUTAR
if (import.meta.url === `file://${process.argv[1]}`) {
  console.error('🏥 Starting Altamedica MCP Tools for Claude integration');
  main().catch(console.error);
}

export { AltamedicaMCPTools };
