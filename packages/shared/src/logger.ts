import pino from 'pino';
import type { Logger } from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isBrowser = typeof window !== 'undefined';
const isNextJs = process.env.NEXT_RUNTIME !== undefined;

// Configure pino logger for all services
const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  // Only use transport in Node.js environments, not in browser or Next.js
  transport: isDevelopment && !isBrowser && !isNextJs ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    }
  } : undefined,
  // In production, use JSON format
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Remove 'pid' and 'hostname' from logs
  base: {
    service: 'altamedica'
  },
  // Browser-compatible configuration
  browser: {
    serialize: true,
    asObject: false,
    transmit: {
      send: function (level, logEvent) {
        if (isDevelopment) {
          console.log(logEvent);
        }
      }
    }
  }
});

// Medical-specific logger functions
export const medicalLogger = {
  // Log de acceso a datos médicos (HIPAA compliance)
  auditAccess: (userId: string, resource: string, action: string, metadata?: any) => {
    logger.info({
      type: 'audit',
      userId,
      resource,
      action,
      compliance: 'HIPAA',
      timestamp: new Date().toISOString(),
      ...metadata
    }, 'Medical data access');
  },

  // Log de operaciones críticas
  critical: (message: string, metadata?: any) => {
    logger.error({
      type: 'critical',
      ...metadata
    }, `CRITICAL: ${message}`);
  },

  // Log de seguridad
  security: (event: string, details: any) => {
    logger.warn({
      type: 'security',
      event,
      timestamp: new Date().toISOString(),
      ...details
    }, `SECURITY: ${event}`);
  },

  // Log de performance
  performance: (operation: string, duration: number, metadata?: any) => {
    logger.info({
      type: 'performance',
      operation,
      duration: `${duration}ms`,
      ...metadata
    }, `PERFORMANCE: ${operation}`);
  },

  // Log de PHI access (Protected Health Information)
  phiAccess: (userId: string, patientId: string, action: string, reason: string, metadata?: any) => {
    logger.info({
      type: 'phi_access',
      userId,
      patientId,
      action,
      reason,
      compliance: 'HIPAA',
      timestamp: new Date().toISOString(),
      ...metadata
    }, 'PHI access logged');
  }
};

export default logger;
