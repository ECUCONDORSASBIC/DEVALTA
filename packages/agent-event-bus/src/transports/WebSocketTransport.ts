import WebSocket from 'ws';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import pRetry from 'p-retry';
import { BaseTransport } from './BaseTransport.js';
import { Event } from '../types/events.js';
import { Command, CommandResponse, CommandResponseSchema } from '../types/commands.js';
import {
  TransportType,
  ConnectionStatus,
  MessageEnvelope,
  PublishOptions,
  SubscriptionOptions,
  TransportFactoryOptions,
} from '../types/transport.js';

interface WebSocketMessage {
  id: string;
  type: 'event' | 'command' | 'response' | 'subscribe' | 'unsubscribe' | 'ack' | 'nack';
  subject: string;
  data: any;
  headers: Record<string, string>;
  replyTo?: string;
}

interface PendingCommand {
  resolve: (response: CommandResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

/**
 * WebSocket transport for real-time bidirectional communication
 */
export class WebSocketTransport extends BaseTransport {
  private ws?: WebSocket;
  private readonly config: TransportFactoryOptions;
  private reconnectAttempts = 0;
  private pingInterval?: NodeJS.Timeout;
  private pendingCommands = new Map<string, PendingCommand>();
  private messageHandlers = new Map<string, (message: WebSocketMessage) => Promise<void>>();

  constructor(config: TransportFactoryOptions) {
    super(TransportType.WEBSOCKET);
    this.config = config;
  }

  async connect(): Promise<void> {
    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      await pRetry(
        async () => {
          const url = this.config.connection.url || 
            `ws://${this.config.connection.host || 'localhost'}:${this.config.connection.port || 8080}`;

          this.ws = new WebSocket(url, {
            headers: {
              'Authorization': this.config.connection.password ? 
                `Bearer ${this.config.connection.password}` : undefined,
            },
            handshakeTimeout: this.config.connection.timeout || 5000,
          });

          await new Promise<void>((resolve, reject) => {
            this.ws!.once('open', () => {
              this.onOpen();
              resolve();
            });
            this.ws!.once('error', reject);
          });
        },
        {
          retries: this.config.connection.reconnect?.maxAttempts || 5,
          minTimeout: this.config.connection.reconnect?.delay || 1000,
          maxTimeout: this.config.connection.reconnect?.maxDelay || 30000,
          factor: this.config.connection.reconnect?.backoffMultiplier || 2,
          onFailedAttempt: (error) => {
            this.reconnectAttempts++;
            this.setStatus(ConnectionStatus.RECONNECTING);
            console.error(`WebSocket connection attempt ${error.attemptNumber} failed:`, error.message);
          },
        }
      );
    } catch (error) {
      this.setStatus(ConnectionStatus.ERROR);
      this._stats.lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
      throw error;
    }
  }

  private onOpen(): void {
    this.reconnectAttempts = 0;
    this.setStatus(ConnectionStatus.CONNECTED);

    // Set up event handlers
    this.ws!.on('message', (data) => this.onMessage(data));
    this.ws!.on('close', () => this.onClose());
    this.ws!.on('error', (error) => this.onError(error));
    this.ws!.on('pong', () => this.onPong());

    // Start ping interval
    this.startPingInterval();

    // Re-subscribe to existing subscriptions
    this.resubscribe();
  }

  private onMessage(data: WebSocket.Data): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      // Handle different message types
      switch (message.type) {
        case 'response':
          this.handleCommandResponse(message);
          break;
        case 'event':
        case 'command':
          this.handleIncomingMessage(message);
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private onClose(): void {
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.stopPingInterval();

    // Attempt to reconnect if configured
    if (this.config.connection.reconnect?.enabled !== false) {
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.config.connection.reconnect?.delay || 1000);
    }
  }

  private onError(error: Error): void {
    console.error('WebSocket error:', error);
    this._stats.lastError = {
      message: error.message,
      timestamp: new Date(),
    };
    this.emit('error', error);
  }

  private onPong(): void {
    // Connection is alive
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  private async resubscribe(): Promise<void> {
    for (const [id, subscription] of this._subscriptions) {
      const message: WebSocketMessage = {
        id: uuidv4(),
        type: 'subscribe',
        subject: subscription.patterns.join(','),
        data: subscription.options || {},
        headers: {},
      };

      this.send(message);
    }
  }

  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  private handleCommandResponse(message: WebSocketMessage): void {
    const pending = this.pendingCommands.get(message.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingCommands.delete(message.id);

      try {
        const response = CommandResponseSchema.parse(message.data);
        pending.resolve(response);
      } catch (error) {
        pending.reject(error as Error);
      }
    }
  }

  private async handleIncomingMessage(message: WebSocketMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.subject);
    if (handler) {
      await handler(message);
    }
  }

  async disconnect(): Promise<void> {
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.stopPingInterval();

    // Clear pending commands
    for (const [id, pending] of this.pendingCommands) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingCommands.clear();

    // Clear handlers
    this.messageHandlers.clear();

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  async publishEvent(event: Event, options?: PublishOptions): Promise<void> {
    const { subject, data, headers } = await this.prepareEvent(event, options);
    
    const message: WebSocketMessage = {
      id: event.id,
      type: 'event',
      subject,
      data: this._codec.decode(data),
      headers,
    };

    this.send(message);
  }

  async publishCommand(command: Command, options?: PublishOptions): Promise<CommandResponse> {
    const { subject, data, headers } = await this.prepareCommand(command, options);
    
    const message: WebSocketMessage = {
      id: command.id,
      type: 'command',
      subject,
      data: this._codec.decode(data),
      headers,
    };

    // Set up response handler
    const responsePromise = new Promise<CommandResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(command.id);
        reject(new Error(`Command timeout: ${command.id}`));
      }, command.timeout);

      this.pendingCommands.set(command.id, { resolve, reject, timeout });
    });

    this.send(message);
    return responsePromise;
  }

  async subscribeToEvents(
    patterns: string[],
    handler: (message: MessageEnvelope<Event>) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const subscriptionId = options?.id || this.generateSubscriptionId();
    
    // Create handler
    const messageHandler = async (message: WebSocketMessage) => {
      const envelope = await this.processIncomingMessage<Event>(
        Buffer.from(JSON.stringify(message.data)),
        message.headers,
        message.replyTo
      );

      // Override ack/nack
      envelope.ack = async () => {
        this.send({
          id: message.id,
          type: 'ack',
          subject: message.subject,
          data: {},
          headers: {},
        });
      };

      envelope.nack = async (delay?: number) => {
        this.send({
          id: message.id,
          type: 'nack',
          subject: message.subject,
          data: { delay },
          headers: {},
        });
      };

      await handler(envelope);
    };

    // Register handler for each pattern
    for (const pattern of patterns) {
      this.messageHandlers.set(pattern, messageHandler);
    }

    // Send subscription message
    const message: WebSocketMessage = {
      id: subscriptionId,
      type: 'subscribe',
      subject: patterns.join(','),
      data: options || {},
      headers: {},
    };

    this.send(message);

    // Store subscription
    this._subscriptions.set(subscriptionId, { patterns, options });

    return subscriptionId;
  }

  async subscribeToCommands(
    patterns: string[],
    handler: (message: MessageEnvelope<Command>) => Promise<CommandResponse>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const subscriptionId = options?.id || this.generateSubscriptionId();
    
    // Create handler
    const messageHandler = async (message: WebSocketMessage) => {
      const envelope = await this.processIncomingMessage<Command>(
        Buffer.from(JSON.stringify(message.data)),
        message.headers,
        message.replyTo
      );

      // Handle command
      const response = await handler(envelope);

      // Send response
      if (message.replyTo) {
        this.send({
          id: message.id,
          type: 'response',
          subject: message.replyTo,
          data: response,
          headers: {},
        });
      }
    };

    // Register handler for each pattern
    for (const pattern of patterns) {
      this.messageHandlers.set(pattern, messageHandler);
    }

    // Send subscription message
    const message: WebSocketMessage = {
      id: subscriptionId,
      type: 'subscribe',
      subject: patterns.join(','),
      data: options || {},
      headers: {},
    };

    this.send(message);

    // Store subscription
    this._subscriptions.set(subscriptionId, { patterns, options });

    return subscriptionId;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this._subscriptions.get(subscriptionId);
    if (subscription) {
      // Remove handlers
      for (const pattern of subscription.patterns) {
        this.messageHandlers.delete(pattern);
      }

      // Send unsubscribe message
      const message: WebSocketMessage = {
        id: subscriptionId,
        type: 'unsubscribe',
        subject: subscription.patterns.join(','),
        data: {},
        headers: {},
      };

      this.send(message);

      // Remove subscription
      this._subscriptions.delete(subscriptionId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
