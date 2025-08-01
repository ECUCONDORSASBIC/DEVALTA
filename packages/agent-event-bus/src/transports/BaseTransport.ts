import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventSchema } from '../types/events.js';
import { Command, CommandResponse, CommandSchema, CommandResponseSchema } from '../types/commands.js';
import {
  ITransport,
  TransportType,
  ConnectionStatus,
  MessageEnvelope,
  PublishOptions,
  SubscriptionOptions,
  TransportStats,
  IMessageCodec,
  IMessageInterceptor,
} from '../types/transport.js';

/**
 * JSON message codec
 */
export class JsonMessageCodec implements IMessageCodec {
  readonly contentType = 'application/json';

  encode<T>(message: T): Buffer {
    return Buffer.from(JSON.stringify(message));
  }

  decode<T>(data: Buffer): T {
    return JSON.parse(data.toString());
  }
}

/**
 * Base transport implementation
 */
export abstract class BaseTransport extends EventEmitter implements ITransport {
  protected _status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  protected _codec: IMessageCodec;
  protected _interceptors: IMessageInterceptor[] = [];
  protected _subscriptions = new Map<string, any>();
  protected _stats: TransportStats = {
    messagesSent: 0,
    messagesReceived: 0,
    bytesSent: 0,
    bytesReceived: 0,
    subscriptions: 0,
    uptime: 0,
  };
  protected _startTime?: number;

  constructor(
    public readonly type: TransportType,
    codec: IMessageCodec = new JsonMessageCodec()
  ) {
    super();
    this._codec = codec;
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  protected setStatus(status: ConnectionStatus): void {
    const previousStatus = this._status;
    this._status = status;

    if (status === ConnectionStatus.CONNECTED && !this._startTime) {
      this._startTime = Date.now();
    }

    if (status !== previousStatus) {
      this.emit(status as any);
    }
  }

  /**
   * Add message interceptor
   */
  addInterceptor(interceptor: IMessageInterceptor): void {
    this._interceptors.push(interceptor);
  }

  /**
   * Remove message interceptor
   */
  removeInterceptor(interceptor: IMessageInterceptor): void {
    const index = this._interceptors.indexOf(interceptor);
    if (index >= 0) {
      this._interceptors.splice(index, 1);
    }
  }

  /**
   * Apply interceptors for outgoing messages
   */
  protected async applyOutgoingInterceptors(
    message: any,
    headers: Record<string, string>
  ): Promise<{ message: any; headers: Record<string, string> }> {
    let result = { message, headers };

    for (const interceptor of this._interceptors) {
      if (interceptor.onSend) {
        result = await interceptor.onSend(result.message, result.headers);
      }
    }

    return result;
  }

  /**
   * Apply interceptors for incoming messages
   */
  protected async applyIncomingInterceptors(
    message: any,
    headers: Record<string, string>
  ): Promise<{ message: any; headers: Record<string, string> }> {
    let result = { message, headers };

    for (const interceptor of this._interceptors) {
      if (interceptor.onReceive) {
        result = await interceptor.onReceive(result.message, result.headers);
      }
    }

    return result;
  }

  /**
   * Validate and prepare event
   */
  protected async prepareEvent(event: Event, options?: PublishOptions): Promise<{
    subject: string;
    data: Buffer;
    headers: Record<string, string>;
  }> {
    // Validate event
    const validatedEvent = EventSchema.parse(event);

    // Build subject
    const subject = this.buildEventSubject(validatedEvent);

    // Build headers
    const headers: Record<string, string> = {
      'content-type': this._codec.contentType,
      'event-id': validatedEvent.id,
      'event-type': validatedEvent.type,
      'source-agent': validatedEvent.source.agentId,
      'timestamp': validatedEvent.timestamp,
    };

    if (validatedEvent.correlationId) {
      headers['correlation-id'] = validatedEvent.correlationId;
    }

    if (validatedEvent.causationId) {
      headers['causation-id'] = validatedEvent.causationId;
    }

    if (options?.deliveryGuarantee) {
      headers['delivery-guarantee'] = options.deliveryGuarantee;
    }

    if (options?.ttl) {
      headers['ttl'] = options.ttl.toString();
    }

    if (options?.partitionKey) {
      headers['partition-key'] = options.partitionKey;
    }

    // Apply interceptors
    const intercepted = await this.applyOutgoingInterceptors(validatedEvent, headers);

    // Encode data
    const data = this._codec.encode(intercepted.message);

    // Update stats
    this._stats.messagesSent++;
    this._stats.bytesSent += data.length;

    return { subject, data, headers: intercepted.headers };
  }

  /**
   * Validate and prepare command
   */
  protected async prepareCommand(command: Command, options?: PublishOptions): Promise<{
    subject: string;
    data: Buffer;
    headers: Record<string, string>;
  }> {
    // Validate command
    const validatedCommand = CommandSchema.parse(command);

    // Build subject
    const subject = this.buildCommandSubject(validatedCommand);

    // Build headers
    const headers: Record<string, string> = {
      'content-type': this._codec.contentType,
      'command-id': validatedCommand.id,
      'command-type': validatedCommand.type,
      'source-agent': validatedCommand.source.agentId,
      'timestamp': validatedCommand.timestamp,
      'timeout': validatedCommand.timeout.toString(),
      'priority': validatedCommand.priority.toString(),
    };

    if (options?.deliveryGuarantee) {
      headers['delivery-guarantee'] = options.deliveryGuarantee;
    }

    // Apply interceptors
    const intercepted = await this.applyOutgoingInterceptors(validatedCommand, headers);

    // Encode data
    const data = this._codec.encode(intercepted.message);

    // Update stats
    this._stats.messagesSent++;
    this._stats.bytesSent += data.length;

    return { subject, data, headers: intercepted.headers };
  }

  /**
   * Process incoming message
   */
  protected async processIncomingMessage<T>(
    data: Buffer,
    headers: Record<string, string>,
    replyTo?: string
  ): Promise<MessageEnvelope<T>> {
    // Update stats
    this._stats.messagesReceived++;
    this._stats.bytesReceived += data.length;

    // Decode message
    let message = this._codec.decode<T>(data);

    // Apply interceptors
    const intercepted = await this.applyIncomingInterceptors(message, headers);
    message = intercepted.message;

    // Create envelope
    const envelope: MessageEnvelope<T> = {
      id: headers['event-id'] || headers['command-id'] || uuidv4(),
      payload: message,
      headers: intercepted.headers,
      receivedAt: new Date(),
      deliveryCount: parseInt(headers['delivery-count'] || '1', 10),
      replyTo,
      ack: async () => {
        // Implemented by specific transport
      },
      nack: async (delay?: number) => {
        // Implemented by specific transport
      },
      reply: async (response: any) => {
        if (!replyTo) {
          throw new Error('Cannot reply to message without replyTo address');
        }
        // Implemented by specific transport
      },
    };

    return envelope;
  }

  /**
   * Build event subject
   */
  protected buildEventSubject(event: Event): string {
    const parts = ['events', event.type];
    
    if (event.source.agentType) {
      parts.push(event.source.agentType);
    }

    return parts.join('.');
  }

  /**
   * Build command subject
   */
  protected buildCommandSubject(command: Command): string {
    const parts = ['commands', command.type];

    if (command.target.broadcast) {
      parts.push('broadcast');
    } else if (command.target.agentId) {
      parts.push('direct', command.target.agentId);
    } else if (command.target.agentType) {
      parts.push('type', command.target.agentType);
    }

    return parts.join('.');
  }

  /**
   * Generate subscription ID
   */
  protected generateSubscriptionId(): string {
    return uuidv4();
  }

  /**
   * Get transport statistics
   */
  getStats(): TransportStats {
    return {
      ...this._stats,
      subscriptions: this._subscriptions.size,
      uptime: this._startTime ? Date.now() - this._startTime : 0,
    };
  }

  /**
   * Abstract methods to be implemented by specific transports
   */
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract publishEvent(event: Event, options?: PublishOptions): Promise<void>;
  abstract publishCommand(command: Command, options?: PublishOptions): Promise<CommandResponse>;
  abstract subscribeToEvents(
    patterns: string[],
    handler: (message: MessageEnvelope<Event>) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string>;
  abstract subscribeToCommands(
    patterns: string[],
    handler: (message: MessageEnvelope<Command>) => Promise<CommandResponse>,
    options?: SubscriptionOptions
  ): Promise<string>;
  abstract unsubscribe(subscriptionId: string): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
}
