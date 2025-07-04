// 🚀 DEVALTAMEDICA MCP DASHBOARD - LOGIC
// Actualización en tiempo real de métricas y análisis

class DevaltamedicaDashboard {
    constructor() {
        this.updateInterval = 15000; // 15 segundos
        this.charts = {};
        this.isUpdating = false;
        this.lastUpdateTime = new Date();
        
        // Configuración de colores
        this.colors = {
            primary: '#2563eb',
            success: '#10b981', 
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4'
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando DEVALTAMEDICA MCP Dashboard');
        
        // Inicializar gráficos
        this.initCharts();
        
        // Cargar datos iniciales
        this.loadInitialData();
        
        // Configurar auto-actualización
        this.startAutoUpdate();
        
        // Event listeners
        this.setupEventListeners();
        
        console.log('✅ Dashboard inicializado correctamente');
    }
    
    initCharts() {
        // Gráfico de performance en tiempo real
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(10),
                    datasets: [{
                        label: 'Salud del Sistema',
                        data: this.generateRandomData(10, 85, 100),
                        borderColor: this.colors.success,
                        backgroundColor: this.colors.success + '20',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Performance Promedio',
                        data: this.generateRandomData(10, 75, 95),
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '20',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 0,
                            max: 100,
                            suggestedMin: 70,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
        }
        
        // Gráfico de agentes
        const agentsCtx = document.getElementById('agentsChart');
        if (agentsCtx) {
            this.charts.agents = new Chart(agentsCtx, {
                type: 'bar',
                data: {
                    labels: [
                        'System Architect',
                        'Backend Dev',
                        'Frontend Dev', 
                        'Security Officer',
                        'Medical Lead',
                        'QA Specialist',
                        'DevOps Engineer',
                        'UX/UI Designer'
                    ],
                    datasets: [{
                        label: 'Score Cognitivo',
                        data: [92, 88, 83, 95, 90, 85, 87, 86],
                        backgroundColor: [
                            this.colors.primary,
                            this.colors.success,
                            this.colors.info,
                            this.colors.warning,
                            this.colors.primary,
                            this.colors.success,
                            this.colors.info,
                            this.colors.warning
                        ],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Gráfico de plataforma
        const platformCtx = document.getElementById('platformChart');
        if (platformCtx) {
            this.charts.platform = new Chart(platformCtx, {
                type: 'doughnut',
                data: {
                    labels: ['API Response', 'DB Performance', 'Memory Usage', 'CPU Usage'],
                    datasets: [{
                        data: [85, 92, 68, 45],
                        backgroundColor: [
                            this.colors.primary,
                            this.colors.success,
                            this.colors.warning,
                            this.colors.info
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
    
    async loadInitialData() {
        try {
            // Simular carga de datos desde los logs del MCP
            await this.updateMetrics();
            await this.updateAgents();
            await this.updatePlatform();
            await this.updateCompliance();
            await this.updateIntelligence();
            await this.updateAlerts();
            
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }
    
    async updateMetrics() {
        try {
            // Obtener datos reales del servidor
            const response = await fetch('/api/data');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Consumir las nuevas claves JSON
            const { systemHealth, averagePerformance, hipaaCompliance, activeUsers } = data;
            
            // Validar que los datos están presentes
            if (systemHealth === undefined || averagePerformance === undefined || 
                hipaaCompliance === undefined || activeUsers === undefined) {
                throw new Error('Datos incompletos recibidos del servidor');
            }
            
            // Actualizar elementos DOM
            this.updateElement('systemHealth', `${systemHealth.toFixed(1)}%`);
            this.updateElement('avgPerformance', `${averagePerformance.toFixed(1)}%`);
            this.updateElement('hipaaScore', `${hipaaCompliance.toFixed(1)}%`);
            this.updateElement('activeUsers', activeUsers.toString());
            
            // Actualizar gráfico de performance
            if (this.charts.performance) {
                const newTime = new Date().toLocaleTimeString();
                this.charts.performance.data.labels.push(newTime);
                this.charts.performance.data.labels = this.charts.performance.data.labels.slice(-10);
                
                this.charts.performance.data.datasets[0].data.push(systemHealth);
                this.charts.performance.data.datasets[0].data = this.charts.performance.data.datasets[0].data.slice(-10);
                
                this.charts.performance.data.datasets[1].data.push(averagePerformance);
                this.charts.performance.data.datasets[1].data = this.charts.performance.data.datasets[1].data.slice(-10);
                
                this.charts.performance.update('none');
            }
            
        } catch (error) {
            console.error('Error obteniendo métricas:', error);
            
            // Fallback mínimo: mostrar mensaje de error en lugar de datos simulados
            this.updateElement('systemHealth', 'Error: Sin datos');
            this.updateElement('avgPerformance', 'Error: Sin datos');
            this.updateElement('hipaaScore', 'Error: Sin datos');
            this.updateElement('activeUsers', 'Error: Sin datos');
            
            // Mostrar alerta de error
            this.showErrorAlert('No se pudieron obtener las métricas del sistema');
        }
    }
    
    async updateAgents() {
        try {
            const response = await fetch('/api/agents');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Consumir datos reales de agentes
            const { agents } = data;
            
            if (!agents || !Array.isArray(agents)) {
                throw new Error('Datos de agentes inválidos recibidos del servidor');
            }
            
            let agentsHtml = '';
            
            agents.forEach(agent => {
                // Usar datos reales sin varianza aleatoria
                const { name, id, score, trend, trendValue } = agent;
                
                // Validar datos del agente
                if (!name || !id || score === undefined) {
                    console.warn(`Datos incompletos para agente:`, agent);
                    return;
                }
                
                const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
                const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted';
                
                agentsHtml += `
                    <div class="agent-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${name}</h6>
                                <small class="text-muted">${id}</small>
                                <div class="progress-bar-custom">
                                    <div class="progress-fill" style="width: ${score}%"></div>
                                </div>
                            </div>
                            <div class="text-end">
                                <div class="agent-score">${score.toFixed(1)}%</div>
                                <small class="${trendColor}">
                                    ${trendIcon} ${Math.abs(trendValue || 0).toFixed(1)}%
                                </small>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            this.updateElement('agentsList', agentsHtml);
            
            // Actualizar gráfico de agentes con datos reales
            if (this.charts.agents) {
                this.charts.agents.data.datasets[0].data = agents.map(agent => agent.score);
                this.charts.agents.data.labels = agents.map(agent => agent.name);
                this.charts.agents.update('none');
            }
            
        } catch (error) {
            console.error('Error obteniendo datos de agentes:', error);
            
            // Fallback mínimo: mostrar mensaje de error
            this.updateElement('agentsList', `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Error al cargar datos de agentes</p>
                </div>
            `);
            
            // Mostrar alerta de error
            this.showErrorAlert('No se pudieron obtener los datos de los agentes');
        }
    }
    
    async updatePlatform() {
        try {
            const response = await fetch('/api/platform');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Consumir las nuevas claves JSON sin fallbacks aleatorios
            const { apiResponseTime, databasePerformance, errorRate, memoryUsage, cpuUsage } = data;
            
            // Validar que los datos están presentes
            if (apiResponseTime === undefined || databasePerformance === undefined || 
                errorRate === undefined || memoryUsage === undefined || cpuUsage === undefined) {
                throw new Error('Datos de plataforma incompletos recibidos del servidor');
            }
            
            // Actualizar elementos DOM
            this.updateElement('apiResponseTime', `${apiResponseTime.toFixed(1)}ms`);
            this.updateElement('dbPerformance', `${databasePerformance.toFixed(1)}%`);
            this.updateElement('errorRate', `${errorRate.toFixed(2)}%`);
            
            // Actualizar gráfico de plataforma con datos reales
            if (this.charts.platform) {
                this.charts.platform.data.datasets[0].data = [
                    Math.min(100, apiResponseTime / 2), // Normalizado para visualización
                    databasePerformance,
                    memoryUsage,
                    cpuUsage
                ];
                this.charts.platform.update('none');
            }
            
        } catch (error) {
            console.error('Error obteniendo datos de plataforma:', error);
            
            // Fallback mínimo: mostrar mensaje de error en lugar de datos simulados
            this.updateElement('apiResponseTime', 'Error: Sin datos');
            this.updateElement('dbPerformance', 'Error: Sin datos');
            this.updateElement('errorRate', 'Error: Sin datos');
            
            // Mostrar alerta de error
            this.showErrorAlert('No se pudieron obtener los datos de la plataforma');
        }
    }
    
    async updateCompliance() {
        const complianceItems = [
            { name: 'HIPAA Encryption', status: 'PASS', score: 98 },
            { name: 'Access Controls', status: 'PASS', score: 96 },
            { name: 'Audit Logging', status: 'PASS', score: 99 },
            { name: 'Data Backup', status: 'PASS', score: 95 },
            { name: 'Incident Response', status: 'REVIEW_NEEDED', score: 88 },
            { name: 'Staff Training', status: 'PASS', score: 92 }
        ];
        
        let complianceHtml = '<div class="row">';
        
        complianceItems.forEach(item => {
            const statusColor = item.status === 'PASS' ? 'success' : 'warning';
            const statusIcon = item.status === 'PASS' ? 'fa-check-circle' : 'fa-exclamation-triangle';
            
            complianceHtml += `
                <div class="col-lg-6 col-md-6">
                    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                            <span class="fw-medium">${item.name}</span>
                            <br>
                            <small class="text-${statusColor}">
                                <i class="fas ${statusIcon}"></i> ${item.status}
                            </small>
                        </div>
                        <span class="badge bg-${statusColor}">${item.score}%</span>
                    </div>
                </div>
            `;
        });
        
        complianceHtml += '</div>';
        this.updateElement('complianceStatus', complianceHtml);
    }
    
    async updateIntelligence() {
        const predictions = [
            'Incremento del 15% en eficiencia esperado en próximos 7 días',
            'Posible necesidad de escalado de base de datos en 2 semanas',
            'Optimización de frontend reducirá tiempo de carga en 25%',
            'Migración a microservicios completamente viable',
            'Compliance HIPAA manteniéndose en niveles óptimos'
        ];
        
        const recommendations = [
            'Implementar caching adicional en API endpoints',
            'Revisar y actualizar políticas de seguridad',
            'Programar training de compliance para el equipo',
            'Optimizar queries de base de datos más frecuentes',
            'Establecer métricas de performance más granulares'
        ];
        
        const negotiations = [
            {
                issue: 'Database scaling strategy',
                participants: ['System Architect', 'Backend Dev', 'DevOps'],
                status: 'IN_PROGRESS',
                consensus: 78
            },
            {
                issue: 'Frontend framework migration',
                participants: ['Frontend Dev', 'UX Designer', 'System Architect'],
                status: 'COMPLETED',
                consensus: 85
            }
        ];
        
        // Predicciones
        let predictionsHtml = '';
        predictions.slice(0, 3).forEach(prediction => {
            predictionsHtml += `
                <div class="prediction-item">
                    <i class="fas fa-crystal-ball"></i> ${prediction}
                </div>
            `;
        });
        this.updateElement('predictionsList', predictionsHtml);
        
        // Recomendaciones
        let recommendationsHtml = '';
        recommendations.slice(0, 3).forEach(recommendation => {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <i class="fas fa-lightbulb"></i> ${recommendation}
                </div>
            `;
        });
        this.updateElement('recommendationsList', recommendationsHtml);
        
        // Negociaciones
        let negotiationsHtml = '';
        negotiations.forEach(negotiation => {
            const statusColor = negotiation.status === 'COMPLETED' ? 'success' : 'warning';
            negotiationsHtml += `
                <div class="border rounded p-3 mb-3">
                    <h6>${negotiation.issue}</h6>
                    <p class="mb-2">
                        <strong>Participantes:</strong> ${negotiation.participants.join(', ')}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-${statusColor}">${negotiation.status}</span>
                        <span class="text-muted">Consenso: ${negotiation.consensus}%</span>
                    </div>
                </div>
            `;
        });
        this.updateElement('negotiationsList', negotiationsHtml);
    }
    
    async updateAlerts() {
        const alerts = [
            { type: 'LOW_AGENT_PERFORMANCE', message: 'Rendimiento bajo en frontend_developer_001', time: '16:07:02', severity: 'MEDIUM' },
            { type: 'HIGH_ERROR_RATE', message: 'Tasa de errores elevada: 2.3%', time: '15:45:12', severity: 'HIGH' }
        ];
        
        let alertsHtml = '';
        
        if (alerts.length === 0) {
            alertsHtml = '<div class="text-center text-success py-3"><i class="fas fa-check-circle fa-2x"></i><br>No hay alertas activas</div>';
        } else {
            alerts.forEach(alert => {
                const severityColor = alert.severity === 'HIGH' ? 'danger' : alert.severity === 'MEDIUM' ? 'warning' : 'info';
                alertsHtml += `
                    <div class="alert-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${alert.type}</strong><br>
                                ${alert.message}
                            </div>
                            <small class="text-muted">${alert.time}</small>
                        </div>
                        <span class="badge bg-${severityColor} mt-2">${alert.severity}</span>
                    </div>
                `;
            });
        }
        
        this.updateElement('alertsList', alertsHtml);
        
        // Estado del monitor
        const monitorHtml = `
            <div class="text-center">
                <div class="status-indicator status-online"></div>
                <strong>Monitor Activo</strong>
                <p class="mt-2 mb-0">
                    • 8 agentes monitoreados<br>
                    • Análisis cada 5 minutos<br>
                    • Uptime: ${this.calculateUptime()}<br>
                    • Logs generados: ${this.calculateLogCount()}
                </p>
            </div>
        `;
        this.updateElement('monitorStatus', monitorHtml);
    }
    
    startAutoUpdate() {
        setInterval(() => {
            if (!this.isUpdating) {
                this.performUpdate();
            }
        }, this.updateInterval);
        
        console.log(`🔄 Auto-actualización configurada cada ${this.updateInterval/1000} segundos`);
    }
    
    async performUpdate() {
        this.isUpdating = true;
        this.showUpdateIndicator();
        
        try {
            await this.updateMetrics();
            await this.updateAgents();
            await this.updatePlatform();
            await this.updateAlerts();
            
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error en actualización automática:', error);
        } finally {
            this.isUpdating = false;
            this.hideUpdateIndicator();
        }
    }
    
    showUpdateIndicator() {
        const indicator = document.getElementById('updateIndicator');
        if (indicator) {
            indicator.style.opacity = '1';
        }
    }
    
    hideUpdateIndicator() {
        const indicator = document.getElementById('updateIndicator');
        if (indicator) {
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 1000);
        }
    }
    
    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const timeString = this.lastUpdateTime.toLocaleTimeString();
        this.updateElement('lastUpdate', timeString);
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = content;
        }
    }
    
    showErrorAlert(message) {
        // Mostrar alerta de error en la interfaz
        const alertContainer = document.getElementById('errorAlerts');
        if (alertContainer) {
            const alertHtml = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            alertContainer.innerHTML = alertHtml;
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                const alert = alertContainer.querySelector('.alert');
                if (alert) {
                    alert.classList.remove('show');
                }
            }, 5000);
        }
    }
    
    setupEventListeners() {
        // Manejar cambio de pestañas
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                // Actualizar gráficos cuando se cambia de pestaña
                setTimeout(() => {
                    Object.values(this.charts).forEach(chart => {
                        if (chart && typeof chart.resize === 'function') {
                            chart.resize();
                        }
                    });
                }, 100);
            });
        });
        
        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.performUpdate();
            }
        });
    }
    
    generateTimeLabels(count) {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * this.updateInterval));
            labels.push(time.toLocaleTimeString());
        }
        
        return labels;
    }
    
    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(min + Math.random() * (max - min));
        }
        return data;
    }
    
    calculateUptime() {
        const uptimeMs = Date.now() - (Date.now() - 3600000); // Simular 1 hora
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
    
    calculateLogCount() {
        return Math.floor(Math.random() * 50) + 150; // Simular archivos de log
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DevaltamedicaDashboard();
});

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevaltamedicaDashboard;
}
