/**
 * Script para verificar el estado del workflow de seguridad en GitHub Actions
 * Altamedica - Sistema de Monitoreo de Seguridad
 */

const https = require('https');

// Configuración
const REPO_OWNER = 'ECUCONDORSASBIC';
const REPO_NAME = 'devaltamedica';

function log(message) {
  console.log(message);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
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
  log('🔍 Verificando estado del workflow de seguridad...');
  log('📅 Timestamp: ' + new Date().toISOString());
  log('');
  
  try {
    // URL para obtener los workflows
    const workflowsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows`;
    
    log('📡 Consultando workflows disponibles...');
    const workflowsResponse = await makeRequest(workflowsUrl);
    
    if (workflowsResponse.status !== 200) {
      log('❌ Error al consultar workflows');
      log(`Status: ${workflowsResponse.status}`);
      return;
    }
    
    const workflows = workflowsResponse.data.workflows;
    const securityWorkflow = workflows.find(w => w.name.includes('Security Audit'));
    
    if (!securityWorkflow) {
      log('❌ Workflow de seguridad no encontrado');
      return;
    }
    
    log(`✅ Workflow encontrado: ${securityWorkflow.name}`);
    log(`🆔 ID: ${securityWorkflow.id}`);
    log('');
    
    // Obtener ejecuciones recientes
    const runsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${securityWorkflow.id}/runs?per_page=3`;
    
    log('📊 Consultando ejecuciones recientes...');
    const runsResponse = await makeRequest(runsUrl);
    
    if (runsResponse.status !== 200) {
      log('❌ Error al consultar ejecuciones');
      return;
    }
    
    const runs = runsResponse.data.workflow_runs;
    
    if (runs.length === 0) {
      log('⚠️ No hay ejecuciones recientes del workflow');
      return;
    }
    
    log(`📋 Últimas ${runs.length} ejecuciones:`);
    log('');
    
    runs.forEach((run, index) => {
      const status = run.status;
      const conclusion = run.conclusion;
      const createdAt = new Date(run.created_at).toLocaleString('es-ES');
      const branch = run.head_branch;
      
      let statusIcon = '⏳';
      if (status === 'completed') {
        if (conclusion === 'success') {
          statusIcon = '✅';
        } else if (conclusion === 'failure') {
          statusIcon = '❌';
        } else {
          statusIcon = '⚠️';
        }
      }
      
      log(`${index + 1}. ${statusIcon} Ejecución #${run.run_number}`);
      log(`   📅 Creada: ${createdAt}`);
      log(`   🌿 Branch: ${branch}`);
      log(`   📊 Estado: ${status}`);
      if (conclusion) {
        log(`   🎯 Conclusión: ${conclusion}`);
      }
      log(`   🔗 URL: ${run.html_url}`);
      log('');
    });
    
    // Verificar la última ejecución
    const latestRun = runs[0];
    
    if (latestRun.status === 'completed') {
      if (latestRun.conclusion === 'success') {
        log('🎉 Última ejecución: EXITOSA');
        log('✅ No se detectaron vulnerabilidades críticas o altas');
      } else if (latestRun.conclusion === 'failure') {
        log('🚨 Última ejecución: FALLÓ');
        log('❌ Se detectaron vulnerabilidades críticas o altas');
        log('📋 Revisar el reporte y aplicar fixes');
      }
    } else {
      log('⏳ Última ejecución: EN PROGRESO');
    }
    
    log('');
    log('📋 PRÓXIMOS PASOS:');
    log('1. Revisar el reporte completo en GitHub Actions');
    log('2. Si hay vulnerabilidades, ejecutar: pnpm audit --fix');
    log('3. Verificar compliance HIPAA con el script de emergencia');
    
  } catch (error) {
    log('❌ Error al verificar workflow:');
    log(error.message);
  }
}

// Función principal
async function main() {
  log('🔒 ALTAMEDICA - VERIFICADOR DE WORKFLOW DE SEGURIDAD');
  log('=' .repeat(60));
  log('');
  
  await checkWorkflowStatus();
  
  log('');
  log('=' .repeat(60));
  log('🏥 Sistema de Monitoreo de Seguridad - Altamedica');
}

// Ejecutar
main().catch(console.error); 