// Exportación principal de seguridad médica ALTAMEDICA
export * from './auditoria-hipaa'

// Exportaciones principales del sistema de seguridad médica
export { default as medicalLogger } from './medical-logger';
export { 
  logMedicalAction, 
  logPHIAccess, 
  logMedicalError, 
  medicalLoggingMiddleware,
  cleanupOldLogs 
} from './medical-logger';

export type { MedicalLogEntry, PHIAccessLog } from './medical-logger';

// Exportar tipos y utilidades de seguridad
export * from './types';
export * from './encryption';
export * from './audit';

// Exportar sistema de métricas Datadog
export * from './datadog-metrics';

// Exportar sistema de health checks
export * from './health-check';

// Exportar middleware de monitoreo
export * from './monitoring-middleware';

// Exportar sistema de alertas
export * from './alerts';

// Exportar sistema de validación de compliance médico
export * from './MedicalComplianceValidator';
