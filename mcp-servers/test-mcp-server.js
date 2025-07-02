#!/usr/bin/env node
// 🧪 SCRIPT DE PRUEBA PARA EL SERVIDOR MCP

import { EnhancedMultiAgentComposer } from './enhanced-multi-agent-mcp.js';

async function testMCPServer() {
  console.log('🧪 Iniciando pruebas del servidor MCP...');

  try {
    // Crear instancia del composer
    const composer = new EnhancedMultiAgentComposer();
    
    console.log('✅ Sistema Enhanced Multi-Agent Composer inicializado');
    
    // Prueba 1: Listar agentes
    console.log('\n📋 Prueba 1: Listando agentes disponibles...');
    const agents = Array.from(composer.agents.values());
    console.log(`Agentes encontrados: ${agents.length}`);
    agents.forEach(agent => {
      console.log(`  - ${agent.id} (${agent.type}): ${agent.status}`);
    });

    // Prueba 2: Composición de aplicación
    console.log('\n🎼 Prueba 2: Composición de aplicación...');
    const testSpec = {
      name: "Mi App de Prueba",
      type: "fullstack",
      frontend: {
        framework: "React"
      },
      backend: {
        runtime: "Node.js"
      },
      features: ["authentication", "dashboard"]
    };

    const testContext = {
      budget: 500,
      teamSize: 3,
      timeline: "3 months"
    };

    const composition = await composer.composeApplicationEnhanced(testSpec, testContext);
    console.log(`✅ Composición completada: ${composition.id}`);
    console.log(`  - Arquitectura: ${composition.architecture.type}`);
    console.log(`  - Complejidad: ${composition.architecture.complexity}`);
    console.log(`  - Tecnologías: ${composition.architecture.technologies.join(', ')}`);
    console.log(`  - Score ético: ${composition.principleAlignment.overallEthicalScore.toFixed(2)}/100`);

    // Prueba 3: Análisis de inteligencia
    console.log('\n🧠 Prueba 3: Análisis de inteligencia del sistema...');
    const intelligenceResult = await composer.performIntelligenceAnalysis();
    console.log(`Resultado: ${intelligenceResult.success ? '✅ Exitoso' : '❌ Falló'}`);
    if (intelligenceResult.recommendations) {
      console.log(`Recomendaciones: ${intelligenceResult.recommendations.length}`);
    }

    // Prueba 4: Análisis cognitivo de un agente
    console.log('\n🧠 Prueba 4: Análisis cognitivo de agente...');
    if (agents.length > 0) {
      const firstAgent = agents[0];
      const cognitiveAnalysis = await composer.analyzeCognitivePerformanceEnhanced(firstAgent.id);
      if (cognitiveAnalysis) {
        console.log(`✅ Análisis completado para ${firstAgent.id}`);
        console.log(`  - Velocidad de aprendizaje: ${cognitiveAnalysis.learningSpeed?.toFixed(2) || 'N/A'}`);
        console.log(`  - Calidad de decisiones: ${cognitiveAnalysis.decisionQuality?.toFixed(2) || 'N/A'}`);
        console.log(`  - Recomendaciones: ${cognitiveAnalysis.recommendations?.length || 0}`);
      }
    }

    // Prueba 5: Iniciar negociación
    console.log('\n🤝 Prueba 5: Iniciando negociación entre agentes...');
    if (agents.length >= 2) {
      const selectedAgents = agents.slice(0, 2);
      const negotiationId = await composer.collaboration.startNegotiation(selectedAgents, {
        topic: "Selección de tecnología frontend",
        urgency: "medium"
      });
      console.log(`✅ Negociación iniciada: ${negotiationId}`);
      console.log(`  - Participantes: ${selectedAgents.map(a => a.type).join(', ')}`);
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Resumen del sistema:');
    console.log(`  - Agentes activos: ${agents.length}`);
    console.log(`  - Composiciones en memoria: ${composer.compositions.size}`);
    console.log(`  - Negociaciones activas: ${composer.activeNegotiations.size}`);
    console.log(`  - Reportes de inteligencia: ${composer.intelligence.reports.size}`);

  } catch (error) {
    console.error('💥 Error durante las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar pruebas
testMCPServer().catch(console.error);
