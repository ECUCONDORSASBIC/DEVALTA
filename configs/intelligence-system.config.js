// 🧠 CONFIGURACIÓN DEL SISTEMA DE INTELIGENCIA ALTAMEDICA
// Configuración centralizada para personalizar el comportamiento del sistema

export const IntelligenceSystemConfig = {
  // ⏰ CONFIGURACIÓN TEMPORAL
  timing: {
    // Intervalo de análisis automático (en milisegundos)
    analysisInterval: 300000, // 5 minutos
    
    // Ventana de tiempo para análisis de patrones (en milisegundos)
    patternAnalysisWindow: 3600000, // 1 hora
    
    // Ventana de tiempo para reportes (en milisegundos)
    reportTimeWindow: 86400000, // 24 horas
    
    // Intervalo para limpieza de datos antiguos (en milisegundos)
    cleanupInterval: 604800000, // 1 semana
    
    // Timeout para operaciones de análisis (en milisegundos)
    analysisTimeout: 30000, // 30 segundos
  },

  // 📊 CONFIGURACIÓN DE ANÁLISIS DE PATRONES
  patternAnalysis: {
    // Umbral mínimo de eventos para considerar un patrón
    minimumEventThreshold: 3,
    
    // Porcentaje mínimo para considerar alta frecuencia
    highFrequencyThreshold: 0.1, // 10%
    
    // Porcentaje para considerar muy alta frecuencia
    veryHighFrequencyThreshold: 0.3, // 30%
    
    // Porcentaje máximo para considerar evento raro
    rareEventThreshold: 0.02, // 2%
    
    // Tamaño de ventana para detección de anomalías (en milisegundos)
    anomalyDetectionWindow: 300000, // 5 minutos
    
    // Multiplicador para umbral de anomalías
    anomalyThresholdMultiplier: 3,
    
    // Tamaño de secuencia para análisis de correlaciones
    correlationSequenceSize: 3,
    
    // Umbral mínimo de correlación para considerar significativa
    correlationThreshold: 0.05, // 5%
  },

  // 🧠 CONFIGURACIÓN DE ANÁLISIS COGNITIVO
  cognitiveAnalysis: {
    // Umbrales de puntuación para dimensiones cognitivas
    scoreThresholds: {
      excellent: 0.8,
      good: 0.7,
      acceptable: 0.6,
      poor: 0.5
    },
    
    // Pesos para cálculo de puntuación general
    dimensionWeights: {
      learning_speed: 0.2,
      decision_quality: 0.25,
      adaptation_rate: 0.2,
      collaboration_efficiency: 0.2,
      problem_solving: 0.15
    },
    
    // Configuración de tendencias
    trendAnalysis: {
      // Porcentaje de cambio para considerar mejora/declive
      trendThreshold: 0.1, // 10%
      
      // Tamaño de ventana para análisis de tendencias (en milisegundos)
      trendWindow: 3600000, // 1 hora
      
      // Número mínimo de puntos para análisis de tendencias
      minimumTrendPoints: 2
    },
    
    // Configuración de aprendizaje
    learningAnalysis: {
      // Tiempo mínimo entre mediciones de aprendizaje (en milisegundos)
      minimumLearningInterval: 1800000, // 30 minutos
      
      // Factor de aceleración para considerar mejora
      accelerationFactor: 1.2, // 20% más rápido
      
      // Factor de desaceleración para considerar empeoramiento
      decelerationFactor: 0.8 // 20% más lento
    }
  },

  // 🔮 CONFIGURACIÓN DE PREDICCIONES
  predictions: {
    // Configuración del modelo predictivo
    model: {
      type: 'linear_regression',
      minimumDataPoints: 5,
      predictionHorizon: 24, // horas
      confidenceDecayRate: 0.03, // 3% por hora
      minimumConfidence: 0.1
    },
    
    // Configuración de validación
    validation: {
      // Porcentaje de datos para validación
      validationSplit: 0.2, // 20%
      
      // Métrica de error máxima aceptable
      maximumErrorRate: 0.3 // 30%
    },
    
    // Factores de influencia
    influencingFactors: {
      // Correlación mínima para considerar factor influyente
      minimumCorrelation: 0.3,
      
      // Variación mínima para considerar factor temporal
      minimumVariation: 0.3
    }
  },

  // 📈 CONFIGURACIÓN DE RENDIMIENTO
  performance: {
    // Umbrales de salud del sistema
    healthThresholds: {
      excellent: 0.9,
      good: 0.7,
      acceptable: 0.5,
      critical: 0.3
    },
    
    // Factores de degradación de salud
    healthDegradation: {
      // Reducción por bajo rendimiento cognitivo
      lowCognitivePerformance: 0.2,
      
      // Reducción por anomalía crítica
      criticalAnomaly: 0.1,
      
      // Reducción por baja confianza de patrones
      lowPatternConfidence: 0.1
    },
    
    // Configuración de optimización
    optimization: {
      // Intervalo para ajustes automáticos (en milisegundos)
      adjustmentInterval: 900000, // 15 minutos
      
      // Factor de mejora objetivo
      targetImprovement: 0.3, // 30%
      
      // Número máximo de ajustes consecutivos
      maximumConsecutiveAdjustments: 5
    }
  },

  // 🚨 CONFIGURACIÓN DE ALERTAS
  alerts: {
    // Configuración de alertas de anomalías
    anomalies: {
      // Severidades que generan alertas
      alertSeverities: ['high', 'critical'],
      
      // Tiempo de expiración de alertas (en milisegundos)
      alertExpiration: 3600000, // 1 hora
      
      // Número máximo de alertas activas
      maximumActiveAlerts: 10
    },
    
    // Configuración de alertas de rendimiento
    performance: {
      // Umbral para alerta de degradación
      degradationThreshold: 0.1, // 10% de degradación
      
      // Tiempo mínimo entre alertas (en milisegundos)
      minimumAlertInterval: 300000 // 5 minutos
    },
    
    // Configuración de notificaciones
    notifications: {
      // Tipos de agentes que reciben alertas
      targetAgentTypes: ['system_architect', 'security_threat_hunter'],
      
      // Formato de notificación
      format: 'structured', // 'structured' | 'simple'
      
      // Incluir contexto en notificaciones
      includeContext: true
    }
  },

  // 🔧 CONFIGURACIÓN DE INTEGRACIÓN
  integration: {
    // Configuración de integración con MCP
    mcp: {
      // Habilitar integración automática
      enabled: true,
      
      // Intervalo de sincronización (en milisegundos)
      syncInterval: 60000, // 1 minuto
      
      // Tamaño máximo de datos a sincronizar
      maxSyncSize: 1000
    },
    
    // Configuración de almacenamiento
    storage: {
      // Tamaño máximo de caché en memoria
      maxCacheSize: 10000,
      
      // Tiempo de retención de datos (en milisegundos)
      dataRetention: 2592000000, // 30 días
      
      // Compresión de datos antiguos
      compressOldData: true
    },
    
    // Configuración de logging
    logging: {
      // Nivel de logging
      level: 'info', // 'debug' | 'info' | 'warn' | 'error'
      
      // Incluir métricas en logs
      includeMetrics: true,
      
      // Formato de timestamp
      timestampFormat: 'ISO'
    }
  },

  // 🎯 CONFIGURACIÓN DE RECOMENDACIONES
  recommendations: {
    // Configuración de generación de recomendaciones
    generation: {
      // Número máximo de recomendaciones por análisis
      maxRecommendations: 10,
      
      // Prioridades disponibles
      priorities: ['low', 'medium', 'high', 'critical'],
      
      // Tipos de recomendaciones
      types: ['anomaly_detection', 'performance_optimization', 'predictive_action']
    },
    
    // Configuración de ejecución
    execution: {
      // Ejecución automática de recomendaciones
      autoExecute: true,
      
      // Confirmación requerida para recomendaciones críticas
      requireConfirmation: ['critical'],
      
      // Timeout para ejecución (en milisegundos)
      executionTimeout: 60000 // 1 minuto
    },
    
    // Configuración de seguimiento
    tracking: {
      // Seguimiento de efectividad de recomendaciones
      trackEffectiveness: true,
      
      // Tiempo de evaluación de efectividad (en milisegundos)
      effectivenessEvaluationTime: 3600000 // 1 hora
    }
  },

  // 🔒 CONFIGURACIÓN DE SEGURIDAD
  security: {
    // Configuración de validación de datos
    validation: {
      // Validar integridad de datos de entrada
      validateInputIntegrity: true,
      
      // Validar rangos de valores
      validateValueRanges: true,
      
      // Validar consistencia temporal
      validateTemporalConsistency: true
    },
    
    // Configuración de hashing
    hashing: {
      // Algoritmo de hash
      algorithm: 'sha256',
      
      // Longitud del hash generado
      hashLength: 16,
      
      // Salt para hashing
      salt: 'altamedica_intelligence_2024'
    },
    
    // Configuración de acceso
    access: {
      // Autenticación requerida para análisis
      requireAuthentication: false,
      
      // Autorización requerida para configuraciones
      requireAuthorization: true,
      
      // Logging de acceso
      logAccess: true
    }
  },

  // 🌍 CONFIGURACIÓN DE ENTORNO
  environment: {
    // Configuración de desarrollo
    development: {
      // Modo de desarrollo
      enabled: process.env.NODE_ENV === 'development',
      
      // Logging detallado en desarrollo
      verboseLogging: true,
      
      // Simulación de datos en desarrollo
      simulateData: true
    },
    
    // Configuración de producción
    production: {
      // Optimizaciones de rendimiento
      performanceOptimizations: true,
      
      // Caché agresivo
      aggressiveCaching: true,
      
      // Logging mínimo
      minimalLogging: true
    },
    
    // Configuración de testing
    testing: {
      // Modo de testing
      enabled: process.env.NODE_ENV === 'test',
      
      // Datos de prueba
      testData: {
        patternCount: 50,
        timeWindow: 1800000, // 30 minutos
        agentCount: 3
      }
    }
  }
};

// Configuración específica por entorno
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...IntelligenceSystemConfig,
        timing: {
          ...IntelligenceSystemConfig.timing,
          analysisInterval: 600000, // 10 minutos en producción
          cleanupInterval: 2592000000 // 30 días en producción
        },
        integration: {
          ...IntelligenceSystemConfig.integration,
          logging: {
            ...IntelligenceSystemConfig.integration.logging,
            level: 'warn'
          }
        }
      };
      
    case 'test':
      return {
        ...IntelligenceSystemConfig,
        timing: {
          ...IntelligenceSystemConfig.timing,
          analysisInterval: 10000, // 10 segundos en testing
          patternAnalysisWindow: 300000 // 5 minutos en testing
        }
      };
      
    default:
      return IntelligenceSystemConfig;
  }
};

// Utilidades de configuración
export const ConfigUtils = {
  // Obtener configuración para un módulo específico
  getModuleConfig: (moduleName) => {
    const config = getEnvironmentConfig();
    return config[moduleName] || {};
  },

  // Validar configuración
  validateConfig: (config) => {
    const errors = [];
    
    // Validar intervalos de tiempo
    if (config.timing?.analysisInterval < 10000) {
      errors.push('analysisInterval debe ser al menos 10 segundos');
    }
    
    // Validar umbrales
    if (config.patternAnalysis?.highFrequencyThreshold > 1) {
      errors.push('highFrequencyThreshold debe ser entre 0 y 1');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Aplicar configuración personalizada
  applyCustomConfig: (baseConfig, customConfig) => {
    return {
      ...baseConfig,
      ...customConfig,
      timing: {
        ...baseConfig.timing,
        ...customConfig.timing
      },
      patternAnalysis: {
        ...baseConfig.patternAnalysis,
        ...customConfig.patternAnalysis
      }
    };
  }
};

export default IntelligenceSystemConfig; 