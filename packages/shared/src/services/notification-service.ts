/**
 * 🔔 NOTIFICATION SERVICE - ALTAMEDICA
 * Servicio centralizado de notificaciones para todas las aplicaciones
 * Usado por: Patients, Doctors, Companies, Admin Apps
 */

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'user' | 'doctor' | 'patient' | 'company' | 'all';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'appointment' | 'prescription' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, unknown>;
  action_url?: string;
  action_text?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  unread_only?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Servicio de Notificaciones Centralizado
 */
export class NotificationService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.unread_only) {
        params.append('unread_only', 'true');
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: NotificationResponse;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
        }
      );

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/mark-all-read`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
        }
      );

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        }
      );

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: NotificationStats;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Crear nueva notificación (admin)
   */
  async createNotification(notification: {
    recipient_id?: string;
    recipient_type: Notification['recipient_type'];
    title: string;
    message: string;
    type: Notification['type'];
    priority: Notification['priority'];
    data?: Record<string, unknown>;
    action_url?: string;
    action_text?: string;
    expires_at?: string;
  }): Promise<Notification> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(notification),
        }
      );

      const result = await this.handleResponse<{
        success: boolean;
        data: Notification;
      }>(response);

      return result.data;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a notificaciones en tiempo real
   */
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // En una implementación real, esto usaría WebSocket o Server-Sent Events
    // Por ahora, retornamos una función de cleanup vacía
    console.log('Subscription to notifications enabled');
    
    return () => {
      console.log('Unsubscribed from notifications');
    };
  }

  /**
   * Actualizar token de autenticación
   */
  updateToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }
}

// Singleton para uso global
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
};

// Export por defecto
export default getNotificationService();