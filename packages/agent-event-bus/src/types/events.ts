import { z } from 'zod';

/**
 * Base event schema that all events must extend
 */
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  source: z.object({
    agentId: z.string(),
    agentType: z.string(),
    instanceId: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
  version: z.string().default('1.0.0'),
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

/**
 * Event priority levels
 */
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Event delivery guarantees
 */
export enum DeliveryGuarantee {
  AT_MOST_ONCE = 'at-most-once',
  AT_LEAST_ONCE = 'at-least-once',
  EXACTLY_ONCE = 'exactly-once',
}

/**
 * System event types
 */
export enum SystemEventType {
  AGENT_STARTED = 'agent.started',
  AGENT_STOPPED = 'agent.stopped',
  AGENT_HEALTHY = 'agent.healthy',
  AGENT_UNHEALTHY = 'agent.unhealthy',
  AGENT_REGISTERED = 'agent.registered',
  AGENT_DEREGISTERED = 'agent.deregistered',
}

/**
 * Command event types
 */
export enum CommandEventType {
  EXECUTE_COMMAND = 'command.execute',
  COMMAND_STARTED = 'command.started',
  COMMAND_COMPLETED = 'command.completed',
  COMMAND_FAILED = 'command.failed',
  COMMAND_TIMEOUT = 'command.timeout',
}

/**
 * Data event types
 */
export enum DataEventType {
  DATA_CREATED = 'data.created',
  DATA_UPDATED = 'data.updated',
  DATA_DELETED = 'data.deleted',
  DATA_QUERIED = 'data.queried',
  DATA_SYNCHRONIZED = 'data.synchronized',
}

/**
 * Security event types
 */
export enum SecurityEventType {
  AUTH_ATTEMPT = 'security.auth.attempt',
  AUTH_SUCCESS = 'security.auth.success',
  AUTH_FAILED = 'security.auth.failed',
  ACCESS_GRANTED = 'security.access.granted',
  ACCESS_DENIED = 'security.access.denied',
  THREAT_DETECTED = 'security.threat.detected',
  AUDIT_LOG = 'security.audit.log',
}

/**
 * Monitoring event types
 */
export enum MonitoringEventType {
  METRIC_RECORDED = 'monitoring.metric.recorded',
  ALERT_TRIGGERED = 'monitoring.alert.triggered',
  ALERT_RESOLVED = 'monitoring.alert.resolved',
  HEALTH_CHECK = 'monitoring.health.check',
  PERFORMANCE_ISSUE = 'monitoring.performance.issue',
}

/**
 * System events
 */
export const AgentStartedEventSchema = BaseEventSchema.extend({
  type: z.literal(SystemEventType.AGENT_STARTED),
  data: z.object({
    agentConfig: z.object({
      name: z.string(),
      version: z.string(),
      capabilities: z.array(z.string()),
      endpoints: z.array(z.object({
        protocol: z.string(),
        host: z.string(),
        port: z.number(),
      })),
    }),
  }),
});

export const AgentStoppedEventSchema = BaseEventSchema.extend({
  type: z.literal(SystemEventType.AGENT_STOPPED),
  data: z.object({
    reason: z.string(),
    graceful: z.boolean(),
  }),
});

export const AgentHealthEventSchema = BaseEventSchema.extend({
  type: z.enum([SystemEventType.AGENT_HEALTHY, SystemEventType.AGENT_UNHEALTHY]),
  data: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    checks: z.record(z.string(), z.boolean()),
    metrics: z.object({
      uptime: z.number(),
      memoryUsage: z.number(),
      cpuUsage: z.number(),
    }).optional(),
  }),
});

/**
 * Command events
 */
export const ExecuteCommandEventSchema = BaseEventSchema.extend({
  type: z.literal(CommandEventType.EXECUTE_COMMAND),
  data: z.object({
    commandId: z.string().uuid(),
    commandType: z.string(),
    targetAgent: z.string().optional(),
    parameters: z.record(z.string(), z.any()),
    timeout: z.number().optional(),
    priority: z.nativeEnum(EventPriority).default(EventPriority.NORMAL),
  }),
});

export const CommandStatusEventSchema = BaseEventSchema.extend({
  type: z.enum([
    CommandEventType.COMMAND_STARTED,
    CommandEventType.COMMAND_COMPLETED,
    CommandEventType.COMMAND_FAILED,
    CommandEventType.COMMAND_TIMEOUT,
  ]),
  data: z.object({
    commandId: z.string().uuid(),
    status: z.enum(['started', 'completed', 'failed', 'timeout']),
    result: z.any().optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    }).optional(),
    duration: z.number().optional(),
  }),
});

/**
 * Data events
 */
export const DataEventSchema = BaseEventSchema.extend({
  type: z.enum([
    DataEventType.DATA_CREATED,
    DataEventType.DATA_UPDATED,
    DataEventType.DATA_DELETED,
    DataEventType.DATA_QUERIED,
    DataEventType.DATA_SYNCHRONIZED,
  ]),
  data: z.object({
    entityType: z.string(),
    entityId: z.string(),
    operation: z.string(),
    changes: z.record(z.string(), z.any()).optional(),
    previousState: z.any().optional(),
    currentState: z.any().optional(),
  }),
});

/**
 * Security events
 */
export const SecurityEventSchema = BaseEventSchema.extend({
  type: z.enum([
    SecurityEventType.AUTH_ATTEMPT,
    SecurityEventType.AUTH_SUCCESS,
    SecurityEventType.AUTH_FAILED,
    SecurityEventType.ACCESS_GRANTED,
    SecurityEventType.ACCESS_DENIED,
    SecurityEventType.THREAT_DETECTED,
    SecurityEventType.AUDIT_LOG,
  ]),
  data: z.object({
    userId: z.string().optional(),
    resource: z.string().optional(),
    action: z.string(),
    result: z.boolean(),
    reason: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    threatLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }),
});

/**
 * Monitoring events
 */
export const MonitoringEventSchema = BaseEventSchema.extend({
  type: z.enum([
    MonitoringEventType.METRIC_RECORDED,
    MonitoringEventType.ALERT_TRIGGERED,
    MonitoringEventType.ALERT_RESOLVED,
    MonitoringEventType.HEALTH_CHECK,
    MonitoringEventType.PERFORMANCE_ISSUE,
  ]),
  data: z.object({
    metricName: z.string().optional(),
    metricValue: z.number().optional(),
    alertId: z.string().optional(),
    alertName: z.string().optional(),
    severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
    threshold: z.number().optional(),
    duration: z.number().optional(),
    resolution: z.string().optional(),
  }),
});

/**
 * Union of all event schemas
 */
export const EventSchema = z.discriminatedUnion('type', [
  AgentStartedEventSchema,
  AgentStoppedEventSchema,
  AgentHealthEventSchema,
  ExecuteCommandEventSchema,
  CommandStatusEventSchema,
  DataEventSchema,
  SecurityEventSchema,
  MonitoringEventSchema,
]);

export type Event = z.infer<typeof EventSchema>;

/**
 * Event type guards
 */
export const isSystemEvent = (event: Event): event is z.infer<typeof AgentStartedEventSchema | typeof AgentStoppedEventSchema | typeof AgentHealthEventSchema> => {
  return Object.values(SystemEventType).includes(event.type as SystemEventType);
};

export const isCommandEvent = (event: Event): event is z.infer<typeof ExecuteCommandEventSchema | typeof CommandStatusEventSchema> => {
  return Object.values(CommandEventType).includes(event.type as CommandEventType);
};

export const isDataEvent = (event: Event): event is z.infer<typeof DataEventSchema> => {
  return Object.values(DataEventType).includes(event.type as DataEventType);
};

export const isSecurityEvent = (event: Event): event is z.infer<typeof SecurityEventSchema> => {
  return Object.values(SecurityEventType).includes(event.type as SecurityEventType);
};

export const isMonitoringEvent = (event: Event): event is z.infer<typeof MonitoringEventSchema> => {
  return Object.values(MonitoringEventType).includes(event.type as MonitoringEventType);
};
