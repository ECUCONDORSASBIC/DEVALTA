/**
 * Servicio de Notificaciones para Pacientes
 * Conecta con la API del servidor para gestionar notificaciones
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

class NotificationService {
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
  async getNotifications(filters: NotificationFilters = {}): Promise<{
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
  }> {
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
        data: {
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
        };
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
        `${this.baseUrl}/api/v1/notifications/read-all`,
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
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const { notifications, unread_count } = await this.getNotifications();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stats: NotificationStats = {
        total: notifications.length,
        unread: unread_count,
        urgent: notifications.filter(n => n.priority === 'urgent' && !n.is_read).length,
        today: notifications.filter(n => 
          new Date(n.created_at) >= today
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const { notifications } = await this.getNotifications({ unread_only: true });
      return notifications;
    } catch (error) {
      console.error('Error obteniendo notificaciones no leídas:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones urgentes
   */
  async getUrgentNotifications(): Promise<Notification[]> {
    try {
      const { notifications } = await this.getNotifications({ priority: 'urgent' });
      return notifications.filter(n => !n.is_read);
    } catch (error) {
      console.error('Error obteniendo notificaciones urgentes:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a notificaciones en tiempo real (WebSocket)
   */
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // Mock WebSocket subscription for now
    // In real implementation, this would connect to WebSocket server
    console.log('Mock WebSocket subscription to notifications');
    
    // Return unsubscribe function
    return () => {
      console.log('Mock WebSocket unsubscription from notifications');
    };
  }

  /**
   * Enviar notificación de prueba (solo para desarrollo)
   */
  async sendTestNotification(): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/test`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService(); 