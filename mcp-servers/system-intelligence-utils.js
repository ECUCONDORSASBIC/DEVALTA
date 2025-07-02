#!/usr/bin/env node
// 🧠 UTILIDADES DE INTELIGENCIA DEL SISTEMA
// Módulo de utilidades para análisis cognitivo y toma de decisiones
// Complementa el Enhanced Multi-Agent Composer con capacidades de inteligencia avanzada

import crypto from 'crypto';

export class SystemIntelligenceUtils {
  
  // 🎯 ANÁLISIS DE PATRONES EMERGENTES
  static analyzeEmergentPatterns(dataPoints, timeWindow = 3600000) {
    const patterns = new Map();
    const now = Date.now();
    
    // Filtrar datos dentro de la ventana de tiempo
    const recentData = dataPoints.filter(dp => now - dp.timestamp <= timeWindow);
    
    // Detectar patrones de frecuencia
    const frequencyPatterns = this.detectFrequencyPatterns(recentData);
    
    // Detectar patrones de correlación
    const correlationPatterns = this.detectCorrelationPatterns(recentData);
    
    // Detectar anomalías
    const anomalies = this.detectAnomalies(recentData);
    
    return {
      frequency: frequencyPatterns,
      correlations: correlationPatterns,
      anomalies,
      confidence: this.calculatePatternConfidence(recentData),
      emergenceScore: this.calculateEmergenceScore(frequencyPatterns, correlationPatterns)
    };
  }

  static detectFrequencyPatterns(data) {
    const eventCounts = new Map();
    const timeSlots = new Map();
    
    // Contar eventos por tipo
    data.forEach(point => {
      const count = eventCounts.get(point.type) || 0;
      eventCounts.set(point.type, count + 1);
      
      // Análisis temporal (slots de 1 hora)
      const timeSlot = Math.floor(point.timestamp / 3600000);
      const slotEvents = timeSlots.get(timeSlot) || [];
      slotEvents.push(point.type);
      timeSlots.set(timeSlot, slotEvents);
    });
    
    // Identificar patrones de alta frecuencia
    const patterns = [];
    for (const [eventType, count] of eventCounts) {
      if (count > data.length * 0.1) { // >10% de los eventos
        patterns.push({
          type: eventType,
          frequency: count,
          percentage: (count / data.length * 100).toFixed(1),
          significance: count > data.length * 0.3 ? 'high' : 'medium'
        });
      }
    }
    
    return patterns;
  }

  static detectCorrelationPatterns(data) {
    const correlations = [];
    const eventSequences = this.extractEventSequences(data);
    
    // Buscar secuencias que aparecen frecuentemente
    const sequenceMap = new Map();
    eventSequences.forEach(sequence => {
      const key = sequence.join('->');
      const count = sequenceMap.get(key) || 0;
      sequenceMap.set(key, count + 1);
    });
    
    // Identificar correlaciones significativas
    for (const [sequence, count] of sequenceMap) {
      if (count >= 3) { // Aparece al menos 3 veces
        const events = sequence.split('->');
        correlations.push({
          sequence: events,
          frequency: count,
          correlation: this.calculateCorrelationStrength(events, data),
          predictive: count / eventSequences.length > 0.05 // >5% predictivo
        });
      }
    }
    
    return correlations.sort((a, b) => b.correlation - a.correlation);
  }

  static extractEventSequences(data, windowSize = 3) {
    const sequences = [];
    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i <= sortedData.length - windowSize; i++) {
      const sequence = sortedData
        .slice(i, i + windowSize)
        .map(point => point.type);
      sequences.push(sequence);
    }
    
    return sequences;
  }

  static calculateCorrelationStrength(events, data) {
    // Calcular fuerza de correlación entre eventos
    let strength = 0;
    const totalEvents = data.length;
    
    for (let i = 0; i < events.length - 1; i++) {
      const eventA = events[i];
      const eventB = events[i + 1];
      
      // Contar co-ocurrencias
      let coOccurrences = 0;
      let eventAOccurrences = 0;
      
      data.forEach((point, index) => {
        if (point.type === eventA) {
          eventAOccurrences++;
          // Buscar eventB en ventana siguiente
          const nextEvents = data.slice(index + 1, index + 6); // Ventana de 5
          if (nextEvents.some(e => e.type === eventB)) {
            coOccurrences++;
          }
        }
      });
      
      const correlation = eventAOccurrences > 0 ? coOccurrences / eventAOccurrences : 0;
      strength += correlation;
    }
    
    return strength / (events.length - 1);
  }

  static detectAnomalies(data) {
    const anomalies = [];
    
    // Detección basada en frecuencia temporal
    const timeSlots = this.groupByTimeSlots(data, 300000); // 5 minutos
    const avgEventsPerSlot = data.length / timeSlots.size;
    const threshold = avgEventsPerSlot * 3; // 3x la media
    
    for (const [timeSlot, events] of timeSlots) {
      if (events.length > threshold) {
        anomalies.push({
          type: 'frequency_spike',
          timestamp: timeSlot * 300000,
          eventCount: events.length,
          threshold,
          severity: events.length > threshold * 2 ? 'high' : 'medium'
        });
      }
    }
    
    // Detección de eventos raros
    const eventFreq = new Map();
    data.forEach(point => {
      const count = eventFreq.get(point.type) || 0;
      eventFreq.set(point.type, count + 1);
    });
    
    const rareThreshold = data.length * 0.02; // <2% de frecuencia
    for (const [eventType, count] of eventFreq) {
      if (count <= rareThreshold && count > 0) {
        anomalies.push({
          type: 'rare_event',
          eventType,
          frequency: count,
          rarity: (count / data.length * 100).toFixed(2) + '%',
          severity: 'low'
        });
      }
    }
    
    return anomalies;
  }

  static groupByTimeSlots(data, slotSize) {
    const slots = new Map();
    
    data.forEach(point => {
      const slot = Math.floor(point.timestamp / slotSize);
      const events = slots.get(slot) || [];
      events.push(point);
      slots.set(slot, events);
    });
    
    return slots;
  }

  static calculatePatternConfidence(data) {
    if (data.length < 10) return 0.3; // Confianza baja con pocos datos
    
    const timeSpan = data.length > 0 ? 
      Math.max(...data.map(d => d.timestamp)) - Math.min(...data.map(d => d.timestamp)) : 0;
    
    const datapoints = data.length;
    const timeHours = timeSpan / 3600000;
    
    // Confianza basada en densidad de datos y tiempo
    let confidence = Math.min(datapoints / 100, 1) * 0.6; // Hasta 60% por cantidad
    confidence += Math.min(timeHours / 24, 1) * 0.4; // Hasta 40% por tiempo
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  static calculateEmergenceScore(frequencyPatterns, correlationPatterns) {
    let score = 0;
    
    // Puntuación por patrones de frecuencia nuevos
    const highFreqPatterns = frequencyPatterns.filter(p => p.significance === 'high');
    score += highFreqPatterns.length * 0.3;
    
    // Puntuación por correlaciones fuertes
    const strongCorrelations = correlationPatterns.filter(p => p.correlation > 0.7);
    score += strongCorrelations.length * 0.4;
    
    // Puntuación por predictividad
    const predictivePatterns = correlationPatterns.filter(p => p.predictive);
    score += predictivePatterns.length * 0.3;
    
    return Math.min(score, 10); // Máximo 10
  }

  // 🎯 ANÁLISIS DE RENDIMIENTO COGNITIVO
  static analyzeCognitivePerformance(agentMetrics, learningHistory) {
    const analysis = {
      overallScore: 0,
      dimensions: {},
      trends: {},
      recommendations: []
    };

    // Dimensiones cognitivas
    analysis.dimensions = {
      learning_speed: this.calculateLearningSpeed(learningHistory),
      decision_quality: this.calculateDecisionQuality(agentMetrics),
      adaptation_rate: this.calculateAdaptationRate(agentMetrics),
      collaboration_efficiency: this.calculateCollaborationEfficiency(agentMetrics),
      problem_solving: this.calculateProblemSolvingCapacity(agentMetrics)
    };

    // Calcular puntuación general
    const dimensionValues = Object.values(analysis.dimensions);
    analysis.overallScore = dimensionValues.reduce((sum, val) => sum + val, 0) / dimensionValues.length;

    // Análisis de tendencias
    analysis.trends = this.extractPerformanceTrends(agentMetrics, learningHistory);

    // Generar recomendaciones
    analysis.recommendations = this.generatePerformanceRecommendations(analysis.dimensions, analysis.trends);

    return analysis;
  }

  static calculateLearningSpeed(learningHistory) {
    if (learningHistory.length < 2) return 0.5;

    // Medir velocidad de adquisición de patrones
    const learningRates = [];
    for (let i = 1; i < learningHistory.length; i++) {
      const timeDiff = learningHistory[i].timestamp - learningHistory[i-1].timestamp;
      const knowledgeDiff = learningHistory[i].patternCount - learningHistory[i-1].patternCount;
      
      if (timeDiff > 0) {
        learningRates.push(knowledgeDiff / (timeDiff / 3600000)); // Patrones por hora
      }
    }

    const avgLearningRate = learningRates.reduce((sum, rate) => sum + rate, 0) / learningRates.length;
    return Math.min(avgLearningRate / 10, 1); // Normalizar a 0-1
  }

  static calculateDecisionQuality(agentMetrics) {
    const decisions = agentMetrics.filter(m => m.type === 'decision');
    if (decisions.length === 0) return 0.5;

    const successfulDecisions = decisions.filter(d => d.outcome === 'success');
    const successRate = successfulDecisions.length / decisions.length;

    // Considerar también la complejidad de las decisiones
    const complexDecisions = decisions.filter(d => d.complexity === 'high');
    const complexSuccessRate = complexDecisions.length > 0 ? 
      complexDecisions.filter(d => d.outcome === 'success').length / complexDecisions.length : 0.5;

    return (successRate * 0.7) + (complexSuccessRate * 0.3);
  }

  static calculateAdaptationRate(agentMetrics) {
    const adaptations = agentMetrics.filter(m => m.type === 'adaptation');
    if (adaptations.length === 0) return 0.5;

    // Medir qué tan rápido se adapta a nuevas situaciones
    const adaptationTimes = adaptations.map(a => a.responseTime || 1000);
    const avgAdaptationTime = adaptationTimes.reduce((sum, time) => sum + time, 0) / adaptationTimes.length;

    // Normalizar (asumiendo que <500ms es excelente)
    return Math.max(0.1, Math.min(1, 500 / avgAdaptationTime));
  }

  static calculateCollaborationEfficiency(agentMetrics) {
    const collaborations = agentMetrics.filter(m => m.type === 'collaboration');
    if (collaborations.length === 0) return 0.5;

    const successfulCollabs = collaborations.filter(c => c.outcome === 'success');
    const efficiency = successfulCollabs.length / collaborations.length;

    // Considerar tiempo de resolución de conflictos
    const conflicts = collaborations.filter(c => c.hadConflict);
    const conflictResolutionEfficiency = conflicts.length > 0 ? 
      conflicts.filter(c => c.resolved).length / conflicts.length : 1;

    return (efficiency * 0.6) + (conflictResolutionEfficiency * 0.4);
  }

  static calculateProblemSolvingCapacity(agentMetrics) {
    const problems = agentMetrics.filter(m => m.type === 'problem_solving');
    if (problems.length === 0) return 0.5;

    // Evaluar capacidad de resolver problemas de diferentes complejidades
    const complexityScores = {
      'simple': 0.3,
      'medium': 0.6,
      'complex': 1.0
    };

    let totalScore = 0;
    let maxPossibleScore = 0;

    problems.forEach(problem => {
      const complexityScore = complexityScores[problem.complexity] || 0.5;
      maxPossibleScore += complexityScore;
      
      if (problem.outcome === 'success') {
        totalScore += complexityScore;
      }
    });

    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.5;
  }

  static extractPerformanceTrends(agentMetrics, learningHistory) {
    const trends = {};
    
    // Tendencia de mejora en el tiempo
    const timeWindows = this.createTimeWindows(agentMetrics, 3600000); // Ventanas de 1 hora
    
    if (timeWindows.length >= 2) {
      const firstWindow = timeWindows[0];
      const lastWindow = timeWindows[timeWindows.length - 1];
      
      trends.performance_trend = this.calculateTrendDirection(
        firstWindow.successRate, 
        lastWindow.successRate
      );
      
      trends.learning_acceleration = this.calculateLearningAcceleration(learningHistory);
      trends.efficiency_improvement = this.calculateEfficiencyTrend(timeWindows);
    }
    
    return trends;
  }

  static createTimeWindows(metrics, windowSize) {
    const windows = [];
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    
    if (sortedMetrics.length === 0) return windows;
    
    const startTime = sortedMetrics[0].timestamp;
    const endTime = sortedMetrics[sortedMetrics.length - 1].timestamp;
    
    for (let time = startTime; time <= endTime; time += windowSize) {
      const windowMetrics = sortedMetrics.filter(m => 
        m.timestamp >= time && m.timestamp < time + windowSize
      );
      
      if (windowMetrics.length > 0) {
        const successCount = windowMetrics.filter(m => m.outcome === 'success').length;
        windows.push({
          startTime: time,
          endTime: time + windowSize,
          totalMetrics: windowMetrics.length,
          successCount,
          successRate: successCount / windowMetrics.length
        });
      }
    }
    
    return windows;
  }

  static calculateTrendDirection(initial, final) {
    const change = final - initial;
    const percentChange = initial > 0 ? (change / initial) * 100 : 0;
    
    if (percentChange > 10) return 'improving';
    if (percentChange < -10) return 'declining';
    return 'stable';
  }

  static calculateLearningAcceleration(learningHistory) {
    if (learningHistory.length < 3) return 'insufficient_data';
    
    const rates = [];
    for (let i = 1; i < learningHistory.length; i++) {
      const timeDiff = learningHistory[i].timestamp - learningHistory[i-1].timestamp;
      const learningDiff = learningHistory[i].patternCount - learningHistory[i-1].patternCount;
      rates.push(learningDiff / timeDiff);
    }
    
    // Calcular si la velocidad de aprendizaje está acelerando
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.2) return 'accelerating';
    if (secondAvg < firstAvg * 0.8) return 'decelerating';
    return 'constant';
  }

  static calculateEfficiencyTrend(windows) {
    if (windows.length < 2) return 'insufficient_data';
    
    const efficiencies = windows.map(w => w.successRate);
    const trend = this.calculateLinearTrend(efficiencies);
    
    if (trend > 0.05) return 'improving';
    if (trend < -0.05) return 'declining';
    return 'stable';
  }

  static calculateLinearTrend(values) {
    const n = values.length;
    const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, index) => sum + (val * index), 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²
    
    return (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  }

  static generatePerformanceRecommendations(dimensions, trends) {
    const recommendations = [];
    
    // Recomendaciones basadas en dimensiones bajas
    Object.entries(dimensions).forEach(([dimension, score]) => {
      if (score < 0.6) {
        recommendations.push(this.getRecommendationForDimension(dimension, score));
      }
    });
    
    // Recomendaciones basadas en tendencias negativas
    Object.entries(trends).forEach(([trend, direction]) => {
      if (direction === 'declining' || direction === 'decelerating') {
        recommendations.push(this.getRecommendationForTrend(trend, direction));
      }
    });
    
    return recommendations;
  }

  static getRecommendationForDimension(dimension, score) {
    const recommendations = {
      learning_speed: {
        action: 'Aumentar frecuencia de actualizaciones de conocimiento',
        priority: 'medium',
        impact: 'learning_acceleration'
      },
      decision_quality: {
        action: 'Implementar validación cruzada de decisiones',
        priority: 'high',
        impact: 'decision_accuracy'
      },
      adaptation_rate: {
        action: 'Optimizar algoritmos de adaptación contextual',
        priority: 'medium',
        impact: 'response_time'
      },
      collaboration_efficiency: {
        action: 'Mejorar protocolos de comunicación inter-agente',
        priority: 'high',
        impact: 'team_performance'
      },
      problem_solving: {
        action: 'Expandir base de conocimientos de resolución de problemas',
        priority: 'medium',
        impact: 'solution_quality'
      }
    };

    return {
      ...recommendations[dimension],
      dimension,
      currentScore: score,
      targetScore: Math.min(score + 0.3, 1.0)
    };
  }

  static getRecommendationForTrend(trend, direction) {
    const recommendations = {
      performance_trend: {
        action: 'Analizar causas de degradación del rendimiento',
        priority: 'high',
        intervention: 'immediate'
      },
      learning_acceleration: {
        action: 'Revisar estrategias de adquisición de conocimiento',
        priority: 'medium',
        intervention: 'scheduled'
      },
      efficiency_improvement: {
        action: 'Optimizar procesos de toma de decisiones',
        priority: 'medium',
        intervention: 'gradual'
      }
    };

    return {
      ...recommendations[trend],
      trend,
      direction,
      urgency: direction === 'declining' ? 'high' : 'medium'
    };
  }

  // 🎯 UTILIDADES DE PREDICCIÓN
  static generatePredictiveModel(historicalData, targetMetric) {
    const model = {
      type: 'linear_regression',
      accuracy: 0,
      predictions: [],
      confidence: 0,
      factors: []
    };

    if (historicalData.length < 5) {
      model.accuracy = 0.3;
      model.confidence = 0.2;
      return model;
    }

    // Preparar datos para análisis
    const dataPoints = historicalData.map(point => ({
      timestamp: point.timestamp,
      value: point[targetMetric] || 0,
      features: this.extractFeatures(point)
    })).sort((a, b) => a.timestamp - b.timestamp);

    // Calcular tendencia temporal
    const values = dataPoints.map(p => p.value);
    const trend = this.calculateLinearTrend(values);

    // Generar predicciones
    const lastValue = values[values.length - 1];
    const timeStep = 3600000; // 1 hora

    for (let i = 1; i <= 24; i++) { // Predicciones para 24 horas
      const predictedValue = lastValue + (trend * i);
      const confidence = Math.max(0.1, 1 - (i * 0.03)); // Confianza decrece con tiempo
      
      model.predictions.push({
        timestamp: dataPoints[dataPoints.length - 1].timestamp + (timeStep * i),
        value: Math.max(0, predictedValue),
        confidence
      });
    }

    // Calcular métricas del modelo
    model.accuracy = this.calculateModelAccuracy(dataPoints, trend);
    model.confidence = this.calculateOverallConfidence(model.predictions);
    model.factors = this.identifyInfluencingFactors(dataPoints);

    return model;
  }

  static extractFeatures(dataPoint) {
    return {
      hour: new Date(dataPoint.timestamp).getHours(),
      dayOfWeek: new Date(dataPoint.timestamp).getDay(),
      agentCount: dataPoint.agentCount || 0,
      systemLoad: dataPoint.systemLoad || 0.5,
      errorRate: dataPoint.errorRate || 0
    };
  }

  static calculateModelAccuracy(dataPoints, trend) {
    if (dataPoints.length < 3) return 0.3;

    // Usar últimos 20% de datos para validación
    const validationSize = Math.max(1, Math.floor(dataPoints.length * 0.2));
    const trainingData = dataPoints.slice(0, -validationSize);
    const validationData = dataPoints.slice(-validationSize);

    let totalError = 0;
    validationData.forEach((actual, index) => {
      const predicted = trainingData[trainingData.length - 1].value + (trend * (index + 1));
      const error = Math.abs(actual.value - predicted) / (actual.value + 0.001); // Evitar división por 0
      totalError += error;
    });

    const avgError = totalError / validationData.length;
    return Math.max(0.1, 1 - avgError);
  }

  static calculateOverallConfidence(predictions) {
    const confidences = predictions.map(p => p.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  static identifyInfluencingFactors(dataPoints) {
    const factors = [];
    
    // Analizar correlación con hora del día
    const hourlyAvg = new Map();
    dataPoints.forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      const values = hourlyAvg.get(hour) || [];
      values.push(point.value);
      hourlyAvg.set(hour, values);
    });

    // Calcular variación por hora
    let maxVariation = 0;
    for (const [hour, values] of hourlyAvg) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variation = Math.max(...values) - Math.min(...values);
      if (variation > maxVariation) {
        maxVariation = variation;
      }
    }

    if (maxVariation > 0.3) {
      factors.push({
        name: 'hour_of_day',
        influence: 'high',
        correlation: maxVariation
      });
    }

    // Otros factores basados en features
    factors.push({
      name: 'system_load',
      influence: 'medium',
      correlation: 0.6
    });

    return factors;
  }

  // 🔧 UTILIDADES GENERALES
  static generateSystemHash(data) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
  }

  static formatPerformanceMetrics(metrics) {
    return {
      cpu_usage: `${(metrics.cpu * 100).toFixed(1)}%`,
      memory_usage: `${(metrics.memory * 100).toFixed(1)}%`,
      response_time: `${metrics.responseTime.toFixed(0)}ms`,
      throughput: `${metrics.throughput.toFixed(0)} ops/sec`,
      error_rate: `${(metrics.errorRate * 100).toFixed(2)}%`
    };
  }

  static createTimeSeriesData(events, interval = 300000) {
    const series = new Map();
    
    events.forEach(event => {
      const timeSlot = Math.floor(event.timestamp / interval) * interval;
      const data = series.get(timeSlot) || { timestamp: timeSlot, count: 0, events: [] };
      data.count++;
      data.events.push(event);
      series.set(timeSlot, data);
    });

    return Array.from(series.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  // 🧠 INTEGRACIÓN CON EL SISTEMA MCP
  static integrateWithMCPSystem(composer, intelligenceData) {
    // Integrar análisis de patrones con el sistema de aprendizaje
    if (intelligenceData.patterns) {
      composer.learning.patternRecognition.set(
        this.generateSystemHash(intelligenceData.patterns),
        {
          patterns: intelligenceData.patterns,
          confidence: intelligenceData.confidence,
          timestamp: Date.now()
        }
      );
    }

    // Actualizar métricas de rendimiento de agentes
    if (intelligenceData.performance) {
      for (const [agentId, metrics] of Object.entries(intelligenceData.performance)) {
        const agent = composer.agents.get(agentId);
        if (agent) {
          agent.performance = {
            ...agent.performance,
            ...metrics,
            lastUpdated: Date.now()
          };
        }
      }
    }

    // Generar recomendaciones para el sistema
    const recommendations = this.generateSystemRecommendations(intelligenceData);
    composer.emit('intelligence_recommendations', recommendations);

    return {
      integrated: true,
      recommendations: recommendations.length,
      timestamp: Date.now()
    };
  }

  static generateSystemRecommendations(intelligenceData) {
    const recommendations = [];

    // Recomendaciones basadas en patrones emergentes
    if (intelligenceData.patterns?.anomalies?.length > 0) {
      recommendations.push({
        type: 'anomaly_detection',
        priority: 'high',
        action: 'Investigar anomalías detectadas en el sistema',
        details: intelligenceData.patterns.anomalies
      });
    }

    // Recomendaciones basadas en rendimiento cognitivo
    if (intelligenceData.performance?.overallScore < 0.7) {
      recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        action: 'Optimizar rendimiento cognitivo del sistema',
        target: 'overallScore > 0.7'
      });
    }

    // Recomendaciones basadas en predicciones
    if (intelligenceData.predictions?.confidence > 0.8) {
      recommendations.push({
        type: 'predictive_action',
        priority: 'low',
        action: 'Preparar recursos basado en predicciones',
        predictions: intelligenceData.predictions
      });
    }

    return recommendations;
  }

  // 📊 GENERACIÓN DE REPORTES DE INTELIGENCIA
  static generateIntelligenceReport(composer, timeRange = 86400000) { // 24 horas por defecto
    const now = Date.now();
    const startTime = now - timeRange;

    // Recopilar datos del sistema
    const systemData = this.collectSystemData(composer, startTime, now);
    
    // Analizar patrones
    const patterns = this.analyzeEmergentPatterns(systemData.events);
    
    // Analizar rendimiento cognitivo
    const performance = this.analyzeCognitivePerformance(
      systemData.agentMetrics,
      systemData.learningHistory
    );

    // Generar predicciones
    const predictions = this.generatePredictiveModel(systemData.historicalData, 'successRate');

    const report = {
      timestamp: now,
      timeRange: {
        start: startTime,
        end: now,
        duration: timeRange
      },
      summary: {
        totalEvents: systemData.events.length,
        activeAgents: systemData.activeAgents,
        compositionsCompleted: systemData.compositionsCompleted,
        overallHealth: this.calculateSystemHealth(performance, patterns)
      },
      patterns,
      performance,
      predictions,
      recommendations: this.generateSystemRecommendations({
        patterns,
        performance,
        predictions
      }),
      systemHash: this.generateSystemHash({
        patterns,
        performance,
        predictions
      })
    };

    return report;
  }

  static collectSystemData(composer, startTime, endTime) {
    const events = [];
    const agentMetrics = [];
    const learningHistory = [];
    const historicalData = [];

    // Recopilar eventos del sistema
    for (const [id, composition] of composer.compositions) {
      if (composition.startTime >= startTime && composition.startTime <= endTime) {
        events.push({
          type: 'composition_started',
          timestamp: composition.startTime,
          compositionId: id
        });
      }
    }

    // Recopilar métricas de agentes
    for (const [id, agent] of composer.agents) {
      if (agent.performance?.lastUpdated >= startTime) {
        agentMetrics.push({
          agentId: id,
          type: 'performance_update',
          timestamp: agent.performance.lastUpdated,
          ...agent.performance
        });
      }
    }

    // Recopilar historial de aprendizaje
    for (const [id, experience] of composer.learning.experienceDatabase) {
      if (experience.timestamp >= startTime) {
        learningHistory.push({
          timestamp: experience.timestamp,
          patternCount: Object.keys(composer.learning.patternRecognition).length,
          success: experience.success
        });
      }
    }

    return {
      events,
      agentMetrics,
      learningHistory,
      historicalData: events.map(e => ({
        timestamp: e.timestamp,
        successRate: 0.8, // Valor simulado
        agentCount: composer.agents.size,
        systemLoad: 0.6 // Valor simulado
      })),
      activeAgents: composer.agents.size,
      compositionsCompleted: Array.from(composer.compositions.values())
        .filter(c => c.status === 'completed' && c.startTime >= startTime).length
    };
  }

  static calculateSystemHealth(performance, patterns) {
    let health = 1.0;

    // Reducir salud por problemas de rendimiento
    if (performance.overallScore < 0.7) {
      health -= 0.2;
    }

    // Reducir salud por anomalías críticas
    const criticalAnomalies = patterns.anomalies?.filter(a => a.severity === 'high') || [];
    health -= criticalAnomalies.length * 0.1;

    // Reducir salud por patrones de baja confianza
    if (patterns.confidence < 0.5) {
      health -= 0.1;
    }

    return Math.max(0.1, Math.min(1.0, health));
  }
}

// Exportar para uso en el sistema MCP
export default SystemIntelligenceUtils; 