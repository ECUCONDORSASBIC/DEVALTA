#!/usr/bin/env node
// 🧪 PRUEBAS DEL SISTEMA DE INTELIGENCIA ALTAMEDICA
// Script para verificar el funcionamiento correcto de las utilidades de inteligencia

import { SystemIntelligenceUtils } from '../mcp-servers/system-intelligence-utils.js';
import { IntelligenceSystemConfig, ConfigUtils } from '../configs/intelligence-system.config.js';

class SistemaInteligenciaTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE INTELIGENCIA ALTAMEDICA\n');
    
    try {
      // Pruebas de análisis de patrones
      await this.testPatternAnalysis();
      
      // Pruebas de análisis cognitivo
      await this.testCognitiveAnalysis();
      
      // Pruebas de predicciones
      await this.testPredictions();
      
      // Pruebas de utilidades generales
      await this.testGeneralUtils();
      
      // Pruebas de configuración
      await this.testConfiguration();
      
      // Mostrar resultados
      this.showTestResults();
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
      this.testResults.failed++;
    }
  }

  async testPatternAnalysis() {
    console.log('🎯 PRUEBAS DE ANÁLISIS DE PATRONES');
    console.log('-'.repeat(40));
    
    // Test 1: Datos vacíos
    await this.runTest('Patrones con datos vacíos', () => {
      const patterns = SystemIntelligenceUtils.analyzeEmergentPatterns([], 3600000);
      return patterns.frequency.length === 0 && patterns.confidence < 0.5;
    });
    
    // Test 2: Patrones de frecuencia
    await this.runTest('Detección de patrones de frecuencia', () => {
      const testData = [
        { type: 'event_a', timestamp: Date.now() - 1000 },
        { type: 'event_a', timestamp: Date.now() - 2000 },
        { type: 'event_a', timestamp: Date.now() - 3000 },
        { type: 'event_b', timestamp: Date.now() - 4000 }
      ];
      
      const patterns = SystemIntelligenceUtils.analyzeEmergentPatterns(testData, 3600000);
      return patterns.frequency.some(p => p.type === 'event_a' && p.frequency === 3);
    });
    
    // Test 3: Detección de anomalías
    await this.runTest('Detección de anomalías', () => {
      const testData = [];
      const now = Date.now();
      
      // Crear pico de eventos
      for (let i = 0; i < 20; i++) {
        testData.push({ type: 'spike_event', timestamp: now - (i * 1000) });
      }
      
      const patterns = SystemIntelligenceUtils.analyzeEmergentPatterns(testData, 3600000);
      return patterns.anomalies.some(a => a.type === 'frequency_spike');
    });
    
    // Test 4: Correlaciones
    await this.runTest('Detección de correlaciones', () => {
      const testData = [
        { type: 'start', timestamp: Date.now() - 3000 },
        { type: 'process', timestamp: Date.now() - 2000 },
        { type: 'end', timestamp: Date.now() - 1000 },
        { type: 'start', timestamp: Date.now() - 6000 },
        { type: 'process', timestamp: Date.now() - 5000 },
        { type: 'end', timestamp: Date.now() - 4000 }
      ];
      
      const patterns = SystemIntelligenceUtils.analyzeEmergentPatterns(testData, 3600000);
      return patterns.correlations.length > 0;
    });
    
    console.log('');
  }

  async testCognitiveAnalysis() {
    console.log('🧠 PRUEBAS DE ANÁLISIS COGNITIVO');
    console.log('-'.repeat(40));
    
    // Test 1: Métricas vacías
    await this.runTest('Análisis con métricas vacías', () => {
      const analysis = SystemIntelligenceUtils.analyzeCognitivePerformance([], []);
      return analysis.overallScore >= 0 && analysis.overallScore <= 1;
    });
    
    // Test 2: Rendimiento exitoso
    await this.runTest('Análisis de rendimiento exitoso', () => {
      const metrics = [
        { type: 'decision', outcome: 'success', complexity: 'medium', timestamp: Date.now() },
        { type: 'collaboration', outcome: 'success', hadConflict: false, resolved: true, timestamp: Date.now() }
      ];
      
      const history = [
        { timestamp: Date.now() - 3600000, patternCount: 5, success: true },
        { timestamp: Date.now(), patternCount: 10, success: true }
      ];
      
      const analysis = SystemIntelligenceUtils.analyzeCognitivePerformance(metrics, history);
      return analysis.overallScore > 0.5;
    });
    
    // Test 3: Dimensiones cognitivas
    await this.runTest('Evaluación de dimensiones cognitivas', () => {
      const metrics = [
        { type: 'problem_solving', outcome: 'success', complexity: 'high', timestamp: Date.now() }
      ];
      
      const analysis = SystemIntelligenceUtils.analyzeCognitivePerformance(metrics, []);
      return 'problem_solving' in analysis.dimensions;
    });
    
    // Test 4: Recomendaciones
    await this.runTest('Generación de recomendaciones', () => {
      const metrics = [
        { type: 'decision', outcome: 'failure', complexity: 'high', timestamp: Date.now() }
      ];
      
      const analysis = SystemIntelligenceUtils.analyzeCognitivePerformance(metrics, []);
      return analysis.recommendations.length > 0;
    });
    
    console.log('');
  }

  async testPredictions() {
    console.log('🔮 PRUEBAS DE PREDICCIONES');
    console.log('-'.repeat(40));
    
    // Test 1: Datos insuficientes
    await this.runTest('Modelo con datos insuficientes', () => {
      const model = SystemIntelligenceUtils.generatePredictiveModel([], 'successRate');
      return model.accuracy < 0.5 && model.confidence < 0.5;
    });
    
    // Test 2: Modelo con datos válidos
    await this.runTest('Modelo con datos válidos', () => {
      const historicalData = [];
      const now = Date.now();
      
      for (let i = 10; i >= 0; i--) {
        historicalData.push({
          timestamp: now - (i * 3600000),
          successRate: 0.8,
          agentCount: 3,
          systemLoad: 0.6
        });
      }
      
      const model = SystemIntelligenceUtils.generatePredictiveModel(historicalData, 'successRate');
      return model.predictions.length > 0 && model.accuracy > 0.3;
    });
    
    // Test 3: Predicciones temporales
    await this.runTest('Predicciones temporales', () => {
      const historicalData = [];
      const now = Date.now();
      
      for (let i = 5; i >= 0; i--) {
        historicalData.push({
          timestamp: now - (i * 3600000),
          successRate: 0.7 + (i * 0.05), // Tendencia creciente
          agentCount: 3,
          systemLoad: 0.6
        });
      }
      
      const model = SystemIntelligenceUtils.generatePredictiveModel(historicalData, 'successRate');
      return model.predictions.length === 24; // 24 horas
    });
    
    // Test 4: Factores influyentes
    await this.runTest('Identificación de factores influyentes', () => {
      const historicalData = [];
      const now = Date.now();
      
      for (let i = 10; i >= 0; i--) {
        historicalData.push({
          timestamp: now - (i * 3600000),
          successRate: 0.8,
          agentCount: 3,
          systemLoad: 0.6,
          errorRate: 0.02
        });
      }
      
      const model = SystemIntelligenceUtils.generatePredictiveModel(historicalData, 'successRate');
      return model.factors.length > 0;
    });
    
    console.log('');
  }

  async testGeneralUtils() {
    console.log('🔧 PRUEBAS DE UTILIDADES GENERALES');
    console.log('-'.repeat(40));
    
    // Test 1: Generación de hash
    await this.runTest('Generación de hash del sistema', () => {
      const data = { test: 'data', timestamp: Date.now() };
      const hash = SystemIntelligenceUtils.generateSystemHash(data);
      return hash.length === 16 && /^[a-f0-9]+$/.test(hash);
    });
    
    // Test 2: Formateo de métricas
    await this.runTest('Formateo de métricas de rendimiento', () => {
      const metrics = {
        cpu: 0.65,
        memory: 0.78,
        responseTime: 245,
        throughput: 1250,
        errorRate: 0.023
      };
      
      const formatted = SystemIntelligenceUtils.formatPerformanceMetrics(metrics);
      return formatted.cpu.includes('%') && formatted.responseTime.includes('ms');
    });
    
    // Test 3: Series temporales
    await this.runTest('Creación de series temporales', () => {
      const events = [
        { type: 'event_a', timestamp: Date.now() - 1000 },
        { type: 'event_b', timestamp: Date.now() - 500 },
        { type: 'event_a', timestamp: Date.now() }
      ];
      
      const series = SystemIntelligenceUtils.createTimeSeriesData(events, 1000);
      return series.length > 0 && series[0].hasOwnProperty('timestamp');
    });
    
    // Test 4: Cálculo de tendencia lineal
    await this.runTest('Cálculo de tendencia lineal', () => {
      const values = [1, 2, 3, 4, 5]; // Tendencia creciente
      const trend = SystemIntelligenceUtils.calculateLinearTrend(values);
      return trend > 0;
    });
    
    console.log('');
  }

  async testConfiguration() {
    console.log('⚙️ PRUEBAS DE CONFIGURACIÓN');
    console.log('-'.repeat(40));
    
    // Test 1: Configuración por defecto
    await this.runTest('Configuración por defecto', () => {
      const config = IntelligenceSystemConfig;
      return config.timing.analysisInterval === 300000;
    });
    
    // Test 2: Configuración por entorno
    await this.runTest('Configuración por entorno', () => {
      const envConfig = getEnvironmentConfig();
      return envConfig.hasOwnProperty('timing') && envConfig.hasOwnProperty('patternAnalysis');
    });
    
    // Test 3: Validación de configuración
    await this.runTest('Validación de configuración', () => {
      const validConfig = IntelligenceSystemConfig;
      const validation = ConfigUtils.validateConfig(validConfig);
      return validation.valid;
    });
    
    // Test 4: Configuración inválida
    await this.runTest('Detección de configuración inválida', () => {
      const invalidConfig = {
        ...IntelligenceSystemConfig,
        timing: { analysisInterval: 5000 } // Muy bajo
      };
      
      const validation = ConfigUtils.validateConfig(invalidConfig);
      return !validation.valid && validation.errors.length > 0;
    });
    
    console.log('');
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    
    try {
      const result = await testFunction();
      
      if (result) {
        console.log(`✅ ${testName}`);
        this.testResults.passed++;
      } else {
        console.log(`❌ ${testName}`);
        this.testResults.failed++;
        this.testResults.details.push({
          test: testName,
          status: 'failed',
          reason: 'Test returned false'
        });
      }
    } catch (error) {
      console.log(`❌ ${testName} - Error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.details.push({
        test: testName,
        status: 'error',
        reason: error.message
      });
    }
  }

  showTestResults() {
    console.log('📊 RESULTADOS DE LAS PRUEBAS');
    console.log('=' .repeat(50));
    
    const { passed, failed, total } = this.testResults;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📊 Total de pruebas: ${total}`);
    console.log(`📈 Tasa de éxito: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n🔍 DETALLES DE FALLOS:');
      this.testResults.details.forEach(detail => {
        console.log(`   • ${detail.test}: ${detail.reason}`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
    
    if (failed === 0) {
      console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    } else {
      console.log(`⚠️  ${failed} prueba(s) fallaron. Revisar detalles arriba.`);
    }
  }
}

// Función auxiliar para obtener configuración por entorno
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...IntelligenceSystemConfig,
        timing: {
          ...IntelligenceSystemConfig.timing,
          analysisInterval: 600000
        }
      };
    default:
      return IntelligenceSystemConfig;
  }
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE INTELIGENCIA ALTAMEDICA');
  console.log('=' .repeat(70));
  
  const testSuite = new SistemaInteligenciaTest();
  await testSuite.runAllTests();
  
  // Salir con código de error si hay fallos
  if (testSuite.testResults.failed > 0) {
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SistemaInteligenciaTest; 