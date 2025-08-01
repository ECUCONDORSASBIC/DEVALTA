/**
 * @altamedica/agent-event-bus
 * 
 * Agent-to-Agent Event Bus & Protocol for ALTAMEDICA
 */

// Export event types and schemas
export * from './types/events.js';

// Export command types and schemas
export * from './types/commands.js';

// Export transport types and interfaces
export * from './types/transport.js';

// Export the main EventBus class
export { EventBus, EventBusOptions, EventBusStats } from './EventBus.js';

// Export transport implementations
export { BaseTransport, JsonMessageCodec } from './transports/BaseTransport.js';
export { RedisTransport } from './transports/RedisTransport.js';
export { WebSocketTransport } from './transports/WebSocketTransport.js';

// Export utility functions
export { createEventBus } from './utils/factory.js';
export { createLoggingInterceptor, createMetricsInterceptor } from './utils/interceptors.js';

// Re-export commonly used types for convenience
export type {
  Event,
  Command,
  CommandResponse,
  ITransport,
  MessageEnvelope,
  PublishOptions,
  SubscriptionOptions,
} from './types/index.js';
