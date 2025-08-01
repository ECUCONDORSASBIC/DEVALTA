import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import PQueue from 'p-queue';
import { 
  Event, 
  BaseEvent,
  EventPriority,
  SystemEventType,
  CommandEventType,
} from './types/events.js';
import { 
  Command, 
  CommandResponse,
  CommandType,
} from './types/commands.js';
import {
  ITransport,
  TransportType,
  TransportFactoryOptions,
  ConnectionStatus,
  MessageEnvelope,
  PublishOptions,
  SubscriptionOptions,
  IMessageInterceptor,
} from './types/transport.js';
import { RedisTransport } from './transports/RedisTransport.js';
import { WebSocketTransport } from './transports/WebSocketTransport.js';

const log = debug('altamedica:event-bus');

export interface EventBusOptions {
  /**
   * Agent information
   */
  agent: {
    id: string;
    type: string;
    instanceId?: string;
  };

  /**
   * Primary transport configuration
   */
  transport: TransportFactoryOptions;

  /**
   * Fallback transport configuration
   */
  fallbackTransport?: TransportFactoryOptions;

  /**
   * Enable automatic fallback
   */
  autoFallback?: boolean;

  /**
   * Queue configuration
   */
  queue?: {
    concurrency?: number;
    timeout?: number;
    throwOnTimeout?: boolean;
  };

  /**
   * Message interceptors
   */
  interceptors?: IMessageInterceptor[];

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export interface EventBusStats {
  /**
   * Current transport type
   */
  transport: TransportType;

  /**
   * Connection status
   */
  status: ConnectionStatus;

  /**
   * Transport statistics
   */
  transportStats: any;

  /**
   * Queue statistics
   */
  queueStats: {
    size: number;
    pending: number;
    isPaused: boolean;
  };

  /**
   * Event statistics
   */
  eventStats: {
    published: number;
    received: number;
    errors: number;
  };

  /**
   * Command statistics
   */
  commandStats: {
    sent: number;
    received: number;
    completed: number;
    failed: number;
  };
}

/**
 * High-level event bus for agent-to-agent communication
 */
export class EventBus extends EventEmitter {
  private transport?: ITransport;
  private fallbackTransport?: ITransport;
  private readonly options: EventBusOptions;
  private readonly queue: PQueue;
  private readonly subscriptions = new Map<string, string>();
  private stats = {
    events: { published: 0, received: 0, errors: 0 },
    commands: { sent: 0, received: 0, completed: 0, failed: 0 },
  };
  private isConnected = false;
  private usingFallback = false;

  constructor(options: EventBusOptions) {
    super();
    this.options = options;

    if (options.debug) {
      debug.enable('altamedica:*');
    }

    // Initialize queue
    this.queue = new PQueue({
      concurrency: options.queue?.concurrency || 10,
      timeout: options.queue?.timeout,
      throwOnTimeout: options.queue?.throwOnTimeout ?? false,
    });

    // Create transports
    this.createTransports();
  }

  /**
   * Get current agent info
   */
  get agent() {
    return this.options.agent;
  }

  /**
   * Check if connected
   */
  get connected() {
    return this.isConnected;
  }

  /**
   * Get current transport
   */
  get currentTransport(): ITransport | undefined {
    return this.usingFallback ? this.fallbackTransport : this.transport;
  }

  private createTransports(): void {
    // Create primary transport
    this.transport = this.createTransport(this.options.transport);

    // Create fallback transport if configured
    if (this.options.fallbackTransport) {
      this.fallbackTransport = this.createTransport(this.options.fallbackTransport);
    }

    // Add interceptors
    if (this.options.interceptors) {
      for (const interceptor of this.options.interceptors) {
        this.transport.addInterceptor?.(interceptor);
        this.fallbackTransport?.addInterceptor?.(interceptor);
      }
    }

    // Set up transport event handlers
    this.setupTransportHandlers(this.transport, false);
    if (this.fallbackTransport) {
      this.setupTransportHandlers(this.fallbackTransport, true);
    }
  }

  private createTransport(config: TransportFactoryOptions): ITransport {
    switch (config.type) {
      case TransportType.REDIS:
        return new RedisTransport(config);
      case TransportType.WEBSOCKET:
        return new WebSocketTransport(config);
      default:
        throw new Error(`Unsupported transport type: ${config.type}`);
    }
  }

  private setupTransportHandlers(transport: ITransport, isFallback: boolean): void {
    transport.on('connected', () => {
      log(`${isFallback ? 'Fallback' : 'Primary'} transport connected`);
      if (!isFallback || this.options.autoFallback) {
        this.handleTransportConnected(isFallback);
      }
    });

    transport.on('disconnected', () => {
      log(`${isFallback ? 'Fallback' : 'Primary'} transport disconnected`);
      if (!isFallback && this.options.autoFallback && this.fallbackTransport) {
        this.switchToFallback();
      }
    });

    transport.on('error', (error: Error) => {
      log(`${isFallback ? 'Fallback' : 'Primary'} transport error:`, error);
      this.emit('error', error);
    });
  }

  private handleTransportConnected(isFallback: boolean): void {
    this.isConnected = true;
    this.usingFallback = isFallback;
    this.emit('connected', { transport: this.currentTransport?.type, fallback: isFallback });

    // Publish agent started event
    this.publishSystemEvent(SystemEventType.AGENT_STARTED, {
      agentConfig: {
        name: this.options.agent.id,
        version: process.env.npm_package_version || '1.0.0',
        capabilities: [],
        endpoints: [],
      },
    }).catch(console.error);
  }

  private async switchToFallback(): Promise<void> {
    if (!this.fallbackTransport || this.usingFallback) {
      return;
    }

    log('Switching to fallback transport');
    this.usingFallback = true;

    try {
      await this.fallbackTransport.connect();
      
      // Re-establish subscriptions
      for (const [localId, transportId] of this.subscriptions) {
        await this.transport?.unsubscribe(transportId);
        // Subscriptions will be re-created on the new transport as needed
      }
    } catch (error) {
      log('Failed to switch to fallback transport:', error);
      this.emit('error', error);
    }
  }

  /**
   * Connect to the event bus
   */
  async connect(): Promise<void> {
    log('Connecting to event bus');

    try {
      await this.transport?.connect();
      
      // Set up graceful shutdown
      process.on('SIGINT', () => this.disconnect());
      process.on('SIGTERM', () => this.disconnect());
    } catch (error) {
      log('Failed to connect to primary transport:', error);
      
      if (this.options.autoFallback && this.fallbackTransport) {
        await this.switchToFallback();
      } else {
        throw error;
      }
    }
  }

  /**
   * Disconnect from the event bus
   */
  async disconnect(): Promise<void> {
    log('Disconnecting from event bus');

    // Publish agent stopped event
    try {
      await this.publishSystemEvent(SystemEventType.AGENT_STOPPED, {
        reason: 'Graceful shutdown',
        graceful: true,
      });
    } catch (error) {
      log('Failed to publish agent stopped event:', error);
    }

    // Clear queue
    this.queue.clear();
    await this.queue.onIdle();

    // Disconnect transports
    await Promise.all([
      this.transport?.disconnect(),
      this.fallbackTransport?.disconnect(),
    ]);

    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Publish an event
   */
  async publishEvent(
    type: string,
    data: any,
    options?: PublishOptions & {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const event: Event = {
      id: uuidv4(),
      type,
      source: this.options.agent,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data,
      correlationId: options?.correlationId,
      causationId: options?.causationId,
      metadata: options?.metadata,
    } as any;

    await this.queue.add(async () => {
      try {
        await this.currentTransport?.publishEvent(event, options);
        this.stats.events.published++;
        this.emit('event:published', event);
      } catch (error) {
        this.stats.events.errors++;
        log('Failed to publish event:', error);
        throw error;
      }
    });
  }

  /**
   * Publish a system event
   */
  async publishSystemEvent(type: SystemEventType, data: any): Promise<void> {
    return this.publishEvent(type, data, {
      priority: EventPriority.HIGH,
    });
  }

  /**
   * Send a command
   */
  async sendCommand(
    type: string,
    targetAgent: string | { agentId?: string; agentType?: string; broadcast?: boolean },
    data: any,
    options?: {
      timeout?: number;
      priority?: EventPriority;
      retryPolicy?: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
      };
      metadata?: Record<string, any>;
    }
  ): Promise<CommandResponse> {
    const command: Command = {
      id: uuidv4(),
      type,
      source: this.options.agent,
      target: typeof targetAgent === 'string' 
        ? { agentId: targetAgent } 
        : targetAgent,
      timestamp: new Date().toISOString(),
      timeout: options?.timeout || 30000,
      priority: options?.priority || EventPriority.NORMAL,
      retryPolicy: options?.retryPolicy,
      metadata: options?.metadata,
      data,
    } as any;

    return this.queue.add(async () => {
      try {
        this.stats.commands.sent++;
        const response = await this.currentTransport!.publishCommand(command);
        
        if (response.success) {
          this.stats.commands.completed++;
        } else {
          this.stats.commands.failed++;
        }

        this.emit('command:sent', { command, response });
        return response;
      } catch (error) {
        this.stats.commands.failed++;
        log('Failed to send command:', error);
        throw error;
      }
    });
  }

  /**
   * Subscribe to events
   */
  async on(
    eventPattern: string | string[],
    handler: (event: Event) => void | Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const patterns = Array.isArray(eventPattern) ? eventPattern : [eventPattern];
    
    const wrappedHandler = async (envelope: MessageEnvelope<Event>) => {
      try {
        this.stats.events.received++;
        await handler(envelope.payload);
        this.emit('event:received', envelope.payload);
      } catch (error) {
        this.stats.events.errors++;
        log('Error handling event:', error);
        throw error;
      }
    };

    const transportId = await this.currentTransport!.subscribeToEvents(
      patterns,
      wrappedHandler,
      options
    );

    const localId = uuidv4();
    this.subscriptions.set(localId, transportId);

    return localId;
  }

  /**
   * Subscribe to commands
   */
  async onCommand(
    commandPattern: string | string[],
    handler: (command: Command) => CommandResponse | Promise<CommandResponse>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const patterns = Array.isArray(commandPattern) ? commandPattern : [commandPattern];
    
    const wrappedHandler = async (envelope: MessageEnvelope<Command>): Promise<CommandResponse> => {
      const startTime = Date.now();
      
      try {
        this.stats.commands.received++;
        const response = await handler(envelope.payload);
        
        if (response.success) {
          this.stats.commands.completed++;
        } else {
          this.stats.commands.failed++;
        }

        // Add timing information
        response.duration = Date.now() - startTime;

        this.emit('command:received', { command: envelope.payload, response });
        return response;
      } catch (error) {
        this.stats.commands.failed++;
        log('Error handling command:', error);
        
        return {
          commandId: envelope.payload.id,
          success: false,
          error: {
            code: 'HANDLER_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error,
          },
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }
    };

    const transportId = await this.currentTransport!.subscribeToCommands(
      patterns,
      wrappedHandler,
      options
    );

    const localId = uuidv4();
    this.subscriptions.set(localId, transportId);

    return localId;
  }

  /**
   * Unsubscribe
   */
  async off(subscriptionId: string): Promise<void> {
    const transportId = this.subscriptions.get(subscriptionId);
    if (transportId) {
      await this.currentTransport?.unsubscribe(transportId);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Get statistics
   */
  getStats(): EventBusStats {
    return {
      transport: this.currentTransport?.type || TransportType.IN_MEMORY,
      status: this.currentTransport?.status || ConnectionStatus.DISCONNECTED,
      transportStats: this.currentTransport?.getStats(),
      queueStats: {
        size: this.queue.size,
        pending: this.queue.pending,
        isPaused: this.queue.isPaused,
      },
      eventStats: { ...this.stats.events },
      commandStats: { ...this.stats.commands },
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    return this.currentTransport?.healthCheck() || false;
  }
}
