import { BaseAgent, MetricPoint } from '../shared/BaseAgent.js';
import { MonitoringConfig, monitoringConfigSchema, loadConfig } from '../shared/config.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { WebSocket } from 'ws';

interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

interface AnomalyDetection {
  metric: string;
  value: number;
  threshold: number;
  anomalyScore: number;
  timestamp: string;
  prediction?: number;
  confidence?: number;
}

interface SelfHealingAction {
  id: string;
  anomalyId: string;
  action: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  timestamp: Date;
}

interface MetricBaseline {
  metric: string;
  mean: number;
  stdDev: number;
  samples: number[];
  lastUpdated: Date;
}

const logEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  service: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
});

const metricSchema = z.object({
  name: z.string(),
  value: z.number(),
  timestamp: z.string(),
  service: z.string(),
  labels: z.record(z.string()).optional(),
});

const alertSchema = z.object({
  service: z.string(),
  level: z.enum(['info', 'warning', 'error', 'critical']),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
});

export class MonitoringAgent extends BaseAgent {
  private config: MonitoringConfig;
  private logs: LogEntry[] = [];
  private metrics: Map<string, MetricPoint[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private anomalies: AnomalyDetection[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;
  private alertsInterval: NodeJS.Timeout | null = null;
  private selfHealingActions: Map<string, SelfHealingAction> = new Map();
  private metricBaselines: Map<string, MetricBaseline> = new Map();
  private realtimeAnomalyDetection: boolean = true;
  private selfHealingEnabled: boolean = true;

  constructor() {
    const config = loadConfig(monitoringConfigSchema, 'monitoring-agent');
    super(config);
    this.config = config;
    this.startMetricsCollection();
    this.startAnomalyDetection();
    this.initializeSelfHealing();
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metrics.interval);
  }

  private startAnomalyDetection(): void {
    this.alertsInterval = setInterval(() => {
      this.detectAnomalies();
    }, 60000); // Check every minute
  }

  private collectSystemMetrics(): void {
    // Collect system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.recordMetric('system_memory_used', memoryUsage.heapUsed);
    this.recordMetric('system_memory_total', memoryUsage.heapTotal);
    this.recordMetric('system_cpu_user', cpuUsage.user);
    this.recordMetric('system_cpu_system', cpuUsage.system);
    
    // Collect custom metrics
    this.recordMetric('logs_count', this.logs.length);
    this.recordMetric('alerts_count', this.alerts.size);
    this.recordMetric('anomalies_count', this.anomalies.length);
  }

  private detectAnomalies(): void {
    if (this.realtimeAnomalyDetection) {
      this.performAdvancedAnomalyDetection();
    } else {
      this.performSimpleAnomalyDetection();
    }
  }
  
  private performSimpleAnomalyDetection(): void {
    // Simple anomaly detection based on thresholds
    for (const [metricName, threshold] of Object.entries(this.config.alerts.thresholds)) {
      const metricData = this.metrics.get(metricName);
      if (!metricData || metricData.length === 0) continue;
      
      const latestMetric = metricData[metricData.length - 1];
      const anomalyScore = Math.abs(latestMetric.value - threshold) / threshold;
      
      if (anomalyScore > 0.5) { // 50% deviation threshold
        const anomaly: AnomalyDetection = {
          metric: metricName,
          value: latestMetric.value,
          threshold,
          anomalyScore,
          timestamp: new Date().toISOString(),
        };
        
        this.anomalies.push(anomaly);
        
        // Create alert for anomaly
        this.createAlert('warning', 'monitoring-agent', 
          `Anomaly detected in ${metricName}: ${latestMetric.value} (threshold: ${threshold})`,
          { anomaly });
      }
    }
  }
  
  private performAdvancedAnomalyDetection(): void {
    for (const [metricName, metricData] of this.metrics) {
      if (metricData.length < 10) continue; // Need enough data for analysis
      
      // Update baseline
      this.updateMetricBaseline(metricName, metricData);
      
      const baseline = this.metricBaselines.get(metricName);
      if (!baseline) continue;
      
      const latestMetric = metricData[metricData.length - 1];
      const zScore = Math.abs((latestMetric.value - baseline.mean) / baseline.stdDev);
      
      // Predict next value using simple linear regression
      const prediction = this.predictNextValue(metricData);
      const confidence = Math.max(0, 1 - (zScore / 10)); // Simple confidence calculation
      
      if (zScore > 3) { // 3 standard deviations
        const anomaly: AnomalyDetection = {
          metric: metricName,
          value: latestMetric.value,
          threshold: baseline.mean,
          anomalyScore: zScore,
          timestamp: new Date().toISOString(),
          prediction,
          confidence,
        };
        
        this.anomalies.push(anomaly);
        
        // Create alert with severity based on z-score
        const severity = zScore > 5 ? 'critical' : zScore > 4 ? 'error' : 'warning';
        this.createAlert(severity, 'monitoring-agent', 
          `Anomaly detected in ${metricName}: ${latestMetric.value} (baseline: ${baseline.mean.toFixed(2)}, z-score: ${zScore.toFixed(2)})`,
          { anomaly });
        
        // Trigger self-healing if enabled
        if (this.selfHealingEnabled && severity === 'critical') {
          this.triggerSelfHealing(anomaly);
        }
      }
    }
  }
  
  private updateMetricBaseline(metricName: string, metricData: MetricPoint[]): void {
    const recentData = metricData.slice(-100); // Use last 100 points
    const values = recentData.map(m => m.value);
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    this.metricBaselines.set(metricName, {
      metric: metricName,
      mean,
      stdDev,
      samples: values,
      lastUpdated: new Date(),
    });
  }
  
  private predictNextValue(metricData: MetricPoint[]): number {
    // Simple linear regression for prediction
    const recentData = metricData.slice(-10);
    const n = recentData.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    recentData.forEach((point, i) => {
      sumX += i;
      sumY += point.value;
      sumXY += i * point.value;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept; // Predict next value
  }

  private createAlert(level: Alert['level'], service: string, message: string, metadata?: Record<string, any>): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      level,
      service,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      metadata,
    };
    
    this.alerts.set(alert.id, alert);
    this.log('info', `Alert created: ${alert.id}`, { alert });
    
    // Send alert to configured channels
    this.sendAlertToChannels(alert);
  }

  private async sendAlertToChannels(alert: Alert): Promise<void> {
    for (const channel of this.config.alerts.channels) {
      try {
        switch (channel.type) {
          case 'webhook':
            await this.sendWebhookAlert(alert, channel.config);
            break;
          case 'email':
            await this.sendEmailAlert(alert, channel.config);
            break;
          case 'slack':
            await this.sendSlackAlert(alert, channel.config);
            break;
        }
      } catch (error) {
        this.log('error', `Failed to send alert to ${channel.type}`, { error: error.message });
      }
    }
  }

  private async sendWebhookAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Implementation for webhook alerts
    this.log('info', `Webhook alert sent`, { alertId: alert.id });
  }

  private async sendEmailAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Implementation for email alerts
    this.log('info', `Email alert sent`, { alertId: alert.id });
  }

  private async sendSlackAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Implementation for Slack alerts
    this.log('info', `Slack alert sent`, { alertId: alert.id });
  }

  private generateAlertId(): string {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  protected setupCustomRoutes(): void {
    // Log management
    this.app.post('/monitoring/logs', this.handleSubmitLog.bind(this));
    this.app.get('/monitoring/logs', this.handleGetLogs.bind(this));
    
    // Metrics management
    this.app.post('/monitoring/metrics', this.handleSubmitMetric.bind(this));
    this.app.get('/monitoring/metrics', this.handleGetMetrics.bind(this));
    this.app.get('/monitoring/metrics/:name', this.handleGetMetric.bind(this));
    
    // Alerts management
    this.app.post('/monitoring/alerts', this.handleCreateAlert.bind(this));
    this.app.get('/monitoring/alerts', this.handleGetAlerts.bind(this));
    this.app.put('/monitoring/alerts/:id/acknowledge', this.handleAcknowledgeAlert.bind(this));
    
    // Anomaly detection
    this.app.get('/monitoring/anomalies', this.handleGetAnomalies.bind(this));
    
    // Health checks
    this.app.get('/monitoring/health/:service', this.handleGetServiceHealth.bind(this));
    
    // Dashboard data
    this.app.get('/monitoring/dashboard', this.handleGetDashboardData.bind(this));
    
    // Self-healing
    this.app.get('/monitoring/self-healing/actions', this.handleGetSelfHealingActions.bind(this));
    this.app.post('/monitoring/self-healing/execute', this.handleExecuteSelfHealing.bind(this));
    
    // Baselines
    this.app.get('/monitoring/baselines', this.handleGetBaselines.bind(this));
  }

  private async handleSubmitLog(req: Request, res: Response): Promise<void> {
    try {
      const logEntry = this.validateSchema(logEntrySchema, req.body);
      
      this.logs.push(logEntry);
      
      // Keep only last 10000 logs
      if (this.logs.length > 10000) {
        this.logs = this.logs.slice(-10000);
      }
      
      this.recordMetric('logs_submitted', 1, { service: logEntry.service });
      this.log('debug', 'Log entry submitted', { service: logEntry.service });
      
      res.json({ success: true });
      
    } catch (error) {
      this.log('error', 'Failed to submit log', { error: error.message });
      res.status(400).json({ error: 'Failed to submit log' });
    }
  }

  private async handleGetLogs(req: Request, res: Response): Promise<void> {
    try {
      const { service, level, limit = 100, offset = 0 } = req.query;
      
      let filteredLogs = this.logs;
      
      if (service) {
        filteredLogs = filteredLogs.filter(log => log.service === service);
      }
      
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }
      
      const paginatedLogs = filteredLogs
        .slice(Number(offset), Number(offset) + Number(limit))
        .reverse(); // Most recent first
      
      res.json({
        logs: paginatedLogs,
        total: filteredLogs.length,
        offset: Number(offset),
        limit: Number(limit),
      });
      
    } catch (error) {
      this.log('error', 'Failed to get logs', { error: error.message });
      res.status(500).json({ error: 'Failed to get logs' });
    }
  }

  private async handleSubmitMetric(req: Request, res: Response): Promise<void> {
    try {
      const metric = this.validateSchema(metricSchema, req.body);
      
      if (!this.metrics.has(metric.name)) {
        this.metrics.set(metric.name, []);
      }
      
      const metricData = this.metrics.get(metric.name)!;
      metricData.push({
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        labels: metric.labels,
      });
      
      // Keep only last 1000 points per metric
      if (metricData.length > 1000) {
        metricData.shift();
      }
      
      this.recordMetric('metrics_submitted', 1, { service: metric.service });
      
      res.json({ success: true });
      
    } catch (error) {
      this.log('error', 'Failed to submit metric', { error: error.message });
      res.status(400).json({ error: 'Failed to submit metric' });
    }
  }

  private async handleGetMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { names } = req.query;
      
      if (names) {
        const requestedNames = (names as string).split(',');
        const filteredMetrics: Record<string, MetricPoint[]> = {};
        
        for (const name of requestedNames) {
          const metricData = this.metrics.get(name);
          if (metricData) {
            filteredMetrics[name] = metricData;
          }
        }
        
        res.json({ metrics: filteredMetrics });
      } else {
        const allMetrics: Record<string, MetricPoint[]> = {};
        for (const [name, data] of this.metrics) {
          allMetrics[name] = data;
        }
        res.json({ metrics: allMetrics });
      }
      
    } catch (error) {
      this.log('error', 'Failed to get metrics', { error: error.message });
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  }

  private async handleGetMetric(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const { limit = 100 } = req.query;
      
      const metricData = this.metrics.get(name);
      if (!metricData) {
        res.status(404).json({ error: 'Metric not found' });
        return;
      }
      
      const limitedData = metricData.slice(-Number(limit));
      
      res.json({
        name,
        data: limitedData,
        total: metricData.length,
      });
      
    } catch (error) {
      this.log('error', 'Failed to get metric', { error: error.message });
      res.status(500).json({ error: 'Failed to get metric' });
    }
  }

  private async handleCreateAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertData = this.validateSchema(alertSchema, req.body);
      
      this.createAlert(alertData.level, alertData.service, alertData.message, alertData.metadata);
      
      res.json({ success: true });
      
    } catch (error) {
      this.log('error', 'Failed to create alert', { error: error.message });
      res.status(400).json({ error: 'Failed to create alert' });
    }
  }

  private async handleGetAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { service, level, acknowledged, limit = 100, offset = 0 } = req.query;
      
      let filteredAlerts = Array.from(this.alerts.values());
      
      if (service) {
        filteredAlerts = filteredAlerts.filter(alert => alert.service === service);
      }
      
      if (level) {
        filteredAlerts = filteredAlerts.filter(alert => alert.level === level);
      }
      
      if (acknowledged !== undefined) {
        const isAcknowledged = acknowledged === 'true';
        filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === isAcknowledged);
      }
      
      const paginatedAlerts = filteredAlerts
        .slice(Number(offset), Number(offset) + Number(limit))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({
        alerts: paginatedAlerts,
        total: filteredAlerts.length,
        offset: Number(offset),
        limit: Number(limit),
      });
      
    } catch (error) {
      this.log('error', 'Failed to get alerts', { error: error.message });
      res.status(500).json({ error: 'Failed to get alerts' });
    }
  }

  private async handleAcknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const alert = this.alerts.get(id);
      if (!alert) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }
      
      alert.acknowledged = true;
      this.alerts.set(id, alert);
      
      this.log('info', `Alert acknowledged: ${id}`);
      
      res.json({ success: true });
      
    } catch (error) {
      this.log('error', 'Failed to acknowledge alert', { error: error.message });
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  }

  private async handleGetAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const paginatedAnomalies = this.anomalies
        .slice(Number(offset), Number(offset) + Number(limit))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({
        anomalies: paginatedAnomalies,
        total: this.anomalies.length,
        offset: Number(offset),
        limit: Number(limit),
      });
      
    } catch (error) {
      this.log('error', 'Failed to get anomalies', { error: error.message });
      res.status(500).json({ error: 'Failed to get anomalies' });
    }
  }

  private async handleGetServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      const { service } = req.params;
      
      // Get recent logs for the service
      const recentLogs = this.logs
        .filter(log => log.service === service)
        .slice(-10);
      
      // Get recent metrics for the service
      const serviceMetrics: Record<string, MetricPoint[]> = {};
      for (const [name, data] of this.metrics) {
        const serviceData = data.filter(metric => metric.labels?.service === service);
        if (serviceData.length > 0) {
          serviceMetrics[name] = serviceData.slice(-10);
        }
      }
      
      // Get recent alerts for the service
      const recentAlerts = Array.from(this.alerts.values())
        .filter(alert => alert.service === service)
        .slice(-5);
      
      res.json({
        service,
        logs: recentLogs,
        metrics: serviceMetrics,
        alerts: recentAlerts,
      });
      
    } catch (error) {
      this.log('error', 'Failed to get service health', { error: error.message });
      res.status(500).json({ error: 'Failed to get service health' });
    }
  }

  private async handleGetDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const dashboardData = {
        summary: {
          totalLogs: this.logs.length,
          totalMetrics: this.metrics.size,
          totalAlerts: this.alerts.size,
          unacknowledgedAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length,
          totalAnomalies: this.anomalies.length,
        },
        recentLogs: this.logs.slice(-10),
        recentAlerts: Array.from(this.alerts.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5),
        recentAnomalies: this.anomalies.slice(-5),
        systemMetrics: {
          memory: this.metrics.get('system_memory_used')?.slice(-10) || [],
          cpu: this.metrics.get('system_cpu_user')?.slice(-10) || [],
        },
      };
      
      res.json(dashboardData);
      
    } catch (error) {
      this.log('error', 'Failed to get dashboard data', { error: error.message });
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  }

  protected handleWebSocketMessage(ws: WebSocket, message: any): void {
    if (message.type === 'subscribe') {
      // Handle real-time subscriptions
      this.handleSubscription(ws, message.data);
    } else if (message.type === 'unsubscribe') {
      // Handle unsubscriptions
      this.handleUnsubscription(ws, message.data);
    }
  }

  private handleSubscription(ws: WebSocket, data: any): void {
    // Implementation for real-time subscriptions
    this.log('info', 'WebSocket subscription', { data });
  }

  private handleUnsubscription(ws: WebSocket, data: any): void {
    // Implementation for unsubscriptions
    this.log('info', 'WebSocket unsubscription', { data });
  }

  protected performHealthChecks(): Record<string, boolean> {
    return {
      logs_collecting: this.logs.length >= 0,
      metrics_collecting: this.metrics.size >= 0,
      alerts_system: this.config.alerts.enabled,
      anomaly_detection: this.anomalies.length >= 0,
    };
  }

  protected getCustomMetrics(): MetricPoint[] {
    return [
      {
        name: 'monitoring_logs_total',
        value: this.logs.length,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'monitoring_metrics_total',
        value: this.metrics.size,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'monitoring_alerts_total',
        value: this.alerts.size,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'monitoring_anomalies_total',
        value: this.anomalies.length,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  public async stop(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.alertsInterval) {
      clearInterval(this.alertsInterval);
      this.alertsInterval = null;
    }
    
    await super.stop();
  }
  
  private initializeSelfHealing(): void {
    // Define self-healing actions for different anomaly types
    this.log('info', 'Self-healing system initialized');
  }
  
  private async triggerSelfHealing(anomaly: AnomalyDetection): Promise<void> {
    const actionId = `heal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    let action = '';
    if (anomaly.metric.includes('memory')) {
      action = 'restart_service';
    } else if (anomaly.metric.includes('cpu')) {
      action = 'scale_horizontally';
    } else if (anomaly.metric.includes('error')) {
      action = 'rollback_deployment';
    } else {
      action = 'alert_ops_team';
    }
    
    const healingAction: SelfHealingAction = {
      id: actionId,
      anomalyId: `${anomaly.metric}_${anomaly.timestamp}`,
      action,
      status: 'pending',
      timestamp: new Date(),
    };
    
    this.selfHealingActions.set(actionId, healingAction);
    
    // Execute healing action
    this.executeSelfHealingAction(healingAction);
  }
  
  private async executeSelfHealingAction(action: SelfHealingAction): Promise<void> {
    action.status = 'executing';
    this.log('info', `Executing self-healing action: ${action.action}`, { actionId: action.id });
    
    try {
      switch (action.action) {
        case 'restart_service':
          // Simulate service restart
          await this.restartService(action);
          break;
        case 'scale_horizontally':
          // Simulate horizontal scaling
          await this.scaleService(action);
          break;
        case 'rollback_deployment':
          // Trigger DevOps agent for rollback
          await this.triggerRollback(action);
          break;
        case 'alert_ops_team':
          // Send high-priority alert
          await this.alertOpsTeam(action);
          break;
      }
      
      action.status = 'completed';
      this.recordMetric('self_healing_success', 1, { action: action.action });
    } catch (error) {
      action.status = 'failed';
      action.result = { error: error.message };
      this.recordMetric('self_healing_failure', 1, { action: action.action });
      this.log('error', 'Self-healing action failed', { actionId: action.id, error: error.message });
    }
  }
  
  private async restartService(action: SelfHealingAction): Promise<void> {
    // Simulate service restart
    this.log('info', 'Restarting service due to memory anomaly');
    action.result = { restarted: true, timestamp: new Date() };
  }
  
  private async scaleService(action: SelfHealingAction): Promise<void> {
    // Simulate horizontal scaling
    this.log('info', 'Scaling service horizontally due to CPU anomaly');
    action.result = { scaled: true, newInstances: 2, timestamp: new Date() };
  }
  
  private async triggerRollback(action: SelfHealingAction): Promise<void> {
    // Call DevOps agent to trigger rollback
    try {
      await axios.post('http://localhost:3004/devops/rollback', {
        reason: 'High error rate detected',
        anomalyId: action.anomalyId,
      });
      action.result = { rollbackTriggered: true };
    } catch (error) {
      throw new Error(`Failed to trigger rollback: ${error.message}`);
    }
  }
  
  private async alertOpsTeam(action: SelfHealingAction): Promise<void> {
    // Send high-priority alert
    this.createAlert('critical', 'monitoring-agent', 
      'Critical anomaly detected - manual intervention required',
      { actionId: action.id, anomalyId: action.anomalyId });
    action.result = { alertSent: true };
  }
  
  private async handleGetSelfHealingActions(req: Request, res: Response): Promise<void> {
    try {
      const { status, limit = 100 } = req.query;
      
      let actions = Array.from(this.selfHealingActions.values());
      
      if (status) {
        actions = actions.filter(a => a.status === status);
      }
      
      const recentActions = actions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, Number(limit));
      
      res.json({ actions: recentActions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get self-healing actions' });
    }
  }
  
  private async handleExecuteSelfHealing(req: Request, res: Response): Promise<void> {
    try {
      const { anomaly } = req.body;
      
      if (!anomaly) {
        res.status(400).json({ error: 'Anomaly data required' });
        return;
      }
      
      await this.triggerSelfHealing(anomaly);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute self-healing' });
    }
  }
  
  private async handleGetBaselines(req: Request, res: Response): Promise<void> {
    try {
      const baselines = Array.from(this.metricBaselines.entries()).map(([name, baseline]) => ({
        metric: name,
        mean: baseline.mean,
        stdDev: baseline.stdDev,
        sampleCount: baseline.samples.length,
        lastUpdated: baseline.lastUpdated,
      }));
      
      res.json({ baselines });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get baselines' });
    }
  }
}

// Start the agent if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new MonitoringAgent();
  agent.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGTERM', () => agent.stop());
  process.on('SIGINT', () => agent.stop());
}
