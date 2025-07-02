#!/usr/bin/env node
// 🧠 DEMOSTRACIÓN DEL SISTEMA DE INTELIGENCIA ALTAMEDICA
// Script para mostrar las capacidades de análisis cognitivo y toma de decisiones

import { SystemIntelligenceUtils } from '../mcp-servers/system-intelligence-utils.js';

class SistemaInteligenciaDemo {
  constructor() {
    this.demoData = [];
    this.setupDemoData();
  }

  setupDemoData() {
    // Generar datos de demostración
    const now = Date.now();
    const events = [
      'composition_started',
      'agent_assigned',
      'code_generated',
      'test_executed',
      'deployment_triggered',
      'error_detected',
      'fix_applied',
      'composition_completed'
    ];

    // Generar 100 eventos en las últimas 2 horas
    for (let i = 0; i < 100; i++) {
      const timestamp = now - Math.random() * 7200000; // Últimas 2 horas
      const eventType = events[Math.floor(Math.random() * events.length)];
      
      this.demoData.push({
        type: eventType,
        timestamp,
        agentId: `agent_${Math.floor(Math.random() * 5) + 1}`,
        compositionId: `comp_${Math.floor(Math.random() * 10) + 1}`,
        success: Math.random() > 0.2 // 80% de éxito
      });
    }

    // Añadir algunos patrones específicos para demostración
    this.addDemoPatterns();
  }

  addDemoPatterns() {
    const now = Date.now();
    
    // Patrón 1: Secuencia de composición exitosa
    this.demoData.push(
      { type: 'composition_started', timestamp: now - 300000, compositionId: 'comp_demo_1' },
      { type: 'agent_assigned', timestamp: now - 290000, compositionId: 'comp_demo_1' },
      { type: 'code_generated', timestamp: now - 280000, compositionId: 'comp_demo_1' },
      { type: 'test_executed', timestamp: now - 270000, compositionId: 'comp_demo_1' },
      { type: 'composition_completed', timestamp: now - 260000, compositionId: 'comp_demo_1' }
    );

    // Patrón 2: Secuencia con error y recuperación
    this.demoData.push(
      { type: 'composition_started', timestamp: now - 200000, compositionId: 'comp_demo_2' },
      { type: 'error_detected', timestamp: now - 190000, compositionId: 'comp_demo_2' },
      { type: 'fix_applied', timestamp: now - 180000, compositionId: 'comp_demo_2' },
      { type: 'composition_completed', timestamp: now - 170000, compositionId: 'comp_demo_2' }
    );

    // Anomalía: Pico de errores
    for (let i = 0; i < 10; i++) {
      this.demoData.push({
        type: 'error_detected',
        timestamp: now - 100000 + (i * 1000),
        compositionId: `comp_anomaly_${i}`,
        severity: 'high'
      });
    }
  }

  async runDemo() {
    console.log('🧠 INICIANDO DEMOSTRACIÓN DEL SISTEMA DE INTELIGENCIA ALTAMEDICA\n');
    
    try {
      // 1. Análisis de Patrones Emergentes
      await this.demonstratePatternAnalysis();
      
      // 2. Análisis de Rendimiento Cognitivo
      await this.demonstrateCognitiveAnalysis();
      
      // 3. Predicciones Inteligentes
      await this.demonstratePredictions();
      
      // 4. Utilidades Generales
      await this.demonstrateGeneralUtils();
      
      console.log('\n✅ DEMOSTRACIÓN COMPLETADA EXITOSAMENTE');
      
    } catch (error) {
      console.error('❌ Error en la demostración:', error);
    }
  }

  async demonstratePatternAnalysis() {
    console.log('🎯 1. ANÁLISIS DE PATRONES EMERGENTES');
    console.log('=' .repeat(50));
    
    // Analizar patrones en los datos de demostración
    const patterns = SystemIntelligenceUtils.analyzeEmergentPatterns(this.demoData, 3600000);
    
    console.log(`📊 Patrones de Frecuencia (${patterns.frequency.length} detectados):`);
    patterns.frequency.forEach(pattern => {
      console.log(`   • ${pattern.type}: ${pattern.frequency} veces (${pattern.percentage}%) - ${pattern.significance} significancia`);
    });
    
    console.log(`\n🔗 Correlaciones (${patterns.correlations.length} detectadas):`);
    patterns.correlations.slice(0, 3).forEach(corr => {
      console.log(`   • ${corr.sequence.join(' → ')}: ${corr.frequency} veces, correlación ${corr.correlation.toFixed(2)}`);
    });
    
    console.log(`\n🚨 Anomalías (${patterns.anomalies.length} detectadas):`);
    patterns.anomalies.forEach(anomaly => {
      console.log(`   • ${anomaly.type}: ${anomaly.severity} severidad`);
      if (anomaly.eventCount) {
        console.log(`     Eventos: ${anomaly.eventCount} (umbral: ${anomaly.threshold})`);
      }
    });
    
    console.log(`\n📈 Métricas de Patrones:`);
    console.log(`   • Confianza: ${(patterns.confidence * 100).toFixed(1)}%`);
    console.log(`   • Puntuación de Emergencia: ${patterns.emergenceScore.toFixed(1)}/10`);
    
    console.log('\n');
  }

  async demonstrateCognitiveAnalysis() {
    console.log('🧠 2. ANÁLISIS DE RENDIMIENTO COGNITIVO');
    console.log('=' .repeat(50));
    
    // Simular métricas de agentes
    const agentMetrics = [
      {
        type: 'decision',
        outcome: 'success',
        complexity: 'medium',
        timestamp: Date.now() - 3600000
      },
      {
        type: 'collaboration',
        outcome: 'success',
        hadConflict: false,
        resolved: true,
        timestamp: Date.now() - 1800000
      },
      {
        type: 'problem_solving',
        outcome: 'success',
        complexity: 'high',
        timestamp: Date.now() - 900000
      },
      {
        type: 'adaptation',
        responseTime: 300,
        timestamp: Date.now() - 600000
      }
    ];

    const learningHistory = [
      { timestamp: Date.now() - 7200000, patternCount: 5, success: true },
      { timestamp: Date.now() - 3600000, patternCount: 8, success: true },
      { timestamp: Date.now(), patternCount: 12, success: true }
    ];

    const analysis = SystemIntelligenceUtils.analyzeCognitivePerformance(agentMetrics, learningHistory);
    
    console.log(`📊 Puntuación General: ${(analysis.overallScore * 100).toFixed(1)}%`);
    
    console.log('\n📈 Dimensiones Cognitivas:');
    Object.entries(analysis.dimensions).forEach(([dimension, score]) => {
      const status = score > 0.7 ? '✅' : score > 0.5 ? '⚠️' : '❌';
      console.log(`   ${status} ${dimension.replace(/_/g, ' ')}: ${(score * 100).toFixed(1)}%`);
    });
    
    console.log('\n📊 Tendencias:');
    Object.entries(analysis.trends).forEach(([trend, direction]) => {
      const icon = direction === 'improving' ? '📈' : direction === 'declining' ? '📉' : '➡️';
      console.log(`   ${icon} ${trend.replace(/_/g, ' ')}: ${direction}`);
    });
    
    console.log(`\n💡 Recomendaciones (${analysis.recommendations.length}):`);
    analysis.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   • ${rec.action} (${rec.priority} prioridad)`);
    });
    
    console.log('\n');
  }

  async demonstratePredictions() {
    console.log('🔮 3. PREDICCIONES INTELIGENTES');
    console.log('=' .repeat(50));
    
    // Simular datos históricos
    const historicalData = [];
    const now = Date.now();
    
    for (let i = 24; i >= 0; i--) {
      historicalData.push({
        timestamp: now - (i * 3600000), // Últimas 24 horas
        successRate: 0.7 + (Math.random() * 0.3), // Entre 70% y 100%
        agentCount: 3 + Math.floor(Math.random() * 3), // 3-5 agentes
        systemLoad: 0.4 + (Math.random() * 0.4), // Entre 40% y 80%
        errorRate: Math.random() * 0.1 // Hasta 10% de errores
      });
    }

    const model = SystemIntelligenceUtils.generatePredictiveModel(historicalData, 'successRate');
    
    console.log(`📊 Modelo Predictivo: ${model.type}`);
    console.log(`   • Precisión: ${(model.accuracy * 100).toFixed(1)}%`);
    console.log(`   • Confianza: ${(model.confidence * 100).toFixed(1)}%`);
    
    console.log('\n🔮 Predicciones para las próximas 6 horas:');
    model.predictions.slice(0, 6).forEach((pred, index) => {
      const time = new Date(pred.timestamp).toLocaleTimeString();
      console.log(`   ${index + 1}h: ${(pred.value * 100).toFixed(1)}% éxito (${(pred.confidence * 100).toFixed(0)}% confianza) - ${time}`);
    });
    
    console.log('\n🎯 Factores Influenciadores:');
    model.factors.forEach(factor => {
      console.log(`   • ${factor.name}: ${factor.influence} influencia (correlación: ${factor.correlation.toFixed(2)})`);
    });
    
    console.log('\n');
  }

  async demonstrateGeneralUtils() {
    console.log('🔧 4. UTILIDADES GENERALES');
    console.log('=' .repeat(50));
    
    // Generar hash del sistema
    const systemData = {
      patterns: this.demoData.slice(0, 10),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    const systemHash = SystemIntelligenceUtils.generateSystemHash(systemData);
    console.log(`🔐 Hash del Sistema: ${systemHash}`);
    
    // Formatear métricas de rendimiento
    const metrics = {
      cpu: 0.65,
      memory: 0.78,
      responseTime: 245,
      throughput: 1250,
      errorRate: 0.023
    };
    
    const formattedMetrics = SystemIntelligenceUtils.formatPerformanceMetrics(metrics);
    console.log('\n📊 Métricas de Rendimiento Formateadas:');
    Object.entries(formattedMetrics).forEach(([key, value]) => {
      console.log(`   • ${key}: ${value}`);
    });
    
    // Crear datos de series temporales
    const timeSeriesData = SystemIntelligenceUtils.createTimeSeriesData(this.demoData.slice(0, 20), 60000);
    console.log(`\n📈 Datos de Series Temporales: ${timeSeriesData.length} intervalos`);
    timeSeriesData.slice(0, 3).forEach((interval, index) => {
      console.log(`   ${index + 1}. ${new Date(interval.timestamp).toLocaleTimeString()}: ${interval.count} eventos`);
    });
    
    console.log('\n');
  }
}

// Ejecutar demostración
async function main() {
  console.log('🚀 INICIANDO DEMOSTRACIÓN DEL SISTEMA DE INTELIGENCIA ALTAMEDICA');
  console.log('=' .repeat(70));
  
  const demo = new SistemaInteligenciaDemo();
  await demo.runDemo();
  
  console.log('\n🎉 ¡DEMOSTRACIÓN FINALIZADA!');
  console.log('\n📚 Para más información, consulta:');
  console.log('   • docs/SISTEMA_INTELIGENCIA_ALTAMEDICA.md');
  console.log('   • mcp-servers/system-intelligence-utils.js');
  console.log('   • mcp-servers/enhanced-multi-agent-mcp.js');
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SistemaInteligenciaDemo; 