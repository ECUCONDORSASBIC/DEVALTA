import { EnhancedBaseAgent, EnhancedAgentConfig, EventMessage, ReactiveRule, MetricPoint } from '../src/shared/EnhancedBaseAgent.js';
import { Request, Response } from 'express';
import { z } from 'zod';

/**
 * Example minimal agent that demonstrates all EnhancedBaseAgent features
 */
export class MinimalEnhancedAgent extends EnhancedBaseAgent {
  private dataStore: Map<string, any> = new Map();
  private processedCount = 0;

  constructor() {
    const config: EnhancedAgentConfig = {
      // Basic agent config
      port: 3099,
      host: 'localhost',
      name: 'minimal-enhanced-agent',
      logLevel: 'info',
      corsOrigins: ['*'],
      enableWebSocket: true,
      enableMetrics: true,
      healthCheckInterval: 30000,
      
      // Enhanced features
      eventBus: {
        url: process.env.EVENT_BUS_URL || 'ws://localhost:8080',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
      },
      
      scheduledJobs: [
        {
          name: 'dataCleanup',
          schedule: '*/5 * * * *', // Every 5 minutes
          handler: 'performDataCleanup',
        },
        {
          name: 'statusReport',
          schedule: '0 * * * *', // Every hour
          handler: 'generateStatusReport',
        },
      ],
      
      circuitBreaker: {
        failureThreshold: 3,
        resetTimeout: 30000,
        monitoringPeriod: 10000,
      },
      
      retryPolicy: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
      },
    };

    super(config);
    
    // Initialize reactive rules
    this.setupRules();
    
    // Load ML model if needed
    // this.initializeMLModel();
  }

  // ============= Scheduled Jobs =============
  
  protected async performDataCleanup(): Promise<void> {
    this.log('info', 'Performing data cleanup');
    
    const cutoffTime = Date.now() - 3600000; // 1 hour
    let cleaned = 0;
    
    for (const [key, value] of this.dataStore.entries()) {
      if (value.timestamp < cutoffTime) {
        this.dataStore.delete(key);
        cleaned++;
      }
    }
    
    this.recordMetric('data_cleaned', cleaned);
    this.log('info', `Cleaned ${cleaned} old entries`);
  }

  protected async generateStatusReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      dataStoreSize: this.dataStore.size,
      processedCount: this.processedCount,
      uptime: process.uptime(),
    };
    
    this.log('info', 'Status report generated', report);
    
    // Publish status report via event bus
    this.publishEvent('status.report', report);
  }

  // ============= Event Bus Implementation =============
  
  protected subscribeToEvents(): void {
    // Subscribe to relevant event patterns
    this.publishEvent('subscribe', {
      events: [
        'data.process',
        'data.query',
        'system.shutdown',
      ],
    });
  }

  protected handleEventBusMessage(message: EventMessage): void {
    this.log('debug', `Received event: ${message.type}`, message.data);
    
    switch (message.type) {
      case 'data.process':
        this.handleDataProcess(message.data, message.correlationId);
        break;
      case 'data.query':
        this.handleDataQuery(message.data, message.correlationId);
        break;
      case 'system.shutdown':
        this.handleSystemShutdown(message.data);
        break;
    }
    
    // Evaluate rules with event context
    this.evaluateRules({
      type: 'event',
      eventType: message.type,
      data: message.data,
    });
  }

  private async handleDataProcess(data: any, correlationId?: string): Promise<void> {
    try {
      // Process with retry
      await this.withRetry(async () => {
        const processed = await this.processData(data);
        this.dataStore.set(processed.id, processed);
        this.processedCount++;
        
        // Publish success event
        this.publishEvent('data.processed', {
          id: processed.id,
          success: true,
        }, correlationId);
      });
    } catch (error) {
      this.publishEvent('data.processing.failed', {
        error: error.message,
        data,
      }, correlationId);
    }
  }

  private async handleDataQuery(query: any, correlationId?: string): Promise<void> {
    const result = this.dataStore.get(query.id);
    
    this.publishEvent('data.query.result', {
      id: query.id,
      found: !!result,
      data: result,
    }, correlationId);
  }

  private handleSystemShutdown(data: any): void {
    this.log('warn', 'System shutdown requested', data);
    setTimeout(() => {
      this.stop().then(() => process.exit(0));
    }, 5000);
  }

  // ============= Reactive Rules =============
  
  private setupRules(): void {
    // High memory usage rule
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage Detection',
      description: 'Triggers when memory usage exceeds threshold',
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
          value: 'memory_usage_percent',
        },
        {
          field: 'value',
          operator: 'gt',
          value: 80,
        },
      ],
      actions: [
        {
          type: 'log',
          data: { level: 'warn' },
        },
        {
          type: 'command',
          target: 'triggerGC',
        },
      ],
      cooldown: 300000, // 5 minutes
      priority: 10,
    });

    // Data overflow rule
    this.addRule({
      id: 'data-overflow',
      name: 'Data Store Overflow',
      description: 'Triggers when data store is too large',
      enabled: true,
      conditions: [
        {
          field: 'dataStoreSize',
          operator: 'gt',
          value: 10000,
        },
      ],
      actions: [
        {
          type: 'alert',
          data: {
            level: 'warning',
            message: 'Data store is getting too large',
          },
        },
        {
          type: 'custom',
        },
      ],
      priority: 5,
    });

    // Processing rate rule
    this.addRule({
      id: 'low-processing-rate',
      name: 'Low Processing Rate',
      description: 'Detects when processing rate drops',
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
          value: 'processing_rate',
        },
        {
          field: 'value',
          operator: 'lt',
          value: 10, // Less than 10 per minute
        },
      ],
      actions: [
        {
          type: 'metric',
          target: 'low_processing_rate_detected',
        },
        {
          type: 'emit',
          target: 'performance:degraded',
        },
      ],
      cooldown: 60000, // 1 minute
    });
  }

  protected async executeCustomRuleAction(
    rule: ReactiveRule,
    action: any,
    context: Record<string, any>
  ): Promise<void> {
    switch (rule.id) {
      case 'data-overflow':
        // Force cleanup of oldest data
        await this.forceDataCleanup();
        break;
      default:
        this.log('warn', `No custom handler for rule: ${rule.id}`);
    }
  }

  protected async executeCommand(command: string, data: any): Promise<void> {
    switch (command) {
      case 'triggerGC':
        if (global.gc) {
          global.gc();
          this.log('info', 'Manual garbage collection triggered');
        }
        break;
      default:
        this.log('warn', `Unknown command: ${command}`);
    }
  }

  // ============= HTTP Routes =============
  
  protected setupCustomRoutes(): void {
    // Data endpoints
    this.app.post('/data', this.handleCreateData.bind(this));
    this.app.get('/data/:id', this.handleGetData.bind(this));
    this.app.delete('/data/:id', this.handleDeleteData.bind(this));
    
    // Status endpoint
    this.app.get('/status', this.handleGetStatus.bind(this));
    
    // Rule management
    this.app.get('/rules', this.handleGetRules.bind(this));
    this.app.post('/rules/:id/enable', this.handleEnableRule.bind(this));
    this.app.post('/rules/:id/disable', this.handleDisableRule.bind(this));
  }

  private async handleCreateData(req: Request, res: Response): Promise<void> {
    await this.withCircuitBreaker('data-creation', async () => {
      const data = req.body;
      const id = this.generateId();
      
      const entry = {
        id,
        ...data,
        timestamp: Date.now(),
      };
      
      this.dataStore.set(id, entry);
      this.processedCount++;
      
      // Evaluate rules with context
      this.evaluateRules({
        type: 'data_created',
        dataStoreSize: this.dataStore.size,
      });
      
      res.json({ id, success: true });
    }).catch(error => {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    });
  }

  private async handleGetData(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = this.dataStore.get(id);
    
    if (!data) {
      res.status(404).json({ error: 'Data not found' });
      return;
    }
    
    res.json(data);
  }

  private async handleDeleteData(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const existed = this.dataStore.delete(id);
    
    res.json({ success: existed });
  }

  private async handleGetStatus(req: Request, res: Response): Promise<void> {
    const status = {
      dataStoreSize: this.dataStore.size,
      processedCount: this.processedCount,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
    };
    
    res.json(status);
  }

  private async handleGetRules(req: Request, res: Response): Promise<void> {
    const rules = Array.from(this.rules.values());
    res.json(rules);
  }

  private async handleEnableRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const rule = this.rules.get(id);
    
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    
    rule.enabled = true;
    res.json({ success: true });
  }

  private async handleDisableRule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const rule = this.rules.get(id);
    
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    
    rule.enabled = false;
    res.json({ success: true });
  }

  // ============= Helper Methods =============
  
  private async processData(data: any): Promise<any> {
    // Simulate processing with potential failures
    if (Math.random() < 0.1) {
      throw new Error('Processing failed');
    }
    
    await this.sleep(100); // Simulate work
    
    return {
      ...data,
      processed: true,
      processedAt: Date.now(),
    };
  }

  private async forceDataCleanup(): Promise<void> {
    const targetSize = 5000;
    const toRemove = this.dataStore.size - targetSize;
    
    if (toRemove > 0) {
      const entries = Array.from(this.dataStore.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < toRemove; i++) {
        this.dataStore.delete(entries[i][0]);
      }
      
      this.log('info', `Force cleaned ${toRemove} entries`);
    }
  }

  private generateId(): string {
    return `data_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============= Health & Metrics =============
  
  protected performHealthChecks(): Record<string, boolean> {
    const checks = super.performHealthChecks();
    
    // Add custom health checks
    checks.dataStore = this.dataStore.size < 10000;
    checks.processingRate = this.processedCount > 0;
    
    return checks;
  }

  protected getCustomMetrics(): MetricPoint[] {
    const metrics = super.getCustomMetrics();
    
    // Add custom metrics
    metrics.push({
      name: 'data_store_size',
      value: this.dataStore.size,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'total_processed',
      value: this.processedCount,
      timestamp: new Date().toISOString(),
    });
    
    // Calculate memory usage percentage
    const memUsage = process.memoryUsage();
    const memoryPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    metrics.push({
      name: 'memory_usage_percent',
      value: memoryPercent,
      timestamp: new Date().toISOString(),
    });
    
    // Calculate processing rate (per minute)
    const uptimeMinutes = process.uptime() / 60;
    const processingRate = uptimeMinutes > 0 ? this.processedCount / uptimeMinutes : 0;
    
    metrics.push({
      name: 'processing_rate',
      value: processingRate,
      timestamp: new Date().toISOString(),
    });
    
    // Evaluate rules with metrics context
    setImmediate(() => {
      this.evaluateRules({
        type: 'metric',
        name: 'memory_usage_percent',
        value: memoryPercent,
      });
      
      this.evaluateRules({
        type: 'metric',
        name: 'processing_rate',
        value: processingRate,
      });
    });
    
    return metrics;
  }

  // ============= ML Pipeline (Optional) =============
  
  private async initializeMLModel(): Promise<void> {
    // Example: Load an anomaly detection model
    try {
      await this.loadMLModel('anomaly-detector', './models/anomaly.onnx', {
        preprocessor: async (input) => {
          // Normalize input data
          return {
            inputs: [input.values],
          };
        },
        postprocessor: async (output) => {
          // Convert output to anomaly scores
          return {
            scores: output.anomaly_scores,
            threshold: 0.8,
          };
        },
        timeout: 5000,
      });
      
      this.log('info', 'ML model loaded successfully');
    } catch (error) {
      this.log('warn', 'ML model loading failed, continuing without ML features', { error });
    }
  }
}

// Export and start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new MinimalEnhancedAgent();
  agent.start().catch(error => {
    console.error('Failed to start agent:', error);
    process.exit(1);
  });
}

export default MinimalEnhancedAgent;
