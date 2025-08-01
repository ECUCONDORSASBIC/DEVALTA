# Migration Guide: Upgrading to EnhancedBaseAgent

This guide explains how to upgrade existing agents from `BaseAgent` to `EnhancedBaseAgent` to leverage the new capabilities.

## Overview of New Features

The `EnhancedBaseAgent` extends `BaseAgent` with:

1. **Scheduled Jobs/Cron Helper** - Built-in cron job scheduling
2. **Event Bus Client** - Native event bus integration
3. **ML Pipeline Hooks** - ONNX/TensorFlow.js model support
4. **Reactive Rules Engine** - Zod-validated rule system
5. **Circuit Breaker & Retry** - Resilience utilities

## Zero-Breaking-Change Migration

The migration is designed to be non-breaking. Existing agents can continue to work as-is, and you can gradually adopt new features.

## Step-by-Step Migration

### 1. Update Import Statement

```typescript
// Before
import { BaseAgent, AgentConfig } from '../shared/BaseAgent.js';

// After
import { EnhancedBaseAgent, EnhancedAgentConfig } from '../shared/EnhancedBaseAgent.js';
```

### 2. Extend EnhancedBaseAgent

```typescript
// Before
export class MyAgent extends BaseAgent {
  constructor() {
    const config = loadConfig(myConfigSchema, 'my-agent');
    super(config);
  }
}

// After
export class MyAgent extends EnhancedBaseAgent {
  constructor() {
    const baseConfig = loadConfig(myConfigSchema, 'my-agent');
    
    // Add enhanced configuration
    const enhancedConfig: EnhancedAgentConfig = {
      ...baseConfig,
      // Optional: Add event bus config
      eventBus: {
        url: process.env.EVENT_BUS_URL || 'ws://localhost:8080',
      },
      // Optional: Add scheduled jobs
      scheduledJobs: [
        {
          name: 'myScheduledTask',
          schedule: '*/5 * * * *', // Every 5 minutes
          handler: 'myScheduledTaskHandler',
        },
      ],
      // Optional: Add circuit breaker config
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      },
      // Optional: Add retry policy
      retryPolicy: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
    };
    
    super(enhancedConfig);
  }
}
```

### 3. Implement Abstract Methods (if using Event Bus)

```typescript
// Only required if using event bus
protected subscribeToEvents(): void {
  // Subscribe to relevant events
  this.publishEvent('subscribe', {
    events: ['user.*', 'system.*'],
  });
}

protected handleEventBusMessage(message: EventMessage): void {
  // Handle incoming events
  switch (message.type) {
    case 'user.created':
      this.handleUserCreated(message.data);
      break;
    // ... handle other events
  }
}
```

### 4. Add Scheduled Job Handlers

```typescript
// Method name must match the handler name in config
protected async myScheduledTaskHandler(): Promise<void> {
  // Your scheduled task logic
  await this.performPeriodicTask();
}
```

### 5. Use Circuit Breaker for External Calls

```typescript
// Before
private async callExternalAPI(): Promise<any> {
  try {
    const response = await axios.get('https://api.example.com/data');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// After
private async callExternalAPI(): Promise<any> {
  return this.withCircuitBreaker('external-api', async () => {
    const response = await axios.get('https://api.example.com/data');
    return response.data;
  });
}
```

### 6. Use Retry for Resilient Operations

```typescript
// Before
private async saveData(data: any): Promise<void> {
  await database.save(data);
}

// After
private async saveData(data: any): Promise<void> {
  await this.withRetry(async () => {
    await database.save(data);
  });
}
```

### 7. Add Reactive Rules

```typescript
private initializeRules(): void {
  this.addRule({
    id: 'high-load-alert',
    name: 'High Load Alert',
    description: 'Alert when CPU usage is high',
    enabled: true,
    conditions: [
      {
        field: 'cpu.usage',
        operator: 'gt',
        value: 80,
      },
    ],
    actions: [
      {
        type: 'alert',
        data: { level: 'warning' },
      },
    ],
    cooldown: 300000, // 5 minutes
  });
}
```

### 8. Implement Custom Rule Actions

```typescript
protected async executeCustomRuleAction(
  rule: ReactiveRule,
  action: any,
  context: Record<string, any>
): Promise<void> {
  // Handle custom rule actions
  switch (rule.id) {
    case 'my-custom-rule':
      await this.handleCustomAction(context);
      break;
  }
}

protected async executeCommand(command: string, data: any): Promise<void> {
  // Handle rule commands
  switch (command) {
    case 'restart-service':
      await this.restartService(data.serviceName);
      break;
  }
}
```

### 9. Add ML Model Support (Optional)

```typescript
private async initializeMLModels(): Promise<void> {
  // Load ONNX model
  await this.loadMLModel('my-model', './models/my-model.onnx', {
    preprocessor: async (input) => {
      // Preprocess input data
      return normalizeData(input);
    },
    postprocessor: async (output) => {
      // Postprocess model output
      return denormalizeData(output);
    },
  });
}

// Use the model
private async predict(input: any): Promise<any> {
  return await this.runInference('my-model', input);
}
```

## Example: Full Migration

Here's a complete example of migrating the AuthAgent:

```typescript
// enhanced-auth-agent.ts
import { EnhancedBaseAgent, EnhancedAgentConfig, EventMessage, ReactiveRule } from '../shared/EnhancedBaseAgent.js';
import { AuthConfig, authConfigSchema, loadConfig } from '../shared/config.js';
// ... other imports

export class EnhancedAuthAgent extends EnhancedBaseAgent {
  private config: AuthConfig & EnhancedAgentConfig;
  
  constructor() {
    const baseConfig = loadConfig(authConfigSchema, 'auth-agent');
    
    const enhancedConfig: AuthConfig & EnhancedAgentConfig = {
      ...baseConfig,
      eventBus: {
        url: process.env.EVENT_BUS_URL || 'ws://localhost:8080',
      },
      scheduledJobs: [
        {
          name: 'cleanupExpiredTokens',
          schedule: '0 * * * *', // Every hour
          handler: 'cleanupExpiredTokensJob',
        },
        {
          name: 'auditSuspiciousActivity',
          schedule: '*/15 * * * *', // Every 15 minutes
          handler: 'auditSuspiciousActivityJob',
        },
      ],
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      },
    };
    
    super(enhancedConfig);
    this.config = enhancedConfig;
    
    // Initialize rules
    this.initializeSecurityRules();
  }
  
  // Scheduled job handlers
  protected async cleanupExpiredTokensJob(): Promise<void> {
    const expiredTokens = await this.findExpiredTokens();
    for (const token of expiredTokens) {
      await this.revokeToken(token);
    }
    this.log('info', `Cleaned up ${expiredTokens.length} expired tokens`);
  }
  
  protected async auditSuspiciousActivityJob(): Promise<void> {
    const suspiciousActivities = await this.detectSuspiciousActivities();
    if (suspiciousActivities.length > 0) {
      this.publishEvent('security.suspicious_activity', {
        activities: suspiciousActivities,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  // Event bus handlers
  protected subscribeToEvents(): void {
    this.publishEvent('subscribe', {
      events: [
        'user.created',
        'user.deleted',
        'security.breach',
      ],
    });
  }
  
  protected handleEventBusMessage(message: EventMessage): void {
    switch (message.type) {
      case 'user.created':
        this.handleUserCreated(message.data);
        break;
      case 'user.deleted':
        this.handleUserDeleted(message.data);
        break;
      case 'security.breach':
        this.handleSecurityBreach(message.data);
        break;
    }
  }
  
  // Security rules
  private initializeSecurityRules(): void {
    this.addRule({
      id: 'brute-force-detection',
      name: 'Brute Force Attack Detection',
      enabled: true,
      conditions: [
        {
          field: 'failedLoginAttempts',
          operator: 'gt',
          value: 5,
        },
        {
          field: 'timeWindow',
          operator: 'lt',
          value: 300000, // 5 minutes
        },
      ],
      actions: [
        {
          type: 'command',
          target: 'lockAccount',
        },
        {
          type: 'alert',
          data: {
            level: 'critical',
            message: 'Brute force attack detected',
          },
        },
      ],
    });
  }
  
  // Circuit breaker usage
  private async validateWithExternalService(token: string): Promise<boolean> {
    return await this.withCircuitBreaker('token-validation', async () => {
      // External validation call
      const response = await axios.post('https://validation.service/validate', { token });
      return response.data.valid;
    });
  }
  
  // Retry usage
  private async saveSession(session: Session): Promise<void> {
    await this.withRetry(async () => {
      await this.sessionStore.save(session);
    }, {
      maxAttempts: 3,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
    });
  }
  
  // ... rest of the agent implementation
}
```

## Gradual Adoption Strategy

1. **Phase 1**: Basic migration - Change inheritance to `EnhancedBaseAgent`
2. **Phase 2**: Add scheduled jobs for periodic tasks
3. **Phase 3**: Integrate event bus for inter-agent communication
4. **Phase 4**: Add reactive rules for proactive behavior
5. **Phase 5**: Implement circuit breakers for external dependencies
6. **Phase 6**: Add ML models for intelligent decision making

## Testing the Migration

```typescript
// Test scheduled jobs
describe('Enhanced Agent Scheduled Jobs', () => {
  it('should execute scheduled jobs', async () => {
    const agent = new EnhancedMyAgent();
    await agent.start();
    
    // Wait for scheduled job to execute
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Verify job execution
    expect(agent.getMetrics()['scheduled_job_success']).toBeGreaterThan(0);
  });
});

// Test circuit breaker
describe('Circuit Breaker', () => {
  it('should open circuit after failures', async () => {
    const agent = new EnhancedMyAgent();
    
    // Simulate failures
    for (let i = 0; i < 5; i++) {
      try {
        await agent.callFailingService();
      } catch (error) {
        // Expected
      }
    }
    
    // Circuit should be open
    await expect(agent.callFailingService()).rejects.toThrow('Circuit breaker is open');
  });
});
```

## Monitoring Enhanced Features

The EnhancedBaseAgent automatically exposes metrics for new features:

- `scheduled_jobs_active` - Number of active scheduled jobs
- `ml_models_loaded` - Number of loaded ML models
- `rules_active` - Number of active reactive rules
- `circuit_breakers_open` - Number of open circuit breakers
- `event_published` - Events published to event bus
- `retry_attempt` - Retry attempts made
- `rule_executed` - Rules executed

## Troubleshooting

### Common Issues

1. **Scheduled jobs not running**
   - Verify cron syntax is correct
   - Ensure handler method exists and matches config
   - Check logs for errors

2. **Event bus connection issues**
   - Verify event bus URL is correct
   - Check network connectivity
   - Monitor reconnection attempts in logs

3. **Circuit breaker not resetting**
   - Check reset timeout configuration
   - Verify service is actually healthy
   - Monitor circuit breaker metrics

4. **ML model loading failures**
   - Ensure model file exists and is accessible
   - Verify ONNX runtime is properly installed
   - Check model compatibility

## Best Practices

1. **Start Small**: Migrate one feature at a time
2. **Monitor Metrics**: Use the built-in metrics to track feature usage
3. **Test Thoroughly**: Ensure existing functionality works after migration
4. **Use Circuit Breakers**: Protect external dependencies
5. **Configure Retries**: Set appropriate retry policies for transient failures
6. **Document Rules**: Keep rule documentation up to date
7. **Version Models**: Maintain model versioning for ML pipelines

## Rollback Strategy

If issues arise during migration:

1. The EnhancedBaseAgent is backward compatible
2. You can disable features by not configuring them
3. Existing BaseAgent functionality remains unchanged
4. Gradual rollout allows testing in non-production first

## Support

For questions or issues with migration:
1. Check the example implementations in `enhanced-index.ts` files
2. Review the EnhancedBaseAgent source code
3. Monitor agent logs for detailed error messages
4. Use health check endpoints to verify agent status
