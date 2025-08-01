import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
  type: 'appointment_reminder' | 'telemedicine_confirmation' | 'medical_alert' | 'results_ready' | 'doctor_message' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  variables: string[];
}

class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'appointment_reminder',
        type: 'appointment_reminder',
        title: 'Recordatorio de Cita',
        message: 'Su cita con {{doctorName}} está programada para {{appointmentDate}} a las {{appointmentTime}}. Por favor, confirme su asistencia.',
        priority: 'medium',
        variables: ['doctorName', 'appointmentDate', 'appointmentTime']
      },
      {
        id: 'telemedicine_confirmation',
        type: 'telemedicine_confirmation',
        title: 'Confirmación de Telemedicina',
        message: 'Su consulta de telemedicina con {{doctorName}} ha sido confirmada para {{appointmentDate}} a las {{appointmentTime}}. Enlace: {{meetingLink}}',
        priority: 'high',
        variables: ['doctorName', 'appointmentDate', 'appointmentTime', 'meetingLink']
      },
      {
        id: 'medical_alert',
        type: 'medical_alert',
        title: 'Alerta Médica',
        message: '{{alertMessage}}. Por favor, contacte a su médico inmediatamente.',
        priority: 'urgent',
        variables: ['alertMessage']
      },
      {
        id: 'results_ready',
        type: 'results_ready',
        title: 'Resultados de Laboratorio Listos',
        message: 'Sus resultados de laboratorio están listos. Puede acceder a ellos en su portal de paciente.',
        priority: 'medium',
        variables: []
      },
      {
        id: 'doctor_message',
        type: 'doctor_message',
        title: 'Mensaje del Médico',
        message: '{{doctorName}} le ha enviado un mensaje: {{message}}',
        priority: 'high',
        variables: ['doctorName', 'message']
      },
      {
        id: 'system_alert',
        type: 'system_alert',
        title: 'Aviso del Sistema',
        message: '{{systemMessage}}',
        priority: 'low',
        variables: ['systemMessage']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Crear notificación
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      ...data,
      createdAt: new Date()
    };

    this.notifications.set(notification.id, notification);

    // Si es una notificación programada, configurar el envío
    if (notification.scheduledFor) {
      this.scheduleNotification(notification);
    } else {
      // Enviar inmediatamente
      await this.sendNotification(notification);
    }

    return notification;
  }

  // Crear notificación desde template
  async createNotificationFromTemplate(
    templateId: string,
    userId: string,
    userType: 'patient' | 'doctor' | 'admin',
    variables: Record<string, string>,
    scheduledFor?: Date
  ): Promise<Notification> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let title = template.title;
    let message = template.message;

    // Reemplazar variables en el template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return this.createNotification({
      userId,
      userType,
      type: template.type as any,
      title,
      message,
      priority: template.priority,
      status: 'unread',
      metadata: { templateId, variables },
      scheduledFor
    });
  }

  // Obtener notificaciones de un usuario
  async getUserNotifications(
    userId: string,
    userType: 'patient' | 'doctor' | 'admin',
    options: {
      status?: 'unread' | 'read' | 'archived';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { status, limit = 50, offset = 0 } = options;

    let notifications = Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        notification.userType === userType
      );

    if (status) {
      notifications = notifications.filter(notification => notification.status === status);
    }

    // Ordenar por fecha de creación (más reciente primero)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return notifications.slice(offset, offset + limit);
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return null;
    }

    notification.status = 'read';
    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);

    return notification;
  }

  // Marcar notificación como archivada
  async markAsArchived(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return null;
    }

    notification.status = 'archived';
    this.notifications.set(notificationId, notification);

    return notification;
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string, userType: 'patient' | 'doctor' | 'admin'): Promise<number> {
    let count = 0;
    
    this.notifications.forEach(notification => {
      if (notification.userId === userId && 
          notification.userType === userType && 
          notification.status === 'unread') {
        notification.status = 'read';
        notification.readAt = new Date();
        count++;
      }
    });

    return count;
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    // Cancelar notificación programada si existe
    const scheduledTimeout = this.scheduledNotifications.get(notificationId);
    if (scheduledTimeout) {
      clearTimeout(scheduledTimeout);
      this.scheduledNotifications.delete(notificationId);
    }

    this.notifications.delete(notificationId);
    return true;
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(userId: string, userType: 'patient' | 'doctor' | 'admin') {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        notification.userType === userType
      );

    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => n.status === 'unread').length,
      read: userNotifications.filter(n => n.status === 'read').length,
      archived: userNotifications.filter(n => n.status === 'archived').length,
      urgent: userNotifications.filter(n => n.priority === 'urgent').length,
      high: userNotifications.filter(n => n.priority === 'high').length,
      medium: userNotifications.filter(n => n.priority === 'medium').length,
      low: userNotifications.filter(n => n.priority === 'low').length
    };
  }

  // Programar notificación
  private scheduleNotification(notification: Notification) {
    if (!notification.scheduledFor) return;

    const delay = notification.scheduledFor.getTime() - Date.now();
    if (delay <= 0) {
      // Si ya pasó la fecha, enviar inmediatamente
      this.sendNotification(notification);
      return;
    }

    const timeout = setTimeout(async () => {
      await this.sendNotification(notification);
      this.scheduledNotifications.delete(notification.id);
    }, delay);

    this.scheduledNotifications.set(notification.id, timeout);
  }

  // Enviar notificación
  private async sendNotification(notification: Notification) {
    try {
      // Simular envío de notificación
      console.log(`Sending notification to ${notification.userId}:`, {
        title: notification.title,
        message: notification.message,
        priority: notification.priority
      });

      // Aquí se integraría con servicios reales como:
      // - Push notifications (Firebase, OneSignal)
      // - Email (SendGrid, Mailgun)
      // - SMS (Twilio)
      // - WebSocket para notificaciones en tiempo real

      notification.sentAt = new Date();
      this.notifications.set(notification.id, notification);

      // Emitir evento para WebSocket si está disponible
      this.emitNotificationEvent(notification);

    } catch (error) {
      console.error('Error sending notification:', error);
      // Marcar como fallida y reintentar más tarde
      notification.metadata = {
        ...notification.metadata,
        sendError: error.message,
        retryCount: (notification.metadata?.retryCount || 0) + 1
      };
    }
  }

  // Emitir evento de notificación (para WebSocket)
  private emitNotificationEvent(notification: Notification) {
    // Aquí se emitiría el evento a través de WebSocket
    // para notificaciones en tiempo real
    console.log(`Notification event emitted for user ${notification.userId}`);
  }

  // Crear recordatorio de cita
  async createAppointmentReminder(
    userId: string,
    userType: 'patient' | 'doctor',
    appointmentData: {
      doctorName: string;
      appointmentDate: string;
      appointmentTime: string;
      appointmentId: string;
    },
    reminderHours: number = 24
  ): Promise<Notification> {
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() - reminderHours);

    return this.createNotificationFromTemplate(
      'appointment_reminder',
      userId,
      userType,
      {
        doctorName: appointmentData.doctorName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime
      },
      scheduledFor
    );
  }

  // Crear confirmación de telemedicina
  async createTelemedicineConfirmation(
    userId: string,
    userType: 'patient' | 'doctor',
    telemedicineData: {
      doctorName: string;
      appointmentDate: string;
      appointmentTime: string;
      meetingLink: string;
    }
  ): Promise<Notification> {
    return this.createNotificationFromTemplate(
      'telemedicine_confirmation',
      userId,
      userType,
      {
        doctorName: telemedicineData.doctorName,
        appointmentDate: telemedicineData.appointmentDate,
        appointmentTime: telemedicineData.appointmentTime,
        meetingLink: telemedicineData.meetingLink
      }
    );
  }

  // Crear alerta médica
  async createMedicalAlert(
    userId: string,
    userType: 'patient' | 'doctor',
    alertMessage: string
  ): Promise<Notification> {
    return this.createNotificationFromTemplate(
      'medical_alert',
      userId,
      userType,
      { alertMessage }
    );
  }

  // Crear mensaje del médico
  async createDoctorMessage(
    patientId: string,
    doctorName: string,
    message: string
  ): Promise<Notification> {
    return this.createNotificationFromTemplate(
      'doctor_message',
      patientId,
      'patient',
      { doctorName, message }
    );
  }

  // Limpiar notificaciones antiguas
  async cleanupOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const notificationsToDelete: string[] = [];

    this.notifications.forEach((notification, id) => {
      if (notification.createdAt < cutoffDate && notification.status === 'archived') {
        notificationsToDelete.push(id);
      }
    });

    notificationsToDelete.forEach(id => {
      this.notifications.delete(id);
    });

    console.log(`Cleaned up ${notificationsToDelete.length} old notifications`);
    return notificationsToDelete.length;
  }

  // Obtener todas las notificaciones (para administración)
  async getAllNotifications(options: {
    userType?: 'patient' | 'doctor' | 'admin';
    status?: 'unread' | 'read' | 'archived';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    limit?: number;
    offset?: number;
  } = {}): Promise<Notification[]> {
    const { userType, status, priority, limit = 100, offset = 0 } = options;

    let notifications = Array.from(this.notifications.values());

    if (userType) {
      notifications = notifications.filter(n => n.userType === userType);
    }

    if (status) {
      notifications = notifications.filter(n => n.status === status);
    }

    if (priority) {
      notifications = notifications.filter(n => n.priority === priority);
    }

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return notifications.slice(offset, offset + limit);
  }
}

export default NotificationService; 