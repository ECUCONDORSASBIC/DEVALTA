import { Request, Response, NextFunction } from 'express';
import { medicalMetrics, recordAccess, recordResponse } from './datadog-metrics';
import { medicalAuditor } from './audit';
import { logMedicalAction } from './medical-logger';

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableAudit: boolean;
  enableLogging: boolean;
  sensitiveEndpoints: string[];
  phiEndpoints: string[];
}

/**
 * Middleware de monitoreo médico completo
 * Integra Sentry, Datadog, auditoría y logging
 */
export const medicalMonitoringMiddleware = (config: MonitoringConfig = {
  enableMetrics: true,
  enableAudit: true,
  enableLogging: true,
  sensitiveEndpoints: ['/patients', '/medical-records', '/appointments'],
  phiEndpoints: ['/patients', '/medical-records']
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const userId = (req as any).user?.id || 'anonymous';
    const endpoint = req.path;
    const method = req.method;
    
    // Detectar si es endpoint sensible
    const isSensitive = config.sensitiveEndpoints.some(path => endpoint.includes(path));
    const isPHI = config.phiEndpoints.some(path => endpoint.includes(path));
    
    // Interceptar respuesta para logging
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // 1. Métricas Datadog
      if (config.enableMetrics) {
        try {
          recordAccess(userId, endpoint, success);
          recordResponse(endpoint, duration);
          
          if (isPHI) {
            const patientId = extractPatientId(endpoint);
            medicalMetrics.recordPHIAccess(userId, patientId, method);
          }
          
          if (!success) {
            medicalMetrics.recordError('http_error', endpoint);
          }
        } catch (error) {
          console.error('Error recording metrics:', error);
        }
      }
      
      // 2. Auditoría médica
      if (config.enableAudit) {
        try {
          medicalAuditor.recordAuditEvent({
            userId,
            action: method,
            resourceType: extractResourceType(endpoint),
            resourceId: extractResourceId(endpoint),
            details: {
              statusCode: res.statusCode,
              duration,
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip || req.connection.remoteAddress
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success
          });
        } catch (error) {
          console.error('Error recording audit:', error);
        }
      }
      
      // 3. Logging médico
      if (config.enableLogging) {
        try {
          logMedicalAction({
            timestamp: new Date().toISOString(),
            userId,
            action: method,
            resource: endpoint,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success,
            metadata: {
              duration,
              statusCode: res.statusCode,
              isSensitive,
              isPHI
            }
          });
        } catch (error) {
          console.error('Error recording log:', error);
        }
      }
      
      // 4. Detectar actividad sospechosa
      if (isSensitive && !success) {
        try {
          medicalMetrics.recordSuspiciousActivity('failed_access', userId);
        } catch (error) {
          console.error('Error recording suspicious activity:', error);
        }
      }
      
      // Llamar función original
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware específico para endpoints de PHI
 */
export const phiMonitoringMiddleware = () => {
  return medicalMonitoringMiddleware({
    enableMetrics: true,
    enableAudit: true,
    enableLogging: true,
    sensitiveEndpoints: ['/patients', '/medical-records'],
    phiEndpoints: ['/patients', '/medical-records']
  });
};

/**
 * Middleware para endpoints de autenticación
 */
export const authMonitoringMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const endpoint = req.path;
    
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // Registrar métricas de autenticación
      try {
        medicalMetrics.recordSessionMetrics('authentication', success ? 'success' : 'failure');
        
        if (!success) {
          medicalMetrics.recordSecurityIncident('auth_failure', 'medium');
        }
      } catch (error) {
        console.error('Error recording auth metrics:', error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware para monitoreo de errores
 */
export const errorMonitoringMiddleware = () => {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || 'anonymous';
    const endpoint = req.path;
    
    // Registrar error en métricas
    try {
      medicalMetrics.recordError('unhandled_error', endpoint);
      medicalMetrics.recordSecurityIncident('system_error', 'high', userId);
    } catch (metricsError) {
      console.error('Error recording error metrics:', metricsError);
    }
    
    // Log del error
    try {
      logMedicalAction({
        timestamp: new Date().toISOString(),
        userId,
        action: req.method,
        resource: endpoint,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: error.message,
        metadata: {
          stack: error.stack,
          errorType: 'unhandled'
        }
      });
    } catch (logError) {
      console.error('Error recording error log:', logError);
    }
    
    next(error);
  };
};

// Funciones auxiliares
function extractPatientId(path: string): string {
  const match = path.match(/\/patients\/([^\/]+)/);
  return match ? match[1] : 'unknown';
}

function extractResourceType(path: string): string {
  if (path.includes('/patients/')) return 'Patient';
  if (path.includes('/medical-records/')) return 'MedicalRecord';
  if (path.includes('/appointments/')) return 'Appointment';
  if (path.includes('/auth/')) return 'Authentication';
  return 'Unknown';
}

function extractResourceId(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || 'unknown';
} 