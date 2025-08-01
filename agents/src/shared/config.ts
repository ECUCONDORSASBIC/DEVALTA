import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

// Base configuration schema
export const baseConfigSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default('localhost'),
  name: z.string(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  corsOrigins: z.array(z.string()).default(['http://localhost:3000']),
  enableWebSocket: z.boolean().default(false),
  enableMetrics: z.boolean().default(true),
  healthCheckInterval: z.number().default(30000),
});

// Individual agent configuration schemas
export const authConfigSchema = baseConfigSchema.extend({
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string().default('24h'),
    refreshExpiresIn: z.string().default('7d'),
    algorithm: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  }),
  session: z.object({
    secret: z.string(),
    maxAge: z.number().default(86400000), // 24 hours
    secure: z.boolean().default(false),
  }),
  database: z.object({
    url: z.string(),
    maxConnections: z.number().default(10),
  }),
});

export const routingConfigSchema = baseConfigSchema.extend({
  services: z.record(z.object({
    url: z.string(),
    port: z.number(),
    healthCheck: z.string(),
  })),
  routes: z.record(z.object({
    path: z.string(),
    service: z.string(),
    requiresAuth: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
  })),
});

export const securityConfigSchema = baseConfigSchema.extend({
  cors: z.object({
    origins: z.array(z.string()),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
    allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization']),
  }),
  rateLimit: z.object({
    windowMs: z.number().default(900000), // 15 minutes
    max: z.number().default(100),
    message: z.string().default('Too many requests'),
  }),
  csrf: z.object({
    enabled: z.boolean().default(true),
    secret: z.string(),
  }),
  headers: z.record(z.string()).default({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
  }),
});

export const monitoringConfigSchema = baseConfigSchema.extend({
  metrics: z.object({
    interval: z.number().default(60000), // 1 minute
    retention: z.number().default(7), // 7 days
    prometheus: z.object({
      enabled: z.boolean().default(true),
      port: z.number().default(9090),
    }),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    format: z.enum(['json', 'text']).default('json'),
    destinations: z.array(z.object({
      type: z.enum(['console', 'file', 'elastic', 'webhook']),
      config: z.record(z.any()),
    })),
  }),
  alerts: z.object({
    enabled: z.boolean().default(true),
    thresholds: z.record(z.number()),
    channels: z.array(z.object({
      type: z.enum(['email', 'slack', 'webhook']),
      config: z.record(z.any()),
    })),
  }),
});

export const devopsConfigSchema = baseConfigSchema.extend({
  ci: z.object({
    provider: z.enum(['github', 'gitlab', 'jenkins']),
    webhook: z.object({
      secret: z.string(),
      events: z.array(z.string()),
    }),
  }),
  build: z.object({
    commands: z.array(z.string()),
    timeout: z.number().default(300000), // 5 minutes
    environment: z.record(z.string()),
  }),
  test: z.object({
    commands: z.array(z.string()),
    timeout: z.number().default(600000), // 10 minutes
    coverage: z.object({
      enabled: z.boolean().default(true),
      threshold: z.number().default(80),
    }),
  }),
  deploy: z.object({
    strategy: z.enum(['rolling', 'blue-green', 'canary']).default('rolling'),
    environments: z.record(z.object({
      url: z.string(),
      branch: z.string(),
      variables: z.record(z.string()),
    })),
  }),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;
export type RoutingConfig = z.infer<typeof routingConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type MonitoringConfig = z.infer<typeof monitoringConfigSchema>;
export type DevOpsConfig = z.infer<typeof devopsConfigSchema>;

export function loadConfig<T>(
  schema: z.ZodSchema<T>,
  agentName: string,
  configDir: string = './config'
): T {
  const configPath = join(configDir, `${agentName}.json`);
  
  try {
    // Load configuration from file
    const configFile = readFileSync(configPath, 'utf-8');
    const configData = JSON.parse(configFile);
    
    // Merge with environment variables
    const envConfig = loadEnvConfig(agentName);
    const mergedConfig = { ...configData, ...envConfig };
    
    // Validate and return
    return schema.parse(mergedConfig);
  } catch (error) {
    console.warn(`Could not load config file ${configPath}, using environment variables only`);
    
    // Fall back to environment variables only
    const envConfig = loadEnvConfig(agentName);
    return schema.parse(envConfig);
  }
}

function loadEnvConfig(agentName: string): Record<string, any> {
  const prefix = `${agentName.toUpperCase()}_`;
  const config: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix)) {
      const configKey = key.substring(prefix.length).toLowerCase();
      
      // Try to parse as JSON first, then as primitive
      try {
        config[configKey] = JSON.parse(value!);
      } catch {
        // Handle boolean values
        if (value === 'true') config[configKey] = true;
        else if (value === 'false') config[configKey] = false;
        // Handle numeric values
        else if (!isNaN(Number(value))) config[configKey] = Number(value);
        else config[configKey] = value;
      }
    }
  }
  
  return config;
}

export function validateConfig<T>(schema: z.ZodSchema<T>, config: unknown): T {
  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation errors:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid configuration');
  }
}

export function getDefaultConfig(agentName: string): Record<string, any> {
  const defaults: Record<string, any> = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost',
    name: agentName,
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    enableWebSocket: process.env.ENABLE_WEBSOCKET === 'true',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
  };
  
  return defaults;
}
