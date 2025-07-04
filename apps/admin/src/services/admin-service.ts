/**
 * Servicio Administrativo - Conexión con Backend API
 * Gestión completa del sistema administrativo
 */

import axios from 'axios';

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Interceptor para agregar token de autenticación
axios.interceptors.request.use(async (config) => {
  // Obtener token de Firebase Auth
  const user = JSON.parse(localStorage.getItem('firebase:authUser:demo-api-key:[DEFAULT]') || '{}');
  if (user.stsTokenManager?.accessToken) {
    config.headers.Authorization = `Bearer ${user.stsTokenManager.accessToken}`;
  }
  return config;
});

// Tipos de datos
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  criticalAlerts: number;
  systemUptime: number;
  totalRevenue: number;
  monthlyGrowth: number;
  securityIncidents: number;
  totalDoctors: number;
  totalPatients: number;
  totalCompanies: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'COMPANY' | 'MODERATOR';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'INACTIVE';
  createdAt: string;
  lastLogin: string;
  isVerified: boolean;
  profilePicture?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  uptime: number;
  responseTime: number;
  issues: Array<{
    id: string;
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    resolved: boolean;
  }>;
  lastCheck: string;
}

export interface AuditLog {
  id: string;
  type: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_ROLE_UPDATED' | 'USER_SUSPENDED' | 'USER_ACTIVATED' | 'SYSTEM_CONFIG_CHANGED' | 'SECURITY_INCIDENT' | 'DATA_EXPORT' | 'LOGIN_ATTEMPT';
  userId: string;
  targetUserId?: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditEvent {
  type: string;
  userId: string;
  targetUserId?: string;
  description: string;
  metadata?: Record<string, any>;
}

class AdminService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  /**
   * Obtener estadísticas del sistema
   */
  async getStats(): Promise<AdminStats> {
    try {
      const response = await this.api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas administrativas:', error);
      throw new Error('No se pudieron obtener las estadísticas del sistema');
    }
  }

  /**
   * Obtener usuarios recientes
   */
  async getRecentUsers(limit: number = 50): Promise<AdminUser[]> {
    try {
      const response = await this.api.get('/admin/users', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error('No se pudieron obtener los usuarios');
    }
  }

  /**
   * Obtener salud del sistema
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await this.api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo salud del sistema:', error);
      throw new Error('No se pudo obtener la salud del sistema');
    }
  }

  /**
   * Obtener logs de auditoría
   */
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      const response = await this.api.get('/admin/audit/logs', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      throw new Error('No se pudieron obtener los logs de auditoría');
    }
  }

  /**
   * Actualizar rol de usuario
   */
  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/role`, {
        role
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando rol de usuario:', error);
      throw new Error('No se pudo actualizar el rol del usuario');
    }
  }

  /**
   * Suspender usuario
   */
  async suspendUser(userId: string, reason: string): Promise<AdminUser> {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/suspend`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      throw new Error('No se pudo suspender el usuario');
    }
  }

  /**
   * Activar usuario
   */
  async activateUser(userId: string): Promise<AdminUser> {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activando usuario:', error);
      throw new Error('No se pudo activar el usuario');
    }
  }

  /**
   * Registrar evento de auditoría
   */
  async logAuditEvent(event: AuditEvent): Promise<void> {
    try {
      await this.api.post('/admin/audit/events', event);
    } catch (error) {
      console.error('Error registrando evento de auditoría:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Exportar reporte
   */
  async exportReport(type: string, dateRange: string): Promise<Blob> {
    try {
      const response = await this.api.get('/admin/reports/export', {
        params: { type, dateRange },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw new Error('No se pudo exportar el reporte');
    }
  }

  /**
   * Obtener configuración del sistema
   */
  async getSystemConfig(): Promise<Record<string, any>> {
    try {
      const response = await this.api.get('/admin/system/config');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuración del sistema:', error);
      throw new Error('No se pudo obtener la configuración del sistema');
    }
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateSystemConfig(config: Record<string, any>): Promise<Record<string, any>> {
    try {
      const response = await this.api.put('/admin/system/config', config);
      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración del sistema:', error);
      throw new Error('No se pudo actualizar la configuración del sistema');
    }
  }

  /**
   * Obtener métricas de rendimiento
   */
  async getPerformanceMetrics(period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    responseTime: number[];
    errorRate: number[];
    throughput: number[];
    timestamps: string[];
  }> {
    try {
      const response = await this.api.get('/admin/system/performance', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error);
      throw new Error('No se pudieron obtener las métricas de rendimiento');
    }
  }

  /**
   * Obtener alertas de seguridad
   */
  async getSecurityAlerts(): Promise<Array<{
    id: string;
    type: 'LOGIN_ATTEMPT' | 'SUSPICIOUS_ACTIVITY' | 'DATA_BREACH' | 'SYSTEM_COMPROMISE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: string;
    resolved: boolean;
    metadata?: Record<string, any>;
  }>> {
    try {
      const response = await this.api.get('/admin/security/alerts');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas de seguridad:', error);
      throw new Error('No se pudieron obtener las alertas de seguridad');
    }
  }

  /**
   * Resolver alerta de seguridad
   */
  async resolveSecurityAlert(alertId: string, resolution: string): Promise<void> {
    try {
      await this.api.patch(`/admin/security/alerts/${alertId}/resolve`, {
        resolution
      });
    } catch (error) {
      console.error('Error resolviendo alerta de seguridad:', error);
      throw new Error('No se pudo resolver la alerta de seguridad');
    }
  }

  /**
   * Obtener backup del sistema
   */
  async createSystemBackup(): Promise<{
    backupId: string;
    size: number;
    createdAt: string;
    downloadUrl: string;
  }> {
    try {
      const response = await this.api.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      console.error('Error creando backup del sistema:', error);
      throw new Error('No se pudo crear el backup del sistema');
    }
  }

  /**
   * Restaurar sistema desde backup
   */
  async restoreSystemFromBackup(backupId: string): Promise<void> {
    try {
      await this.api.post(`/admin/system/restore/${backupId}`);
    } catch (error) {
      console.error('Error restaurando sistema:', error);
      throw new Error('No se pudo restaurar el sistema');
    }
  }
}

export const adminService = new AdminService(); 