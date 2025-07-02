#!/usr/bin/env node
// 🔗 WARP MCP CONNECTOR - Cliente Inteligente para Enhanced Multi-Agent Composer
// Conecta Warp Terminal con tu servidor MCP de forma nativa

import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import readline from 'readline'
import { fileURLToPath } from 'url'

class WarpMCPConnector extends EventEmitter {
  constructor() {
    super()
    this.mcpProcess = null
    this.isConnected = false
    this.pendingRequests = new Map()
    this.requestId = 1
    
    this.setupTerminalInterface()
  }

  setupTerminalInterface() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🎼 Altamedica MCP> '
    })

    this.rl.on('line', (input) => {
      this.handleUserInput(input.trim())
    })

    this.rl.on('close', () => {
      console.log('\n👋 Desconectando del MCP...')
      this.disconnect()
      process.exit(0)
    })
  }

  async connect() {
    console.log('🚀 Conectando a Enhanced Multi-Agent Composer MCP...')
    
    try {
      // Spawn el servidor MCP
      this.mcpProcess = spawn('node', ['./mcp-servers/enhanced-multi-agent-mcp.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      })

      // Configurar manejo de mensajes
      this.mcpProcess.stdout.on('data', (data) => {
        this.handleMCPMessage(data.toString())
      })

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('🚨 Error MCP:', data.toString())
      })

      this.mcpProcess.on('exit', (code) => {
        console.log('💀 Servidor MCP terminó con código:', code)
        this.isConnected = false
      })

      // Esperar conexión
      await this.waitForConnection()
      
      console.log('✅ Conectado exitosamente al MCP!')
      console.log('📋 Comandos disponibles:')
      console.log('  - compose <app-name>    : Componer nueva aplicación')
      console.log('  - agents                : Listar agentes disponibles')
      console.log('  - report                : Obtener reporte de inteligencia')
      console.log('  - negotiate <agents>    : Iniciar negociación')
      console.log('  - analyze <agent-id>    : Analizar rendimiento cognitivo')
      console.log('  - help                  : Mostrar ayuda')
      console.log('  - exit                  : Salir')
      console.log('')
      
      this.rl.prompt()

    } catch (error) {
      console.error('💥 Error conectando al MCP:', error)
      process.exit(1)
    }
  }

  async waitForConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando conexión MCP'))
      }, 10000)

      // Enviar mensaje de inicialización
      this.sendMCPMessage({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'warp-mcp-connector',
            version: '1.0.0'
          }
        }
      })

      this.once('initialized', () => {
        clearTimeout(timeout)
        this.isConnected = true
        resolve()
      })
    })
  }

  sendMCPMessage(message) {
    if (this.mcpProcess && this.mcpProcess.stdin) {
      const jsonMessage = JSON.stringify(message) + '\n'
      this.mcpProcess.stdin.write(jsonMessage)
    }
  }

  handleMCPMessage(data) {
    try {
      const lines = data.split('\n').filter(line => line.trim())
      
      lines.forEach(line => {
        try {
          const message = JSON.parse(line)
          
          if (message.method === 'initialized') {
            this.emit('initialized')
          } else if (message.result && message.result.protocolVersion) {
            // This is the initialize response
            console.log('🔄 Received initialize response, completing handshake...');
            if (message.id && this.pendingRequests.has(message.id)) {
              const resolve = this.pendingRequests.get(message.id)
              this.pendingRequests.delete(message.id)
              resolve(message)
            }
            
            // Send initialized notification to complete handshake
            setTimeout(() => {
              this.sendMCPMessage({
                jsonrpc: '2.0',
                method: 'initialized',
                params: {}
              })
              console.log('📤 Sent initialized notification, connection established!');
              this.emit('initialized')
            }, 100)
          } else if (message.id && this.pendingRequests.has(message.id)) {
            const resolve = this.pendingRequests.get(message.id)
            this.pendingRequests.delete(message.id)
            resolve(message)
          } else {
            console.log('📨 Mensaje del MCP:', message)
          }
        } catch (parseError) {
          // Ignore non-JSON output
        }
      })
    } catch (error) {
      console.error('Error procesando mensaje MCP:', error)
    }
  }

  async callMCPTool(toolName, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.requestId++
      
      this.pendingRequests.set(id, resolve)
      
      this.sendMCPMessage({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      })

      // Timeout para la solicitud
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Timeout esperando respuesta de ' + toolName))
        }
      }, 30000)
    })
  }

  async handleUserInput(input) {
    if (!this.isConnected) {
      console.log('❌ No conectado al MCP. Use "connect" primero.')
      this.rl.prompt()
      return
    }

    const [command, ...args] = input.split(' ')

    try {
      switch (command.toLowerCase()) {
        case 'compose':
          await this.handleComposeCommand(args)
          break

        case 'agents':
          await this.handleAgentsCommand()
          break

        case 'report':
          await this.handleReportCommand()
          break

        case 'negotiate':
          await this.handleNegotiateCommand(args)
          break

        case 'analyze':
          await this.handleAnalyzeCommand(args)
          break

        case 'help':
          this.showHelp()
          break

        case 'exit':
          this.rl.close()
          return

        default:
          console.log('❓ Comando desconocido:', command, '. Use "help" para ver comandos disponibles.')
      }
    } catch (error) {
      console.error('💥 Error ejecutando comando:', error.message)
    }

    this.rl.prompt()
  }

  async handleComposeCommand(args) {
    const appName = args[0] || 'MiApp'
    
    console.log('🎼 Componiendo aplicación:', appName, '...')
    
    const result = await this.callMCPTool('compose_application', {
      spec: {
        name: appName,
        type: 'fullstack',
        frontend: { framework: 'React' },
        backend: { runtime: 'Node.js' },
        features: ['authentication', 'dashboard', 'api']
      },
      context: {
        budget: 5000,
        teamSize: 5,
        timeline: '3 months'
      }
    })

    console.log('✅ Composición completada:')
    console.log(result.content?.[0]?.text || JSON.stringify(result, null, 2))
  }

  async handleAgentsCommand() {
    console.log('🤖 Obteniendo lista de agentes...')
    
    const result = await this.callMCPTool('list_agents')
    
    console.log('📋 Agentes disponibles:')
    console.log(result.content?.[0]?.text || JSON.stringify(result, null, 2))
  }

  async handleReportCommand() {
    console.log('📊 Generando reporte de inteligencia...')
    
    const result = await this.callMCPTool('get_intelligence_report')
    
    console.log('📈 Reporte de inteligencia:')
    console.log(result.content?.[0]?.text || JSON.stringify(result, null, 2))
  }

  async handleNegotiateCommand(args) {
    const agentIds = args.length > 0 ? args : ['react_specialist_001', 'api_architect_001']
    
    console.log('🤝 Iniciando negociación entre agentes:', agentIds.join(', '), '...')
    
    const result = await this.callMCPTool('start_negotiation', {
      agentIds,
      context: {
        topic: 'architecture_decision',
        priority: 'high'
      }
    })

    console.log('🔄 Negociación iniciada:')
    console.log(result.content?.[0]?.text || JSON.stringify(result, null, 2))
  }

  async handleAnalyzeCommand(args) {
    const agentId = args[0] || 'react_specialist_001'
    
    console.log('🧠 Analizando rendimiento cognitivo del agente:', agentId, '...')
    
    const result = await this.callMCPTool('analyze_cognitive_performance', {
      agentId
    })

    console.log('📊 Análisis cognitivo:')
    console.log(result.content?.[0]?.text || JSON.stringify(result, null, 2))
  }

  showHelp() {
    console.log(`
🎼 ENHANCED MULTI-AGENT COMPOSER - WARP CONNECTOR

📋 Comandos Disponibles:
  compose <name>       - Componer nueva aplicación fullstack
  agents              - Listar todos los agentes disponibles
  report              - Obtener reporte de inteligencia del sistema
  negotiate <agents>  - Iniciar negociación entre agentes específicos
  analyze <agent-id>  - Analizar rendimiento cognitivo de un agente
  help                - Mostrar esta ayuda
  exit                - Salir del conector

🎯 Ejemplos:
  compose "MiAppMedica"
  agents
  negotiate react_specialist_001 api_architect_001
  analyze system_architect_001

🔗 Estado: ${this.isConnected ? '✅ Conectado' : '❌ Desconectado'}
`)
  }

  disconnect() {
    if (this.mcpProcess) {
      this.mcpProcess.kill()
      this.mcpProcess = null
    }
    this.isConnected = false
  }
}

// Iniciar el conector
async function main() {
  console.log('🎼 WARP MCP CONNECTOR - Enhanced Multi-Agent Composer')
  console.log('='.repeat(60))
  
  const connector = new WarpMCPConnector()
  
  // Manejar señales de sistema
  process.on('SIGINT', () => {
    console.log('\n👋 Recibida señal de interrupción...')
    connector.disconnect()
    process.exit(0)
  })

  // Conectar al MCP
  await connector.connect()
}

// Ejecutar solo si es el módulo principal
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log('🎼 Starting warp-mcp-connector.js as main module');
  main().catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}

export { WarpMCPConnector }
