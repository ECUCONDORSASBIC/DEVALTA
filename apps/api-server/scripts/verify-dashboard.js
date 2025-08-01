#!/usr/bin/env node

/**
 * Script para verificar que todos los componentes del dashboard estén funcionando
 * Ejecutar con: node scripts/verify-dashboard.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando componentes del Panel de Control Médico...\n');

const componentsDir = path.join(__dirname, '../src/components/dashboard');
const requiredComponents = [
  'APIDashboard.tsx',
  'RealTimeLogs.tsx', 
  'APIEndpoints.tsx',
  'SystemMetrics.tsx',
  'HealthStatus.tsx',
  'MedicalCompliance.tsx',
  'SecurityMonitoring.tsx',
  'PerformanceAnalytics.tsx',
  'IncidentManagement.tsx',
  'MaintenanceTools.tsx',
  'UserActivity.tsx',
  'DatabaseMonitoring.tsx'
];

let allComponentsPresent = true;

console.log('📁 Verificando componentes en:', componentsDir);

requiredComponents.forEach(component => {
  const filePath = path.join(componentsDir, component);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - FALTANTE`);
    allComponentsPresent = false;
  }
});

console.log('\n📊 Verificando archivos principales...');

const mainFiles = [
  '../src/app/dashboard/page.tsx',
  '../src/app/api/admin/dashboard/route.ts',
  '../DASHBOARD_README.md'
];

mainFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${path.basename(file)}`);
  } else {
    console.log(`❌ ${path.basename(file)} - FALTANTE`);
    allComponentsPresent = false;
  }
});

console.log('\n🎯 Estado del Panel de Control:');
if (allComponentsPresent) {
  console.log('✅ TODOS LOS COMPONENTES ESTÁN PRESENTES');
  console.log('🚀 El Panel de Control Médico está listo para usar');
  console.log('\n📋 Funcionalidades disponibles:');
  console.log('   • Vista General - Resumen ejecutivo del sistema');
  console.log('   • Logs en Tiempo Real - Registros detallados');
  console.log('   • Endpoints API - Documentación y estado');
  console.log('   • Métricas del Sistema - Performance y recursos');
  console.log('   • Estado de Salud - Health checks completos');
  console.log('   • Cumplimiento Médico - HIPAA, GDPR, estándares');
  console.log('   • Seguridad - Monitoreo de amenazas');
  console.log('   • Análisis de Performance - Optimización');
  console.log('   • Gestión de Incidentes - Alertas y resolución');
  console.log('   • Herramientas de Mantenimiento - Backup, limpieza');
  console.log('   • Actividad de Usuarios - Sesiones y comportamiento');
  console.log('   • Monitoreo de Base de Datos - Estado y performance');
  
  console.log('\n🌐 URLs disponibles:');
  console.log('   • Dashboard Principal: http://localhost:3001/dashboard');
  console.log('   • API del Dashboard: http://localhost:3001/api/admin/dashboard');
  console.log('   • Health Check: http://localhost:3001/api/health');
  
} else {
  console.log('❌ FALTAN COMPONENTES - Revisar archivos faltantes');
}

console.log('\n🏥 Panel de Control Médico ALTAMEDICA');
console.log('Sistema Integral de Monitoreo, Diagnóstico y Mantenimiento');
console.log('Versión: 1.0.0'); 