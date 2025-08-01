// Sistema de notificaciones para Altamedica
// Soporte para push notifications, email, SMS y notificaciones en tiempo real

interface NotificationData {
  type: string;
  title: string;
  message: string;
  recipients: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  channels?: ('push' | 'email' | 'sms' | 'websocket')[];
  scheduledAt?: string;
  expiresAt?: string;
}

interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  deliveryStatus?: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
    websocket?: boolean;
  };
}

// Configuración del sistema de notificaciones
const notificationConfig = {
  push: {
    enabled: true,
    vapidKey: process.env.VAPID_PUBLIC_KEY || 'mock-vapid-key',
    fcmServerKey: process.env.FCM_SERVER_KEY || 'mock-fcm-key'
  },
  email: {
    enabled: true,
    provider: 'sendgrid', // sendgrid, ses, nodemailer
    from: 'noreply@altamedica.com'
  },
  sms: {
    enabled: true,
    provider: 'twilio', // twilio, aws-sns
    from: '+1234567890'
  },
  websocket: {
    enabled: true,
    endpoint: process.env.WEBSOCKET_ENDPOINT || 'ws://localhost:3001'
  }
};

// Plantillas de notificaciones médicas
const notificationTemplates = {
  'appointment_created': {
    title: 'Nueva Cita Programada',
    message: 'Su cita con {doctorName} ha sido programada para {appointmentDate}',
    priority: 'medium',
    channels: ['push', 'email']
  },
  'appointment_reminder': {
    title: 'Recordatorio de Cita',
    message: 'Su cita con {doctorName} es en {timeUntil}',
    priority: 'high',
    channels: ['push', 'sms']
  },
  'prescription_ready': {
    title: 'Receta Lista',
    message: 'Su prescripción de {medicationName} está lista para recoger',
    priority: 'medium',
    channels: ['push', 'email']
  },
  'lab_results_available': {
    title: 'Resultados de Laboratorio',
    message: 'Sus resultados de {testName} están disponibles',
    priority: 'high',
    channels: ['push', 'email', 'websocket']
  },
  'telemedicine_session_starting': {
    title: 'Sesión de Telemedicina',
    message: 'Su consulta virtual con {doctorName} comenzará en {timeUntil}',
    priority: 'critical',
    channels: ['push', 'sms', 'websocket']
  },
  'emergency_alert': {
    title: 'Alerta de Emergencia',
    message: 'Se requiere atención médica inmediata: {reason}',
    priority: 'critical',
    channels: ['push', 'sms', 'email', 'websocket']
  },
  'medication_reminder': {
    title: 'Recordatorio de Medicación',
    message: 'Es hora de tomar {medicationName} - {dosage}',
    priority: 'high',
    channels: ['push']
  },
  'application_status_updated': {
    title: 'Estado de Solicitud Actualizado',
    message: 'Su solicitud "{applicationTitle}" ha sido {status}',
    priority: 'medium',
    channels: ['push', 'email']
  }
};

// Función principal para enviar notificaciones
export async function sendNotification(notificationData: NotificationData): Promise<NotificationResult> {
  try {
    const notificationId = generateNotificationId();
    
    // Obtener plantilla si existe
    const template = notificationTemplates[notificationData.type];
    
    // Combinar datos de plantilla con datos personalizados
    const finalNotification = {
      ...notificationData,
      title: template?.title || notificationData.title,
      message: interpolateTemplate(template?.message || notificationData.message, notificationData.data),
      priority: notificationData.priority || template?.priority || 'medium',
      channels: notificationData.channels || template?.channels || ['push']
    };

    // Validar destinatarios
    if (!finalNotification.recipients || finalNotification.recipients.length === 0) {
      return {
        success: false,
        error: 'No recipients specified'
      };
    }

    // Registrar notificación en base de datos
    await saveNotificationToDatabase(notificationId, finalNotification);

    // Enviar por cada canal configurado
    const deliveryStatus = {};
    const deliveryPromises = [];

    for (const channel of finalNotification.channels) {
      switch (channel) {
        case 'push':
          if (notificationConfig.push.enabled) {
            deliveryPromises.push(sendPushNotification(finalNotification));
          }
          break;
        case 'email':
          if (notificationConfig.email.enabled) {
            deliveryPromises.push(sendEmailNotification(finalNotification));
          }
          break;
        case 'sms':
          if (notificationConfig.sms.enabled) {
            deliveryPromises.push(sendSmsNotification(finalNotification));
          }
          break;
        case 'websocket':
          if (notificationConfig.websocket.enabled) {
            deliveryPromises.push(sendWebSocketNotification(finalNotification));
          }
          break;
      }
    }

    // Esperar resultados de entrega
    const results = await Promise.allSettled(deliveryPromises);
    
    // Procesar resultados
    results.forEach((result, index) => {
      const channel = finalNotification.channels[index];
      deliveryStatus[channel] = result.status === 'fulfilled';
    });

    // Actualizar estado en base de datos
    await updateNotificationStatus(notificationId, deliveryStatus);

    return {
      success: true,
      notificationId,
      deliveryStatus
    };

  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Función para enviar notificaciones push
async function sendPushNotification(notification: NotificationData): Promise<boolean> {
  try {
    console.log(`[PUSH] Enviando a ${notification.recipients.length} destinatarios:`, notification.title);
    
    // En producción: usar Firebase Cloud Messaging o similar
    for (const recipient of notification.recipients) {
      const pushPayload = {
        to: recipient,
        notification: {
          title: notification.title,
          body: notification.message,
          icon: '/icons/altamedica-192.png',
          badge: '/icons/altamedica-badge.png',
          tag: notification.type,
          requireInteraction: notification.priority === 'critical',
          data: notification.data
        }
      };
      
      // Simular envío FCM
      console.log(`[FCM] Push enviado a ${recipient}:`, pushPayload.notification.title);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Función para enviar notificaciones por email
async function sendEmailNotification(notification: NotificationData): Promise<boolean> {
  try {
    console.log(`[EMAIL] Enviando a ${notification.recipients.length} destinatarios:`, notification.title);
    
    // En producción: usar SendGrid, AWS SES, etc.
    for (const recipient of notification.recipients) {
      const emailData = {
        to: recipient,
        from: notificationConfig.email.from,
        subject: notification.title,
        html: generateEmailTemplate(notification),
        text: notification.message
      };
      
      // Simular envío de email
      console.log(`[SENDGRID] Email enviado a ${recipient}:`, emailData.subject);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Función para enviar notificaciones SMS
async function sendSmsNotification(notification: NotificationData): Promise<boolean> {
  try {
    console.log(`[SMS] Enviando a ${notification.recipients.length} destinatarios:`, notification.title);
    
    // En producción: usar Twilio, AWS SNS, etc.
    for (const recipient of notification.recipients) {
      const smsData = {
        to: recipient,
        from: notificationConfig.sms.from,
        body: `${notification.title}: ${notification.message}`
      };
      
      // Simular envío SMS
      console.log(`[TWILIO] SMS enviado a ${recipient}:`, smsData.body.substring(0, 50) + '...');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

// Función para enviar notificaciones WebSocket
async function sendWebSocketNotification(notification: NotificationData): Promise<boolean> {
  try {
    console.log(`[WEBSOCKET] Enviando a ${notification.recipients.length} destinatarios:`, notification.title);
    
    // En producción: usar Socket.IO o WebSocket real
    for (const recipient of notification.recipients) {
      const wsPayload = {
        type: 'notification',
        data: {
          id: generateNotificationId(),
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          timestamp: new Date().toISOString(),
          data: notification.data
        }
      };
      
      // Simular envío WebSocket
      console.log(`[WS] Notificación en tiempo real a ${recipient}:`, wsPayload.data.title);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending WebSocket notification:', error);
    return false;
  }
}

// Función para generar template de email
function generateEmailTemplate(notification: NotificationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${notification.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .priority-critical { border-left: 4px solid #dc2626; }
        .priority-high { border-left: 4px solid #ea580c; }
        .priority-medium { border-left: 4px solid #2563eb; }
        .priority-low { border-left: 4px solid #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AltaMedica</h1>
          <p>Sistema de Salud Digital</p>
        </div>
        <div class="content priority-${notification.priority}">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.data?.actionUrl ? `<a href="${notification.data.actionUrl}" class="button">Ver Detalles</a>` : ''}
          <p><small>Recibido: ${new Date().toLocaleString('es-ES')}</small></p>
        </div>
        <div class="footer">
          <p>AltaMedica - Sistema de Gestión Médica</p>
          <p>Si no desea recibir estas notificaciones, <a href="#">haga clic aquí</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Función para interpolar plantillas
function interpolateTemplate(template: string, data: any): string {
  if (!data) return template;
  
  let result = template;
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), data[key]);
  });
  
  return result;
}

// Funciones de base de datos (mock)
async function saveNotificationToDatabase(notificationId: string, notification: NotificationData): Promise<void> {
  console.log(`[DB] Guardando notificación ${notificationId}:`, notification.type);
  // En producción: insertar en base de datos
}

async function updateNotificationStatus(notificationId: string, deliveryStatus: any): Promise<void> {
  console.log(`[DB] Actualizando estado de ${notificationId}:`, deliveryStatus);
  // En producción: actualizar en base de datos
}

// Funciones auxiliares
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Función para notificaciones programadas
export async function scheduleNotification(notification: NotificationData, scheduleTime: Date): Promise<NotificationResult> {
  const delay = scheduleTime.getTime() - Date.now();
  
  if (delay <= 0) {
    return await sendNotification(notification);
  }
  
  // En producción: usar sistema de colas como Bull/Agenda
  setTimeout(async () => {
    await sendNotification(notification);
  }, delay);
  
  return {
    success: true,
    notificationId: generateNotificationId()
  };
}

// Función para notificaciones masivas
export async function sendBulkNotifications(notifications: NotificationData[]): Promise<NotificationResult[]> {
  const results = [];
  
  // Enviar en lotes para evitar sobrecarga
  const batchSize = 10;
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(notification => sendNotification(notification))
    );
    
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false, error: 'Batch failed' }
    ));
  }
  
  return results;
}

export default {
  sendNotification,
  scheduleNotification,
  sendBulkNotifications
};
