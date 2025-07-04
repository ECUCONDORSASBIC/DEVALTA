import { medicalMetrics } from './datadog-metrics';
import { logMedicalError } from './medical-logger';

export interface AlertRule {
  id: string;
  name: string;
  condition: () => boolean | Promise<boolean>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  cooldownMinutes: number;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: string;
  severity: string;
  message: string;
  details?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

/**
 * Sistema de alertas para monitoreo médico
 */
export class MedicalAlertSystem {
  private static instance: MedicalAlertSystem;
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private lastTriggered: Map<string, number> = new Map();
  
  private constructor() {
    this.initializeDefaultRules();
  }
  
  static getInstance(): MedicalAlertSystem {
    if (!MedicalAlertSystem.instance) {
      MedicalAlertSystem.instance = new MedicalAlertSystem();
    }
    return MedicalAlertSystem.instance;
  }
  
  /**
   * Agregar regla de alerta
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }
  
  /**
   * Ejecutar verificación de alertas
   */
  async checkAlerts(): Promise<Alert[]> {
    const newAlerts: Alert[] = [];
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      // Verificar cooldown
      const lastTriggered = this.lastTriggered.get(rule.id) || 0;
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      const now = Date.now();
      
      if (now - lastTriggered < cooldownMs) continue;
      
      try {
        const shouldAlert = await rule.condition();
        
        if (shouldAlert) {
          const alert: Alert = {
            id: this.generateAlertId(),
            ruleId: rule.id,
            timestamp: new Date().toISOString(),
            severity: rule.severity,
            message: rule.message,
            acknowledged: false
          };
          
          this.alerts.push(alert);
          newAlerts.push(alert);
          this.lastTriggered.set(rule.id, now);
          
          // Registrar alerta
          this.handleAlert(alert);
        }
      } catch (error) {
        console.error(`Error checking alert rule ${rule.id}:`, error);
      }
    }
    
    return newAlerts;
  }
  
  /**
   * Obtener alertas activas
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }
  
  /**
   * Reconocer alerta
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
  
  /**
   * Limpiar alertas antiguas (más de 7 días)
   */
  cleanupOldAlerts(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > sevenDaysAgo
    );
  }
  
  /**
   * Reglas de alerta por defecto para sistema médico
   */
  private initializeDefaultRules(): void {
    // Alerta por múltiples intentos de acceso fallidos
    this.addRule({
      id: 'multiple_failed_access',
      name: 'Multiple Failed Access Attempts',
      condition: async () => {
        // Esta regla se verificaría contra métricas de acceso
        // Por ahora retornamos false como placeholder
        return false;
      },
      severity: 'high',
      message: 'Multiple failed access attempts detected',
      cooldownMinutes: 15,
      enabled: true
    });
    
    // Alerta por acceso a múltiples pacientes
    this.addRule({
      id: 'multiple_patient_access',
      name: 'Multiple Patient Access',
      condition: async () => {
        // Verificar acceso a múltiples pacientes en poco tiempo
        return false;
      },
      severity: 'medium',
      message: 'User accessed multiple patients in short time',
      cooldownMinutes: 30,
      enabled: true
    });
    
    // Alerta por errores críticos del sistema
    this.addRule({
      id: 'system_errors',
      name: 'System Errors',
      condition: async () => {
        // Verificar tasa de errores
        return false;
      },
      severity: 'critical',
      message: 'High error rate detected',
      cooldownMinutes: 5,
      enabled: true
    });
    
    // Alerta por problemas de encriptación
    this.addRule({
      id: 'encryption_failure',
      name: 'Encryption Failure',
      condition: async () => {
        // Verificar fallos de encriptación
        return false;
      },
      severity: 'critical',
      message: 'Encryption system failure detected',
      cooldownMinutes: 1,
      enabled: true
    });
    
    // Alerta por problemas de auditoría
    this.addRule({
      id: 'audit_failure',
      name: 'Audit System Failure',
      condition: async () => {
        // Verificar que el sistema de auditoría esté funcionando
        return false;
      },
      severity: 'high',
      message: 'Audit system not functioning properly',
      cooldownMinutes: 10,
      enabled: true
    });
  }
  
  /**
   * Manejar nueva alerta
   */
  private handleAlert(alert: Alert): void {
    // Registrar en métricas
    medicalMetrics.recordSecurityIncident('alert_triggered', alert.severity);
    
    // Log de alerta
    logMedicalError(new Error(alert.message), {
      action: 'ALERT_TRIGGERED',
      resource: 'alert-system',
      success: false,
      metadata: {
        alertId: alert.id,
        ruleId: alert.ruleId,
        severity: alert.severity
      }
    });
    
    // Console log para desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const emoji = this.getSeverityEmoji(alert.severity);
      console.log(`${emoji} ALERTA MÉDICA: ${alert.message}`, {
        id: alert.id,
        severity: alert.severity,
        timestamp: alert.timestamp
      });
    }
    
    // Aquí se podrían agregar notificaciones por email, Slack, etc.
    this.sendNotification(alert);
  }
  
  /**
   * Enviar notificación de alerta
   */
  private sendNotification(alert: Alert): void {
    // Implementar notificaciones según severidad
    switch (alert.severity) {
      case 'critical':
        // Notificación inmediata (SMS, llamada, etc.)
        this.sendCriticalNotification(alert);
        break;
      case 'high':
        // Notificación urgente (email, Slack)
        this.sendHighPriorityNotification(alert);
        break;
      case 'medium':
        // Notificación estándar (email)
        this.sendStandardNotification(alert);
        break;
      case 'low':
        // Log solamente
        break;
    }
  }
  
  private sendCriticalNotification(alert: Alert): void {
    // Implementar notificación crítica
    console.error('🚨 NOTIFICACIÓN CRÍTICA:', alert.message);
  }
  
  private sendHighPriorityNotification(alert: Alert): void {
    // Implementar notificación de alta prioridad
    console.warn('⚠️ NOTIFICACIÓN ALTA PRIORIDAD:', alert.message);
  }
  
  private sendStandardNotification(alert: Alert): void {
    // Implementar notificación estándar
    console.log('ℹ️ NOTIFICACIÓN:', alert.message);
  }
  
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  }
  
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instancia singleton
export const medicalAlertSystem = MedicalAlertSystem.getInstance();

// Función de conveniencia para verificar alertas
export const checkMedicalAlerts = async (): Promise<Alert[]> => {
  return medicalAlertSystem.checkAlerts();
}; 