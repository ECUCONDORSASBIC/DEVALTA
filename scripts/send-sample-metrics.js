#!/usr/bin/env node

/**
 * Script de ejemplo para enviar métricas KPI a TimescaleDB
 * Uso: node scripts/send-sample-metrics.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const METRICS_ENDPOINT = `${API_BASE_URL}/api/v1/metrics`;

// Función para enviar una métrica
async function sendKPI(name, value, tags = {}, source = 'example', environment = 'development') {
  try {
    const response = await fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        tags,
        source,
        environment
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ KPI enviado: ${name} = ${value}`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error enviando KPI ${name}:`, error.message);
    return null;
  }
}

// Función para generar métricas de ejemplo
function generateSampleMetrics() {
  const now = Date.now();
  
  return [
    // Métricas de build
    {
      name: 'build_time_seconds',
      value: Math.floor(Math.random() * 300) + 60, // 60-360 segundos
      tags: { 
        branch: 'main', 
        job: 'ci',
        commit: Math.random().toString(36).substring(7)
      },
      source: 'github_actions'
    },
    
    // Métricas de testing
    {
      name: 'test_pass_percentage',
      value: Math.floor(Math.random() * 20) + 80, // 80-100%
      tags: { 
        test_suite: 'unit',
        branch: 'main',
        total_tests: Math.floor(Math.random() * 100) + 50
      },
      source: 'jest'
    },
    
    // Métricas de seguridad
    {
      name: 'security_findings_count',
      value: Math.floor(Math.random() * 5), // 0-4 hallazgos
      tags: { 
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        tool: 'snyk',
        scan_type: 'dependencies'
      },
      source: 'security_scanner'
    },
    
    // Métricas de API
    {
      name: 'api_response_time_ms',
      value: Math.floor(Math.random() * 500) + 100, // 100-600ms
      tags: { 
        endpoint: '/api/v1/patients',
        method: 'GET',
        status_code: [200, 200, 200, 404, 500][Math.floor(Math.random() * 5)]
      },
      source: 'monitoring'
    },
    
    // Métricas de infraestructura
    {
      name: 'database_connection_count',
      value: Math.floor(Math.random() * 20) + 5, // 5-25 conexiones
      tags: { 
        pool: 'main',
        database: 'altamedica'
      },
      source: 'postgres'
    },
    
    // Métricas de costo (simulado)
    {
      name: 'daily_cost_usd',
      value: parseFloat((Math.random() * 50 + 10).toFixed(2)), // $10-60 USD
      tags: { 
        service: 'aws',
        region: 'us-east-1',
        resource_type: 'compute'
      },
      source: 'cost_analyzer'
    },
    
    // Métricas de deployment
    {
      name: 'deployment_frequency',
      value: Math.floor(Math.random() * 5) + 1, // 1-5 deployments
      tags: { 
        environment: 'production',
        service: 'api-server'
      },
      source: 'cd_pipeline'
    },
    
    // Métricas de uptime
    {
      name: 'service_uptime_percentage',
      value: parseFloat((Math.random() * 5 + 95).toFixed(2)), // 95-100%
      tags: { 
        service: 'api-server',
        region: 'us-east-1'
      },
      source: 'monitoring'
    }
  ];
}

// Función principal
async function main() {
  console.log('🚀 Enviando métricas de ejemplo a TimescaleDB...\n');
  
  const metrics = generateSampleMetrics();
  
  for (const metric of metrics) {
    await sendKPI(
      metric.name,
      metric.value,
      metric.tags,
      metric.source,
      'development'
    );
    
    // Esperar un poco entre envíos para simular datos realistas
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Todas las métricas han sido enviadas!');
  console.log(`📊 Puedes ver los resultados en:`);
  console.log(`   - API: ${METRICS_ENDPOINT}?format=json`);
  console.log(`   - Grafana: http://localhost:3000`);
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { sendKPI, generateSampleMetrics };
