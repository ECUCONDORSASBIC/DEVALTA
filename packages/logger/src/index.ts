// Re-exportar el logger desde la aplicación API
export { default as logger, medicalLogger } from '../../../apps/api-server/src/lib/logger'

// Exportar tipos y utilidades adicionales
export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  meta?: any;
}

export interface AuditEntry {
  userId: string;
  resource: string;
  action: string;
  timestamp: string;
  compliance: string;
}

// Logger específico para el contexto médico
export const createMedicalLogger = (context: string) => {
  return {
    info: (message: string, meta?: any) => {
      console.log(`[${context}] INFO: ${message}`, meta)
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[${context}] WARN: ${message}`, meta)
    },
    error: (message: string, meta?: any) => {
      console.error(`[${context}] ERROR: ${message}`, meta)
    },
    audit: (userId: string, action: string, resource: string) => {
      console.log(`[${context}] AUDIT: User ${userId} performed ${action} on ${resource}`)
    }
  }
}

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as Sentry from '@sentry/node';

// Initialize Sentry only if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV || 'development',
    beforeSend(event) {
      // Filtrar información sensible médica
      if (event.request?.data) {
        const sanitizedData = sanitizeMedicalData(event.request.data);
        event.request.data = sanitizedData;
      }
      
      // Agregar contexto médico
      event.tags = {
        ...event.tags,
        service: 'altamedica-logger',
        compliance: 'HIPAA'
      };
      
      return event;
    }
  });
}

const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ci';

// Configuración de logs médicos
const medicalTransports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // Log general con rotación diaria
  new DailyRotateFile({
    dirname: 'logs',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
    level: isProd ? 'info' : 'debug'
  }),
  // Log de auditoría médica (cumple HIPAA)
  new DailyRotateFile({
    dirname: 'logs',
    filename: 'medical-audit-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7y', // Retención de 7 años para cumplir HIPAA
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  // Log de errores médicos
  new DailyRotateFile({
    dirname: 'logs',
    filename: 'medical-errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d',
    level: 'error'
  }),
  // Log de acceso a PHI (Información de Salud Protegida)
  new DailyRotateFile({
    dirname: 'logs',
    filename: 'phi-access-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7y', // Retención de 7 años para cumplir HIPAA
    level: 'info'
  })
];

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'altamedica',
    compliance: 'HIPAA',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: medicalTransports
});

// Bridge to Sentry for error-level logs
logger.on('error', (err) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      tags: {
        errorType: 'medical',
        compliance: 'HIPAA'
      }
    });
  }
});

// Funciones especializadas para logging médico
export const logMedicalAction = (entry: {
  userId?: string;
  patientId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}) => {
  logger.info('Medical Action', {
    ...entry,
    category: 'medical-action',
    compliance: 'HIPAA',
    timestamp: new Date().toISOString()
  });
};

export const logPHIAccess = (entry: {
  userId: string;
  patientId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  reason: string;
}) => {
  logger.info('PHI Access', {
    ...entry,
    category: 'phi-access',
    compliance: 'HIPAA',
    timestamp: new Date().toISOString()
  });
};

export const logSecurityEvent = (entry: {
  event: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) => {
  logger.warn('Security Event', {
    ...entry,
    category: 'security',
    compliance: 'HIPAA',
    timestamp: new Date().toISOString()
  });
  
  // Enviar a Sentry para alertas
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(entry.event, {
      level: 'warning',
      tags: {
        ...entry.details,
        eventType: 'security',
        compliance: 'HIPAA'
      }
    });
  }
};

// Función para sanitizar datos médicos
function sanitizeMedicalData(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeMedicalData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return data;
}

// Lista de campos sensibles médicos
function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'ssn', 'socialSecurityNumber', 'dateOfBirth', 'birthDate',
    'phone', 'telephone', 'email', 'address', 'zipCode',
    'medicalRecordNumber', 'patientId', 'diagnosis', 'treatment',
    'medication', 'prescription', 'symptoms', 'allergies'
  ];
  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
}

export default logger; 