#!/usr/bin/env node
// 🎯 DEMOSTRACIÓN DEL SISTEMA DE CONFIGURACIÓN AVANZADA
// Muestra las capacidades del ecosistema cognitivo

import { systemConfig, ConfigurationUtils } from './system-configuration.js';
import { SystemIntelligenceUtils } from './system-intelligence-utils.js';

console.log('🧠 SISTEMA DE CONFIGURACIÓN AVANZADA - DEMOSTRACIÓN');
console.log('=' .repeat(60));

async function runDemo() {
  try {
    // 1. Validación del entorno
    console.log('\n🔍 1. VALIDACIÓN DEL ENTORNO');
    const envValidation = await ConfigurationUtils.validateEnvironment();
    console.log(`✅ Compatible: ${envValidation.compatible}`);
    if (envValidation.issues.length > 0) {
      console.log('⚠️  Problemas detectados:');
      envValidation.issues.forEach(issue => {
        console.log(`   - ${issue.severity.toUpperCase()}: ${issue.message}`);
      });
    }

    // 2. Configuración inicial
    console.log('\n⚙️  2. CONFIGURACIÓN INICIAL');
    console.log(`📊 Secciones configuradas: ${systemConfig.config.size}`);
    console.log(`🕒 Última actualización: ${new Date(systemConfig.lastUpdate).toLocaleString()}`);

    // 3. Validación de configuración
    console.log('\n✅ 3. VALIDACIÓN DE CONFIGURACIÓN');
    const validation = systemConfig.validateConfiguration();
    console.log(`✅ Válida: ${validation.valid}`);
    console.log(`⚠️  Advertencias: ${validation.warnings}`);
    console.log(`❌ Errores: ${validation.errors}`);

    // 4. Reporte de configuración
    console.log('\n📋 4. REPORTE DE CONFIGURACIÓN');
    const report = systemConfig.generateConfigurationReport();
    console.log(`🏷️  Versión: ${report.system_info.version}`);
    console.log(`📈 Cambios adaptativos: ${report.system_info.adaptive_changes}`);
    
    console.log('\n🎯 CONFIGURACIONES PRINCIPALES:');
    console.log(`   • Agentes máximos: ${report.performance_settings.max_agents}`);
    console.log(`   • Operaciones concurrentes: ${report.performance_settings.concurrent_operations}`);
    console.log(`   • Límite de memoria: ${report.performance_settings.memory_limit}`);
    console.log(`   • Tasa de aprendizaje: ${report.learning_settings.learning_rate}`);
    console.log(`   • Umbral de patrones: ${report.learning_settings.pattern_threshold}`);

    // 5. Demostración de perfiles optimizados
    console.log('\n🚀 5. DEMOSTRACIÓN DE PERFILES OPTIMIZADOS');
    
    // Perfil de alto rendimiento
    console.log('\n   🔥 PERFIL: Alto Rendimiento');
    systemConfig.loadOptimizedProfile('high_performance');
    const highPerfReport = systemConfig.generateConfigurationReport();
    console.log(`   • Operaciones concurrentes: ${highPerfReport.performance_settings.concurrent_operations}`);
    console.log(`   • Tasa de aprendizaje: ${highPerfReport.learning_settings.learning_rate}`);
    console.log(`   • Patrones máximos: ${highPerfReport.learning_settings.max_patterns}`);

    // Perfil conservador de recursos
    console.log('\n   🌱 PERFIL: Conservador de Recursos');
    systemConfig.loadOptimizedProfile('resource_conservative');
    const conservativeReport = systemConfig.generateConfigurationReport();
    console.log(`   • Operaciones concurrentes: ${conservativeReport.performance_settings.concurrent_operations}`);
    console.log(`   • Tasa de aprendizaje: ${conservativeReport.learning_settings.learning_rate}`);
    console.log(`   • Patrones máximos: ${conservativeReport.learning_settings.max_patterns}`);

    // 6. Demostración de características experimentales
    console.log('\n🔬 6. CARACTERÍSTICAS EXPERIMENTALES');
    systemConfig.enableExperimentalFeature('quantum_optimization');
    systemConfig.enableExperimentalFeature('neural_adaptation');
    
    const experimentalFeatures = systemConfig.getExperimentalFeatures();
    console.log('   Características habilitadas:');
    Object.entries(experimentalFeatures).forEach(([feature, enabled]) => {
      console.log(`   • ${feature}: ${enabled ? '✅' : '❌'}`);
    });

    // 7. Demostración de adaptación automática
    console.log('\n🔄 7. ADAPTACIÓN AUTOMÁTICA');
    const mockMetrics = {
      cpu_usage: 0.85,
      memory_usage: 0.92,
      error_rate: 0.08,
      learning_rate: 0.05
    };
    
    console.log('   Métricas simuladas:');
    console.log(`   • CPU: ${(mockMetrics.cpu_usage * 100).toFixed(1)}%`);
    console.log(`   • Memoria: ${(mockMetrics.memory_usage * 100).toFixed(1)}%`);
    console.log(`   • Tasa de error: ${(mockMetrics.error_rate * 100).toFixed(1)}%`);
    console.log(`   • Tasa de aprendizaje: ${(mockMetrics.learning_rate * 100).toFixed(1)}%`);
    
    const adaptations = await systemConfig.adaptConfiguration(mockMetrics);
    console.log(`   🔧 Adaptaciones aplicadas: ${adaptations.length}`);
    adaptations.forEach(adaptation => {
      console.log(`   • ${adaptation}`);
    });

    // 8. Demostración de utilidades de inteligencia
    console.log('\n🧠 8. UTILIDADES DE INTELIGENCIA DEL SISTEMA');
    
    // Simular datos del sistema
    const mockSystemData = {
      compositions: new Map([
        ['comp_1', { id: 'comp_1', status: 'completed', duration: 120000, success: true }],
        ['comp_2', { id: 'comp_2', status: 'completed', duration: 180000, success: true }],
        ['comp_3', { id: 'comp_3', status: 'failed', duration: 90000, success: false }]
      ]),
      agents: new Map([
        ['agent_1', { id: 'agent_1', type: 'system_architect', performance: { successRate: 0.95 } }],
        ['agent_2', { id: 'agent_2', type: 'react_specialist', performance: { successRate: 0.88 } }],
        ['agent_3', { id: 'agent_3', type: 'api_architect', performance: { successRate: 0.92 } }]
      ]),
      patterns: new Map([
        ['pattern_1', { name: 'microservices', confidence: 0.85, occurrences: 15 }],
        ['pattern_2', { name: 'event_driven', confidence: 0.78, occurrences: 8 }]
      ])
    };

    // Generar reporte de inteligencia
    const intelligenceReport = SystemIntelligenceUtils.generateIntelligenceReport(mockSystemData, 3600000);
    console.log(`   📊 Salud del sistema: ${(intelligenceReport.summary.overallHealth * 100).toFixed(1)}%`);
    console.log(`   🎯 Eficiencia cognitiva: ${(intelligenceReport.summary.cognitiveEfficiency * 100).toFixed(1)}%`);
    console.log(`   🤝 Colaboración efectiva: ${(intelligenceReport.summary.collaborationEffectiveness * 100).toFixed(1)}%`);
    console.log(`   📈 Tasa de aprendizaje: ${(intelligenceReport.summary.learningRate * 100).toFixed(1)}%`);

    // 9. Demostración de configuración por entorno
    console.log('\n🌍 9. CONFIGURACIÓN POR ENTORNO');
    
    console.log('\n   🛠️  CONFIGURACIÓN DE DESARROLLO:');
    const devConfig = ConfigurationUtils.createDevelopmentConfig();
    const devReport = devConfig.generateConfigurationReport();
    console.log(`   • Modo debug: ${devReport.system_info.debug_mode || 'N/A'}`);
    console.log(`   • Nivel de logging: ${devReport.system_info.logging_level || 'N/A'}`);
    
    console.log('\n   🏭 CONFIGURACIÓN DE PRODUCCIÓN:');
    const prodConfig = ConfigurationUtils.createProductionConfig();
    const prodReport = prodConfig.generateConfigurationReport();
    console.log(`   • Autenticación requerida: ${prodReport.system_info.auth_required || 'N/A'}`);
    console.log(`   • Nivel de logging: ${prodReport.system_info.logging_level || 'N/A'}`);

    // 10. Guardar configuración
    console.log('\n💾 10. PERSISTENCIA DE CONFIGURACIÓN');
    const saveResult = await systemConfig.saveConfiguration('./demo-config.json');
    console.log(`   ✅ Configuración guardada: ${saveResult}`);

    console.log('\n🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=' .repeat(60));
    console.log('✨ El sistema de configuración avanzada está funcionando correctamente');
    console.log('🚀 El servidor MCP está listo para recibir conexiones');
    console.log('🧠 El ecosistema cognitivo está operativo');

  } catch (error) {
    console.error('❌ Error en la demostración:', error);
    process.exit(1);
  }
}

// Ejecutar demostración
runDemo(); 