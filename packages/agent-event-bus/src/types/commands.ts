import { z } from 'zod';
import { EventPriority } from './events.js';

/**
 * Base command schema
 */
export const BaseCommandSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  source: z.object({
    agentId: z.string(),
    agentType: z.string(),
  }),
  target: z.object({
    agentId: z.string().optional(),
    agentType: z.string().optional(),
    broadcast: z.boolean().default(false),
  }),
  timestamp: z.string().datetime(),
  timeout: z.number().default(30000), // 30 seconds default
  priority: z.nativeEnum(EventPriority).default(EventPriority.NORMAL),
  retryPolicy: z.object({
    maxRetries: z.number().default(3),
    retryDelay: z.number().default(1000),
    backoffMultiplier: z.number().default(2),
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type BaseCommand = z.infer<typeof BaseCommandSchema>;

/**
 * Command types
 */
export enum CommandType {
  // System commands
  PING = 'system.ping',
  SHUTDOWN = 'system.shutdown',
  RESTART = 'system.restart',
  RELOAD_CONFIG = 'system.reload_config',
  
  // Data commands
  QUERY_DATA = 'data.query',
  SYNC_DATA = 'data.sync',
  CACHE_INVALIDATE = 'data.cache_invalidate',
  
  // Security commands
  VALIDATE_TOKEN = 'security.validate_token',
  REVOKE_ACCESS = 'security.revoke_access',
  UPDATE_PERMISSIONS = 'security.update_permissions',
  
  // Monitoring commands
  GET_METRICS = 'monitoring.get_metrics',
  GET_LOGS = 'monitoring.get_logs',
  SET_LOG_LEVEL = 'monitoring.set_log_level',
  
  // Workflow commands
  START_WORKFLOW = 'workflow.start',
  CANCEL_WORKFLOW = 'workflow.cancel',
  GET_WORKFLOW_STATUS = 'workflow.get_status',
}

/**
 * Command response schema
 */
export const CommandResponseSchema = z.object({
  commandId: z.string().uuid(),
  success: z.boolean(),
  result: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  timestamp: z.string().datetime(),
  duration: z.number(),
});

export type CommandResponse = z.infer<typeof CommandResponseSchema>;

/**
 * System commands
 */
export const PingCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.PING),
  data: z.object({
    echo: z.string().optional(),
  }),
});

export const ShutdownCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.SHUTDOWN),
  data: z.object({
    graceful: z.boolean().default(true),
    timeout: z.number().default(30000),
    reason: z.string(),
  }),
});

export const RestartCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.RESTART),
  data: z.object({
    graceful: z.boolean().default(true),
    clearCache: z.boolean().default(false),
    reason: z.string(),
  }),
});

export const ReloadConfigCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.RELOAD_CONFIG),
  data: z.object({
    configPaths: z.array(z.string()).optional(),
    validateOnly: z.boolean().default(false),
  }),
});

/**
 * Data commands
 */
export const QueryDataCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.QUERY_DATA),
  data: z.object({
    entityType: z.string(),
    query: z.record(z.string(), z.any()),
    projection: z.array(z.string()).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
  }),
});

export const SyncDataCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.SYNC_DATA),
  data: z.object({
    entityType: z.string(),
    entityIds: z.array(z.string()).optional(),
    since: z.string().datetime().optional(),
    full: z.boolean().default(false),
  }),
});

export const CacheInvalidateCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.CACHE_INVALIDATE),
  data: z.object({
    keys: z.array(z.string()).optional(),
    pattern: z.string().optional(),
    all: z.boolean().default(false),
  }),
});

/**
 * Security commands
 */
export const ValidateTokenCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.VALIDATE_TOKEN),
  data: z.object({
    token: z.string(),
    requiredScopes: z.array(z.string()).optional(),
    requiredRoles: z.array(z.string()).optional(),
  }),
});

export const RevokeAccessCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.REVOKE_ACCESS),
  data: z.object({
    userId: z.string().optional(),
    tokenId: z.string().optional(),
    sessionId: z.string().optional(),
    reason: z.string(),
  }),
});

export const UpdatePermissionsCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.UPDATE_PERMISSIONS),
  data: z.object({
    userId: z.string(),
    permissions: z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
      set: z.array(z.string()).optional(),
    }),
  }),
});

/**
 * Monitoring commands
 */
export const GetMetricsCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.GET_METRICS),
  data: z.object({
    metricNames: z.array(z.string()).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    aggregation: z.enum(['sum', 'avg', 'min', 'max', 'count']).optional(),
    interval: z.string().optional(),
  }),
});

export const GetLogsCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.GET_LOGS),
  data: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    limit: z.number().default(100),
    query: z.string().optional(),
  }),
});

export const SetLogLevelCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.SET_LOG_LEVEL),
  data: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    duration: z.number().optional(), // milliseconds
  }),
});

/**
 * Workflow commands
 */
export const StartWorkflowCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.START_WORKFLOW),
  data: z.object({
    workflowId: z.string(),
    workflowType: z.string(),
    input: z.record(z.string(), z.any()),
    options: z.object({
      priority: z.nativeEnum(EventPriority).optional(),
      timeout: z.number().optional(),
      retries: z.number().optional(),
    }).optional(),
  }),
});

export const CancelWorkflowCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.CANCEL_WORKFLOW),
  data: z.object({
    workflowId: z.string(),
    reason: z.string(),
    force: z.boolean().default(false),
  }),
});

export const GetWorkflowStatusCommandSchema = BaseCommandSchema.extend({
  type: z.literal(CommandType.GET_WORKFLOW_STATUS),
  data: z.object({
    workflowId: z.string(),
    includeHistory: z.boolean().default(false),
  }),
});

/**
 * Union of all command schemas
 */
export const CommandSchema = z.discriminatedUnion('type', [
  PingCommandSchema,
  ShutdownCommandSchema,
  RestartCommandSchema,
  ReloadConfigCommandSchema,
  QueryDataCommandSchema,
  SyncDataCommandSchema,
  CacheInvalidateCommandSchema,
  ValidateTokenCommandSchema,
  RevokeAccessCommandSchema,
  UpdatePermissionsCommandSchema,
  GetMetricsCommandSchema,
  GetLogsCommandSchema,
  SetLogLevelCommandSchema,
  StartWorkflowCommandSchema,
  CancelWorkflowCommandSchema,
  GetWorkflowStatusCommandSchema,
]);

export type Command = z.infer<typeof CommandSchema>;

/**
 * Command type guards
 */
export const isSystemCommand = (command: Command): boolean => {
  return [
    CommandType.PING,
    CommandType.SHUTDOWN,
    CommandType.RESTART,
    CommandType.RELOAD_CONFIG,
  ].includes(command.type as CommandType);
};

export const isDataCommand = (command: Command): boolean => {
  return [
    CommandType.QUERY_DATA,
    CommandType.SYNC_DATA,
    CommandType.CACHE_INVALIDATE,
  ].includes(command.type as CommandType);
};

export const isSecurityCommand = (command: Command): boolean => {
  return [
    CommandType.VALIDATE_TOKEN,
    CommandType.REVOKE_ACCESS,
    CommandType.UPDATE_PERMISSIONS,
  ].includes(command.type as CommandType);
};

export const isMonitoringCommand = (command: Command): boolean => {
  return [
    CommandType.GET_METRICS,
    CommandType.GET_LOGS,
    CommandType.SET_LOG_LEVEL,
  ].includes(command.type as CommandType);
};

export const isWorkflowCommand = (command: Command): boolean => {
  return [
    CommandType.START_WORKFLOW,
    CommandType.CANCEL_WORKFLOW,
    CommandType.GET_WORKFLOW_STATUS,
  ].includes(command.type as CommandType);
};
