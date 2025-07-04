import { medicalMetrics } from './datadog-metrics';
import { medicalAuditor } from './audit';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'healthy' | 'unhealthy' | 'degraded';
      message: string;
      details?: any;
    };
  };
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

export interface HealthCheckConfig {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  critical?: boolean;
}

/**
 * Sistema de health checks para servicios médicos
 */
export class MedicalHealthChecker {
  private checks: HealthCheckConfig[] = [];
  private lastCheck: HealthCheckResult | null = null;
  
  constructor() {
    // Health checks por defecto
    this.addDefaultChecks();
  }
  
  /**
   * Agregar health check personalizado
   */
  addCheck(config: HealthCheckConfig): void {
    this.checks.push(config);
  }
  
  /**
   * Ejecutar todos los health checks
   */
  async runHealthChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const results: HealthCheckResult['checks'] = {};
    
    // Ejecutar checks en paralelo
    const checkPromises = this.checks.map(async (check) => {
      const checkStart = Date.now();
      
      try {
        const timeout = check.timeout || 5000;
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), timeout);
        });
        
        const checkPromise = check.check();
        const isHealthy = await Promise.race([checkPromise, timeoutPromise]);
        
        const duration = Date.now() - checkStart;
        
        results[check.name] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          message: isHealthy ? 'Check passed' : 'Check failed',
          details: { duration }
        };
        
        // Registrar métricas
        medicalMetrics.recordResponseTime(`health_check.${check.name}`, duration);
        
        return isHealthy;
      } catch (error) {
        const duration = Date.now() - checkStart;
        
        results[check.name] = {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { duration, error: error instanceof Error ? error.stack : error }
        };
        
        // Registrar error
        medicalMetrics.recordError('health_check_failure', check.name);
        
        return false;
      }
    });
    
    await Promise.all(checkPromises);
    
    // Calcular resumen
    const summary = this.calculateSummary(results);
    const overallStatus = this.determineOverallStatus(summary);
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      summary
    };
    
    this.lastCheck = result;
    
    // Registrar métricas de health check
    const totalDuration = Date.now() - startTime;
    medicalMetrics.recordResponseTime('health_check.total', totalDuration);
    
    // Alertar si hay problemas críticos
    if (overallStatus !== 'healthy') {
      this.alertHealthIssues(result);
    }
    
    return result;
  }
  
  /**
   * Obtener último resultado de health check
   */
  getLastCheck(): HealthCheckResult | null {
    return this.lastCheck;
  }
  
  /**
   * Health checks por defecto para sistema médico
   */
  private addDefaultChecks(): void {
    // Check de memoria
    this.addCheck({
      name: 'memory',
      check: async () => {
        const memUsage = process.memoryUsage();
        const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        return heapUsedPercent < 90; // Menos del 90% de uso
      },
      timeout: 1000,
      critical: true
    });
    
    // Check de CPU
    this.addCheck({
      name: 'cpu',
      check: async () => {
        const startUsage = process.cpuUsage();
        await new Promise(resolve => setTimeout(resolve, 100));
        const endUsage = process.cpuUsage(startUsage);
        const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convertir a segundos
        return cpuPercent < 80; // Menos del 80% de CPU
      },
      timeout: 2000
    });
    
    // Check de auditoría
    this.addCheck({
      name: 'audit_system',
      check: async () => {
        try {
          // Verificar que el sistema de auditoría esté funcionando
          const testEvent = {
            userId: 'health-check',
            action: 'HEALTH_CHECK',
            resourceType: 'System',
            resourceId: 'health-check',
            details: {},
            ipAddress: '127.0.0.1',
            userAgent: 'HealthChecker/1.0',
            success: true
          };
          
          medicalAuditor.recordAuditEvent(testEvent);
          return true;
        } catch (error) {
          return false;
        }
      },
      timeout: 3000,
      critical: true
    });
    
    // Check de encriptación
    this.addCheck({
      name: 'encryption',
      check: async () => {
        try {
          const { encryptMedicalData, decryptMedicalData } = await import('./encryption');
          const testData = 'health-check-test-data';
          const encrypted = encryptMedicalData(testData);
          const decrypted = decryptMedicalData(encrypted);
          return decrypted.success && decrypted.data === testData;
        } catch (error) {
          return false;
        }
      },
      timeout: 5000,
      critical: true
    });
    
    // Check de métricas
    this.addCheck({
      name: 'metrics',
      check: async () => {
        try {
          // Verificar que las métricas se puedan registrar
          medicalMetrics.recordAccessAttempt('health-check', 'health-check', true);
          return true;
        } catch (error) {
          return false;
        }
      },
      timeout: 2000
    });
    
    // Check de logs
    this.addCheck({
      name: 'logging',
      check: async () => {
        try {
          const { logMedicalAction } = await import('./medical-logger');
          logMedicalAction({
            timestamp: new Date().toISOString(),
            userId: 'health-check',
            action: 'HEALTH_CHECK',
            resource: 'health-check',
            success: true
          });
          return true;
        } catch (error) {
          return false;
        }
      },
      timeout: 2000,
      critical: true
    });
  }
  
  /**
   * Calcular resumen de health checks
   */
  private calculateSummary(results: HealthCheckResult['checks']): HealthCheckResult['summary'] {
    const total = Object.keys(results).length;
    let healthy = 0;
    let unhealthy = 0;
    let degraded = 0;
    
    Object.values(results).forEach(result => {
      switch (result.status) {
        case 'healthy':
          healthy++;
          break;
        case 'unhealthy':
          unhealthy++;
          break;
        case 'degraded':
          degraded++;
          break;
      }
    });
    
    return { total, healthy, unhealthy, degraded };
  }
  
  /**
   * Determinar estado general del sistema
   */
  private determineOverallStatus(summary: HealthCheckResult['summary']): 'healthy' | 'unhealthy' | 'degraded' {
    if (summary.unhealthy > 0) {
      return 'unhealthy';
    }
    
    if (summary.degraded > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }
  
  /**
   * Alertar sobre problemas de salud del sistema
   */
  private async alertHealthIssues(result: HealthCheckResult): Promise<void> {
    const unhealthyChecks = Object.entries(result.checks)
      .filter(([_, check]) => check.status === 'unhealthy')
      .map(([name, check]) => `${name}: ${check.message}`);
    
    if (unhealthyChecks.length > 0) {
      // Registrar métrica de alerta
      medicalMetrics.recordSecurityIncident('health_check_failure', 'high');
      
      // Log de alerta
      console.error('🚨 HEALTH CHECK FAILED:', {
        service: 'medical-health-checker',
        unhealthyChecks,
        summary: result.summary
      });
    }
  }
}

// Instancia singleton
export const medicalHealthChecker = new MedicalHealthChecker();

// Función de conveniencia para health check rápido
export const quickHealthCheck = async (): Promise<HealthCheckResult> => {
  return medicalHealthChecker.runHealthChecks();
}; 