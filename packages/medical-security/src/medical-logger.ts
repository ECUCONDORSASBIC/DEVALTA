import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';

// Tipos para logging médico
export interface MedicalLogEntry {
  timestamp: string;
  userId?: string;
  patientId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface PHIAccessLog {
  timestamp: string;
  userId: string;
  patientId: string;
  accessType: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT';
  resourceType: string;
  resourceId: string;
  justification?: string;
  ipAddress: string;
  userAgent: string;
}

// Configuración del logger médico
const medicalLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'medical-system' },
  transports: [
    // Log de auditoría médica (cumple HIPAA)
    new DailyRotateFile({
      filename: 'logs/medical-audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Log de errores médicos
    new DailyRotateFile({
      filename: 'logs/medical-errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      level: 'error'
    }),
    // Log de acceso a PHI (Información de Salud Protegida)
    new DailyRotateFile({
      filename: 'logs/phi-access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7y', // Retención de 7 años para cumplir HIPAA
      level: 'info'
    })
  ]
});

// Agregar console en desarrollo
if (process.env.NODE_ENV !== 'production') {
  medicalLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Funciones de logging especializadas
export const logMedicalAction = (entry: MedicalLogEntry): void => {
  medicalLogger.info('Medical Action', {
    ...entry,
    category: 'medical-action',
    compliance: 'HIPAA'
  });
};

export const logPHIAccess = (entry: PHIAccessLog): void => {
  medicalLogger.info('PHI Access', {
    ...entry,
    category: 'phi-access',
    compliance: 'HIPAA-required',
    retention: '7-years'
  });
};

export const logMedicalError = (error: Error, context: Partial<MedicalLogEntry>): void => {
  medicalLogger.error('Medical Error', {
    error: error.message,
    stack: error.stack,
    ...context,
    category: 'medical-error',
    compliance: 'HIPAA'
  });
};

// Middleware para logging automático de requests médicos
export const medicalLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    const logEntry: MedicalLogEntry = {
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      action: req.method,
      resource: req.path,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: res.statusCode < 400,
      metadata: {
        duration,
        statusCode: res.statusCode,
        contentLength: data?.length
      }
    };

    // Detectar acceso a PHI
    if (req.path.includes('/patients/') || req.path.includes('/medical-records/')) {
      const phiAccess: PHIAccessLog = {
        timestamp: logEntry.timestamp,
        userId: logEntry.userId || 'anonymous',
        patientId: extractPatientId(req.path),
        accessType: req.method === 'GET' ? 'READ' : req.method === 'POST' ? 'WRITE' : 'DELETE',
        resourceType: extractResourceType(req.path),
        resourceId: extractResourceId(req.path),
        ipAddress: logEntry.ipAddress || 'unknown',
        userAgent: logEntry.userAgent || 'unknown'
      };
      
      logPHIAccess(phiAccess);
    }

    logMedicalAction(logEntry);
    originalSend.call(this, data);
  };

  next();
};

// Funciones auxiliares
const extractPatientId = (path: string): string => {
  const match = path.match(/\/patients\/([^\/]+)/);
  return match ? match[1] : 'unknown';
};

const extractResourceType = (path: string): string => {
  if (path.includes('/patients/')) return 'Patient';
  if (path.includes('/medical-records/')) return 'MedicalRecord';
  if (path.includes('/appointments/')) return 'Appointment';
  return 'Unknown';
};

const extractResourceId = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1] || 'unknown';
};

// Función para limpiar logs antiguos (cumplir retención HIPAA)
export const cleanupOldLogs = (): void => {
  // Implementar lógica de limpieza según políticas de retención
  medicalLogger.info('Log cleanup initiated', {
    category: 'system-maintenance',
    compliance: 'HIPAA-retention'
  });
};

export default medicalLogger; 