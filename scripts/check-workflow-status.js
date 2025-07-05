#!/usr/bin/env node

/**
 * Script para verificar el estado del workflow de seguridad en GitHub Actions
 * Altamedica - Sistema de Monitoreo de Seguridad
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const REPO_OWNER = 'ECUCONDORSASBIC';
const REPO_NAME = 'devaltamedica';
const WORKFLOW_NAME = 'security-audit.yml';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function checkWorkflowStatus() {
  log('🔍 Verificando estado del workflow de seguridad...', 'cyan');
  log('📅 Timestamp: ' + new Date().toISOString(), 'blue');
  log('');
  
  try {
    // URL para obtener los workflows
    const workflowsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows`;
    
    log('📡 Consultando workflows disponibles...', 'yellow');
    const workflowsResponse = await makeRequest(workflowsUrl);
    
    if (workflowsResponse.status !== 200) {
      log('❌ Error al consultar workflows', 'red');
      log(`Status: ${workflowsResponse.status}`, 'red');
      return;
    }
    
    const workflows = workflowsResponse.data.workflows;
    const securityWorkflow = workflows.find(w => w.name.includes('Security Audit'));
    
    if (!securityWorkflow) {
      log('❌ Workflow de seguridad no encontrado', 'red');
      return;
    }
    
    log(`✅ Workflow encontrado: ${securityWorkflow.name}`, 'green');
    log(`🆔 ID: ${securityWorkflow.id}`, 'blue');
    log(`📁 Archivo: ${securityWorkflow.path}`, 'blue');
    log('');
    
    // Obtener ejecuciones recientes
    const runsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${securityWorkflow.id}/runs?per_page=5`;
    
    log('📊 Consultando ejecuciones recientes...', 'yellow');
    const runsResponse = await makeRequest(runsUrl);
    
    if (runsResponse.status !== 200) {
      log('❌ Error al consultar ejecuciones', 'red');
      return;
    }
    
    const runs = runsResponse.data.workflow_runs;
    
    if (runs.length === 0) {
      log('⚠️ No hay ejecuciones recientes del workflow', 'yellow');
      return;
    }
    
    log(`📋 Últimas ${runs.length} ejecuciones:`, 'bright');
    log('');
    
    runs.forEach((run, index) => {
      const status = run.status;
      const conclusion = run.conclusion;
      const createdAt = new Date(run.created_at).toLocaleString('es-ES');
      const branch = run.head_branch;
      
      let statusColor = 'yellow';
      let statusIcon = '⏳';
      
      if (status === 'completed') {
        if (conclusion === 'success') {
          statusColor = 'green';
          statusIcon = '✅';
        } else if (conclusion === 'failure') {
          statusColor = 'red';
          statusIcon = '❌';
        } else {
          statusColor = 'yellow';
          statusIcon = '⚠️';
        }
      }
      
      log(`${index + 1}. ${statusIcon} Ejecución #${run.run_number}`, statusColor);
      log(`   📅 Creada: ${createdAt}`, 'blue');
      log(`   🌿 Branch: ${branch}`, 'blue');
      log(`   📊 Estado: ${status}`, statusColor);
      if (conclusion) {
        log(`   🎯 Conclusión: ${conclusion}`, statusColor);
      }
      log(`   🔗 URL: ${run.html_url}`, 'cyan');
      log('');
    });
    
    // Verificar la última ejecución
    const latestRun = runs[0];
    
    if (latestRun.status === 'completed') {
      if (latestRun.conclusion === 'success') {
        log('🎉 Última ejecución: EXITOSA', 'green');
        log('✅ No se detectaron vulnerabilidades críticas o altas', 'green');
      } else if (latestRun.conclusion === 'failure') {
        log('🚨 Última ejecución: FALLÓ', 'red');
        log('❌ Se detectaron vulnerabilidades críticas o altas', 'red');
        log('📋 Revisar el reporte y aplicar fixes', 'yellow');
      }
    } else {
      log('⏳ Última ejecución: EN PROGRESO', 'yellow');
    }
    
    log('');
    log('📋 PRÓXIMOS PASOS:', 'bright');
    log('1. Revisar el reporte completo en GitHub Actions', 'blue');
    log('2. Si hay vulnerabilidades, ejecutar: pnpm audit --fix', 'blue');
    log('3. Verificar compliance HIPAA con el script de emergencia', 'blue');
    log('4. Configurar notificaciones automáticas si es necesario', 'blue');
    
  } catch (error) {
    log('❌ Error al verificar workflow:', 'red');
    log(error.message, 'red');
  }
}

// Función para verificar si hay un token de GitHub configurado
function checkGitHubToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    log('⚠️ No se encontró GITHUB_TOKEN en variables de entorno', 'yellow');
    log('💡 Para acceso completo, configurar GITHUB_TOKEN', 'blue');
    log('   export GITHUB_TOKEN=tu_token_aqui', 'cyan');
  }
}

// Función principal
async function main() {
  log('🔒 ALTAMEDICA - VERIFICADOR DE WORKFLOW DE SEGURIDAD', 'bright');
  log('=' .repeat(60), 'blue');
  log('');
  
  checkGitHubToken();
  log('');
  
  await checkWorkflowStatus();
  
  log('');
  log('=' .repeat(60), 'blue');
  log('🏥 Sistema de Monitoreo de Seguridad - Altamedica', 'bright');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkWorkflowStatus }; 