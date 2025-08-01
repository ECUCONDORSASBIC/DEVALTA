import { BaseAgent, AgentConfig, MetricPoint, HealthStatus } from './BaseAgent.js';
import { EventEmitter } from 'events';
import { z } from 'zod';
import * as cron from 'node-cron';
import { WebSocket } from 'ws';
import * as ort from 'onnxruntime-node';

// Event Bus Types
export interface EventBusConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface EventMessage {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: any;
  correlationId?: string;
}

// Scheduled Job Types
export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  errorCount: number;
}

// ML Pipeline Types
export interface MLPipelineConfig {
  modelPath?: string;
  preprocessor?: (input: any) => Promise<any>;
  postprocessor?: (output: any) => Promise<any>;
  batchSize?: number;
  timeout?: number;
}

export interface MLModel {
  id: string;
  type: 'onnx' | 'tensorflow' | 'custom';
  session?: ort.InferenceSession;
  config: MLPipelineConfig;
}

// Reactive Rules Types
export const RuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'matches']),
  value: z.any(),
});

export const RuleActionSchema = z.object({
  type: z.enum(['emit', 'log', 'metric', 'alert', 'command', 'custom']),
  target: z.string().optional(),
  data: z.any().optional(),
});

export const ReactiveRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  conditions: z.array(RuleConditionSchema),
  conditionOperator: z.enum(['and', 'or']).default('and'),
  actions: z.array(RuleActionSchema),
  cooldown: z.number().optional(), // Milliseconds between rule executions
  priority: z.number().default(0),
});

export type ReactiveRule = z.infer<typeof ReactiveRuleSchema>;

// Circuit Breaker Types
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls?: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure?: Date;
  nextRetry?: Date;
  successCount: number;
}

// Retry Policy Types
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

// Enhanced Agent Config
export interface EnhancedAgentConfig extends AgentConfig {
  eventBus?: EventBusConfig;
  mlPipeline?: MLPipelineConfig;
  circuitBreaker?: CircuitBreakerConfig;
  retryPolicy?: RetryConfig;
  scheduledJobs?: Array<{
    name: string;
    schedule: string;
    handler: string; // Method name to call
  }>;
}

export abstract class EnhancedBaseAgent extends BaseAgent {
  // Event Bus
  private eventBusClient: WebSocket | null = null;
  private eventBusReconnectAttempts = 0;
  private eventBusReconnectTimer: NodeJS.Timeout | null = null;
  
  // Scheduled Jobs
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  
  // ML Models
  private mlModels: Map<string, MLModel> = new Map();
  
  // Reactive Rules
  private rules: Map<string, ReactiveRule> = new Map();
  private ruleLastExecution: Map<string, number> = new Map();
  
  // Circuit Breakers
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  
  // Enhanced Config
  protected enhancedConfig: EnhancedAgentConfig;

  constructor(config: EnhancedAgentConfig) {
    super(config);
    this.enhancedConfig = config;
    
    // Initialize components
    if (config.eventBus?.url) {
      this.initializeEventBus();
    }
    
    if (config.scheduledJobs) {
      this.initializeScheduledJobs(config.scheduledJobs);
    }
  }

  // ============= Event Bus Client =============
  
  private initializeEventBus(): void {
    const config = this.enhancedConfig.eventBus!;
    this.connectToEventBus(config.url!);
  }

  private connectToEventBus(url: string): void {
    try {
      this.eventBusClient = new WebSocket(url);
      
      this.eventBusClient.on('open', () => {
        this.log('info', 'Connected to event bus', { url });
        this.eventBusReconnectAttempts = 0;
        this.subscribeToEvents();
      });
      
      this.eventBusClient.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as EventMessage;
          this.handleEventBusMessage(message);
        } catch (error) {
          this.log('error', 'Failed to parse event bus message', { error });
        }
      });
      
      this.eventBusClient.on('close', () => {
        this.log('warn', 'Disconnected from event bus');
        this.scheduleEventBusReconnect();
      });
      
      this.eventBusClient.on('error', (error: Error) => {
        this.log('error', 'Event bus connection error', { error: error.message });
      });
    } catch (error) {
      this.log('error', 'Failed to connect to event bus', { error });
      this.scheduleEventBusReconnect();
    }
  }

  private scheduleEventBusReconnect(): void {
    const config = this.enhancedConfig.eventBus!;
    const maxAttempts = config.maxReconnectAttempts || 10;
    const interval = config.reconnectInterval || 5000;
    
    if (this.eventBusReconnectAttempts >= maxAttempts) {
      this.log('error', 'Max event bus reconnection attempts reached');
      return;
    }
    
    this.eventBusReconnectAttempts++;
    this.eventBusReconnectTimer = setTimeout(() => {
      this.log('info', `Attempting to reconnect to event bus (attempt ${this.eventBusReconnectAttempts})`);
      this.connectToEventBus(config.url!);
    }, interval * this.eventBusReconnectAttempts);
  }

  protected abstract subscribeToEvents(): void;
  protected abstract handleEventBusMessage(message: EventMessage): void;

  protected publishEvent(type: string, data: any, correlationId?: string): void {
    if (!this.eventBusClient || this.eventBusClient.readyState !== WebSocket.OPEN) {
      this.log('warn', 'Cannot publish event: event bus not connected');
      return;
    }
    
    const message: EventMessage = {
      id: this.generateId(),
      type,
      source: this.config.name,
      timestamp: new Date().toISOString(),
      data,
      correlationId,
    };
    
    this.eventBusClient.send(JSON.stringify(message));
    this.recordMetric('event_published', 1, { type });
  }

  // ============= Scheduled Jobs / Cron =============
  
  private initializeScheduledJobs(jobConfigs: Array<{ name: string; schedule: string; handler: string }>): void {
    for (const jobConfig of jobConfigs) {
      const handler = (this as any)[jobConfig.handler];
      if (typeof handler !== 'function') {
        this.log('error', `Scheduled job handler not found: ${jobConfig.handler}`);
        continue;
      }
      
      const job: ScheduledJob = {
        id: this.generateId(),
        name: jobConfig.name,
        schedule: jobConfig.schedule,
        handler: handler.bind(this),
        enabled: true,
        errorCount: 0,
      };
      
      this.scheduledJobs.set(job.id, job);
      this.scheduleJob(job);
    }
  }

  protected addScheduledJob(name: string, schedule: string, handler: () => Promise<void>): string {
    const job: ScheduledJob = {
      id: this.generateId(),
      name,
      schedule,
      handler,
      enabled: true,
      errorCount: 0,
    };
    
    this.scheduledJobs.set(job.id, job);
    this.scheduleJob(job);
    
    return job.id;
  }

  private scheduleJob(job: ScheduledJob): void {
    if (!cron.validate(job.schedule)) {
      this.log('error', `Invalid cron schedule: ${job.schedule}`);
      return;
    }
    
    const task = cron.schedule(job.schedule, async () => {
      if (!job.enabled) return;
      
      job.lastRun = new Date();
      
      try {
        await job.handler();
        job.errorCount = 0;
        this.recordMetric('scheduled_job_success', 1, { job: job.name });
      } catch (error) {
        job.errorCount++;
        this.log('error', `Scheduled job failed: ${job.name}`, { error });
        this.recordMetric('scheduled_job_error', 1, { job: job.name });
        
        // Disable job after too many failures
        if (job.errorCount >= 5) {
          this.disableScheduledJob(job.id);
          this.log('error', `Scheduled job disabled due to repeated failures: ${job.name}`);
        }
      }
    }, {
      scheduled: true,
    });
    
    this.cronJobs.set(job.id, task);
  }

  protected disableScheduledJob(jobId: string): void {
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      job.enabled = false;
      const task = this.cronJobs.get(jobId);
      if (task) {
        task.stop();
      }
    }
  }

  protected enableScheduledJob(jobId: string): void {
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      job.enabled = true;
      job.errorCount = 0;
      const task = this.cronJobs.get(jobId);
      if (task) {
        task.start();
      }
    }
  }

  // ============= ML Pipeline Hooks =============
  
  protected async loadMLModel(id: string, modelPath: string, config?: MLPipelineConfig): Promise<void> {
    try {
      const session = await ort.InferenceSession.create(modelPath);
      
      const model: MLModel = {
        id,
        type: 'onnx',
        session,
        config: config || {},
      };
      
      this.mlModels.set(id, model);
      this.log('info', `ML model loaded: ${id}`, { modelPath });
    } catch (error) {
      this.log('error', `Failed to load ML model: ${id}`, { error });
      throw error;
    }
  }

  protected async runInference(modelId: string, input: any): Promise<any> {
    const model = this.mlModels.get(modelId);
    if (!model || !model.session) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Preprocess input if configured
      let processedInput = input;
      if (model.config.preprocessor) {
        processedInput = await model.config.preprocessor(input);
      }
      
      // Run inference with timeout
      const inferencePromise = model.session.run(processedInput);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Inference timeout')), model.config.timeout || 30000)
      );
      
      const output = await Promise.race([inferencePromise, timeoutPromise]);
      
      // Postprocess output if configured
      let processedOutput = output;
      if (model.config.postprocessor) {
        processedOutput = await model.config.postprocessor(output);
      }
      
      const duration = Date.now() - startTime;
      this.recordMetric('ml_inference_duration', duration, { model: modelId });
      this.recordMetric('ml_inference_success', 1, { model: modelId });
      
      return processedOutput;
    } catch (error) {
      this.recordMetric('ml_inference_error', 1, { model: modelId });
      throw error;
    }
  }

  protected registerMLPipeline(
    id: string,
    preprocessor: (input: any) => Promise<any>,
    postprocessor: (output: any) => Promise<any>
  ): void {
    const model = this.mlModels.get(id);
    if (model) {
      model.config.preprocessor = preprocessor;
      model.config.postprocessor = postprocessor;
    }
  }

  // ============= Reactive Rules Engine =============
  
  protected addRule(rule: ReactiveRule): void {
    const validatedRule = ReactiveRuleSchema.parse(rule);
    this.rules.set(validatedRule.id, validatedRule);
    this.log('info', `Rule added: ${validatedRule.name}`);
  }

  protected removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.ruleLastExecution.delete(ruleId);
  }

  protected async evaluateRules(context: Record<string, any>): Promise<void> {
    const sortedRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      try {
        if (this.shouldExecuteRule(rule) && this.evaluateConditions(rule, context)) {
          await this.executeRuleActions(rule, context);
          this.ruleLastExecution.set(rule.id, Date.now());
          this.recordMetric('rule_executed', 1, { rule: rule.name });
        }
      } catch (error) {
        this.log('error', `Rule execution failed: ${rule.name}`, { error });
        this.recordMetric('rule_error', 1, { rule: rule.name });
      }
    }
  }

  private shouldExecuteRule(rule: ReactiveRule): boolean {
    if (!rule.cooldown) return true;
    
    const lastExecution = this.ruleLastExecution.get(rule.id);
    if (!lastExecution) return true;
    
    return Date.now() - lastExecution >= rule.cooldown;
  }

  private evaluateConditions(rule: ReactiveRule, context: Record<string, any>): boolean {
    const results = rule.conditions.map(condition => {
      const value = this.getNestedValue(context, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
    
    return rule.conditionOperator === 'and' 
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq': return value === expectedValue;
      case 'neq': return value !== expectedValue;
      case 'gt': return value > expectedValue;
      case 'gte': return value >= expectedValue;
      case 'lt': return value < expectedValue;
      case 'lte': return value <= expectedValue;
      case 'contains': return String(value).includes(String(expectedValue));
      case 'matches': return new RegExp(expectedValue).test(String(value));
      default: return false;
    }
  }

  private async executeRuleActions(rule: ReactiveRule, context: Record<string, any>): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'emit':
          this.emit(action.target || 'rule:triggered', { rule, context, data: action.data });
          break;
        case 'log':
          this.log('info', `Rule triggered: ${rule.name}`, { context, data: action.data });
          break;
        case 'metric':
          this.recordMetric(action.target || `rule_${rule.id}`, 1, action.data);
          break;
        case 'alert':
          this.publishEvent('alert', { rule: rule.name, context, ...action.data });
          break;
        case 'command':
          if (action.target) {
            await this.executeCommand(action.target, action.data);
          }
          break;
        case 'custom':
          await this.executeCustomRuleAction(rule, action, context);
          break;
      }
    }
  }

  protected abstract executeCustomRuleAction(
    rule: ReactiveRule, 
    action: z.infer<typeof RuleActionSchema>, 
    context: Record<string, any>
  ): Promise<void>;

  protected abstract executeCommand(command: string, data: any): Promise<void>;

  // ============= Circuit Breaker & Retry =============
  
  protected async withCircuitBreaker<T>(
    name: string,
    operation: () => Promise<T>,
    config?: CircuitBreakerConfig
  ): Promise<T> {
    const cbConfig = config || this.enhancedConfig.circuitBreaker || {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 10000,
      halfOpenMaxCalls: 3,
    };
    
    let state = this.circuitBreakers.get(name);
    if (!state) {
      state = {
        state: 'closed',
        failures: 0,
        successCount: 0,
      };
      this.circuitBreakers.set(name, state);
    }
    
    // Check if circuit is open
    if (state.state === 'open') {
      if (state.nextRetry && Date.now() < state.nextRetry.getTime()) {
        throw new Error(`Circuit breaker is open for ${name}`);
      }
      // Move to half-open state
      state.state = 'half-open';
      state.successCount = 0;
    }
    
    // Check half-open limit
    if (state.state === 'half-open' && state.successCount >= (cbConfig.halfOpenMaxCalls || 3)) {
      state.state = 'closed';
      state.failures = 0;
    }
    
    try {
      const result = await operation();
      
      // Success handling
      if (state.state === 'half-open') {
        state.successCount++;
      }
      state.failures = 0;
      
      this.recordMetric('circuit_breaker_success', 1, { name });
      return result;
    } catch (error) {
      // Failure handling
      state.failures++;
      state.lastFailure = new Date();
      
      if (state.failures >= cbConfig.failureThreshold) {
        state.state = 'open';
        state.nextRetry = new Date(Date.now() + cbConfig.resetTimeout);
        this.log('warn', `Circuit breaker opened for ${name}`, { 
          failures: state.failures,
          nextRetry: state.nextRetry 
        });
      }
      
      this.recordMetric('circuit_breaker_failure', 1, { name });
      throw error;
    }
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> {
    const retryConfig = config || this.enhancedConfig.retryPolicy || {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    };
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          this.recordMetric('retry_success', 1, { attempt });
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (retryConfig.retryableErrors && 
            !retryConfig.retryableErrors.some(e => lastError.message.includes(e))) {
          throw lastError;
        }
        
        if (attempt < retryConfig.maxAttempts) {
          const delay = Math.min(
            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
            retryConfig.maxDelay
          );
          
          if (retryConfig.onRetry) {
            retryConfig.onRetry(lastError, attempt);
          }
          
          this.log('warn', `Retry attempt ${attempt} after ${delay}ms`, { error: lastError.message });
          this.recordMetric('retry_attempt', 1, { attempt });
          
          await this.sleep(delay);
        }
      }
    }
    
    this.recordMetric('retry_exhausted', 1);
    throw lastError!;
  }

  // ============= Utility Methods =============
  
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============= Lifecycle Methods =============
  
  public async start(): Promise<void> {
    await super.start();
    
    // Start all scheduled jobs
    for (const task of this.cronJobs.values()) {
      task.start();
    }
    
    this.log('info', 'Enhanced agent started with all features');
  }

  public async stop(): Promise<void> {
    // Stop all scheduled jobs
    for (const task of this.cronJobs.values()) {
      task.stop();
    }
    
    // Close event bus connection
    if (this.eventBusClient) {
      this.eventBusClient.close();
    }
    
    // Clear reconnect timer
    if (this.eventBusReconnectTimer) {
      clearTimeout(this.eventBusReconnectTimer);
    }
    
    // Close ML sessions
    for (const model of this.mlModels.values()) {
      if (model.session) {
        await model.session.release();
      }
    }
    
    await super.stop();
  }

  // ============= Health & Metrics =============
  
  protected performHealthChecks(): Record<string, boolean> {
    const checks = super.performHealthChecks();
    
    // Add enhanced component checks
    checks.eventBus = this.eventBusClient?.readyState === WebSocket.OPEN;
    checks.scheduledJobs = Array.from(this.scheduledJobs.values()).some(job => job.enabled);
    checks.mlModels = this.mlModels.size > 0;
    checks.rules = this.rules.size > 0;
    
    return checks;
  }

  protected getCustomMetrics(): MetricPoint[] {
    const metrics = super.getCustomMetrics();
    
    // Add enhanced metrics
    metrics.push({
      name: 'scheduled_jobs_active',
      value: Array.from(this.scheduledJobs.values()).filter(job => job.enabled).length,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'ml_models_loaded',
      value: this.mlModels.size,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'rules_active',
      value: Array.from(this.rules.values()).filter(rule => rule.enabled).length,
      timestamp: new Date().toISOString(),
    });
    
    metrics.push({
      name: 'circuit_breakers_open',
      value: Array.from(this.circuitBreakers.values()).filter(cb => cb.state === 'open').length,
      timestamp: new Date().toISOString(),
    });
    
    return metrics;
  }
}
