import { logMedicalAction, logPHIAccess, logMedicalError } from './medical-logger';
import { SecurityEvent, AccessControl } from './types';

export interface AuditTrail {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalAccesses: number;
    uniqueUsers: number;
    uniquePatients: number;
    securityIncidents: number;
    complianceScore: number;
  };
  details: AuditTrail[];
}

/**
 * Clase principal para auditoría médica
 * Cumple con requisitos HIPAA para auditoría de accesos
 */
export class MedicalAuditor {
  private auditTrails: AuditTrail[] = [];
  private securityEvents: SecurityEvent[] = [];

  /**
   * Registra un evento de auditoría
   */
  recordAuditEvent(auditTrail: Omit<AuditTrail, 'id' | 'timestamp'>): void {
    const event: AuditTrail = {
      ...auditTrail,
      id: this.generateAuditId(),
      timestamp: new Date().toISOString()
    };

    this.auditTrails.push(event);

    // Log automático para cumplimiento HIPAA
    logMedicalAction({
      timestamp: event.timestamp,
      userId: event.userId,
      action: event.action,
      resource: `${event.resourceType}/${event.resourceId}`,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: event.success,
      metadata: event.details
    });

    // Si es acceso a PHI, registrar específicamente
    if (this.isPHIAccess(event.resourceType)) {
      logPHIAccess({
        timestamp: event.timestamp,
        userId: event.userId,
        patientId: event.resourceId,
        accessType: this.mapActionToAccessType(event.action),
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      });
    }
  }

  /**
   * Registra un evento de seguridad
   */
  recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateSecurityEventId(),
      timestamp: new Date().toISOString()
    };

    this.securityEvents.push(securityEvent);

    // Log de errores de seguridad
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      logMedicalError(new Error(`Security Event: ${event.eventType}`), {
        userId: event.userId,
        action: event.eventType,
        resource: 'security-system',
        success: false,
        errorMessage: JSON.stringify(event.details)
      });
    }
  }

  /**
   * Genera reporte de cumplimiento HIPAA
   */
  generateComplianceReport(startDate: string, endDate: string): ComplianceReport {
    const filteredTrails = this.auditTrails.filter(trail => 
      trail.timestamp >= startDate && trail.timestamp <= endDate
    );

    const uniqueUsers = new Set(filteredTrails.map(t => t.userId)).size;
    const uniquePatients = new Set(
      filteredTrails
        .filter(t => this.isPHIAccess(t.resourceType))
        .map(t => t.resourceId)
    ).size;

    const securityIncidents = this.securityEvents.filter(event =>
      event.timestamp >= startDate && 
      event.timestamp <= endDate &&
      (event.severity === 'HIGH' || event.severity === 'CRITICAL')
    ).length;

    const complianceScore = this.calculateComplianceScore(filteredTrails, securityIncidents);

    return {
      reportId: this.generateReportId(),
      generatedAt: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      summary: {
        totalAccesses: filteredTrails.length,
        uniqueUsers,
        uniquePatients,
        securityIncidents,
        complianceScore
      },
      details: filteredTrails
    };
  }

  /**
   * Verifica accesos sospechosos
   */
  detectSuspiciousActivity(): SecurityEvent[] {
    const suspiciousEvents: SecurityEvent[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Agrupar accesos por usuario y hora
    const userAccesses = this.auditTrails
      .filter(trail => trail.timestamp >= oneHourAgo.toISOString())
      .reduce((acc, trail) => {
        if (!acc[trail.userId]) {
          acc[trail.userId] = [];
        }
        acc[trail.userId].push(trail);
        return acc;
      }, {} as Record<string, AuditTrail[]>);

    // Detectar patrones sospechosos
    Object.entries(userAccesses).forEach(([userId, accesses]) => {
      // Muchos accesos en poco tiempo
      if (accesses.length > 50) {
        suspiciousEvents.push({
          id: this.generateSecurityEventId(),
          timestamp: new Date().toISOString(),
          eventType: 'ACCESS_DENIED',
          userId,
          details: {
            reason: 'Excessive access attempts',
            accessCount: accesses.length,
            timeWindow: '1 hour'
          },
          severity: 'HIGH'
        });
      }

      // Accesos a múltiples pacientes en poco tiempo
      const uniquePatients = new Set(
        accesses
          .filter(t => this.isPHIAccess(t.resourceType))
          .map(t => t.resourceId)
      );

      if (uniquePatients.size > 10) {
        suspiciousEvents.push({
          id: this.generateSecurityEventId(),
          timestamp: new Date().toISOString(),
          eventType: 'ACCESS_DENIED',
          userId,
          details: {
            reason: 'Multiple patient access',
            patientCount: uniquePatients.size,
            timeWindow: '1 hour'
          },
          severity: 'MEDIUM'
        });
      }
    });

    return suspiciousEvents;
  }

  /**
   * Obtiene historial de accesos de un usuario
   */
  getUserAccessHistory(userId: string, days: number = 30): AuditTrail[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.auditTrails.filter(trail =>
      trail.userId === userId && 
      trail.timestamp >= cutoffDate.toISOString()
    );
  }

  /**
   * Obtiene historial de accesos a un paciente
   */
  getPatientAccessHistory(patientId: string, days: number = 30): AuditTrail[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.auditTrails.filter(trail =>
      trail.resourceId === patientId && 
      trail.timestamp >= cutoffDate.toISOString()
    );
  }

  // Métodos auxiliares privados
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSecurityEventId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isPHIAccess(resourceType: string): boolean {
    const phiResources = ['Patient', 'MedicalRecord', 'LabResult', 'Prescription', 'Diagnosis'];
    return phiResources.includes(resourceType);
  }

  private mapActionToAccessType(action: string): 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' {
    switch (action.toUpperCase()) {
      case 'GET': return 'READ';
      case 'POST': case 'PUT': case 'PATCH': return 'WRITE';
      case 'DELETE': return 'DELETE';
      case 'EXPORT': return 'EXPORT';
      default: return 'READ';
    }
  }

  private calculateComplianceScore(trails: AuditTrail[], securityIncidents: number): number {
    const totalTrails = trails.length;
    if (totalTrails === 0) return 100;

    const failedAccesses = trails.filter(t => !t.success).length;
    const successRate = ((totalTrails - failedAccesses) / totalTrails) * 100;
    
    // Penalizar incidentes de seguridad
    const securityPenalty = securityIncidents * 10;
    
    return Math.max(0, Math.min(100, successRate - securityPenalty));
  }
}

// Instancia singleton para uso global
export const medicalAuditor = new MedicalAuditor(); 