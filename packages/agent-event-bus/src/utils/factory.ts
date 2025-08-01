import { EventBus, EventBusOptions } from '../EventBus.js';
import { TransportType, TransportFactoryOptions } from '../types/transport.js';

export interface CreateEventBusOptions {
  /**
   * Agent ID
   */
  agentId: string;

  /**
   * Agent type
   */
  agentType: string;

  /**
   * Instance ID (optional)
   */
  instanceId?: string;

  /**
   * Redis connection options
   */
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    username?: string;
  };

  /**
   * WebSocket connection options
   */
  websocket?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
  };

  /**
   * Use WebSocket as primary transport
   */
  useWebSocketPrimary?: boolean;

  /**
   * Enable fallback transport
   */
  enableFallback?: boolean;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Queue concurrency
   */
  concurrency?: number;
}

/**
 * Create an EventBus instance with sensible defaults
 */
export function createEventBus(options: CreateEventBusOptions): EventBus {
  const {
    agentId,
    agentType,
    instanceId,
    redis,
    websocket,
    useWebSocketPrimary = false,
    enableFallback = true,
    debug = false,
    concurrency = 10,
  } = options;

  // Create Redis transport config
  const redisTransport: TransportFactoryOptions = {
    type: TransportType.REDIS,
    connection: {
      host: redis?.host || process.env.REDIS_HOST || 'localhost',
      port: redis?.port || parseInt(process.env.REDIS_PORT || '6379', 10),
      password: redis?.password || process.env.REDIS_PASSWORD,
      username: redis?.username || process.env.REDIS_USERNAME,
      timeout: 5000,
      reconnect: {
        enabled: true,
        maxAttempts: 10,
        delay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 1.5,
      },
    },
    options: {
      consumerGroup: `altamedica-${agentType}`,
    },
  };

  // Create WebSocket transport config
  const websocketTransport: TransportFactoryOptions = {
    type: TransportType.WEBSOCKET,
    connection: {
      url: websocket?.url || process.env.WEBSOCKET_URL,
      host: websocket?.host || process.env.WEBSOCKET_HOST || 'localhost',
      port: websocket?.port || parseInt(process.env.WEBSOCKET_PORT || '8080', 10),
      password: websocket?.password || process.env.WEBSOCKET_TOKEN,
      timeout: 5000,
      reconnect: {
        enabled: true,
        maxAttempts: -1, // Infinite retries for WebSocket
        delay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
      },
    },
  };

  // Create EventBus options
  const eventBusOptions: EventBusOptions = {
    agent: {
      id: agentId,
      type: agentType,
      instanceId: instanceId || process.env.HOSTNAME || undefined,
    },
    transport: useWebSocketPrimary ? websocketTransport : redisTransport,
    fallbackTransport: enableFallback 
      ? (useWebSocketPrimary ? redisTransport : websocketTransport)
      : undefined,
    autoFallback: enableFallback,
    queue: {
      concurrency,
      timeout: 60000, // 1 minute timeout for queued operations
      throwOnTimeout: false,
    },
    debug,
  };

  return new EventBus(eventBusOptions);
}

/**
 * Create an EventBus instance for testing with in-memory transport
 */
export function createTestEventBus(agentId: string, agentType: string): EventBus {
  // For testing, we'll use WebSocket transport pointing to a local server
  return createEventBus({
    agentId,
    agentType,
    websocket: {
      host: 'localhost',
      port: 8080,
    },
    useWebSocketPrimary: true,
    enableFallback: false,
    debug: true,
  });
}
