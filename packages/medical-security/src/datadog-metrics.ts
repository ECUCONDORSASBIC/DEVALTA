import * as metrics from 'datadog-metrics';

// Configuración de métricas Datadog para sistema médico
const DATADOG_CONFIG = {
  host: process.env.DATADOG_HOST || 'localhost',
  port: parseInt(process.env.DATADOG_PORT || '8125'),
  prefix: 'altamedica.medical.',
  flushIntervalSeconds: 15,
  tags: ['service:medical-system', 'compliance:hipaa']
};

// Inicializar métricas
metrics.init(DATADOG_CONFIG);

export interface MedicalMetrics {
  // Métricas de acceso
  accessAttempts: number;
  accessSuccess: number;
  accessDenied: number;
  
  // Métricas de PHI
  phiAccessCount: number;
  phiModificationCount: number;
  
  // Métricas de seguridad
  securityIncidents: number;
  suspiciousActivity: number;
  
  // Métricas de performance
  responseTime: number;
  errorRate: number;
}

/**
 * Clase para manejo de métricas médicas
 */
export class MedicalMetricsTracker {
  private static instance: MedicalMetricsTracker;
  
  private constructor() {
    // Configurar flush automático
    setInterval(() => {
      metrics.flush();
    }, DATADOG_CONFIG.flushIntervalSeconds * 1000);
  }
  
  static getInstance(): MedicalMetricsTracker {
    if (!MedicalMetricsTracker.instance) {
      MedicalMetricsTracker.instance = new MedicalMetricsTracker();
    }
    return MedicalMetricsTracker.instance;
  }
  
  /**
   * Registrar intento de acceso
   */
  recordAccessAttempt(userId: string, resource: string, success: boolean): void {
    const tags = [
      `user:${userId}`,
      `resource:${resource}`,
      `success:${success}`
    ];
    
    metrics.increment('access.attempts', 1, tags);
    
    if (success) {
      metrics.increment('access.success', 1, tags);
    } else {
      metrics.increment('access.denied', 1, tags);
    }
  }
  
  /**
   * Registrar acceso a PHI
   */
  recordPHIAccess(userId: string, patientId: string, accessType: string): void {
    const tags = [
      `user:${userId}`,
      `patient:${patientId}`,
      `access_type:${accessType}`,
      'phi:true'
    ];
    
    metrics.increment('phi.access', 1, tags);
  }
  
  /**
   * Registrar incidente de seguridad
   */
  recordSecurityIncident(incidentType: string, severity: string, userId?: string): void {
    const tags = [
      `incident_type:${incidentType}`,
      `severity:${severity}`,
      ...(userId ? [`user:${userId}`] : [])
    ];
    
    metrics.increment('security.incidents', 1, tags);
  }
  
  /**
   * Registrar actividad sospechosa
   */
  recordSuspiciousActivity(activityType: string, userId: string): void {
    const tags = [
      `activity_type:${activityType}`,
      `user:${userId}`,
      'suspicious:true'
    ];
    
    metrics.increment('security.suspicious_activity', 1, tags);
  }
  
  /**
   * Registrar tiempo de respuesta
   */
  recordResponseTime(endpoint: string, duration: number): void {
    const tags = [`endpoint:${endpoint}`];
    
    metrics.histogram('response.time', duration, tags);
  }
  
  /**
   * Registrar error
   */
  recordError(errorType: string, endpoint?: string): void {
    const tags = [
      `error_type:${errorType}`,
      ...(endpoint ? [`endpoint:${endpoint}`] : [])
    ];
    
    metrics.increment('errors.total', 1, tags);
  }
  
  /**
   * Registrar métricas de auditoría
   */
  recordAuditMetrics(auditCount: number, complianceScore: number): void {
    metrics.gauge('audit.total_events', auditCount);
    metrics.gauge('compliance.score', complianceScore);
  }
  
  /**
   * Registrar métricas de encriptación
   */
  recordEncryptionMetrics(operation: string, duration: number, success: boolean): void {
    const tags = [
      `operation:${operation}`,
      `success:${success}`
    ];
    
    metrics.histogram('encryption.duration', duration, tags);
    metrics.increment(`encryption.${success ? 'success' : 'failure'}`, 1, tags);
  }
  
  /**
   * Registrar métricas de sesión
   */
  recordSessionMetrics(sessionType: string, action: string): void {
    const tags = [
      `session_type:${sessionType}`,
      `action:${action}`
    ];
    
    metrics.increment('session.events', 1, tags);
  }
  
  /**
   * Flush manual de métricas
   */
  flush(): void {
    metrics.flush();
  }
}

// Instancia singleton
export const medicalMetrics = MedicalMetricsTracker.getInstance();

// Funciones de conveniencia para uso directo
export const recordAccess = (userId: string, resource: string, success: boolean) => {
  medicalMetrics.recordAccessAttempt(userId, resource, success);
};

export const recordPHI = (userId: string, patientId: string, accessType: string) => {
  medicalMetrics.recordPHIAccess(userId, patientId, accessType);
};

export const recordSecurity = (incidentType: string, severity: string, userId?: string) => {
  medicalMetrics.recordSecurityIncident(incidentType, severity, userId);
};

export const recordResponse = (endpoint: string, duration: number) => {
  medicalMetrics.recordResponseTime(endpoint, duration);
}; 