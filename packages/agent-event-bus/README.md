# @altamedica/agent-event-bus

Agent-to-Agent Event Bus & Protocol for ALTAMEDICA platform. Provides a robust, scalable messaging infrastructure for microservice agents to communicate via events and commands.

## Features

- **Multiple Transport Options**: Redis Streams (primary) and WebSocket (fallback)
- **Type-Safe Messaging**: Full TypeScript support with Zod schema validation
- **Event & Command Patterns**: Publish/Subscribe for events, Request/Reply for commands
- **Automatic Failover**: Seamless switching between transports
- **Message Interceptors**: For logging, metrics, validation, and transformation
- **Queue Management**: Built-in message queuing with concurrency control
- **Delivery Guarantees**: Support for at-most-once, at-least-once, and exactly-once delivery

## Installation

```bash
npm install @altamedica/agent-event-bus
```

## Quick Start

```typescript
import { createEventBus, SystemEventType, CommandType } from '@altamedica/agent-event-bus';

// Create an event bus instance
const eventBus = createEventBus({
  agentId: 'auth-agent-01',
  agentType: 'auth',
  redis: {
    host: 'localhost',
    port: 6379,
  },
  enableFallback: true,
  debug: true,
});

// Connect to the event bus
await eventBus.connect();

// Publish an event
await eventBus.publishEvent('user.created', {
  userId: '123',
  email: 'user@example.com',
  timestamp: new Date().toISOString(),
});

// Subscribe to events
await eventBus.on('user.*', async (event) => {
  console.log('User event received:', event);
});

// Send a command and wait for response
const response = await eventBus.sendCommand(
  CommandType.VALIDATE_TOKEN,
  'auth-agent', // target agent
  {
    token: 'jwt-token-here',
    requiredScopes: ['read:users'],
  }
);

// Handle commands
await eventBus.onCommand(CommandType.VALIDATE_TOKEN, async (command) => {
  // Validate the token
  const isValid = await validateToken(command.data.token);
  
  return {
    commandId: command.id,
    success: isValid,
    result: { valid: isValid },
    timestamp: new Date().toISOString(),
    duration: 0,
  };
});
```

## Event Types

### System Events
- `agent.started` - Agent has started
- `agent.stopped` - Agent has stopped
- `agent.healthy` - Agent health status is healthy
- `agent.unhealthy` - Agent health status is unhealthy

### Command Events
- `command.execute` - Execute a command
- `command.started` - Command execution started
- `command.completed` - Command completed successfully
- `command.failed` - Command execution failed

### Data Events
- `data.created` - Data entity created
- `data.updated` - Data entity updated
- `data.deleted` - Data entity deleted
- `data.synchronized` - Data synchronized

### Security Events
- `security.auth.attempt` - Authentication attempt
- `security.auth.success` - Authentication successful
- `security.auth.failed` - Authentication failed
- `security.access.granted` - Access granted
- `security.access.denied` - Access denied

### Monitoring Events
- `monitoring.metric.recorded` - Metric recorded
- `monitoring.alert.triggered` - Alert triggered
- `monitoring.alert.resolved` - Alert resolved

## Command Types

### System Commands
- `system.ping` - Ping an agent
- `system.shutdown` - Shutdown an agent
- `system.restart` - Restart an agent
- `system.reload_config` - Reload configuration

### Data Commands
- `data.query` - Query data
- `data.sync` - Synchronize data
- `data.cache_invalidate` - Invalidate cache

### Security Commands
- `security.validate_token` - Validate authentication token
- `security.revoke_access` - Revoke user access
- `security.update_permissions` - Update user permissions

### Monitoring Commands
- `monitoring.get_metrics` - Get agent metrics
- `monitoring.get_logs` - Get agent logs
- `monitoring.set_log_level` - Set log level

## Advanced Usage

### Using the Enhanced Base Agent

```typescript
import { EnhancedBaseAgent } from '@altamedica/agent-event-bus';

class MyAgent extends EnhancedBaseAgent {
  protected setupCustomRoutes(): void {
    // Add your custom HTTP routes
  }

  protected performHealthChecks(): Record<string, boolean> {
    return {
      database: true,
      redis: true,
    };
  }

  protected getCustomMetrics(): MetricPoint[] {
    return [
      {
        name: 'custom_metric',
        value: 42,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  protected setupEventSubscriptions(): void {
    // Subscribe to relevant events
    this.subscribeToEvent('user.*', async (event) => {
      console.log('User event:', event);
    });

    // Handle custom commands
    this.eventBus.onCommand('custom.command', async (command) => {
      return {
        commandId: command.id,
        success: true,
        result: { message: 'Custom command handled' },
        timestamp: new Date().toISOString(),
        duration: 0,
      };
    });
  }
}
```

### Message Interceptors

```typescript
import { createLoggingInterceptor, createMetricsInterceptor } from '@altamedica/agent-event-bus';

const eventBus = new EventBus({
  // ... config
  interceptors: [
    // Log all messages
    createLoggingInterceptor({
      logOutgoing: true,
      logIncoming: true,
      logHeaders: false,
      maxBodyLength: 500,
    }),
    
    // Collect metrics
    createMetricsInterceptor((metric) => {
      console.log('Message metric:', metric);
    }),
  ],
});
```

### Custom Transport Configuration

```typescript
const eventBus = new EventBus({
  agent: { id: 'my-agent', type: 'custom' },
  
  // Primary transport (Redis)
  transport: {
    type: TransportType.REDIS,
    connection: {
      host: 'redis.example.com',
      port: 6379,
      password: 'secret',
      tls: {
        enabled: true,
        rejectUnauthorized: true,
      },
    },
    options: {
      consumerGroup: 'my-consumer-group',
    },
  },
  
  // Fallback transport (WebSocket)
  fallbackTransport: {
    type: TransportType.WEBSOCKET,
    connection: {
      url: 'wss://eventbus.example.com',
      reconnect: {
        enabled: true,
        maxAttempts: -1,
        delay: 1000,
        backoffMultiplier: 2,
      },
    },
  },
  
  autoFallback: true,
});
```

## Architecture

The Event Bus uses a layered architecture:

1. **EventBus**: High-level API for publishing events and sending commands
2. **Transport Layer**: Abstracts the underlying message transport (Redis, WebSocket)
3. **Message Codec**: Handles message serialization/deserialization
4. **Interceptors**: Middleware for message processing

## Best Practices

1. **Use Typed Events**: Define TypeScript interfaces for your custom events
2. **Handle Failures**: Always handle command failures and event processing errors
3. **Set Timeouts**: Configure appropriate timeouts for commands
4. **Monitor Performance**: Use interceptors to collect metrics
5. **Graceful Shutdown**: Always disconnect the event bus on shutdown

## Environment Variables

- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port
- `REDIS_PASSWORD` - Redis password
- `WEBSOCKET_URL` - WebSocket server URL
- `WEBSOCKET_HOST` - WebSocket server host
- `WEBSOCKET_PORT` - WebSocket server port
- `WEBSOCKET_TOKEN` - WebSocket authentication token

## License

Private - ALTAMEDICA
