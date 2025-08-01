import { Redis, RedisOptions } from 'ioredis';
import pRetry from 'p-retry';
import { v4 as uuidv4 } from 'uuid';
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

interface RedisSubscription {
  id: string;
  patterns: string[];
  handler: (message: MessageEnvelope<any>) => Promise<any>;
  options?: SubscriptionOptions;
  active: boolean;
  consumerName: string;
  lastId: string;
}

/**
 * Redis transport using Redis Streams
 */
export class RedisTransport extends BaseTransport {
  private client?: Redis;
  private subscriber?: Redis;
  private readonly config: TransportFactoryOptions;
  private consumerGroup: string;
  private consumerId: string;
  private pollInterval?: NodeJS.Timeout;

  constructor(config: TransportFactoryOptions) {
    super(TransportType.REDIS);
    this.config = config;
    this.consumerGroup = config.options?.consumerGroup || 'altamedica-agents';
    this.consumerId = `${this.consumerGroup}:${uuidv4()}`;
  }

  async connect(): Promise<void> {
    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      const redisOptions: RedisOptions = {
        host: this.config.connection.host || 'localhost',
        port: this.config.connection.port || 6379,
        password: this.config.connection.password,
        username: this.config.connection.username,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          this.setStatus(ConnectionStatus.RECONNECTING);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      };

      // Create main client for publishing
      this.client = new Redis(redisOptions);
      
      // Create subscriber client
      this.subscriber = new Redis(redisOptions);

      // Wait for connection
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          this.client!.once('ready', () => resolve());
          this.client!.once('error', reject);
        }),
        new Promise<void>((resolve, reject) => {
          this.subscriber!.once('ready', () => resolve());
          this.subscriber!.once('error', reject);
        }),
      ]);

      // Start polling for messages
      this.startPolling();

      this.setStatus(ConnectionStatus.CONNECTED);
    } catch (error) {
      this.setStatus(ConnectionStatus.ERROR);
      this._stats.lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.setStatus(ConnectionStatus.DISCONNECTED);

    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }

    // Clear subscriptions
    this._subscriptions.clear();

    // Disconnect clients
    if (this.client) {
      await this.client.quit();
      this.client = undefined;
    }

    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = undefined;
    }
  }

  async publishEvent(event: Event, options?: PublishOptions): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const { subject, data, headers } = await this.prepareEvent(event, options);
    const streamKey = this.getStreamKey(subject);

    // Add to stream
    await this.client.xadd(
      streamKey,
      '*',
      'data', data.toString('base64'),
      'headers', JSON.stringify(headers)
    );

    // Set TTL if specified
    if (options?.ttl) {
      await this.client.expire(streamKey, Math.ceil(options.ttl / 1000));
    }
  }

  async publishCommand(command: Command, options?: PublishOptions): Promise<CommandResponse> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const { subject, data, headers } = await this.prepareCommand(command, options);
    const replyChannel = `reply:${command.id}`;
    
    // Set up reply listener
    const responsePromise = new Promise<CommandResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.subscriber?.unsubscribe(replyChannel);
        reject(new Error(`Command timeout: ${command.id}`));
      }, command.timeout);

      this.subscriber?.subscribe(replyChannel, (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this.subscriber?.on('message', (channel, message) => {
        if (channel === replyChannel) {
          clearTimeout(timeout);
          this.subscriber?.unsubscribe(replyChannel);
          
          try {
            const response = JSON.parse(message);
            const validatedResponse = CommandResponseSchema.parse(response);
            resolve(validatedResponse);
          } catch (error) {
            reject(error);
          }
        }
      });
    });

    // Publish command
    const streamKey = this.getStreamKey(subject);
    await this.client.xadd(
      streamKey,
      '*',
      'data', data.toString('base64'),
      'headers', JSON.stringify({ ...headers, 'reply-to': replyChannel })
    );

    return responsePromise;
  }

  async subscribeToEvents(
    patterns: string[],
    handler: (message: MessageEnvelope<Event>) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const subscriptionId = options?.id || this.generateSubscriptionId();
    
    const subscription: RedisSubscription = {
      id: subscriptionId,
      patterns,
      handler,
      options,
      active: true,
      consumerName: `${this.consumerId}:${subscriptionId}`,
      lastId: options?.startPosition === 'first' ? '0' : '>',
    };

    // Create consumer groups for each pattern
    if (this.client) {
      for (const pattern of patterns) {
        const streamKey = this.getStreamKey(pattern);
        try {
          await this.client.xgroup(
            'CREATE',
            streamKey,
            this.consumerGroup,
            subscription.lastId,
            'MKSTREAM'
          );
        } catch (error: any) {
          // Group already exists
          if (!error.message.includes('BUSYGROUP')) {
            throw error;
          }
        }
      }
    }

    this._subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  async subscribeToCommands(
    patterns: string[],
    handler: (message: MessageEnvelope<Command>) => Promise<CommandResponse>,
    options?: SubscriptionOptions
  ): Promise<string> {
    const subscriptionId = options?.id || this.generateSubscriptionId();

    const wrappedHandler = async (envelope: MessageEnvelope<Command>) => {
      const response = await handler(envelope);
      
      // Send reply if needed
      if (envelope.replyTo && this.client) {
        await this.client.publish(envelope.replyTo, JSON.stringify(response));
      }

      return response;
    };

    const subscription: RedisSubscription = {
      id: subscriptionId,
      patterns,
      handler: wrappedHandler,
      options,
      active: true,
      consumerName: `${this.consumerId}:${subscriptionId}`,
      lastId: options?.startPosition === 'first' ? '0' : '>',
    };

    // Create consumer groups
    if (this.client) {
      for (const pattern of patterns) {
        const streamKey = this.getStreamKey(pattern);
        try {
          await this.client.xgroup(
            'CREATE',
            streamKey,
            this.consumerGroup,
            subscription.lastId,
            'MKSTREAM'
          );
        } catch (error: any) {
          if (!error.message.includes('BUSYGROUP')) {
            throw error;
          }
        }
      }
    }

    this._subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this._subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this._subscriptions.delete(subscriptionId);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client || this._status !== ConnectionStatus.CONNECTED) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  private startPolling(): void {
    const pollStreams = async () => {
      if (!this.client || this._subscriptions.size === 0) {
        return;
      }

      for (const [_, subscription] of this._subscriptions) {
        if (!subscription.active) continue;

        for (const pattern of subscription.patterns) {
          const streamKey = this.getStreamKey(pattern);
          
          try {
            const messages = await this.client.xreadgroup(
              'GROUP',
              this.consumerGroup,
              subscription.consumerName,
              'COUNT',
              10,
              'BLOCK',
              100,
              'STREAMS',
              streamKey,
              subscription.lastId
            );

            if (messages && messages.length > 0) {
              for (const [stream, entries] of messages) {
                for (const [id, fields] of entries) {
                  await this.processStreamMessage(subscription, id, fields);
                  subscription.lastId = id;
                }
              }
            }
          } catch (error) {
            console.error('Error polling Redis stream:', error);
          }
        }
      }
    };

    // Poll every 100ms
    this.pollInterval = setInterval(pollStreams, 100);
  }

  private async processStreamMessage(
    subscription: RedisSubscription,
    messageId: string,
    fields: string[]
  ): Promise<void> {
    try {
      // Parse fields
      const fieldMap: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldMap[fields[i]] = fields[i + 1];
      }

      const data = Buffer.from(fieldMap.data, 'base64');
      const headers = JSON.parse(fieldMap.headers);
      const replyTo = headers['reply-to'];

      // Create envelope
      const envelope = await this.processIncomingMessage(data, headers, replyTo);

      // Override ack/nack methods
      envelope.ack = async () => {
        if (this.client) {
          await this.client.xack(
            this.getStreamKey(subscription.patterns[0]),
            this.consumerGroup,
            messageId
          );
        }
      };

      envelope.nack = async (delay?: number) => {
        // Redis Streams doesn't support delayed redelivery directly
        // Just don't ACK the message
      };

      // Handle message
      await subscription.handler(envelope);

      // Auto-acknowledge
      await envelope.ack();
    } catch (error) {
      console.error('Error processing Redis stream message:', error);
    }
  }

  private getStreamKey(subject: string): string {
    return `stream:${subject}`;
  }
}
