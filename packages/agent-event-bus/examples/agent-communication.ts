import { createEventBus, CommandType, SystemEventType, DataEventType } from '../src/index.js';

/**
 * Example: Agent-to-Agent Communication
 * 
 * This example demonstrates how different agents can communicate
 * using the event bus with both events and commands.
 */

async function main() {
  // Create Auth Agent
  const authAgent = createEventBus({
    agentId: 'auth-agent-01',
    agentType: 'auth',
    debug: true,
  });

  // Create Monitoring Agent
  const monitoringAgent = createEventBus({
    agentId: 'monitoring-agent-01',
    agentType: 'monitoring',
    debug: true,
  });

  // Create Security Agent
  const securityAgent = createEventBus({
    agentId: 'security-agent-01',
    agentType: 'security',
    debug: true,
  });

  try {
    // Connect all agents
    console.log('Connecting agents...');
    await Promise.all([
      authAgent.connect(),
      monitoringAgent.connect(),
      securityAgent.connect(),
    ]);

    // Setup event handlers
    setupAuthAgentHandlers(authAgent);
    setupMonitoringAgentHandlers(monitoringAgent);
    setupSecurityAgentHandlers(securityAgent);

    // Simulate some interactions
    console.log('\n--- Starting agent interactions ---\n');

    // 1. Auth agent validates a token by asking security agent
    console.log('1. Auth agent requesting token validation from security agent...');
    const tokenValidation = await authAgent.sendCommand(
      CommandType.VALIDATE_TOKEN,
      { agentType: 'security' },
      {
        token: 'sample-jwt-token',
        requiredScopes: ['read:users', 'write:users'],
      }
    );
    console.log('Token validation result:', tokenValidation);

    // 2. Security agent publishes a security event
    console.log('\n2. Security agent publishing authentication success event...');
    await securityAgent.publishEvent('security.auth.success', {
      userId: 'user-123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
    });

    // 3. Monitoring agent queries metrics from all agents
    console.log('\n3. Monitoring agent collecting metrics from all agents...');
    const metrics = await monitoringAgent.sendCommand(
      CommandType.GET_METRICS,
      { broadcast: true },
      {
        metricNames: ['uptime_seconds', 'memory_usage_bytes'],
      }
    );
    console.log('Collected metrics:', metrics);

    // 4. Test ping command
    console.log('\n4. Testing ping command to auth agent...');
    const pingResponse = await monitoringAgent.sendCommand(
      CommandType.PING,
      'auth-agent-01',
      { echo: 'Hello from monitoring!' }
    );
    console.log('Ping response:', pingResponse);

    // Wait a bit for async events to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get statistics
    console.log('\n--- Agent Statistics ---');
    console.log('Auth Agent:', authAgent.getStats());
    console.log('Monitoring Agent:', monitoringAgent.getStats());
    console.log('Security Agent:', securityAgent.getStats());

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect all agents
    console.log('\n--- Disconnecting agents ---');
    await Promise.all([
      authAgent.disconnect(),
      monitoringAgent.disconnect(),
      securityAgent.disconnect(),
    ]);
  }
}

function setupAuthAgentHandlers(eventBus: any) {
  // Subscribe to security events
  eventBus.on('security.*', async (event: any) => {
    console.log('[Auth Agent] Received security event:', event.type, event.data);
    
    // React to authentication events
    if (event.type === 'security.auth.success') {
      // Create user session
      await eventBus.publishEvent(DataEventType.DATA_CREATED, {
        entityType: 'session',
        entityId: `session-${Date.now()}`,
        userId: event.data.userId,
      });
    }
  });

  // Handle ping commands
  eventBus.onCommand(CommandType.PING, async (command: any) => {
    return {
      commandId: command.id,
      success: true,
      result: {
        echo: command.data.echo,
        message: 'Pong from Auth Agent!',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  });

  // Handle metric requests
  eventBus.onCommand(CommandType.GET_METRICS, async (command: any) => {
    return {
      commandId: command.id,
      success: true,
      result: {
        agentId: 'auth-agent-01',
        metrics: {
          uptime_seconds: Math.floor(process.uptime()),
          memory_usage_bytes: process.memoryUsage().heapUsed,
          auth_requests_total: 42,
        },
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  });
}

function setupMonitoringAgentHandlers(eventBus: any) {
  // Subscribe to all events for monitoring
  eventBus.on('*', async (event: any) => {
    console.log('[Monitoring Agent] Event detected:', {
      type: event.type,
      source: event.source.agentId,
      timestamp: event.timestamp,
    });
  });

  // Handle metric requests
  eventBus.onCommand(CommandType.GET_METRICS, async (command: any) => {
    return {
      commandId: command.id,
      success: true,
      result: {
        agentId: 'monitoring-agent-01',
        metrics: {
          uptime_seconds: Math.floor(process.uptime()),
          memory_usage_bytes: process.memoryUsage().heapUsed,
          events_processed_total: 156,
        },
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  });
}

function setupSecurityAgentHandlers(eventBus: any) {
  // Handle token validation commands
  eventBus.onCommand(CommandType.VALIDATE_TOKEN, async (command: any) => {
    console.log('[Security Agent] Validating token:', command.data.token);
    
    // Simulate token validation
    const isValid = command.data.token === 'sample-jwt-token';
    
    return {
      commandId: command.id,
      success: true,
      result: {
        valid: isValid,
        userId: isValid ? 'user-123' : null,
        scopes: isValid ? ['read:users', 'write:users', 'admin'] : [],
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  });

  // Subscribe to data events for audit logging
  eventBus.on('data.*', async (event: any) => {
    console.log('[Security Agent] Audit log:', {
      eventType: event.type,
      entityType: event.data.entityType,
      entityId: event.data.entityId,
      timestamp: event.timestamp,
    });
  });

  // Handle metric requests
  eventBus.onCommand(CommandType.GET_METRICS, async (command: any) => {
    return {
      commandId: command.id,
      success: true,
      result: {
        agentId: 'security-agent-01',
        metrics: {
          uptime_seconds: Math.floor(process.uptime()),
          memory_usage_bytes: process.memoryUsage().heapUsed,
          tokens_validated_total: 89,
          auth_failures_total: 12,
        },
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  });
}

// Run the example
main().catch(console.error);
