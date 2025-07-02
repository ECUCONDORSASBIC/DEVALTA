#!/usr/bin/env node
// 🚀 SCRIPT DE INICIO DEL SERVIDOR MCP
// Inicia el Enhanced Multi-Agent Composer como servidor MCP

import { MCPServer } from './enhanced-multi-agent-mcp.js';

console.log('🎯 ===============================================');
console.log('   Enhanced Multi-Agent Composer MCP Server');
console.log('   Sistema Cognitivo Autónomo - Nivel Inalcanzable');
console.log('===============================================\n');

console.log('🚀 Iniciando servidor MCP...\n');

try {
  const server = new MCPServer();
  
  console.log('✅ Servidor MCP configurado exitosamente');
  console.log('🧠 Sistema cognitivo autónomo activado');
  console.log('🌍 Ingesta de conocimiento en tiempo real iniciada');
  console.log('🤝 Motor de colaboración emergente en línea');
  console.log('📈 Sistema de aprendizaje adaptativo activado\n');
  
  console.log('🎼 Herramientas MCP disponibles:');
  console.log('   📋 compose_application - Composición inteligente de aplicaciones');
  console.log('   🧠 analyze_cognitive_performance - Análisis cognitivo de agentes');
  console.log('   📊 get_intelligence_report - Reportes de inteligencia del sistema');
  console.log('   🤖 list_agents - Lista de agentes especializados');
  console.log('   🤝 start_negotiation - Negociación emergente entre agentes\n');
  
  console.log('🔗 Conectando al transporte stdio...');
  
  // Iniciar el servidor
  await server.start();
  
} catch (error) {
  console.error('💥 Error crítico al iniciar el servidor:', error);
  process.exit(1);
}
