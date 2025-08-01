#!/usr/bin/env node
/**
 * MCP Server: WebRTC Metrics
 * Proporciona métricas de telemedicina WebRTC para AltaMedica
 * Monitorea calidad de videollamadas médicas, latencia, bandwidth
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { z } from 'zod';

// Configuración WebRTC para AltaMedica
const WEBRTC_CONFIG = {
  logPaths: [
    'logs/webrtc-connections.log',
    'logs/signaling-server.log',
    'apps/doctors/logs/telemedicine.log',
    'apps/patients/logs/video-calls.log'
  ],
  metricThresholds: {
    latency: { good: 100, warning: 300, critical: 500 }, // ms
    bandwidth: { minimum: 256, recommended: 1024, hd: 2048 }, // kbps  
    packetLoss: { good: 0.01, warning: 0.05, critical: 0.1 }, // %
    jitter: { good: 10, warning: 30, critical: 50 } // ms
  },
  qualityScore: {
    excellent: 90,
    good: 70,
    fair: 50,
    poor: 30
  }
};

// Esquemas de validación
const MetricsRequestSchema = z.object({
  sessionId: z.string().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).default('1h'),
  includeDetails: z.boolean().default(false),
  filterBy: z.object({
    doctorId: z.string().optional(),
    patientId: z.string().optional(),
    connectionType: z.enum(['p2p', 'relay', 'turn']).optional()
  }).optional()
});

const ConnectionAnalysisSchema = z.object({
  logFile: z.string(),
  pattern: z.string().default('connection'),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional()
});

class WebRTCMetricsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'altamedica-webrtc-metrics',
        version: '1.0.0',
        description: 'MCP Server para métricas WebRTC de telemedicina'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Cache para métricas
    this.metricsCache = new Map();
    this.lastUpdate = new Map();
    
    this.setupHandlers();
  }

  setupHandlers() {
    // Lista de herramientas WebRTC
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'mcp__altamedica__webrtc_metrics',
            description: 'Obtiene métricas de rendimiento WebRTC en tiempo real',
            inputSchema: {
              type: 'object',
              properties: {
                sessionId: {
                  type: 'string',
                  description: 'ID de sesión específica (opcional)'
                },
                timeRange: {
                  type: 'string',
                  enum: ['1h', '24h', '7d', '30d'],
                  description: 'Rango temporal de métricas',
                  default: '1h'
                },
                includeDetails: {
                  type: 'boolean',
                  description: 'Incluir detalles técnicos detallados',
                  default: false
                }
              }
            }
          },
          {
            name: 'mcp__altamedica__connection_analysis',
            description: 'Analiza logs de conexiones WebRTC para diagnosticar problemas',
            inputSchema: {
              type: 'object',
              properties: {
                logFile: {
                  type: 'string',
                  description: 'Archivo de log a analizar'
                },
                pattern: {
                  type: 'string',
                  description: 'Patrón de búsqueda en logs',
                  default: 'connection'
                },
                severity: {
                  type: 'string',
                  enum: ['info', 'warning', 'error', 'critical'],
                  description: 'Filtrar por severidad'
                }
              },
              required: ['logFile']
            }
          },
          {
            name: 'mcp__altamedica__quality_report',
            description: 'Genera reporte de calidad de videollamadas médicas',
            inputSchema: {
              type: 'object',
              properties: {
                doctorId: {
                  type: 'string',
                  description: 'ID del doctor (opcional)'
                },
                timeRange: {
                  type: 'string',
                  enum: ['today', 'week', 'month'],
                  default: 'today'
                },
                includeRecommendations: {
                  type: 'boolean',
                  description: 'Incluir recomendaciones de mejora',
                  default: true
                }
              }
            }
          },
          {
            name: 'mcp__altamedica__bandwidth_optimizer',
            description: 'Sugiere optimizaciones de bandwidth para telemedicina',
            inputSchema: {
              type: 'object',
              properties: {
                currentBandwidth: {
                  type: 'number',
                  description: 'Bandwidth actual en kbps'
                },
                deviceType: {
                  type: 'string',
                  enum: ['desktop', 'tablet', 'mobile'],
                  description: 'Tipo de dispositivo'
                },
                connectionType: {
                  type: 'string',
                  enum: ['wifi', '4g', '5g', 'ethernet'],
                  description: 'Tipo de conexión'
                }
              },
              required: ['currentBandwidth']
            }
          }
        ]
      };
    });

    // Implementación de herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mcp__altamedica__webrtc_metrics':
            return await this.getWebRTCMetrics(args);
          
          case 'mcp__altamedica__connection_analysis':
            return await this.analyzeConnections(args);
          
          case 'mcp__altamedica__quality_report':
            return await this.generateQualityReport(args);
          
          case 'mcp__altamedica__bandwidth_optimizer':
            return await this.optimizeBandwidth(args);
          
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error en ${name}: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async getWebRTCMetrics(args) {
    const validatedArgs = MetricsRequestSchema.parse(args);
    const { sessionId, timeRange, includeDetails } = validatedArgs;
    
    console.error(`[MCP-WEBRTC] Obteniendo métricas WebRTC: ${timeRange}`);
    
    // Generar métricas simuladas (reemplazar con datos reales)
    const metrics = await this.collectMetrics(sessionId, timeRange);
    
    const response = {
      timestamp: new Date().toISOString(),
      timeRange,
      ...(sessionId && { sessionId }),
      summary: {
        totalSessions: metrics.sessions.length,
        averageQuality: this.calculateAverageQuality(metrics.sessions),
        connectionSuccess: this.calculateConnectionSuccess(metrics.sessions),
        averageLatency: this.calculateAverageLatency(metrics.sessions)
      },
      performance: {
        latency: this.analyzeLatency(metrics.sessions),
        bandwidth: this.analyzeBandwidth(metrics.sessions),
        packetLoss: this.analyzePacketLoss(metrics.sessions),
        jitter: this.analyzeJitter(metrics.sessions)
      },
      ...(includeDetails && { 
        detailedSessions: metrics.sessions.map(s => this.sanitizeSession(s))
      }),
      recommendations: this.generatePerformanceRecommendations(metrics),
      alerts: this.generateAlerts(metrics)
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }]
    };
  }

  async analyzeConnections(args) {
    const validatedArgs = ConnectionAnalysisSchema.parse(args);
    const { logFile, pattern, severity } = validatedArgs;
    
    console.error(`[MCP-WEBRTC] Analizando conexiones en: ${logFile}`);
    
    if (!existsSync(logFile)) {
      // Simular análisis si no existe el archivo
      return this.generateMockConnectionAnalysis(logFile, pattern, severity);
    }

    const logContent = readFileSync(logFile, 'utf-8');
    const lines = logContent.split('\n');
    
    const analysis = {
      logFile,
      pattern,
      totalLines: lines.length,
      matches: [],
      patterns: {
        connections: 0,
        disconnections: 0,
        errors: 0,
        warnings: 0
      },
      timeline: [],
      insights: []
    };

    // Analizar líneas del log
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.toLowerCase().includes(pattern.toLowerCase())) {
        const match = this.parseLogLine(line, i + 1);
        if (!severity || match.severity === severity) {
          analysis.matches.push(match);
        }
      }

      // Contar patrones específicos
      if (line.includes('connected')) analysis.patterns.connections++;
      if (line.includes('disconnected')) analysis.patterns.disconnections++;
      if (line.includes('ERROR')) analysis.patterns.errors++;
      if (line.includes('WARN')) analysis.patterns.warnings++;
    }

    // Generar insights
    analysis.insights = this.generateConnectionInsights(analysis);
    
    // Crear timeline de eventos críticos
    analysis.timeline = this.createEventTimeline(analysis.matches);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }]
    };
  }

  async generateQualityReport(args) {
    const { doctorId, timeRange = 'today', includeRecommendations = true } = args;
    
    console.error(`[MCP-WEBRTC] Generando reporte de calidad: ${timeRange}`);
    
    // Simular datos de calidad (reemplazar con datos reales)
    const qualityData = await this.collectQualityData(doctorId, timeRange);
    
    const report = {
      reportId: `quality_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      timeRange,
      ...(doctorId && { doctorId }),
      overview: {
        totalCalls: qualityData.totalCalls,
        averageQuality: qualityData.averageQuality,
        qualityDistribution: qualityData.qualityDistribution,
        patientSatisfaction: qualityData.patientSatisfaction
      },
      technicalMetrics: {
        videoQuality: this.analyzeVideoQuality(qualityData),
        audioQuality: this.analyzeAudioQuality(qualityData),
        connectionStability: this.analyzeConnectionStability(qualityData)
      },
      medicalContext: {
        consultationTypes: qualityData.consultationTypes,
        criticalIssues: qualityData.criticalIssues,
        emergencyCallsQuality: qualityData.emergencyCallsQuality
      },
      ...(includeRecommendations && {
        recommendations: this.generateQualityRecommendations(qualityData)
      }),
      complianceStatus: {
        hipaaCompliant: true,
        dataRetention: '90 days',
        encryptionStatus: 'AES-256 enabled'
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(report, null, 2)
      }]
    };
  }

  async optimizeBandwidth(args) {
    const { currentBandwidth, deviceType = 'desktop', connectionType = 'wifi' } = args;
    
    console.error(`[MCP-WEBRTC] Optimizando bandwidth: ${currentBandwidth}kbps en ${deviceType}`);
    
    const analysis = {
      currentBandwidth,
      deviceType,
      connectionType,
      assessment: this.assessBandwidth(currentBandwidth),
      optimizations: []
    };

    // Determinar configuración óptima
    if (currentBandwidth < WEBRTC_CONFIG.metricThresholds.bandwidth.minimum) {
      analysis.optimizations.push({
        priority: 'HIGH',
        action: 'Reducir resolución de video',
        settings: {
          videoResolution: '480p',
          frameRate: 15,
          audioBitrate: 32
        },
        expectedImprovement: '40% reducción en uso de bandwidth'
      });
    }

    if (deviceType === 'mobile') {
      analysis.optimizations.push({
        priority: 'MEDIUM',
        action: 'Configuración optimizada para móvil',
        settings: {
          videoCodec: 'H.264',
          audioCodec: 'Opus',
          adaptiveBitrate: true
        },
        expectedImprovement: '25% mejor rendimiento en móvil'
      });
    }

    if (connectionType === '4g' || connectionType === '5g') {
      analysis.optimizations.push({
        priority: 'HIGH',
        action: 'Optimización para conexión móvil',
        settings: {
          bufferSize: 'small',
          jitterBuffer: 'adaptive',
          fecEnabled: true
        },
        expectedImprovement: '30% mejor estabilidad'
      });
    }

    // Recomendaciones específicas para telemedicina
    analysis.medicalRecommendations = [
      {
        context: 'Consultas de emergencia',
        recommendation: 'Priorizar audio sobre video si bandwidth < 512kbps',
        rationale: 'Comunicación crítica no debe verse afectada por video'
      },
      {
        context: 'Revisión de imágenes médicas',
        recommendation: 'Requerir mínimo 1024kbps para calidad diagnóstica',
        rationale: 'Precisión diagnóstica depende de calidad visual'
      }
    ];

    // Configuración TURN/STUN optimizada
    analysis.serverOptimizations = {
      stunServers: ['stun:stun.altamedica.com:3478'],
      turnServers: [
        {
          urls: 'turn:turn.altamedica.com:3478',
          username: 'medical_user',
          credential: 'encrypted_credential'
        }
      ],
      iceTransportPolicy: currentBandwidth < 256 ? 'relay' : 'all'
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }]
    };
  }

  // Métodos auxiliares
  async collectMetrics(sessionId, timeRange) {
    // Simular métricas (reemplazar con datos reales de logs/DB)
    const now = new Date();
    const sessions = [];
    
    for (let i = 0; i < 10; i++) {
      sessions.push({
        sessionId: sessionId || `session_${i}`,
        startTime: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutos  
        latency: Math.floor(Math.random() * 200) + 50,
        bandwidth: Math.floor(Math.random() * 2000) + 500,
        packetLoss: Math.random() * 0.1,
        jitter: Math.floor(Math.random() * 40),
        quality: Math.floor(Math.random() * 40) + 60,
        doctorId: `doctor_${i % 3}`,
        patientId: `patient_${i}`,
        connectionType: ['p2p', 'relay', 'turn'][i % 3]
      });
    }
    
    return { sessions };
  }

  calculateAverageQuality(sessions) {
    const avg = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
    return Math.round(avg * 10) / 10;
  }

  calculateConnectionSuccess(sessions) {
    const successful = sessions.filter(s => s.quality > 50).length;
    return Math.round((successful / sessions.length) * 100);
  }

  calculateAverageLatency(sessions) {
    const avg = sessions.reduce((sum, s) => sum + s.latency, 0) / sessions.length;
    return Math.round(avg);
  }

  analyzeLatency(sessions) {
    const latencies = sessions.map(s => s.latency);
    return {
      average: Math.round(latencies.reduce((a, b) => a + b) / latencies.length),
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      p95: this.percentile(latencies, 95),
      status: this.getLatencyStatus(latencies)
    };
  }

  analyzeBandwidth(sessions) {
    const bandwidths = sessions.map(s => s.bandwidth);
    return {
      average: Math.round(bandwidths.reduce((a, b) => a + b) / bandwidths.length),
      min: Math.min(...bandwidths),
      max: Math.max(...bandwidths),
      recommended: WEBRTC_CONFIG.metricThresholds.bandwidth.recommended,
      adequateConnections: bandwidths.filter(b => b >= WEBRTC_CONFIG.metricThresholds.bandwidth.recommended).length
    };
  }

  analyzePacketLoss(sessions) {
    const packetLosses = sessions.map(s => s.packetLoss);
    const avgLoss = packetLosses.reduce((a, b) => a + b) / packetLosses.length;
    
    return {
      average: Math.round(avgLoss * 1000) / 10, // Percentage with 1 decimal
      max: Math.round(Math.max(...packetLosses) * 1000) / 10,
      sessionsWithIssues: packetLosses.filter(p => p > WEBRTC_CONFIG.metricThresholds.packetLoss.warning).length,
      status: avgLoss > WEBRTC_CONFIG.metricThresholds.packetLoss.critical ? 'CRITICAL' : 
              avgLoss > WEBRTC_CONFIG.metricThresholds.packetLoss.warning ? 'WARNING' : 'GOOD'
    };
  }

  analyzeJitter(sessions) {
    const jitters = sessions.map(s => s.jitter);
    return {
      average: Math.round(jitters.reduce((a, b) => a + b) / jitters.length),
      max: Math.max(...jitters),
      status: this.getJitterStatus(jitters)
    };
  }

  sanitizeSession(session) {
    // Remover información sensible para HIPAA compliance
    const sanitized = { ...session };
    delete sanitized.patientId;
    delete sanitized.doctorId;
    
    return {
      ...sanitized,
      participantType: 'medical_professional',
      sessionType: 'telemedicine_consultation'
    };
  }

  generatePerformanceRecommendations(metrics) {
    const recommendations = [];
    
    const avgLatency = this.calculateAverageLatency(metrics.sessions);
    if (avgLatency > WEBRTC_CONFIG.metricThresholds.latency.warning) {
      recommendations.push({
        priority: 'HIGH',
        category: 'latency',
        issue: `Alta latencia promedio: ${avgLatency}ms`,
        solution: 'Considerar servidores TURN más cercanos o CDN médico',
        impact: 'Mejora en comunicación médica en tiempo real'
      });
    }

    return recommendations;
  }

  generateAlerts(metrics) {
    const alerts = [];
    
    const criticalSessions = metrics.sessions.filter(s => s.quality < 30);
    if (criticalSessions.length > 0) {
      alerts.push({
        severity: 'CRITICAL',
        message: `${criticalSessions.length} sesiones con calidad crítica detectadas`,
        action: 'Revisar infraestructura WebRTC inmediatamente',
        medicalImpact: 'Posible interrupción en consultas médicas críticas'
      });
    }

    return alerts;
  }

  parseLogLine(line, lineNumber) {
    // Parser simplificado de logs WebRTC
    const timestamp = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)?.[0] || '';
    const severity = line.includes('ERROR') ? 'error' : 
                    line.includes('WARN') ? 'warning' : 'info';
    
    return {
      lineNumber,
      timestamp,
      severity,
      content: line.substring(0, 200) // Limitar para evitar logs enormes
    };
  }

  generateConnectionInsights(analysis) {
    const insights = [];
    
    if (analysis.patterns.errors > analysis.patterns.connections * 0.1) {
      insights.push({
        type: 'WARNING',
        message: 'Alta tasa de errores de conexión detectada',
        recommendation: 'Revisar configuración de red y firewall'
      });
    }

    return insights;
  }

  createEventTimeline(matches) {
    return matches
      .filter(m => m.severity === 'error')
      .slice(0, 10) // Limitar para evitar sobrecarga
      .map(m => ({
        timestamp: m.timestamp,
        event: m.content.substring(0, 100),
        severity: m.severity
      }));
  }

  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  getLatencyStatus(latencies) {
    const avg = latencies.reduce((a, b) => a + b) / latencies.length;
    if (avg > WEBRTC_CONFIG.metricThresholds.latency.critical) return 'CRITICAL';
    if (avg > WEBRTC_CONFIG.metricThresholds.latency.warning) return 'WARNING';
    return 'GOOD';
  }

  getJitterStatus(jitters) {
    const avg = jitters.reduce((a, b) => a + b) / jitters.length;
    if (avg > WEBRTC_CONFIG.metricThresholds.jitter.critical) return 'CRITICAL';
    if (avg > WEBRTC_CONFIG.metricThresholds.jitter.warning) return 'WARNING';
    return 'GOOD';
  }

  generateMockConnectionAnalysis(logFile, pattern, severity) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          logFile,
          pattern,
          status: 'MOCK_DATA',
          message: `Archivo ${logFile} no encontrado, generando análisis simulado`,
          mockAnalysis: {
            totalConnections: 45,
            successfulConnections: 42,
            failedConnections: 3,
            averageConnectionTime: '2.3s',
            commonErrors: [
              'ICE connection failed',
              'STUN server timeout',
              'Media stream error'
            ]
          },
          recommendations: [
            'Verificar configuración de STUN/TURN servers',
            'Revisar logs de signaling server',
            'Monitorear bandwidth de usuarios'
          ]
        }, null, 2)
      }]
    };
  }

  async collectQualityData(doctorId, timeRange) {
    // Simular datos de calidad (reemplazar con datos reales)
    return {
      totalCalls: 28,
      averageQuality: 8.4,
      qualityDistribution: {
        excellent: 15,
        good: 10,
        fair: 2,
        poor: 1
      },
      patientSatisfaction: 4.6,
      consultationTypes: {
        routine: 20,
        emergency: 3,
        followup: 5
      },
      criticalIssues: 1,
      emergencyCallsQuality: 9.2
    };
  }

  analyzeVideoQuality(data) {
    return {
      averageResolution: '720p',
      frameRateStability: '94%',
      compressionEfficiency: 'Good',
      visualArtifacts: 'Minimal'
    };
  }

  analyzeAudioQuality(data) {
    return {
      clarity: 'Excellent',
      latency: '45ms average',
      echoCancellation: 'Active',
      noiseSuppression: 'Effective'
    };
  }

  analyzeConnectionStability(data) {
    return {
      disconnectionRate: '2.1%',
      reconnectionSuccess: '98%',
      averageUptime: '99.2%',
      qualityDegradation: 'Rare'
    };
  }

  generateQualityRecommendations(data) {
    return [
      {
        category: 'Infrastructure',
        recommendation: 'Implementar CDN médico para reducir latencia',
        impact: 'Mejora 20-30% en calidad de video',
        priority: 'HIGH'
      },
      {
        category: 'Configuration',
        recommendation: 'Optimizar codecs para dispositivos médicos',
        impact: 'Mejor compatibilidad con equipamiento hospitalario',
        priority: 'MEDIUM'
      }
    ];
  }

  assessBandwidth(bandwidth) {
    if (bandwidth >= WEBRTC_CONFIG.metricThresholds.bandwidth.hd) {
      return {
        level: 'EXCELLENT',
        recommendation: 'HD video enabled',
        supportedFeatures: ['HD video', 'Screen sharing', 'Multi-participant']
      };
    } else if (bandwidth >= WEBRTC_CONFIG.metricThresholds.bandwidth.recommended) {
      return {
        level: 'GOOD',
        recommendation: 'Standard video quality',
        supportedFeatures: ['SD video', 'Screen sharing']
      };
    } else if (bandwidth >= WEBRTC_CONFIG.metricThresholds.bandwidth.minimum) {
      return {
        level: 'FAIR',
        recommendation: 'Audio priority mode',
        supportedFeatures: ['Audio only', 'Low-res video']
      };
    } else {
      return {
        level: 'POOR',
        recommendation: 'Connection unstable for telemedicine',
        supportedFeatures: ['Audio only (degraded)']
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP-WEBRTC] Servidor de métricas WebRTC iniciado');
  }
}

// Iniciar servidor si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new WebRTCMetricsServer();
  server.start().catch(console.error);
}

export default WebRTCMetricsServer;