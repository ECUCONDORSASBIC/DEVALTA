import type { MarketplaceMessage, MessageNotification } from '../types/messaging';

/**
 * Generate notification from message
 */
export const generateNotification = (
  message: MarketplaceMessage,
  recipientId: string,
  recipientType: 'company' | 'doctor'
): MessageNotification => {
  const isToCompany = recipientType === 'company';
  
  let title = '';
  let notificationMessage = '';
  let type: MessageNotification['type'] = 'new_message';

  switch (message.type) {
    case 'text':
      title = `Nuevo mensaje de ${message.senderName}`;
      notificationMessage = message.content.length > 100 
        ? `${message.content.substring(0, 100)}...`
        : message.content;
      type = 'new_message';
      break;

    case 'application':
      title = isToCompany 
        ? `Nueva aplicación de ${message.senderName}`
        : `Aplicación enviada a ${message.receiverName}`;
      notificationMessage = isToCompany
        ? `${message.senderName} ha aplicado a tu oferta de trabajo`
        : `Tu aplicación ha sido enviada exitosamente`;
      type = 'new_application';
      break;

    case 'interview':
      title = `Entrevista programada`;
      notificationMessage = isToCompany
        ? `Entrevista programada con ${message.senderName}`
        : `Entrevista programada con ${message.receiverName}`;
      type = 'interview_scheduled';
      break;

    case 'offer':
      title = `Nueva oferta de trabajo`;
      notificationMessage = `${message.senderName} te ha enviado una oferta de trabajo`;
      type = 'offer_received';
      break;

    case 'file':
      title = `Archivo compartido por ${message.senderName}`;
      notificationMessage = `${message.metadata?.fileName || 'Archivo'} compartido`;
      type = 'new_message';
      break;

    case 'system':
      title = 'Actualización del sistema';
      notificationMessage = message.content;
      type = 'application_update';
      break;

    default:
      title = `Mensaje de ${message.senderName}`;
      notificationMessage = message.content;
      type = 'new_message';
  }

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message: notificationMessage,
    userId: recipientId,
    userType: recipientType,
    conversationId: message.conversationId,
    jobId: message.metadata?.jobId,
    applicationId: message.metadata?.applicationId,
    isRead: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    actionUrl: `/messages/${message.conversationId}`,
    actionText: 'Ver conversación'
  };
};

/**
 * Generate system notification
 */
export const generateSystemNotification = (
  type: MessageNotification['type'],
  title: string,
  message: string,
  userId: string,
  userType: 'company' | 'doctor',
  metadata?: {
    conversationId?: string;
    jobId?: string;
    applicationId?: string;
    actionUrl?: string;
    actionText?: string;
    expiresInHours?: number;
  }
): MessageNotification => {
  const expiresAt = metadata?.expiresInHours 
    ? new Date(Date.now() + metadata.expiresInHours * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours default

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    userId,
    userType,
    conversationId: metadata?.conversationId,
    jobId: metadata?.jobId,
    applicationId: metadata?.applicationId,
    isRead: false,
    createdAt: new Date().toISOString(),
    expiresAt,
    actionUrl: metadata?.actionUrl,
    actionText: metadata?.actionText
  };
};

/**
 * Format notification time
 */
export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  return created.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications: MessageNotification[]): {
  today: MessageNotification[];
  yesterday: MessageNotification[];
  thisWeek: MessageNotification[];
  older: MessageNotification[];
} => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups = {
    today: [] as MessageNotification[],
    yesterday: [] as MessageNotification[],
    thisWeek: [] as MessageNotification[],
    older: [] as MessageNotification[]
  };

  notifications.forEach(notification => {
    const createdDate = new Date(notification.createdAt);
    
    if (createdDate >= today) {
      groups.today.push(notification);
    } else if (createdDate >= yesterday) {
      groups.yesterday.push(notification);
    } else if (createdDate >= weekAgo) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
};

/**
 * Check if notification should be shown as badge
 */
export const shouldShowNotificationBadge = (notification: MessageNotification): boolean => {
  if (notification.isRead) return false;
  
  // Check if expired
  if (notification.expiresAt) {
    const expiryDate = new Date(notification.expiresAt);
    if (expiryDate < new Date()) return false;
  }

  // High priority types should always show badge
  const highPriorityTypes: MessageNotification['type'][] = [
    'offer_received',
    'interview_scheduled',
    'new_application'
  ];

  return highPriorityTypes.includes(notification.type) || 
         (notification.type === 'new_message' && isRecentNotification(notification));
};

/**
 * Check if notification is recent (within last hour)
 */
export const isRecentNotification = (notification: MessageNotification): boolean => {
  const createdDate = new Date(notification.createdAt);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return createdDate >= oneHourAgo;
};

/**
 * Generate notification sound/vibration pattern
 */
export const getNotificationPattern = (type: MessageNotification['type']): {
  sound: 'default' | 'urgent' | 'success' | 'info';
  vibrate?: number[];
} => {
  switch (type) {
    case 'offer_received':
      return { 
        sound: 'success', 
        vibrate: [100, 50, 100, 50, 100] 
      };
    
    case 'interview_scheduled':
      return { 
        sound: 'urgent', 
        vibrate: [200, 100, 200] 
      };
    
    case 'new_application':
      return { 
        sound: 'info', 
        vibrate: [100, 50, 100] 
      };
    
    case 'application_update':
      return { 
        sound: 'info', 
        vibrate: [100] 
      };
    
    case 'new_message':
    default:
      return { 
        sound: 'default', 
        vibrate: [100] 
      };
  }
};

/**
 * Format notification for push notification service
 */
export const formatPushNotification = (notification: MessageNotification): {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
} => {
  const { sound, vibrate } = getNotificationPattern(notification.type);
  
  return {
    title: notification.title,
    body: notification.message,
    icon: getNotificationIcon(notification.type),
    badge: '/icons/badge.png',
    tag: notification.conversationId || notification.applicationId || notification.id,
    data: {
      notificationId: notification.id,
      type: notification.type,
      actionUrl: notification.actionUrl,
      conversationId: notification.conversationId,
      jobId: notification.jobId,
      applicationId: notification.applicationId,
      sound,
      vibrate
    }
  };
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: MessageNotification['type']): string => {
  switch (type) {
    case 'new_message':
      return '/icons/message.png';
    case 'new_application':
      return '/icons/application.png';
    case 'interview_scheduled':
      return '/icons/calendar.png';
    case 'offer_received':
      return '/icons/offer.png';
    case 'application_update':
      return '/icons/update.png';
    default:
      return '/icons/notification.png';
  }
};

/**
 * Calculate notification priority score
 */
export const calculateNotificationPriority = (notification: MessageNotification): number => {
  let priority = 0;

  // Base priority by type
  switch (notification.type) {
    case 'offer_received':
      priority += 100;
      break;
    case 'interview_scheduled':
      priority += 80;
      break;
    case 'new_application':
      priority += 60;
      break;
    case 'application_update':
      priority += 40;
      break;
    case 'new_message':
      priority += 20;
      break;
  }

  // Adjust for recency
  const ageInMinutes = (Date.now() - new Date(notification.createdAt).getTime()) / (1000 * 60);
  if (ageInMinutes < 5) priority += 20;
  else if (ageInMinutes < 30) priority += 10;
  else if (ageInMinutes < 60) priority += 5;

  // Reduce priority if read
  if (notification.isRead) priority *= 0.1;

  return Math.round(priority);
};

/**
 * Filter notifications by criteria
 */
export const filterNotifications = (
  notifications: MessageNotification[],
  criteria: {
    types?: MessageNotification['type'][];
    userType?: 'company' | 'doctor';
    isRead?: boolean;
    isRecent?: boolean;
    hasAction?: boolean;
  }
): MessageNotification[] => {
  return notifications.filter(notification => {
    if (criteria.types && !criteria.types.includes(notification.type)) {
      return false;
    }

    if (criteria.userType && notification.userType !== criteria.userType) {
      return false;
    }

    if (criteria.isRead !== undefined && notification.isRead !== criteria.isRead) {
      return false;
    }

    if (criteria.isRecent !== undefined) {
      const isRecent = isRecentNotification(notification);
      if (isRecent !== criteria.isRecent) return false;
    }

    if (criteria.hasAction !== undefined) {
      const hasAction = Boolean(notification.actionUrl);
      if (hasAction !== criteria.hasAction) return false;
    }

    return true;
  });
};

/**
 * Sort notifications by priority and recency
 */
export const sortNotificationsByPriority = (notifications: MessageNotification[]): MessageNotification[] => {
  return [...notifications].sort((a, b) => {
    const priorityA = calculateNotificationPriority(a);
    const priorityB = calculateNotificationPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // If same priority, sort by creation time (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Generate notification summary text
 */
export const generateNotificationSummary = (notifications: MessageNotification[]): string => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  if (unreadCount === 0) {
    return 'No hay notificaciones nuevas';
  }

  if (unreadCount === 1) {
    return '1 notificación nueva';
  }

  return `${unreadCount} notificaciones nuevas`;
};

/**
 * Check if user should receive notification based on preferences
 */
export const shouldSendNotification = (
  notification: MessageNotification,
  userPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    quietHours?: { start: string; end: string };
    notificationTypes: MessageNotification['type'][];
  }
): {
  email: boolean;
  push: boolean;
  sms: boolean;
} => {
  const now = new Date();
  const result = { email: false, push: false, sms: false };

  // Check if notification type is enabled
  if (!userPreferences.notificationTypes.includes(notification.type)) {
    return result;
  }

  // Check quiet hours
  if (userPreferences.quietHours) {
    const currentHour = now.getHours();
    const startHour = parseInt(userPreferences.quietHours.start.split(':')[0]);
    const endHour = parseInt(userPreferences.quietHours.end.split(':')[0]);
    
    const isQuietTime = startHour <= endHour 
      ? (currentHour >= startHour && currentHour <= endHour)
      : (currentHour >= startHour || currentHour <= endHour);

    // Only urgent notifications during quiet hours
    if (isQuietTime && !['offer_received', 'interview_scheduled'].includes(notification.type)) {
      return result;
    }
  }

  // Apply user preferences
  result.email = userPreferences.emailNotifications;
  result.push = userPreferences.pushNotifications;
  result.sms = userPreferences.smsNotifications && 
              ['offer_received', 'interview_scheduled'].includes(notification.type);

  return result;
};
