#!/usr/bin/env node
/**
 * @fileoverview Sistema de monitoreo continuo de hooks
 * @description Monitorea cambios en tiempo real y detecta regresiones
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const HooksUsageAnalyzer = require('./analyze-hooks-usage');

class HooksMonitor {
  constructor() {
    this.analyzer = new HooksUsageAnalyzer();
    this.lastResults = null;
    this.metricsHistory = [];
    this.isRunning = false;
  }

  /**
   * Inicia monitoreo continuo
   */
  async startMonitoring() {
    console.log('🚀 Iniciando monitoreo continuo de hooks...');
    this.isRunning = true;

    // Análisis inicial
    await this.runAnalysis();
    
    // Configurar watchers para archivos relevantes
    this.setupFileWatchers();
    
    // Análisis periódico cada 5 minutos
    setInterval(() => {
      if (this.isRunning) {
        this.runAnalysis();
      }
    }, 5 * 60 * 1000);

    console.log('✅ Monitoreo iniciado. Presiona Ctrl+C para detener.');
  }

  /**
   * Configura watchers para archivos relevantes
   */
  setupFileWatchers() {
    const watchPaths = [
      'packages/hooks/src/**/*.{ts,tsx}',
      'apps/*/src/**/*.{ts,tsx,js,jsx}',
      'apps/*/package.json'
    ];

    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignorar archivos ocultos
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => this.onFileChange('added', filePath))
      .on('change', (filePath) => this.onFileChange('modified', filePath))
      .on('unlink', (filePath) => this.onFileChange('deleted', filePath));

    console.log('👀 Monitoreando archivos para cambios...');
  }

  /**
   * Maneja cambios en archivos
   */
  async onFileChange(event, filePath) {
    console.log(`📝 Archivo ${event}: ${filePath}`);

    // Si es un archivo de hook, analizar inmediatamente
    if (filePath.includes('packages/hooks/src') || 
        filePath.includes('/hooks/') ||
        filePath.includes('package.json')) {
      
      console.log('🔄 Ejecutando análisis por cambio en archivo crítico...');
      await this.runAnalysis();
    }
  }

  /**
   * Ejecuta análisis y compara con resultados anteriores
   */
  async runAnalysis() {
    try {
      console.log(`📊 Ejecutando análisis... (${new Date().toLocaleTimeString()})`);
      
      await this.analyzer.analyze();
      const currentResults = this.analyzer.results;
      
      if (this.lastResults) {
        await this.compareResults(this.lastResults, currentResults);
      }
      
      await this.updateMetrics(currentResults);
      this.lastResults = currentResults;
      
    } catch (error) {
      console.error('❌ Error en análisis:', error.message);
    }
  }

  /**
   * Compara resultados y detecta cambios significativos
   */
  async compareResults(previous, current) {
    const changes = {
      hooksAdded: current.totalHooks - previous.totalHooks,
      usageChange: current.usedHooks.size - previous.usedHooks.size,
      duplicationsChange: current.duplicatedHooks.size - previous.duplicatedHooks.size,
      dependencyIssuesChange: current.dependencyIssues.length - previous.dependencyIssues.length
    };

    let hasSignificantChanges = false;

    // Detectar cambios significativos
    if (Math.abs(changes.hooksAdded) >= 5) {
      console.log(`🔥 CAMBIO SIGNIFICATIVO: ${changes.hooksAdded > 0 ? '+' : ''}${changes.hooksAdded} hooks`);
      hasSignificantChanges = true;
    }

    if (Math.abs(changes.usageChange) >= 2) {
      console.log(`📈 CAMBIO EN USO: ${changes.usageChange > 0 ? '+' : ''}${changes.usageChange} hooks utilizados`);
      hasSignificantChanges = true;
    }

    if (changes.duplicationsChange > 0) {
      console.log(`⚠️ REGRESIÓN: +${changes.duplicationsChange} hooks duplicados`);
      hasSignificantChanges = true;
    }

    if (changes.dependencyIssuesChange > 0) {
      console.log(`🚨 PROBLEMAS: +${changes.dependencyIssuesChange} issues de dependencias`);
      hasSignificantChanges = true;
    }

    // Mejoras positivas
    if (changes.usageChange > 0 || changes.duplicationsChange < 0) {
      console.log(`✅ MEJORA: ${changes.usageChange > 0 ? 'Más uso' : ''} ${changes.duplicationsChange < 0 ? 'Menos duplicación' : ''}`);
    }

    if (hasSignificantChanges) {
      await this.generateAlertReport(changes);
    }
  }

  /**
   * Actualiza métricas históricas
   */
  async updateMetrics(results) {
    const metrics = {
      timestamp: new Date().toISOString(),
      totalHooks: results.totalHooks,
      usedHooks: results.usedHooks.size,
      usagePercentage: (results.usedHooks.size / results.totalHooks * 100).toFixed(1),
      duplicatedHooks: results.duplicatedHooks.size,
      dependencyIssues: results.dependencyIssues.length,
      health: this.calculateHealthScore(results)
    };

    this.metricsHistory.push(metrics);

    // Mantener solo últimas 24 horas de métricas (288 puntos si cada 5 min)
    if (this.metricsHistory.length > 288) {
      this.metricsHistory = this.metricsHistory.slice(-288);
    }

    // Guardar métricas
    const metricsPath = path.join(__dirname, '..', 'hooks-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify({
      current: metrics,
      history: this.metricsHistory
    }, null, 2));

    console.log(`📊 Métricas actualizadas - Salud: ${metrics.health}% | Uso: ${metrics.usagePercentage}%`);
  }

  /**
   * Calcula score de salud del sistema de hooks
   */
  calculateHealthScore(results) {
    let score = 100;

    // Penalizar por bajo uso (objetivo: >20%)
    const usagePercentage = (results.usedHooks.size / results.totalHooks * 100);
    if (usagePercentage < 20) {
      score -= (20 - usagePercentage) * 2;
    }

    // Penalizar por duplicaciones (objetivo: <5)
    if (results.duplicatedHooks.size > 5) {
      score -= (results.duplicatedHooks.size - 5) * 5;
    }

    // Penalizar por problemas de dependencias
    score -= results.dependencyIssues.length * 10;

    // Bonificar por buen uso
    if (usagePercentage > 30) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Genera reporte de alerta por cambios significativos
   */
  async generateAlertReport(changes) {
    const alertReport = `# 🚨 ALERTA: Cambios Significativos en Hooks

**Timestamp**: ${new Date().toISOString()}

## Cambios Detectados
- **Hooks totales**: ${changes.hooksAdded > 0 ? '+' : ''}${changes.hooksAdded}
- **Uso**: ${changes.usageChange > 0 ? '+' : ''}${changes.usageChange}
- **Duplicaciones**: ${changes.duplicationsChange > 0 ? '+' : ''}${changes.duplicationsChange}
- **Problemas**: ${changes.dependencyIssuesChange > 0 ? '+' : ''}${changes.dependencyIssuesChange}

## Acciones Recomendadas
${changes.duplicationsChange > 0 ? '- ⚠️ Investigar nuevas duplicaciones' : ''}
${changes.dependencyIssuesChange > 0 ? '- 🔧 Resolver problemas de dependencias' : ''}
${changes.usageChange < -2 ? '- 📉 Investigar reducción en uso de hooks' : ''}

---
*Generado automáticamente por HooksMonitor*
`;

    const alertPath = path.join(__dirname, '..', `hooks-alert-${Date.now()}.md`);
    fs.writeFileSync(alertPath, alertReport);
    
    console.log(`🚨 Reporte de alerta generado: ${alertPath}`);
  }

  /**
   * Genera dashboard HTML en tiempo real
   */
  async generateDashboard() {
    if (this.metricsHistory.length === 0) return;

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const chartData = this.metricsHistory.slice(-20); // Últimos 20 puntos

    const dashboardHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>AltaMedica Hooks Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .health-${latest.health >= 80 ? 'good' : latest.health >= 60 ? 'warning' : 'critical'} { 
            color: ${latest.health >= 80 ? '#4CAF50' : latest.health >= 60 ? '#FF9800' : '#F44336'}; 
        }
        .chart-container { position: relative; height: 400px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 AltaMedica Hooks Dashboard</h1>
        <p><strong>Última actualización:</strong> ${latest.timestamp}</p>
        
        <div class="card">
            <h2>📊 Métricas Actuales</h2>
            <div class="metric">
                <div class="metric-value health-${latest.health >= 80 ? 'good' : latest.health >= 60 ? 'warning' : 'critical'}">${latest.health}%</div>
                <div class="metric-label">Salud del Sistema</div>
            </div>
            <div class="metric">
                <div class="metric-value">${latest.usagePercentage}%</div>
                <div class="metric-label">Hooks Utilizados</div>
            </div>
            <div class="metric">
                <div class="metric-value">${latest.totalHooks}</div>
                <div class="metric-label">Total Hooks</div>
            </div>
            <div class="metric">
                <div class="metric-value">${latest.duplicatedHooks}</div>
                <div class="metric-label">Duplicaciones</div>
            </div>
        </div>

        <div class="card">
            <h2>📈 Tendencias (Últimas ${chartData.length} mediciones)</h2>
            <div class="chart-container">
                <canvas id="trendsChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h2>🎯 Objetivos</h2>
            <ul>
                <li>✅ Uso de hooks > 20%: <strong>${latest.usagePercentage > 20 ? 'CUMPLIDO' : 'PENDIENTE'}</strong></li>
                <li>✅ Duplicaciones < 5: <strong>${latest.duplicatedHooks < 5 ? 'CUMPLIDO' : 'PENDIENTE'}</strong></li>
                <li>✅ Problemas = 0: <strong>${latest.dependencyIssues === 0 ? 'CUMPLIDO' : 'PENDIENTE'}</strong></li>
                <li>✅ Salud > 80%: <strong>${latest.health > 80 ? 'CUMPLIDO' : 'PENDIENTE'}</strong></li>
            </ul>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('trendsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(chartData.map(d => new Date(d.timestamp).toLocaleTimeString()))},
                datasets: [{
                    label: 'Salud del Sistema (%)',
                    data: ${JSON.stringify(chartData.map(d => d.health))},
                    borderColor: '#4CAF50',
                    tension: 0.1
                }, {
                    label: 'Uso de Hooks (%)',
                    data: ${JSON.stringify(chartData.map(d => parseFloat(d.usagePercentage)))},
                    borderColor: '#2196F3',
                    tension: 0.1
                }, {
                    label: 'Duplicaciones',
                    data: ${JSON.stringify(chartData.map(d => d.duplicatedHooks))},
                    borderColor: '#FF9800',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    const dashboardPath = path.join(__dirname, '..', 'hooks-dashboard.html');
    fs.writeFileSync(dashboardPath, dashboardHTML);
  }

  /**
   * Detiene el monitoreo
   */
  stopMonitoring() {
    this.isRunning = false;
    console.log('🛑 Monitoreo detenido.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const monitor = new HooksMonitor();
  
  // Manejar señales de salida
  process.on('SIGINT', () => {
    monitor.stopMonitoring();
    process.exit(0);
  });

  // Generar dashboard cada minuto
  setInterval(() => {
    if (monitor.isRunning) {
      monitor.generateDashboard();
    }
  }, 60 * 1000);

  monitor.startMonitoring().catch(console.error);
}

module.exports = HooksMonitor;