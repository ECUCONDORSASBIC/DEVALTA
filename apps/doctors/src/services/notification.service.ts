// Servicio de notificaciones para ofertas médicas
interface Notification {
  id: string;
  type: 'job_match' | 'application_update' | 'interview_scheduled' | 'offer_received' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

interface NotificationPreferences {
  jobMatches: boolean;
  applicationUpdates: boolean;
  interviews: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  minMatchScore: number;
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private permission: NotificationPermission = 'default';

  constructor() {
    // Cargar preferencias guardadas
    const savedPrefs = localStorage.getItem('notificationPreferences');
    this.preferences = savedPrefs ? JSON.parse(savedPrefs) : {
      jobMatches: true,
      applicationUpdates: true,
      interviews: true,
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      minMatchScore: 80
    };

    // Cargar notificaciones guardadas
    const savedNotifications = localStorage.getItem('notifications');
    this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

    // Solicitar permisos de notificación del navegador
    this.requestNotificationPermission();
  }

  // Solicitar permiso para notificaciones del navegador
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
    } else if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Agregar nueva notificación
  addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    // Mostrar notificación del navegador si está permitido
    if (this.shouldShowPushNotification(notification.type)) {
      this.showPushNotification(newNotification);
    }

    return newNotification;
  }

  // Verificar si debe mostrar notificación push
  private shouldShowPushNotification(type: Notification['type']): boolean {
    if (!this.preferences.pushNotifications || this.permission !== 'granted') {
      return false;
    }

    switch (type) {
      case 'job_match':
        return this.preferences.jobMatches;
      case 'application_update':
      case 'interview_scheduled':
      case 'offer_received':
        return this.preferences.applicationUpdates;
      default:
        return true;
    }
  }

  // Mostrar notificación del navegador
  private showPushNotification(notification: Notification) {
    if ('Notification' in window && this.permission === 'granted') {
      const pushNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/altamedica-icon.png',
        badge: '/icons/altamedica-badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        data: {
          url: notification.actionUrl
        }
      });

      pushNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        pushNotif.close();
      };
    }
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Marcar todas como leídas
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Eliminar notificación
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Obtener todas las notificaciones
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Obtener conteo de no leídas
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Suscribirse a cambios
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    // Notificar inmediatamente con el estado actual
    listener(this.getNotifications());
  }

  // Desuscribirse
  unsubscribe(listener: (notifications: Notification[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notificar a todos los listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }

  // Guardar notificaciones en localStorage
  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Actualizar preferencias
  updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences };
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  // Obtener preferencias
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Crear notificación de nueva oferta de trabajo
  notifyJobMatch(job: {
    id: string;
    title: string;
    company: string;
    matchScore: number;
    salary?: string;
  }) {
    if (!this.preferences.jobMatches) return;
    if (job.matchScore < this.preferences.minMatchScore) return;

    this.addNotification({
      type: 'job_match',
      title: '¡Nueva oportunidad laboral!',
      message: `${job.title} en ${job.company} (${job.matchScore}% de compatibilidad)`,
      priority: job.matchScore >= 90 ? 'high' : 'medium',
      actionUrl: `/marketplace/listings/${job.id}`,
      actionText: 'Ver oferta',
      data: { jobId: job.id, matchScore: job.matchScore }
    });
  }

  // Crear notificación de actualización de aplicación
  notifyApplicationUpdate(application: {
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
  }) {
    if (!this.preferences.applicationUpdates) return;

    const statusMessages = {
      viewed: 'Tu aplicación ha sido vista',
      interview: '¡Has sido seleccionado para una entrevista!',
      accepted: '¡Felicidades! Tu aplicación ha sido aceptada',
      rejected: 'Tu aplicación no ha sido seleccionada'
    };

    this.addNotification({
      type: 'application_update',
      title: statusMessages[application.status as keyof typeof statusMessages] || 'Actualización de aplicación',
      message: `${application.jobTitle} en ${application.company}`,
      priority: application.status === 'interview' || application.status === 'accepted' ? 'high' : 'medium',
      actionUrl: `/marketplace/applications`,
      actionText: 'Ver aplicaciones',
      data: { jobId: application.jobId, status: application.status }
    });
  }

  // Crear notificación de entrevista programada
  notifyInterviewScheduled(interview: {
    jobId: string;
    jobTitle: string;
    company: string;
    date: string;
    time: string;
    type: 'video' | 'phone' | 'in-person';
  }) {
    if (!this.preferences.interviews) return;

    this.addNotification({
      type: 'interview_scheduled',
      title: 'Entrevista programada',
      message: `${interview.jobTitle} en ${interview.company} - ${new Date(interview.date).toLocaleDateString('es-ES')} a las ${interview.time}`,
      priority: 'high',
      actionUrl: `/marketplace/applications`,
      actionText: 'Ver detalles',
      data: interview
    });
  }

  // Limpiar notificaciones antiguas (más de 30 días)
  cleanOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.notifications = this.notifications.filter(n => 
      new Date(n.createdAt) > thirtyDaysAgo
    );
    this.saveNotifications();
    this.notifyListeners();
  }
}

// Singleton instance
export const notificationService = new NotificationService();