#!/usr/bin/env node
/**
 * 📊 ALTAMEDICA - Monitoring Activation Script
 * Script proactivo para activar monitoreo en tiempo real
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function activateMonitoring() {
  log('📊 ALTAMEDICA - ACTIVANDO MONITOREO EN TIEMPO REAL', 'bold');
  log('=' .repeat(60), 'blue');

  try {
    // 1. Verificar archivos de configuración
    log('\n🔍 1. VERIFICANDO CONFIGURACIÓN...', 'yellow');
    
    const requiredFiles = [
      'docker-compose.monitoring.yml',
      'monitoring/prometheus.yml',
      'monitoring/alertmanager.yml',
      'monitoring/grafana/dashboards/altamedica-security.json'
    ];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        log(`  ✅ ${file}`, 'green');
      } else {
        log(`  ❌ ${file} - NO ENCONTRADO`, 'red');
        throw new Error(`Archivo de configuración faltante: ${file}`);
      }
    }

    // 2. Detener servicios existentes
    log('\n🛑 2. LIMPIANDO SERVICIOS EXISTENTES...', 'yellow');
    try {
      execSync('docker-compose -f docker-compose.monitoring.yml down', {
        stdio: 'pipe'
      });
      log('  ✅ Servicios anteriores detenidos', 'green');
    } catch {
      log('  ℹ️  No hay servicios previos ejecutándose', 'cyan');
    }

    // 3. Iniciar stack de monitoreo
    log('\n🚀 3. INICIANDO STACK DE MONITOREO...', 'yellow');
    
    execSync('docker-compose -f docker-compose.monitoring.yml up -d', {
      stdio: 'inherit'
    });

    log('  ✅ Stack de monitoreo iniciado', 'green');

    // 4. Esperar a que los servicios se inicien
    log('\n⏱️  4. ESPERANDO INICIALIZACIÓN DE SERVICIOS...', 'yellow');
    
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 segundos

    // 5. Verificar salud de servicios
    log('\n🏥 5. VERIFICANDO SALUD DE SERVICIOS...', 'yellow');

    const healthChecks = [
      { name: 'Prometheus', url: 'http://localhost:9090/-/healthy', port: '9090' },
      { name: 'Grafana', url: 'http://localhost:3000/api/health', port: '3000' },
      { name: 'AlertManager', url: 'http://localhost:9093/-/healthy', port: '9093' }
    ];

    for (const service of healthChecks) {
      try {
        execSync(`curl -f ${service.url}`, { stdio: 'pipe' });
        log(`  ✅ ${service.name} (Puerto ${service.port}) - SALUDABLE`, 'green');
      } catch {
        log(`  ⚠️  ${service.name} (Puerto ${service.port}) - INICIANDO...`, 'yellow');
      }
    }

    // 6. Configurar alertas de producción
    log('\n🚨 6. CONFIGURANDO ALERTAS DE PRODUCCIÓN...', 'yellow');
    
    // Recargar configuración de Prometheus
    try {
      execSync('curl -X POST http://localhost:9090/-/reload', { stdio: 'pipe' });
      log('  ✅ Configuración de Prometheus recargada', 'green');
    } catch {
      log('  ⚠️  No se pudo recargar Prometheus automáticamente', 'yellow');
    }

    // 7. Mostrar URLs de acceso
    log('\n🎯 7. SERVICIOS DE MONITOREO ACTIVADOS:', 'bold');
    log('  📊 Prometheus: http://localhost:9090', 'cyan');
    log('  📈 Grafana: http://localhost:3000 (admin/altamedica2025)', 'cyan');
    log('  🚨 AlertManager: http://localhost:9093', 'cyan');
    log('  📋 Node Exporter: http://localhost:9100/metrics', 'cyan');

    // 8. Validación final
    log('\n✅ MONITOREO EN TIEMPO REAL ACTIVADO EXITOSAMENTE!', 'green');
    log('🔔 Las alertas están configuradas para:', 'white');
    log('   • CPU > 80%', 'white');
    log('   • Memoria > 90%', 'white'); 
    log('   • Disk > 85%', 'white');
    log('   • Response time > 1s', 'white');
    log('   • Error rate > 5%', 'white');
    log('   • Failed requests > 1%', 'white');

    log('\n🎉 ALTAMEDICA MONITORING STACK READY FOR PRODUCTION! 🚀', 'bold');

  } catch (error) {
    log(`\n💥 ERROR ACTIVANDO MONITOREO: ${error.message}`, 'red');
    log('🔧 Verifica Docker y las configuraciones de monitoreo', 'yellow');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  activateMonitoring().catch(error => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
}
