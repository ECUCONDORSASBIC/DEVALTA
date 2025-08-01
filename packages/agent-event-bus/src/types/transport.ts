import { Event, DeliveryGuarantee } from './events.js';
import { Command, CommandResponse } from './commands.js';

/**
 * Transport connection status
 */
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * Transport types
 */
export enum TransportType {
  NATS = 'nats',
  REDIS = 'redis',
  WEBSOCKET = 'websocket',
  IN_MEMORY = 'in-memory',
}

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  /**
   * Subscription ID
   */
  id?: string;

  /**
   * Queue group name for load balancing
   */
  queueGroup?: string;

  /**
   * Durable subscription name
   */
  durable?: string;

  /**
   * Max in-flight messages
   */
  maxInFlight?: number;

  /**
   * Message acknowledgment timeout
   */
  ackTimeout?: number;

  /**
   * Start position for replay
   */
  startPosition?: 'new' | 'first' | 'last' | Date;

  /**
   * Filter by metadata
   */
  metadataFilter?: Record<string, any>;
}

/**
 * Publish options
 */
export interface PublishOptions {
  /**
   * Delivery guarantee
   */
  deliveryGuarantee?: DeliveryGuarantee;

  /**
   * Time to live (milliseconds)
   */
  ttl?: number;

  /**
   * Delay before delivery (milliseconds)
   */
  delay?: number;

  /**
   * Target specific agents
   */
  targetAgents?: string[];

  /**
   * Target agent types
   */
  targetAgentTypes?: string[];

  /**
   * Partition key for ordering
   */
  partitionKey?: string;
}

/**
 * Message envelope
 */
export interface MessageEnvelope<T = any> {
  /**
   * Message ID
   */
  id: string;

  /**
   * Message payload
   */
  payload: T;

  /**
   * Message headers
   */
  headers: Record<string, string>;

  /**
   * Received timestamp
   */
  receivedAt: Date;

  /**
   * Delivery attempt count
   */
  deliveryCount: number;

  /**
   * Reply-to subject
   */
  replyTo?: string;

  /**
   * Acknowledge the message
   */
  ack(): Promise<void>;

  /**
   * Negative acknowledge the message
   */
  nack(delay?: number): Promise<void>;

  /**
   * Reply to the message
   */
  reply(response: any): Promise<void>;
}

/**
 * Transport statistics
 */
export interface TransportStats {
  /**
   * Messages sent
   */
  messagesSent: number;

  /**
   * Messages received
   */
  messagesReceived: number;

  /**
   * Bytes sent
   */
  bytesSent: number;

  /**
   * Bytes received
   */
  bytesReceived: number;

  /**
   * Active subscriptions
   */
  subscriptions: number;

  /**
   * Connection uptime
   */
  uptime: number;

  /**
   * Last error
   */
  lastError?: {
    message: string;
    timestamp: Date;
  };
}

/**
 * Transport interface
 */
export interface ITransport {
  /**
   * Transport type
   */
  readonly type: TransportType;

  /**
   * Connection status
   */
  readonly status: ConnectionStatus;

  /**
   * Connect to the transport
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the transport
   */
  disconnect(): Promise<void>;

  /**
   * Publish an event
   */
  publishEvent(event: Event, options?: PublishOptions): Promise<void>;

  /**
   * Publish a command
   */
  publishCommand(command: Command, options?: PublishOptions): Promise<CommandResponse>;

  /**
   * Subscribe to events
   */
  subscribeToEvents(
    patterns: string[],
    handler: (message: MessageEnvelope<Event>) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string>;

  /**
   * Subscribe to commands
   */
  subscribeToCommands(
    patterns: string[],
    handler: (message: MessageEnvelope<Command>) => Promise<CommandResponse>,
    options?: SubscriptionOptions
  ): Promise<string>;

  /**
   * Unsubscribe
   */
  unsubscribe(subscriptionId: string): Promise<void>;

  /**
   * Get transport statistics
   */
  getStats(): TransportStats;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;

  /**
   * Event handlers
   */
  on(event: 'connected' | 'disconnected' | 'error' | 'reconnecting', handler: (...args: any[]) => void): void;
  off(event: 'connected' | 'disconnected' | 'error' | 'reconnecting', handler: (...args: any[]) => void): void;
}

/**
 * Transport factory options
 */
export interface TransportFactoryOptions {
  /**
   * Transport type
   */
  type: TransportType;

  /**
   * Connection options
   */
  connection: {
    /**
     * Connection URL or URLs
     */
    url?: string | string[];

    /**
     * Host
     */
    host?: string;

    /**
     * Port
     */
    port?: number;

    /**
     * Username
     */
    username?: string;

    /**
     * Password
     */
    password?: string;

    /**
     * TLS options
     */
    tls?: {
      enabled: boolean;
      cert?: string;
      key?: string;
      ca?: string;
      rejectUnauthorized?: boolean;
    };

    /**
     * Connection timeout
     */
    timeout?: number;

    /**
     * Reconnect options
     */
    reconnect?: {
      enabled: boolean;
      maxAttempts?: number;
      delay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    };
  };

  /**
   * Transport-specific options
   */
  options?: Record<string, any>;
}

/**
 * Message codec interface
 */
export interface IMessageCodec {
  /**
   * Encode a message
   */
  encode<T>(message: T): Buffer;

  /**
   * Decode a message
   */
  decode<T>(data: Buffer): T;

  /**
   * Content type
   */
  readonly contentType: string;
}

/**
 * Message interceptor
 */
export interface IMessageInterceptor {
  /**
   * Intercept outgoing messages
   */
  onSend?(message: any, headers: Record<string, string>): Promise<{ message: any; headers: Record<string, string> }>;

  /**
   * Intercept incoming messages
   */
  onReceive?(message: any, headers: Record<string, string>): Promise<{ message: any; headers: Record<string, string> }>;
}
