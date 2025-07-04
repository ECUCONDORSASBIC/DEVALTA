#!/usr/bin/env node

/**
 * Script de Prueba de APIs Reales para Altamedica
 * Verifica el funcionamiento de las APIs profesionales
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Probando APIs Reales de Altamedica...\n');

// Función para probar API FHIR
async function testFHIRAPI() {
  console.log('🏥 Probando API FHIR...');
  
  try {
    const response = await fetch('https://hapi.fhir.org/baseR4/Patient?_count=1');
    const data = await response.json();
    
    if (data.entry && data.entry.length > 0) {
      console.log('✅ API FHIR funcionando correctamente');
      console.log(`   Pacientes disponibles: ${data.total || 'N/A'}`);
      return true;
    } else {
      console.log('⚠️ API FHIR respondió pero sin datos');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en API FHIR:', error.message);
    return false;
  }
}

// Función para probar API de COVID-19
async function testCOVIDAPI() {
  console.log('🦠 Probando API COVID-19...');
  
  try {
    const response = await fetch('https://disease.sh/v3/covid-19/all');
    const data = await response.json();
    
    if (data.cases !== undefined) {
      console.log('✅ API COVID-19 funcionando correctamente');
      console.log(`   Casos globales: ${data.cases.toLocaleString()}`);
      return true;
    } else {
      console.log('⚠️ API COVID-19 respondió pero sin datos válidos');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en API COVID-19:', error.message);
    return false;
  }
}

// Función para probar API de Datadog (simulada)
async function testDatadogAPI() {
  console.log('📊 Probando configuración Datadog...');
  
  const apiKey = process.env.DATADOG_API_KEY;
  const appKey = process.env.DATADOG_APP_KEY;
  
  if (!apiKey || !appKey) {
    console.log('⚠️ Datadog no configurado (variables de entorno faltantes)');
    console.log('   Configura DATADOG_API_KEY y DATADOG_APP_KEY en tu .env');
    return false;
  }
  
  try {
    const response = await fetch('https://api.datadoghq.com/api/v1/validate', {
      headers: {
        'DD-API-KEY': apiKey,
        'DD-APP-KEY': appKey
      }
    });
    
    if (response.ok) {
      console.log('✅ Datadog configurado correctamente');
      return true;
    } else {
      console.log('❌ Datadog: credenciales inválidas');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en Datadog:', error.message);
    return false;
  }
}

// Función para probar API de Auth0 (simulada)
async function testAuth0API() {
  console.log('🔐 Probando configuración Auth0...');
  
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  
  if (!domain || !clientId) {
    console.log('⚠️ Auth0 no configurado (variables de entorno faltantes)');
    console.log('   Configura AUTH0_DOMAIN y AUTH0_CLIENT_ID en tu .env');
    return false;
  }
  
  try {
    const response = await fetch(`https://${domain}/.well-known/openid_configuration`);
    
    if (response.ok) {
      console.log('✅ Auth0 configurado correctamente');
      return true;
    } else {
      console.log('❌ Auth0: dominio inválido');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en Auth0:', error.message);
    return false;
  }
}

// Función para probar API de FDA
async function testFDAAPI() {
  console.log('💊 Probando API FDA...');
  
  try {
    const response = await fetch('https://api.fda.gov/drug/label.json?limit=1');
    const data = await response.json();
    
    if (data.meta && data.results) {
      console.log('✅ API FDA funcionando correctamente');
      console.log(`   Medicamentos disponibles: ${data.meta.results.total.toLocaleString()}`);
      return true;
    } else {
      console.log('⚠️ API FDA respondió pero sin datos válidos');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en API FDA:', error.message);
    return false;
  }
}

// Función para probar API de WHO
async function testWHOAPI() {
  console.log('🌍 Probando API WHO...');
  
  try {
    const response = await fetch('https://covid19.who.int/WHO-COVID-19-global-data.csv');
    
    if (response.ok) {
      console.log('✅ API WHO funcionando correctamente');
      console.log('   Datos COVID-19 globales disponibles');
      return true;
    } else {
      console.log('❌ API WHO no disponible');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en API WHO:', error.message);
    return false;
  }
}

// Función para probar conectividad general
async function testConnectivity() {
  console.log('🌐 Probando conectividad general...');
  
  const testUrls = [
    'https://www.google.com',
    'https://www.github.com',
    'https://www.npmjs.com'
  ];
  
  let successCount = 0;
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      console.log(`   ❌ ${url}: ${error.message}`);
    }
  }
  
  if (successCount === testUrls.length) {
    console.log('✅ Conectividad general: Excelente');
    return true;
  } else {
    console.log(`⚠️ Conectividad general: ${successCount}/${testUrls.length} exitosas`);
    return false;
  }
}

// Función para generar reporte
function generateReport(results) {
  const reportPath = path.join(__dirname, '..', 'logs', 'api-test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r).length,
      failed: Object.values(results).filter(r => !r).length
    },
    results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Reporte guardado en: ${reportPath}`);
  
  return report;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de APIs reales...\n');
  
  const results = {};
  
  // Ejecutar pruebas
  results.connectivity = await testConnectivity();
  console.log('');
  
  results.fhir = await testFHIRAPI();
  console.log('');
  
  results.covid = await testCOVIDAPI();
  console.log('');
  
  results.fda = await testFDAAPI();
  console.log('');
  
  results.who = await testWHOAPI();
  console.log('');
  
  results.datadog = await testDatadogAPI();
  console.log('');
  
  results.auth0 = await testAuth0API();
  console.log('');
  
  // Generar reporte
  const report = generateReport(results);
  
  // Mostrar resumen
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('═══════════════════════');
  console.log(`Total de APIs probadas: ${report.summary.total}`);
  console.log(`✅ Exitosas: ${report.summary.passed}`);
  console.log(`❌ Fallidas: ${report.summary.failed}`);
  console.log(`📈 Tasa de éxito: ${Math.round((report.summary.passed / report.summary.total) * 100)}%`);
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  
  if (!results.connectivity) {
    console.log('   • Verifica tu conexión a internet');
  }
  
  if (!results.fhir) {
    console.log('   • La API FHIR puede estar temporalmente no disponible');
  }
  
  if (!results.datadog || !results.auth0) {
    console.log('   • Configura las variables de entorno para Datadog y Auth0');
    console.log('   • Ejecuta: cp .env.example .env');
    console.log('   • Edita .env con tus API keys reales');
  }
  
  if (report.summary.passed >= report.summary.total * 0.8) {
    console.log('\n🎉 ¡Excelente! La mayoría de las APIs están funcionando correctamente.');
  } else {
    console.log('\n⚠️ Algunas APIs necesitan configuración adicional.');
  }
  
  console.log('\n📋 Próximos pasos:');
  console.log('1. Revisa el reporte detallado en logs/api-test-report.json');
  console.log('2. Configura las APIs que fallaron');
  console.log('3. Ejecuta este script nuevamente para verificar');
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  });
}

export { main }; 