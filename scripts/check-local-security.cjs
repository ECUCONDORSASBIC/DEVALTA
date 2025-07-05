/**
 * Script para verificar el estado de seguridad local del proyecto
 * Altamedica - Verificación Local
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(message);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkEmergencyState() {
  log('🏥 Verificando estado de emergencia HIPAA...');
  
  if (checkFileExists('EMERGENCY_HIPAA_STATE.json')) {
    log('✅ Archivo de estado de emergencia encontrado');
    
    try {
      const state = JSON.parse(fs.readFileSync('EMERGENCY_HIPAA_STATE.json', 'utf8'));
      log(`📅 Fecha de emergencia: ${state.timestamp}`);
      log(`🔒 Estado: ${state.status}`);
      return true;
    } catch (error) {
      log('❌ Error al leer archivo de estado');
      return false;
    }
  } else {
    log('❌ Archivo de estado de emergencia NO encontrado');
    return false;
  }
}

function checkWorkflowFile() {
  log('\n🔒 Verificando workflow de seguridad...');
  
  const workflowPath = '.github/workflows/security-audit.yml';
  if (checkFileExists(workflowPath)) {
    log('✅ Workflow de seguridad encontrado');
    
    try {
      const content = fs.readFileSync(workflowPath, 'utf8');
      if (content.includes('Security Audit')) {
        log('✅ Workflow configurado correctamente');
        return true;
      } else {
        log('⚠️ Workflow encontrado pero contenido inesperado');
        return false;
      }
    } catch (error) {
      log('❌ Error al leer workflow');
      return false;
    }
  } else {
    log('❌ Workflow de seguridad NO encontrado');
    return false;
  }
}

function checkVulnerabilities() {
  log('\n🔍 Verificando vulnerabilidades locales...');
  
  try {
    const auditOutput = execSync('pnpm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditOutput);
    
    const vulnerabilities = audit.metadata.vulnerabilities;
    const critical = vulnerabilities.critical || 0;
    const high = vulnerabilities.high || 0;
    const moderate = vulnerabilities.moderate || 0;
    const low = vulnerabilities.low || 0;
    
    log(`📊 Vulnerabilidades detectadas:`);
    log(`   🔴 Críticas: ${critical}`);
    log(`   🟠 Altas: ${high}`);
    log(`   🟡 Moderadas: ${moderate}`);
    log(`   🟢 Bajas: ${low}`);
    
    if (critical > 0 || high > 0) {
      log('❌ VULNERABILIDADES CRÍTICAS/ALTAS DETECTADAS');
      log('🚨 Se recomienda ejecutar: pnpm audit --fix');
      return false;
    } else {
      log('✅ No se detectaron vulnerabilidades críticas o altas');
      return true;
    }
    
  } catch (error) {
    log('❌ Error al ejecutar auditoría de seguridad');
    log(error.message);
    return false;
  }
}

function checkDisabledFeatures() {
  log('\n🚫 Verificando funcionalidades deshabilitadas...');
  
  const patterns = [
    { pattern: 'EMERGENCY HIPAA: API DISABLED', description: 'APIs deshabilitadas' },
    { pattern: 'EMERGENCY HIPAA: TELEMEDICINE DISABLED', description: 'Telemedicina deshabilitada' },
    { pattern: 'EMERGENCY HIPAA: MOCK DATA DISABLED', description: 'Datos mock deshabilitados' }
  ];
  
  let allDisabled = true;
  
  patterns.forEach(({ pattern, description }) => {
    try {
      const grepOutput = execSync(`grep -r "${pattern}" apps/ packages/ 2>/dev/null || echo ""`, { encoding: 'utf8' });
      if (grepOutput.trim()) {
        log(`✅ ${description}: Encontradas`);
      } else {
        log(`❌ ${description}: NO encontradas`);
        allDisabled = false;
      }
    } catch (error) {
      log(`⚠️ ${description}: Error al verificar`);
      allDisabled = false;
    }
  });
  
  return allDisabled;
}

function main() {
  log('🔒 ALTAMEDICA - VERIFICACIÓN LOCAL DE SEGURIDAD');
  log('=' .repeat(60));
  log('');
  
  const emergencyState = checkEmergencyState();
  const workflowExists = checkWorkflowFile();
  const vulnerabilitiesOk = checkVulnerabilities();
  const featuresDisabled = checkDisabledFeatures();
  
  log('\n📋 RESUMEN DEL ESTADO:');
  log('=' .repeat(40));
  log(`🏥 Estado de emergencia: ${emergencyState ? '✅' : '❌'}`);
  log(`🔒 Workflow de seguridad: ${workflowExists ? '✅' : '❌'}`);
  log(`🔍 Vulnerabilidades: ${vulnerabilitiesOk ? '✅' : '❌'}`);
  log(`🚫 Funcionalidades deshabilitadas: ${featuresDisabled ? '✅' : '❌'}`);
  
  log('\n📊 PRÓXIMOS PASOS:');
  if (emergencyState && workflowExists && vulnerabilitiesOk && featuresDisabled) {
    log('✅ Sistema en estado seguro para desarrollo');
    log('🔄 El workflow se ejecutará automáticamente en GitHub');
    log('📅 Revisar GitHub Actions para confirmar ejecución');
  } else {
    log('⚠️ Se requieren acciones adicionales:');
    if (!emergencyState) log('   - Ejecutar script de emergencia');
    if (!workflowExists) log('   - Verificar workflow en GitHub');
    if (!vulnerabilitiesOk) log('   - Ejecutar: pnpm audit --fix');
    if (!featuresDisabled) log('   - Verificar deshabilitación de funcionalidades');
  }
  
  log('\n🔗 Para verificar en GitHub:');
  log('   https://github.com/ECUCONDORSASBIC/devaltamedica/actions');
  
  log('\n' + '=' .repeat(60));
  log('🏥 Sistema de Monitoreo de Seguridad - Altamedica');
}

main(); 