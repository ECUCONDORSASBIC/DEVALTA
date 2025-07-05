#!/usr/bin/env node

/**
 * 🚨 SCRIPT DE VERIFICACIÓN DE ESTADO DE EMERGENCIA
 * Verifica el estado actual del sistema después de activar medidas de emergencia
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white', level = 'INFO') {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${colors[color]}${colors.bold}[${timestamp}] [${level}]${colors.reset} ${message}`;
  console.log(coloredMessage);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

async function checkEmergencyState() {
  log('🚨 VERIFICANDO ESTADO DE EMERGENCIA HIPAA', 'red', 'CRITICAL');
  log('Timestamp: ' + new Date().toISOString(), 'cyan');
  log('Directorio: ' + process.cwd(), 'cyan');

  const results = {
    emergencyMode: false,
    disabledAPIs: [],
    disabledTelemedicine: [],
    disabledMockData: [],
    environmentVars: [],
    vulnerabilities: [],
    compliance: {},
    recommendations: []
  };

  // 1. Verificar archivo de estado de emergencia
  const emergencyStateFile = 'EMERGENCY_HIPAA_STATE.json';
  if (checkFileExists(emergencyStateFile)) {
    try {
      const stateData = JSON.parse(fs.readFileSync(emergencyStateFile, 'utf8'));
      results.emergencyMode = stateData.emergency?.activated || false;
      log('✅ Archivo de estado de emergencia encontrado', 'green');
      log(`   Modo de emergencia: ${results.emergencyMode ? 'ACTIVADO' : 'DESACTIVADO'}`, 
          results.emergencyMode ? 'red' : 'green');
    } catch (error) {
      log('❌ Error leyendo archivo de estado de emergencia', 'red');
    }
  } else {
    log('❌ Archivo de estado de emergencia NO encontrado', 'red');
    results.recommendations.push('Ejecutar: pnpm run emergency:disable-non-compliant');
  }

  // 2. Verificar APIs deshabilitadas
  const apiFiles = [
    'apps/api-server/src/app/api/v1/applications/route.ts',
    'apps/api-server/src/app/api/v1/dashboard/analytics/route.ts',
    'apps/api-server/src/app/api/v1/medical-locations/route.ts'
  ];

  apiFiles.forEach(file => {
    if (checkFileExists(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('EMERGENCY HIPAA: API DISABLED')) {
        results.disabledAPIs.push(file);
        log(`✅ API deshabilitada: ${file}`, 'green');
      } else {
        log(`⚠️ API NO deshabilitada: ${file}`, 'yellow');
        results.recommendations.push(`Deshabilitar API: ${file}`);
      }
    }
  });

  // 3. Verificar telemedicina deshabilitada
  const telemedicineFiles = [
    'apps/patients/src/components/telemedicine/WebRTCVideoCall.tsx',
    'apps/patients/src/hooks/useWebRTC.ts',
    'apps/patients/src/hooks/useTelemedicineSession.ts'
  ];

  telemedicineFiles.forEach(file => {
    if (checkFileExists(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('EMERGENCY HIPAA: TELEMEDICINE DISABLED')) {
        results.disabledTelemedicine.push(file);
        log(`✅ Telemedicina deshabilitada: ${file}`, 'green');
      } else {
        log(`⚠️ Telemedicina NO deshabilitada: ${file}`, 'yellow');
        results.recommendations.push(`Deshabilitar telemedicina: ${file}`);
      }
    }
  });

  // 4. Verificar datos mock deshabilitados
  const mockFiles = [
    'apps/companies/companies/lib/mock-data.ts',
    'apps/web-app/src/hooks/dashboard/useDashboardData.ts'
  ];

  mockFiles.forEach(file => {
    if (checkFileExists(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('EMERGENCY HIPAA: MOCK DATA DISABLED')) {
        results.disabledMockData.push(file);
        log(`✅ Datos mock deshabilitados: ${file}`, 'green');
      } else {
        log(`⚠️ Datos mock NO deshabilitados: ${file}`, 'yellow');
        results.recommendations.push(`Deshabilitar datos mock: ${file}`);
      }
    }
  });

  // 5. Verificar variables de entorno
  const envFiles = ['.env.local', '.env.development', '.env.production'];
  envFiles.forEach(envFile => {
    if (checkFileExists(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('EMERGENCY HIPAA COMPLIANCE MODE')) {
        results.environmentVars.push(envFile);
        log(`✅ Variables de emergencia en: ${envFile}`, 'green');
      } else {
        log(`⚠️ Variables de emergencia NO en: ${envFile}`, 'yellow');
        results.recommendations.push(`Agregar variables de emergencia: ${envFile}`);
      }
    }
  });

  // 6. Verificar vulnerabilidades
  log('🔍 Verificando vulnerabilidades...', 'cyan');
  try {
    const { execSync } = await import('child_process');
    const auditOutput = execSync('pnpm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.metadata && auditData.metadata.vulnerabilities) {
      const vulns = auditData.metadata.vulnerabilities;
      results.vulnerabilities = {
        critical: vulns.critical || 0,
        high: vulns.high || 0,
        moderate: vulns.moderate || 0,
        low: vulns.low || 0
      };
      
      log(`📊 Vulnerabilidades encontradas:`, 'yellow');
      log(`   Críticas: ${results.vulnerabilities.critical}`, 
          results.vulnerabilities.critical > 0 ? 'red' : 'green');
      log(`   Altas: ${results.vulnerabilities.high}`, 
          results.vulnerabilities.high > 0 ? 'red' : 'green');
      log(`   Moderadas: ${results.vulnerabilities.moderate}`, 
          results.vulnerabilities.moderate > 0 ? 'yellow' : 'green');
      log(`   Bajas: ${results.vulnerabilities.low}`, 
          results.vulnerabilities.low > 0 ? 'yellow' : 'green');
    }
  } catch (error) {
    log('❌ Error verificando vulnerabilidades', 'red');
  }

  // 7. Verificar compliance
  log('🏥 Verificando compliance médico...', 'cyan');
  try {
    const complianceFile = 'altamedica-core/scripts/medical-compliance-check.js';
    if (checkFileExists(complianceFile)) {
      log('✅ Script de compliance encontrado', 'green');
      results.compliance.scriptExists = true;
    } else {
      log('❌ Script de compliance NO encontrado', 'red');
      results.compliance.scriptExists = false;
    }
  } catch (error) {
    log('❌ Error verificando compliance', 'red');
  }

  // 8. Generar resumen
  log('\n📋 RESUMEN DE ESTADO DE EMERGENCIA', 'magenta', 'SUMMARY');
  log('=====================================', 'magenta');
  
  log(`Modo de emergencia: ${results.emergencyMode ? 'ACTIVADO' : 'DESACTIVADO'}`, 
      results.emergencyMode ? 'red' : 'green');
  log(`APIs deshabilitadas: ${results.disabledAPIs.length}/${apiFiles.length}`, 
      results.disabledAPIs.length === apiFiles.length ? 'green' : 'yellow');
  log(`Telemedicina deshabilitada: ${results.disabledTelemedicine.length}/${telemedicineFiles.length}`, 
      results.disabledTelemedicine.length === telemedicineFiles.length ? 'green' : 'yellow');
  log(`Datos mock deshabilitados: ${results.disabledMockData.length}/${mockFiles.length}`, 
      results.disabledMockData.length === mockFiles.length ? 'green' : 'yellow');
  log(`Variables de entorno configuradas: ${results.environmentVars.length}/${envFiles.length}`, 
      results.environmentVars.length === envFiles.length ? 'green' : 'yellow');

  if (results.vulnerabilities.critical > 0 || results.vulnerabilities.high > 0) {
    log('🚨 VULNERABILIDADES CRÍTICAS DETECTADAS', 'red', 'CRITICAL');
    log('Se requieren acciones inmediatas', 'red');
  }

  // 9. Recomendaciones
  if (results.recommendations.length > 0) {
    log('\n🔧 RECOMENDACIONES INMEDIATAS:', 'yellow', 'RECOMMENDATIONS');
    results.recommendations.forEach((rec, index) => {
      log(`${index + 1}. ${rec}`, 'yellow');
    });
  }

  // 10. Estado final
  const allDisabled = results.disabledAPIs.length === apiFiles.length &&
                     results.disabledTelemedicine.length === telemedicineFiles.length &&
                     results.disabledMockData.length === mockFiles.length &&
                     results.environmentVars.length === envFiles.length;

  if (allDisabled && results.emergencyMode) {
    log('\n✅ SISTEMA EN MODO DE EMERGENCIA COMPLETO', 'green', 'SUCCESS');
    log('Todas las medidas de emergencia están activas', 'green');
  } else {
    log('\n⚠️ SISTEMA NO COMPLETAMENTE EN MODO DE EMERGENCIA', 'yellow', 'WARNING');
    log('Se requieren acciones adicionales', 'yellow');
  }

  log('\n🚨 ESTADO DE PRODUCCIÓN:', 'red', 'PRODUCTION');
  log('NO SEGURO PARA PRODUCCIÓN', 'red');
  log('Se requiere implementación completa de compliance', 'red');

  return results;
}

// Ejecutar verificación
checkEmergencyState(); 