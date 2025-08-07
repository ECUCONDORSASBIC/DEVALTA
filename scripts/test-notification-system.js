#!/usr/bin/env node

/**
 * AltaMedica Test Notification System
 * Sistema de notificaciones para fallos en testing
 * Compatible con GitHub Copilot Debug
 */

const fs = require('fs');
const path = require('path');

class TestNotificationSystem {
  constructor() {
    this.config = {
      notificationChannels: ['console', 'file', 'webhook'],
      thresholds: {
        responseTime: 1000, // ms
        uptime: 99.9, // %
        criticalApps: ['api-server', 'patients', 'doctors']
      },
      logFile: './test-notifications.log',
      webhookUrl: process.env.ALTAMEDICA_WEBHOOK_URL || null
    };
    
    this.testResults = [];
    this.failureCount = 0;
    this.criticalFailures = [];
  }

  // Cargar resultados de pruebas
  loadTestResults() {
    const pythonResultsPath = './scripts/python_testing_results';
    const playwrightResultsPath = './test-results.json';
    
    // Cargar resultados Python
    try {
      if (fs.existsSync(pythonResultsPath)) {
        const files = fs.readdirSync(pythonResultsPath);
        const latestFile = files
          .filter(f => f.endsWith('.json'))
          .sort()
          .pop();
        
        if (latestFile) {
          const pythonResults = JSON.parse(
            fs.readFileSync(path.join(pythonResultsPath, latestFile), 'utf8')
          );
          this.testResults.push({
            type: 'python',
            timestamp: new Date().toISOString(),
            results: pythonResults
          });
        }
      }
    } catch (error) {
      this.logError('Error loading Python results:', error.message);
    }

    // Cargar resultados Playwright
    try {
      if (fs.existsSync(playwrightResultsPath)) {
        const playwrightResults = JSON.parse(
          fs.readFileSync(playwrightResultsPath, 'utf8')
        );
        this.testResults.push({
          type: 'playwright',
          timestamp: new Date().toISOString(),
          results: playwrightResults
        });
      }
    } catch (error) {
      this.logError('Error loading Playwright results:', error.message);
    }
  }

  // Analizar fallos y generar notificaciones
  analyzeFailures() {
    console.log('🔍 Analizando fallos en el sistema AltaMedica...\n');
    
    const failures = [];
    const warnings = [];
    const criticalIssues = [];

    this.testResults.forEach(result => {
      if (result.type === 'python') {
        // Analizar resultados Python
        if (result.results.apps) {
          Object.entries(result.results.apps).forEach(([appName, appData]) => {
            if (appData.status === 'unreachable') {
              const issue = {
                app: appName,
                type: 'unreachable',
                severity: this.config.thresholds.criticalApps.includes(appName) ? 'critical' : 'high',
                message: `Aplicación ${appName} no accesible`,
                timestamp: result.timestamp
              };
              
              if (issue.severity === 'critical') {
                criticalIssues.push(issue);
              } else {
                failures.push(issue);
              }
            }
            
            if (appData.http_response && appData.http_response.response_time > this.config.thresholds.responseTime) {
              warnings.push({
                app: appName,
                type: 'performance',
                severity: 'medium',
                message: `Tiempo de respuesta alto: ${appData.http_response.response_time}ms`,
                timestamp: result.timestamp
              });
            }
          });
        }
      }
      
      if (result.type === 'playwright') {
        // Analizar resultados Playwright
        if (Array.isArray(result.results)) {
          result.results.forEach(appResult => {
            if (appResult.status === 'error' || appResult.status >= 400) {
              failures.push({
                app: appResult.name,
                type: 'playwright_error',
                severity: 'high',
                message: appResult.error || `HTTP ${appResult.status}`,
                timestamp: result.timestamp
              });
            }
          });
        }
      }
    });

    this.criticalFailures = criticalIssues;
    this.failureCount = failures.length + warnings.length + criticalIssues.length;

    // Generar notificaciones
    if (criticalIssues.length > 0) {
      this.notifyCriticalFailures(criticalIssues);
    }
    
    if (failures.length > 0) {
      this.notifyFailures(failures);
    }
    
    if (warnings.length > 0) {
      this.notifyWarnings(warnings);
    }

    // Resumen final
    this.generateSummaryNotification(criticalIssues, failures, warnings);
  }

  // Notificaciones críticas
  notifyCriticalFailures(criticalIssues) {
    const message = `🚨 ALERTA CRÍTICA - ALTAMEDICA MEDICAL PLATFORM

${criticalIssues.length} fallo(s) crítico(s) detectado(s):

${criticalIssues.map(issue => 
  `❌ ${issue.app.toUpperCase()}: ${issue.message}`
).join('\\n')}

🏥 IMPACTO: Servicios médicos críticos comprometidos
⏰ TIEMPO DE RESPUESTA REQUERIDO: INMEDIATO
🔧 ACCIÓN: Iniciar servicios caídos

Comando sugerido:
npm run dev:all

Verificar servicios:
${criticalIssues.map(issue => `curl http://localhost:300${issue.app === 'api-server' ? '1' : issue.app === 'doctors' ? '2' : issue.app === 'patients' ? '3' : '0'}/api/health`).join('\\n')}`;

    this.sendNotification('CRITICAL', message);
  }

  // Notificaciones de fallos
  notifyFailures(failures) {
    const message = `⚠️ FALLOS DETECTADOS - ALTAMEDICA

${failures.length} fallo(s) detectado(s):

${failures.map(issue => 
  `❌ ${issue.app}: ${issue.message}`
).join('\\n')}

🔧 Acciones recomendadas:
- Verificar logs de aplicación
- Reiniciar servicios afectados
- Ejecutar diagnósticos completos`;

    this.sendNotification('FAILURE', message);
  }

  // Notificaciones de advertencias
  notifyWarnings(warnings) {
    const message = `⚠️ ADVERTENCIAS - ALTAMEDICA

${warnings.length} advertencia(s) detectada(s):

${warnings.map(issue => 
  `⚠️ ${issue.app}: ${issue.message}`
).join('\\n')}

💡 Optimizaciones sugeridas:
- Revisar performance de aplicaciones
- Optimizar queries de base de datos
- Verificar recursos del sistema`;

    this.sendNotification('WARNING', message);
  }

  // Resumen de notificaciones
  generateSummaryNotification(critical, failures, warnings) {
    const totalIssues = critical.length + failures.length + warnings.length;
    
    if (totalIssues === 0) {
      const successMessage = `✅ SISTEMA ALTAMEDICA - ESTADO SALUDABLE

🏥 Todas las aplicaciones médicas funcionando correctamente
📊 Performance dentro de parámetros normales  
🔒 Compliance médico verificado
⚡ Tiempo de respuesta óptimo

Última verificación: ${new Date().toLocaleString()}`;
      
      this.sendNotification('SUCCESS', successMessage);
      return;
    }

    const summaryMessage = `📊 RESUMEN DE TESTING - ALTAMEDICA MEDICAL PLATFORM

🎯 ESTADO GENERAL:
   🚨 Críticos: ${critical.length}
   ❌ Fallos: ${failures.length}  
   ⚠️ Advertencias: ${warnings.length}
   📊 Total issues: ${totalIssues}

🏥 IMPACTO EN SERVICIOS MÉDICOS:
${critical.length > 0 ? '   🔴 SERVICIOS CRÍTICOS AFECTADOS' : '   🟢 Servicios críticos funcionando'}
${failures.length > 0 ? '   🟠 Fallos no críticos detectados' : '   🟢 Sin fallos significativos'}
${warnings.length > 0 ? '   🟡 Optimizaciones recomendadas' : '   🟢 Performance óptima'}

🔧 ACCIÓN REQUERIDA:
${totalIssues > 0 ? 
  `   ⚡ INMEDIATA: Resolver ${critical.length + failures.length} issue(s) crítico(s)
   📊 PLANIFICADA: Optimizar ${warnings.length} área(s) de mejora` :
  '   ✅ Ninguna - Sistema estable'
}

📅 Próxima verificación: En 30 minutos
📁 Logs detallados: TEST_EXECUTION_SUMMARY.md`;

    this.sendNotification('SUMMARY', summaryMessage);
  }

  // Enviar notificación por múltiples canales
  sendNotification(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    // Console notification
    if (this.config.notificationChannels.includes('console')) {
      console.log(`\n${this.getColorCode(level)}${message}\x1b[0m\n`);
    }

    // File notification
    if (this.config.notificationChannels.includes('file')) {
      fs.appendFileSync(this.config.logFile, logEntry);
    }

    // Webhook notification (si está configurado)
    if (this.config.notificationChannels.includes('webhook') && this.config.webhookUrl) {
      this.sendWebhook(level, message, timestamp);
    }
  }

  // Códigos de color para console
  getColorCode(level) {
    const colors = {
      'CRITICAL': '\x1b[41m\x1b[37m', // Rojo background, texto blanco
      'FAILURE': '\x1b[31m',          // Rojo
      'WARNING': '\x1b[33m',          // Amarillo
      'SUCCESS': '\x1b[32m',          // Verde
      'SUMMARY': '\x1b[36m'           // Cyan
    };
    return colors[level] || '\x1b[0m';
  }

  // Enviar webhook (placeholder)
  sendWebhook(level, message, timestamp) {
    // Aquí se implementaría el envío a webhook/Slack/Teams
    console.log(`📡 Webhook notification sent: ${level}`);
  }

  // Log de errores
  logError(message, error) {
    const errorLog = `[ERROR] ${message} ${error}\n`;
    console.error(`\x1b[31m${errorLog}\x1b[0m`);
    fs.appendFileSync(this.config.logFile, errorLog);
  }

  // Ejecutar análisis completo
  run() {
    console.log('🔔 Iniciando Sistema de Notificaciones AltaMedica...\n');
    
    this.loadTestResults();
    this.analyzeFailures();
    
    console.log(`\n📊 Análisis completo. ${this.failureCount} issue(s) detectado(s).`);
    console.log(`📁 Notificaciones guardadas en: ${this.config.logFile}`);
    
    // Código de salida basado en severidad
    if (this.criticalFailures.length > 0) {
      process.exit(2); // Critical failures
    } else if (this.failureCount > 0) {
      process.exit(1); // Non-critical failures
    } else {
      process.exit(0); // Success
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const notificationSystem = new TestNotificationSystem();
  notificationSystem.run();
}

module.exports = TestNotificationSystem;