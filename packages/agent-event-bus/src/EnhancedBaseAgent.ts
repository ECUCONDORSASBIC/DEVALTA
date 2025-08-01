import { BaseAgent, AgentConfig, MetricPoint } from '../../../agents/src/shared/BaseAgent.js';
import { EventBus, createEventBus } from './index.js';
import { 
  SystemEventType, 
  CommandType,
  CommandResponse,
  MonitoringEventType,
  SecurityEventType,
} from './types/index.js';

export interface EnhancedAgentConfig extends AgentConfig {
  agentType: string;
  redis?: {
    host?: string;
    port?: number;
    password?: string;
  };
  websocket?: {
    url?: string;
    host?: string;
    port?: number;
  };
}

/**
 * Enhanced BaseAgent with EventBus integration
 */
export abstract class EnhancedBaseAgent extends BaseAgent {
  protected eventBus: EventBus;
  protected config: EnhancedAgentConfig;

  constructor(config: EnhancedAgentConfig) {
    super(config);
    this.config = config;

    // Create EventBus instance
    this.eventBus = createEventBus({
      agentId: config.name,
      agentType: config.agentType,
      redis: config.redis,
      websocket: config.websocket,
      debug: config.logLevel === 'debug',
      concurrency: 20,
    });

    this.setupEventBusHandlers();
  }

  /**
   * Setup EventBus event and command handlers
   */
  protected setupEventBusHandlers(): void {
    // Handle system commands
    this.eventBus.onCommand(CommandType.PING, async (command) => {
      return {
        commandId: command.id,
        success: true,
        result: {
          echo: command.data.echo,
          timestamp: new Date().toISOString(),
          agentId: this.config.name,
        },
        timestamp: new Date().toISOString(),
        duration: 0,
      };
    });

    this.eventBus.onCommand(CommandType.SHUTDOWN, async (command) => {
      const { graceful, timeout, reason } = command.data;
      
      this.log('info', `Shutdown requested: ${reason}`, { graceful, timeout });
      
      // Schedule shutdown
      setTimeout(() => {
        this.stop().then(() => process.exit(0));
      }, graceful ? Math.min(timeout, 30000) : 0);

      return {
        commandId: command.id,
        success: true,
        result: { message: 'Shutdown scheduled' },
        timestamp: new Date().toISOString(),
        duration: 0,
      };
    });

    this.eventBus.onCommand(CommandType.GET_METRICS, async (command) => {
      const metrics = this.getMetrics();
      
      return {
        commandId: command.id,
        success: true,
        result: metrics,
        timestamp: new Date().toISOString(),
        duration: 0,
      };
    });

    this.eventBus.onCommand(CommandType.SET_LOG_LEVEL, async (command) => {
      const { level, duration } = command.data;
      const previousLevel = this.config.logLevel;
      
      this.config.logLevel = level;
      
      // Restore previous level after duration if specified
      if (duration) {
        setTimeout(() => {
          this.config.logLevel = previousLevel;
        }, duration);
      }

      return {
        commandId: command.id,
        success: true,
        result: { previousLevel, newLevel: level },
        timestamp: new Date().toISOString(),
        duration: 0,
      };
    });

    // Subscribe to relevant events
    this.setupEventSubscriptions();
  }

  /**
   * Setup event subscriptions - override in subclasses
   */
  protected abstract setupEventSubscriptions(): void;

  /**
   * Start the agent
   */
  public async start(): Promise<void> {
    // Connect to EventBus first
    await this.eventBus.connect();

    // Start the HTTP server
    await super.start();

    // Publish agent healthy event
    await this.eventBus.publishSystemEvent(SystemEventType.AGENT_HEALTHY, {
      status: 'healthy',
      checks: this.performHealthChecks(),
      metrics: {
        uptime: 0,
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage().user,
      },
    });
  }

  /**
   * Stop the agent
   */
  public async stop(): Promise<void> {
    // Publish agent stopped event
    await this.eventBus.publishSystemEvent(SystemEventType.AGENT_STOPPED, {
      reason: 'Manual stop',
      graceful: true,
    });

    // Disconnect from EventBus
    await this.eventBus.disconnect();

    // Stop the HTTP server
    await super.stop();
  }

  /**
   * Enhanced logging that also publishes to EventBus
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: any): void {
    super.log(level, message, meta);

    // Publish important logs as monitoring events
    if (level === 'error' || level === 'warn') {
      this.eventBus.publishEvent(MonitoringEventType.ALERT_TRIGGERED, {
        alertName: `${this.config.name}.log.${level}`,
        severity: level,
        message,
        meta,
      }).catch(err => console.error('Failed to publish log event:', err));
    }
  }

  /**
   * Record metric and publish to EventBus
   */
  protected recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    super.recordMetric(name, value, labels);

    // Publish metric event
    this.eventBus.publishEvent(MonitoringEventType.METRIC_RECORDED, {
      metricName: `${this.config.name}.${name}`,
      metricValue: value,
      labels,
    }).catch(err => console.error('Failed to publish metric event:', err));
  }

  /**
   * Send command to another agent
   */
  protected async sendCommand(
    type: string,
    targetAgent: string | { agentType: string },
    data: any,
    options?: any
  ): Promise<CommandResponse> {
    return this.eventBus.sendCommand(type, targetAgent, data, options);
  }

  /**
   * Publish custom event
   */
  protected async publishEvent(
    type: string,
    data: any,
    options?: any
  ): Promise<void> {
    return this.eventBus.publishEvent(type, data, options);
  }

  /**
   * Subscribe to custom event
   */
  protected async subscribeToEvent(
    pattern: string | string[],
    handler: (event: any) => void | Promise<void>
  ): Promise<string> {
    return this.eventBus.on(pattern, handler);
  }

  /**
   * Get EventBus statistics
   */
  protected getEventBusStats() {
    return this.eventBus.getStats();
  }
}
