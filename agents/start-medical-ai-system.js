#!/usr/bin/env node
/**
 * 🤖 ALTAMEDICA Medical AI System Launcher
 * Sistema de agentes AI especializado para telemedicina
 * Características únicas: Diagnóstico asistido, NLP médico, análisis de riesgo
 */

import { spawn, fork } from 'child_process';
import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del sistema AI médico
const MEDICAL_AI_CONFIG = {
  port: process.env.PORT || 3006,
  logLevel: process.env.LOG_LEVEL || 'info',
  maxMemory: process.env.MAX_MEMORY || '1024M',
  aiMode: process.env.ALTAMEDICA_AI_MODE || 'medical',
  compliance: process.env.ALTAMEDICA_COMPLIANCE || 'hipaa'
};

// Agentes médicos especializados con orden de prioridad
const MEDICAL_AGENTS = {
  // Core medical AI agents (máxima prioridad)
  'medical-ai-agent': {
    script: 'src/medical-ai-agent/index.js',
    priority: 1,
    healthEndpoint: '/health/medical-ai',
    description: 'Agente principal de IA médica con TensorFlow.js',
    capabilities: ['diagnosis-support', 'risk-analysis', 'medical-nlp'],
    port: 3007
  },
  'patient-monitoring-agent': {
    script: 'src/patient-monitoring-agent/start.ts',
    priority: 1,
    healthEndpoint: '/health/patient-monitoring',
    description: 'Monitoreo continuo de pacientes en tiempo real',
    capabilities: ['vital-signs', 'alert-management', 'trend-analysis'],
    port: 3008
  },
  'emergency-coordination-agent': {
    script: 'src/emergency-coordination-agent/index.ts',
    priority: 1,
    healthEndpoint: '/health/emergency',
    description: 'Coordinación de emergencias médicas automatizada',
    capabilities: ['emergency-detection', 'resource-allocation', 'triage'],
    port: 3009
  },
  
  // Clinical support agents (alta prioridad)
  'scheduling-optimization-agent': {
    script: 'src/scheduling-optimization-agent/start.ts',
    priority: 2,
    healthEndpoint: '/health/scheduling',
    description: 'Optimización inteligente de horarios médicos',
    capabilities: ['appointment-optimization', 'resource-scheduling', 'prediction'],
    port: 3010
  },
  'knowledge-graph-agent': {
    script: 'src/knowledge-graph-agent/start.ts',
    priority: 2,
    healthEndpoint: '/health/knowledge-graph',
    description: 'Grafo de conocimiento médico y relaciones',
    capabilities: ['medical-knowledge', 'drug-interactions', 'clinical-guidelines'],
    port: 3011
  },

  // System support agents (prioridad media)
  'security-agent': {
    script: 'src/security-agent/index.ts',
    priority: 3,
    healthEndpoint: '/health/security',
    description: 'Seguridad HIPAA y compliance automático',
    capabilities: ['hipaa-monitoring', 'data-protection', 'audit-trails'],
    port: 3012
  },
  'monitoring-agent': {
    script: 'src/monitoring-agent/enhanced-index.ts',
    priority: 3,
    healthEndpoint: '/health/monitoring',
    description: 'Monitoreo del sistema y métricas de rendimiento',
    capabilities: ['system-metrics', 'performance-analysis', 'alerting'],
    port: 3013
  },

  // Infrastructure agents (baja prioridad)
  'event-bus': {
    script: 'src/event-bus/index.ts',
    priority: 4,
    healthEndpoint: '/health/event-bus',
    description: 'Bus de eventos para comunicación entre agentes',
    capabilities: ['event-routing', 'message-queuing', 'real-time-sync'],
    port: 3014
  }
};

class MedicalAISystemLauncher {
  constructor() {
    this.processes = new Map();
    this.startTime = Date.now();
    this.isShuttingDown = false;
    this.healthServer = null;
    
    // Configurar manejo de señales
    this.setupSignalHandlers();
    
    console.log(`🤖 [MEDICAL-AI-SYSTEM] Iniciando sistema AI médico AltaMedica`);
    console.log(`📊 [CONFIG] Puerto: ${MEDICAL_AI_CONFIG.port}, Modo: ${MEDICAL_AI_CONFIG.aiMode}`);
  }

  async start() {
    try {
      // Verificar dependencias del sistema
      await this.verifySystemDependencies();
      
      // Crear directorio de logs
      await this.setupLogging();
      
      // Iniciar servidor de health checks
      await this.startHealthServer();
      
      // Iniciar agentes médicos por orden de prioridad
      await this.startMedicalAgents();
      
      // Configurar monitoreo del sistema
      this.setupSystemMonitoring();
      
      console.log(`✅ [MEDICAL-AI-SYSTEM] Sistema AI médico iniciado correctamente`);
      console.log(`🌐 [HEALTH] Health checks disponibles en http://localhost:${MEDICAL_AI_CONFIG.port}/health`);
      
    } catch (error) {
      console.error(`❌ [MEDICAL-AI-SYSTEM] Error iniciando sistema:`, error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async verifySystemDependencies() {
    console.log(`🔍 [SYSTEM] Verificando dependencias AI médicas...`);
    
    // Verificar Node.js y versión
    const nodeVersion = process.version;
    console.log(`✅ [SYSTEM] Node.js ${nodeVersion} detectado`);
    
    // Verificar disponibilidad de TensorFlow.js
    try {
      const tf = await import('@tensorflow/tfjs-node');
      console.log(`✅ [SYSTEM] TensorFlow.js disponible, backend: ${tf.getBackend()}`);
    } catch (error) {
      console.warn(`⚠️  [SYSTEM] TensorFlow.js no disponible:`, error.message);
    }
    
    // Verificar modelos AI médicos
    const modelsDir = path.join(__dirname, 'models');
    try {
      await fs.access(modelsDir);
      const models = await fs.readdir(modelsDir);
      console.log(`✅ [SYSTEM] Modelos AI encontrados: ${models.length}`);
    } catch (error) {
      console.warn(`⚠️  [SYSTEM] Directorio de modelos no encontrado, usando modelos mock`);
    }
  }

  async setupLogging() {
    const logsDir = path.join(__dirname, '..', 'logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
      console.log(`📝 [LOGGING] Directorio de logs configurado: ${logsDir}`);
    } catch (error) {
      console.warn(`⚠️  [LOGGING] No se pudo crear directorio de logs:`, error.message);
    }
  }

  async startHealthServer() {
    this.healthServer = createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      // Configurar CORS para desarrollo
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Content-Type', 'application/json');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        if (url.pathname === '/health') {
          await this.handleHealthCheck(res);
        } else if (url.pathname.startsWith('/health/')) {
          const agentName = url.pathname.replace('/health/', '');
          await this.handleAgentHealthCheck(res, agentName);
        } else if (url.pathname === '/status') {
          await this.handleSystemStatus(res);
        } else if (url.pathname === '/agents') {
          await this.handleAgentsList(res);
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      } catch (error) {
        console.error(`❌ [HEALTH-SERVER] Error:`, error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });

    this.healthServer.listen(MEDICAL_AI_CONFIG.port, () => {
      console.log(`🏥 [HEALTH-SERVER] Servidor de salud iniciado en puerto ${MEDICAL_AI_CONFIG.port}`);
    });
  }

  async startMedicalAgents() {
    console.log(`🚀 [AGENTS] Iniciando ${Object.keys(MEDICAL_AGENTS).length} agentes médicos...`);
    
    // Ordenar agentes por prioridad
    const sortedAgents = Object.entries(MEDICAL_AGENTS)
      .sort(([,a], [,b]) => a.priority - b.priority);
    
    for (const [name, config] of sortedAgents) {
      await this.startAgent(name, config);
      // Pequeña pausa entre agentes para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async startAgent(name, config) {
    try {
      console.log(`🔄 [AGENT-${name.toUpperCase()}] Iniciando agente...`);
      
      const scriptPath = path.join(__dirname, config.script);
      
      // Verificar si el script existe
      try {
        await fs.access(scriptPath);
      } catch (error) {
        console.warn(`⚠️  [AGENT-${name.toUpperCase()}] Script no encontrado: ${scriptPath}`);
        return;
      }

      const env = {
        ...process.env,
        NODE_ENV: 'production',
        AGENT_NAME: name,
        AGENT_PORT: config.port,
        MEDICAL_AI_MODE: MEDICAL_AI_CONFIG.aiMode,
        LOG_LEVEL: MEDICAL_AI_CONFIG.logLevel
      };

      const child = spawn('node', [scriptPath], {
        env,
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: __dirname
      });

      // Configurar logging de salida
      child.stdout.on('data', (data) => {
        console.log(`📤 [${name.toUpperCase()}] ${data.toString().trim()}`);
      });

      child.stderr.on('data', (data) => {
        console.log(`📥 [${name.toUpperCase()}] ${data.toString().trim()}`);
      });

      child.on('exit', (code) => {
        console.log(`🔚 [AGENT-${name.toUpperCase()}] Proceso terminado con código ${code}`);
        this.processes.delete(name);
        
        // Reiniciar agente si no estamos cerrando el sistema
        if (!this.isShuttingDown && code !== 0) {
          console.log(`🔄 [AGENT-${name.toUpperCase()}] Reiniciando en 5 segundos...`);
          setTimeout(() => this.startAgent(name, config), 5000);
        }
      });

      this.processes.set(name, {
        process: child,
        config,
        startTime: Date.now(),
        restarts: 0
      });

      console.log(`✅ [AGENT-${name.toUpperCase()}] Agente iniciado (PID: ${child.pid})`);
      
    } catch (error) {
      console.error(`❌ [AGENT-${name.toUpperCase()}] Error iniciando agente:`, error);
    }
  }

  async handleHealthCheck(res) {
    const uptime = Date.now() - this.startTime;
    const activeAgents = this.processes.size;
    const totalAgents = Object.keys(MEDICAL_AGENTS).length;
    
    const health = {
      status: activeAgents === totalAgents ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
      system: {
        activeAgents,
        totalAgents,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      medical: {
        aiMode: MEDICAL_AI_CONFIG.aiMode,
        compliance: MEDICAL_AI_CONFIG.compliance,
        capabilities: this.getSystemCapabilities()
      }
    };

    res.writeHead(200);
    res.end(JSON.stringify(health, null, 2));
  }

  async handleAgentHealthCheck(res, agentName) {
    const agentProcess = this.processes.get(agentName);
    
    if (!agentProcess) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: `Agent ${agentName} not found` }));
      return;
    }

    const health = {
      agent: agentName,
      status: 'running',
      pid: agentProcess.process.pid,
      uptime: Math.floor((Date.now() - agentProcess.startTime) / 1000),
      config: agentProcess.config,
      restarts: agentProcess.restarts
    };

    res.writeHead(200);
    res.end(JSON.stringify(health, null, 2));
  }

  async handleSystemStatus(res) {
    const agents = {};
    
    for (const [name, process] of this.processes) {
      agents[name] = {
        status: 'running',
        pid: process.process.pid,
        uptime: Math.floor((Date.now() - process.startTime) / 1000),
        description: process.config.description,
        capabilities: process.config.capabilities
      };
    }

    const status = {
      system: 'AltaMedica Medical AI System',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      agents
    };

    res.writeHead(200);
    res.end(JSON.stringify(status, null, 2));
  }

  async handleAgentsList(res) {
    const agentsList = Object.entries(MEDICAL_AGENTS).map(([name, config]) => ({
      name,
      description: config.description,
      capabilities: config.capabilities,
      priority: config.priority,
      port: config.port,
      status: this.processes.has(name) ? 'running' : 'stopped'
    }));

    res.writeHead(200);
    res.end(JSON.stringify({ agents: agentsList }, null, 2));
  }

  getSystemCapabilities() {
    const capabilities = new Set();
    
    for (const [name, process] of this.processes) {
      if (process.config.capabilities) {
        process.config.capabilities.forEach(cap => capabilities.add(cap));
      }
    }
    
    return Array.from(capabilities);
  }

  setupSystemMonitoring() {
    // Monitoreo de memoria cada 30 segundos
    setInterval(() => {
      const usage = process.memoryUsage();
      const mbUsed = Math.round(usage.heapUsed / 1024 / 1024);
      
      if (mbUsed > 512) { // Alerta si usa más de 512MB
        console.warn(`⚠️  [MONITOR] Alto uso de memoria: ${mbUsed}MB`);
      }
      
      console.log(`📊 [MONITOR] Memoria: ${mbUsed}MB, Agentes activos: ${this.processes.size}`);
    }, 30000);
  }

  setupSignalHandlers() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`🛑 [SYSTEM] Recibida señal ${signal}, cerrando sistema...`);
        await this.shutdown();
        process.exit(0);
      });
    });

    process.on('uncaughtException', async (error) => {
      console.error(`💥 [SYSTEM] Excepción no capturada:`, error);
      await this.shutdown();
      process.exit(1);
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log(`🔄 [SYSTEM] Iniciando cierre del sistema AI médico...`);

    // Cerrar servidor de health checks
    if (this.healthServer) {
      this.healthServer.close();
      console.log(`🏥 [HEALTH-SERVER] Servidor de salud cerrado`);
    }

    // Terminar todos los agentes
    const shutdownPromises = Array.from(this.processes.entries()).map(async ([name, processInfo]) => {
      return new Promise((resolve) => {
        console.log(`🔄 [AGENT-${name.toUpperCase()}] Cerrando agente...`);
        
        processInfo.process.on('exit', () => {
          console.log(`✅ [AGENT-${name.toUpperCase()}] Agente cerrado`);
          resolve();
        });
        
        processInfo.process.kill('SIGTERM');
        
        // Forzar cierre después de 5 segundos
        setTimeout(() => {
          if (!processInfo.process.killed) {
            processInfo.process.kill('SIGKILL');
            resolve();
          }
        }, 5000);
      });
    });

    await Promise.all(shutdownPromises);
    console.log(`✅ [SYSTEM] Sistema AI médico cerrado correctamente`);
  }
}

// Iniciar el sistema si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const launcher = new MedicalAISystemLauncher();
  launcher.start().catch((error) => {
    console.error(`💥 [SYSTEM] Error fatal:`, error);
    process.exit(1);
  });
}

export default MedicalAISystemLauncher;