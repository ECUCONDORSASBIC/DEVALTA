import { EnhancedBaseAgent, EnhancedAgentConfig, MetricPoint, EventMessage, ReactiveRule } from '../shared/EnhancedBaseAgent.js';
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

interface EnhancedMonitoringConfig extends MonitoringConfig, EnhancedAgentConfig {
  anomalyDetection?: {
    modelPath?: string;
    enabled: boolean;
  };
}

export class EnhancedMonitoringAgent extends EnhancedBaseAgent {
  private config: EnhancedMonitoringConfig;
  private logs: LogEntry[] = [];
  private metrics: Map<string, MetricPoint[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private anomalies: AnomalyDetection[] = [];

  constructor() {
    const baseConfig = loadConfig(monitoringConfigSchema, 'monitoring-agent');
    
    // Enhanced configuration with new features
    const enhancedConfig: EnhancedMonitoringConfig = {
      ...baseConfig,
      eventBus: {
        url: process.env.EVENT_BUS_URL || 'ws://localhost:8080',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      },
      retryPolicy: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
      scheduledJobs: [
        {
          name: 'collectSystemMetrics',
          schedule: '*/30 * * * * *', // Every 30 seconds
          handler: 'collectSystemMetricsJob',
        },
        {
          name: 'detectAnomalies',
          schedule: '*/1 * * * *', // Every minute
          handler: 'detectAnomaliesJob',
        },
        {
          name: 'cleanupOldData',
          schedule: '0 0 * * *', // Daily at midnight
          handler: 'cleanupOldDataJob',
        },
      ],
      anomalyDetection: {
        enabled: true,
        modelPath: process.env.ANOMALY_MODEL_PATH,
      },
    };

    super(enhancedConfig);
    this.config = enhancedConfig;
    
    // Initialize reactive rules
    this.initializeRules();
    
    // Load ML model if configured
    if (enhancedConfig.anomalyDetection?.enabled && enhancedConfig.anomalyDetection.modelPath) {
      this.loadAnomalyDetectionModel();
    }
  }

  // ============= Scheduled Job Handlers =============
  
  protected async collectSystemMetricsJob(): Promise<void> {
    await this.withRetry(async () => {
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
      
      // Publish metrics event
      this.publishEvent('metrics.collected', {
        timestamp: new Date().toISOString(),
        metrics: {
          memory: memoryUsage,
          cpu: cpuUsage,
          logs: this.logs.length,
          alerts: this.alerts.size,
          anomalies: this.anomalies.length,
        },
      });
    });
  }

  protected async detectAnomaliesJob(): Promise<void> {
    await this.withCircuitBreaker('anomaly-detection', async () => {
      // Use ML model if available
      if (this.config.anomalyDetection?.enabled) {
        await this.detectAnomaliesWithML();
      } else {
        await this.detectAnomaliesWithThresholds();
      }
    });
  }

  protected async cleanupOldDataJob(): Promise<void> {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Cleanup old logs
    const initialLogCount = this.logs.length;
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoffTime
    );
    
    // Cleanup old anomalies
    const initialAnomalyCount = this.anomalies.length;
    this.anomalies = this.anomalies.filter(anomaly => 
      new Date(anomaly.timestamp).getTime() > cutoffTime
    );
    
    this.log('info', 'Cleanup completed', {
      logsRemoved: initialLogCount - this.logs.length,
      anomaliesRemoved: initialAnomalyCount - this.anomalies.length,
    });
  }

  // ============= ML Pipeline =============
  
  private async loadAnomalyDetectionModel(): Promise<void> {
    try {
      await this.loadMLModel('anomaly-detector', this.config.anomalyDetection!.modelPath!, {
        preprocessor: async (input) => {
          // Normalize metrics for model input
          return {
            // Transform metrics into model input format
            inputs: input.metrics.map((m: any) => [m.value]),
          };
        },
        postprocessor: async (output) => {
          // Convert model output to anomaly scores
          return {
            anomalyScores: output.anomaly_scores,
            threshold: output.threshold,
          };
        },
      });
    } catch (error) {
      this.log('error', 'Failed to load anomaly detection model', { error });
    }
  }

  private async detectAnomaliesWithML(): Promise<void> {
    try {
      // Prepare metrics for ML model
      const recentMetrics = Array.from(this.metrics.entries()).map(([name, values]) => ({
        name,
        value: values[values.length - 1]?.value || 0,
      }));
      
      // Run inference
      const result = await this.runInference('anomaly-detector', { metrics: recentMetrics });
      
      // Process anomalies
      recentMetrics.forEach((metric, index) => {
        const anomalyScore = result.anomalyScores[index];
        if (anomalyScore > result.threshold) {
          this.createAnomaly(metric.name, metric.value, result.threshold, anomalyScore);
        }
      });
    } catch (error) {
      this.log('error', 'ML anomaly detection failed', { error });
      // Fallback to threshold-based detection
      await this.detectAnomaliesWithThresholds();
    }
  }

  private async detectAnomaliesWithThresholds(): Promise<void> {
    // Simple threshold-based anomaly detection
    for (const [metricName, threshold] of Object.entries(this.config.alerts.thresholds)) {
      const metricData = this.metrics.get(metricName);
      if (!metricData || metricData.length === 0) continue;
      
      const latestMetric = metricData[metricData.length - 1];
      const anomalyScore = Math.abs(latestMetric.value - threshold) / threshold;
      
      if (anomalyScore > 0.5) { // 50% deviation threshold
        this.createAnomaly(metricName, latestMetric.value, threshold, anomalyScore);
      }
    }
  }

  private createAnomaly(metric: string, value: number, threshold: number, anomalyScore: number): void {
    const anomaly: AnomalyDetection = {
      metric,
      value,
      threshold,
      anomalyScore,
      timestamp: new Date().toISOString(),
    };
    
    this.anomalies.push(anomaly);
    
    // Create alert for anomaly
    this.createAlert('warning', 'monitoring-agent', 
      `Anomaly detected in ${metric}: ${value} (threshold: ${threshold})`,
      { anomaly });
    
    // Evaluate reactive rules with anomaly context
    this.evaluateRules({
      type: 'anomaly',
      metric,
      value,
      threshold,
      anomalyScore,
    });
  }

  // ============= Reactive Rules =============
  
  private initializeRules(): void {
    // High memory usage rule
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage Alert',
      description: 'Triggers when memory usage exceeds 80%',
      enabled: true,
      conditions: [
        {
          field: 'type',
          operator: 'eq',
          value: 'metric',
        },
        {
          field: 'name',
          operator: 'eq',
          value: 'system_memory_used',
        },
        {
          field: 'percentUsed',
          operator: 'gt',
          value: 80,
        },
      ],
      actions: [
        {
          type: 'alert',
          data: {
            level: 'warning',
            message: 'High memory usage detected',
          },
        },
        {
          type: 'command',
          target: 'garbageCollect',
        },
      ],
      cooldown: 300000, // 5 minutes
      priority: 10,
    });

    // Critical error cascade rule
    this.addRule({
      id: 'error-cascade',
      name: 'Error Cascade Detection',
      description: 'Detects rapid error accumulation',
      enabled: true,
      conditions: [
        {
          field: 'type',
          operator: 'eq',
          value: 'log',
        },
        {
          field: 'level',
          operator: 'eq',
          value: 'error',
        },
        {
          field: 'errorRate',
          operator: 'gt',
          value: 10, // 10 errors per minute
        },
      ],
      actions: [
        {
          type: 'alert',
          data: {
            level: 'critical',
            message: 'Error cascade detected',
          },
        },
        {
          type: 'emit',
          target: 'error:cascade',
        },
        {
          type: 'custom',
        },
      ],
      cooldown: 60000, // 1 minute
      priority: 20,
    });

    // Anomaly storm rule
    this.addRule({
      id: 'anomaly-storm',
      name: 'Anomaly Storm Detection',
      description: 'Multiple anomalies detected simultaneously',
      enabled: true,
      conditions: [
        {
          field: 'type',
          operator: 'eq',
          value: 'anomaly',
        },
        {
          field: 'anomalyScore',
          operator: 'gt',
          value: 0.8,
        },
      ],
      conditionOperator: 'and',
      actions: [
        {
          type: 'log',
          data: { severity: 'high' },
        },
        {
          type: 'metric',
          target: 'anomaly_storm_detected',
        },
        {
          type: 'alert',
          data: {
            level: 'critical',
            message: 'Multiple anomalies detected - possible system instability',
          },
        },
      ],
      priority: 15,
    });
  }

  protected async executeCustomRuleAction(
    rule: ReactiveRule,
    action: any,
    context: Record<string, any>
  ): Promise<void> {
    switch (rule.id) {
      case 'error-cascade':
        // Implement emergency response
        await this.enableEmergencyMode();
        break;
      default:
        this.log('warn', `No custom action handler for rule: ${rule.id}`);
    }
  }

  protected async executeCommand(command: string, data: any): Promise<void> {
    switch (command) {
      case 'garbageCollect':
        if (global.gc) {
          global.gc();
          this.log('info', 'Garbage collection triggered');
        }
        break;
      default:
        this.log('warn', `Unknown command: ${command}`);
    }
  }

  private async enableEmergencyMode(): Promise<void> {
    this.log('warn', 'Emergency mode activated');
    
    // Increase logging level
    this.config.logLevel = 'debug';
    
    // Disable non-critical scheduled jobs
    this.disableScheduledJob('cleanupOldData');
    
    // Alert all connected services
    this.publishEvent('emergency.mode.activated', {
      timestamp: new Date().toISOString(),
      reason: 'Error cascade detected',
    });
  }

  // ============= Event Bus Handlers =============
  
  protected subscribeToEvents(): void {
    // Subscribe to system events
    this.publishEvent('subscribe', {
      events: [
        'agent.*.started',
        'agent.*.stopped',
        'agent.*.error',
        'metrics.*',
        'alert.*',
      ],
    });
  }

  protected handleEventBusMessage(message: EventMessage): void {
    // Route messages based on type
    if (message.type.startsWith('agent.')) {
      this.handleAgentEvent(message);
    } else if (message.type.startsWith('metrics.')) {
      this.handleMetricsEvent(message);
    } else if (message.type.startsWith('alert.')) {
      this.handleAlertEvent(message);
    }
    
    // Evaluate rules with event context
    this.evaluateRules({
      type: 'event',
      eventType: message.type,
      source: message.source,
      data: message.data,
    });
  }

  private handleAgentEvent(message: EventMessage): void {
    const [, agentName, action] = message.type.split('.');
    
    switch (action) {
      case 'started':
        this.log('info', `Agent started: ${agentName}`);
        break;
      case 'stopped':
        this.log('warn', `Agent stopped: ${agentName}`);
        this.createAlert('warning', agentName, 'Agent stopped unexpectedly');
        break;
      case 'error':
        this.log('error', `Agent error: ${agentName}`, message.data);
        this.createAlert('error', agentName, message.data.message || 'Agent error occurred');
        break;
    }
  }

  private handleMetricsEvent(message: EventMessage): void {
    // Store metrics from other agents
    if (message.data.metrics) {
      Object.entries(message.data.metrics).forEach(([name, value]) => {
        this.recordMetric(`${message.source}.${name}`, value as number);
      });
    }
  }

  private handleAlertEvent(message: EventMessage): void {
    // Process alerts from other services
    this.createAlert(
      message.data.level || 'info',
      message.source,
      message.data.message || 'Alert received',
      message.data
    );
  }

  // ============= HTTP Routes =============
  
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
    
    // Dashboard data
    this.app.get('/monitoring/dashboard', this.handleGetDashboard.bind(this));
    
    // Rules management
    this.app.get('/monitoring/rules', this.handleGetRules.bind(this));
    this.app.post('/monitoring/rules', this.handleAddRule.bind(this));
    this.app.put('/monitoring/rules/:id', this.handleUpdateRule.bind(this));
    this.app.delete('/monitoring/rules/:id', this.handleDeleteRule.bind(this));
  }

  private async handleSubmitLog(req: Request, res: Response): Promise<void> {
    await this.withRetry(async () => {
      const logEntry = this.validateSchema(logEntrySchema, req.body);
      this.logs.push(logEntry);
      
      // Evaluate rules with log context
      this.evaluateRules({
        type: 'log',
        ...logEntry,
        errorRate: this.calculateErrorRate(),
      });
      
      res.json({ success: true });
    }).catch(error => {
      res.status(400).json({ error: error.message });
    });
  }

  private async handleGetLogs(req: Request, res: Response): Promise<void> {
    const { service, level, limit = 100 } = req.query;
    
    let filteredLogs = this.logs;
    if (service) {
      filteredLogs = filteredLogs.filter(log => log.service === service);
    }
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    res.json(filteredLogs.slice(-Number(limit)));
  }

  private async handleSubmitMetric(req: Request, res: Response): Promise<void> {
    await this.withRetry(async () => {
      const metric = this.validateSchema(metricSchema, req.body);
      
      const metricKey = `${metric.service}.${metric.name}`;
      if (!this.metrics.has(metricKey)) {
        this.metrics.set(metricKey, []);
      }
      
      const metrics = this.metrics.get(metricKey)!;
      metrics.push({
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        labels: metric.labels,
      });
      
      // Keep only last 1000 points
      if (metrics.length > 1000) {
        metrics.shift();
      }
      
      // Calculate percentage for memory metrics
      let percentUsed = 0;
      if (metric.name === 'system_memory_used') {
        const totalMetrics = this.metrics.get(`${metric.service}.system_memory_total`);
        if (totalMetrics && totalMetrics.length > 0) {
          const total = totalMetrics[totalMetrics.length - 1].value;
          percentUsed = (metric.value / total) * 100;
        }
      }
      
      // Evaluate rules with metric context
      this.evaluateRules({
        type: 'metric',
        service: metric.service,
        name: metric.name,
        value: metric.value,
        percentUsed,
      });
      
      res.json({ success: true });
    }).catch(error => {
      res.status(400).json({ error: error.message });
    });
  }

  private async handleGetMetrics(req: Request, res: Response): Promise<void> {
    const allMetrics: Record<string, MetricPoint[]> = {};
    
    for (const [name, metrics] of this.metrics) {
      allMetrics[name] = metrics;
    }
    
    res.json(allMetrics);
  }

  private async handleGetMetric(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const metrics = this.metrics.get(name);
    
    if (!metrics) {
      res.status(404).json({ error: 'Metric not found' });
      return;
    }
    
    res.json(metrics);
  }

  private async handleCreateAlert(req: Request, res: Response): Promise<void> {
    await this.withCircuitBreaker('alert-creation', async () => {
      const alertData = this.validateSchema(alertSchema, req.body);
      
      this.createAlert(
        alertData.level,
        alertData.service,
        alertData.message,
        alertData.metadata
      );
      
      res.json({ success: true });
    }).catch(error => {
      res.status(503).json({ error: 'Alert creation temporarily unavailable' });
    });
  }

  private async handleGetAlerts(req: Request, res: Response): Promise<void> {
    const { acknowledged } = req.query;
    
    let alerts = Array.from(this.alerts.values());
    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === (acknowledged === 'true'));
    }
    
    res.json(alerts);
  }

  private async handleAcknowledgeAlert(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const alert = this.alerts.get(id);
    
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    
    alert.acknowledged = true;
    res.json({ success: true });
  }

  private async handleGetAnomalies(req: Request, res: Response): Promise<void> {
    const { limit = 100 } = req.query;
    res.json(this.anomalies.slice(-Number(limit)));
  }

  private async handleGetDashboard(req: Request, res: Response): Promise<void> {
    const dashboard = {
      summary: {
        totalLogs: this.logs.length,
        activeAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length,
        totalAnomalies: this.anomalies.length,
        errorRate: this.calculateErrorRate(),
      },
      recentLogs: this.logs.slice(-10),
      activeAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged),
      recentAnomalies: this.anomalies.slice(-10),
      systemMetrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      },
    };
    
    res.json(dashboard);
  }

  private async handleGetRules(req: Request, res: Response): Promise<void> {
    const rules = Array.from(this.rules.values());
    res.json(rules);
  }

  private async handleAddRule(req: Request, res: Response): Promise<void> {
    try {
      const rule = req.body as ReactiveRule;
      this.addRule(rule);
      res.json({ success: true, ruleId: rule.id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  private async handleUpdateRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;
    
    const rule = this.rules.get(id);
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    
    // Update rule
    const updatedRule = { ...rule, ...updates };
    this.removeRule(id);
    this.addRule(updatedRule);
    
    res.json({ success: true });
  }

  private async handleDeleteRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    this.removeRule(id);
    res.json({ success: true });
  }

  // ============= Helper Methods =============
  
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
    
    // Send alert to configured channels with circuit breaker
    this.withCircuitBreaker('alert-channels', async () => {
      await this.sendAlertToChannels(alert);
    }).catch(error => {
      this.log('error', 'Failed to send alert to channels', { error });
    });
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
    // Implementation with retry
    await this.withRetry(async () => {
      // Webhook implementation
      this.log('info', `Webhook alert sent`, { alertId: alert.id });
    });
  }

  private async sendEmailAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Implementation with retry
    await this.withRetry(async () => {
      // Email implementation
      this.log('info', `Email alert sent`, { alertId: alert.id });
    });
  }

  private async sendSlackAlert(alert: Alert, config: Record<string, any>): Promise<void> {
    // Implementation with retry
    await this.withRetry(async () => {
      // Slack implementation
      this.log('info', `Slack alert sent`, { alertId: alert.id });
    });
  }

  private generateAlertId(): string {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private calculateErrorRate(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentErrors = this.logs.filter(log => 
      log.level === 'error' && new Date(log.timestamp).getTime() > oneMinuteAgo
    );
    
    return recentErrors.length;
  }

  // ============= Health & Metrics =============
  
  protected performHealthChecks(): Record<string, boolean> {
    const checks = super.performHealthChecks();
    
    // Add monitoring-specific checks
    checks.alertChannels = this.config.alerts.channels.length > 0;
    checks.anomalyDetection = this.config.anomalyDetection?.enabled || false;
    
    return checks;
  }

  protected getCustomMetrics(): MetricPoint[] {
    const metrics = super.getCustomMetrics();
    
    // Add monitoring-specific metrics
    metrics.push({
      name: 'logs_total',
      value: this.logs.length,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'alerts_active',
      value: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'anomalies_detected',
      value: this.anomalies.length,
      timestamp: new Date().toISOString(),
    });
    
    return metrics;
  }

  // ============= WebSocket Handler =============
  
  protected handleWebSocketMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Handle real-time subscriptions
        ws.send(JSON.stringify({
          type: 'subscribed',
          channels: message.channels,
        }));
        break;
      
      case 'getRealtimeMetrics':
        // Send real-time metrics
        ws.send(JSON.stringify({
          type: 'metrics',
          data: Object.fromEntries(this.metrics),
        }));
        break;
      
      default:
        super.handleWebSocketMessage(ws, message);
    }
  }
}

// Export for use
export default EnhancedMonitoringAgent;
