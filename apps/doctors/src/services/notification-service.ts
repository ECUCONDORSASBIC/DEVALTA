/**
 * Servicio de Notificaciones Multi-canal
 * Email, SMS, Push, Alertas en tiempo real
 */

import { 
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

import { firebaseService } from '@altamedica/database';
import { NotificationLog, NotificationPreferences } from '../types/appointments-users';
import { Appointment } from '../types/appointments-users';
import { Patient } from '../types/medical-entities';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'APPOINTMENT_REMINDER' | 'CANCELLATION' | 'CONFIRMATION' | 'MEDICAL_ALERT' | 'SYSTEM_UPDATE';
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
  templates: {
    email?: {
      subject: string;
      body: string;
      isHTML: boolean;
    };
    sms?: {
      message: string;
    };
    push?: {
      title: string;
      body: string;
      icon?: string;
    };
    inApp?: {
      title: string;
      message: string;
      severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    };
  };
  variables: string[]; // Variables que se pueden usar en templates
  isActive: boolean;
  complianceChecks: {
    hipaaCompliant: boolean;
    requiresConsent: boolean;
    retentionDays: number;
  };
}

export interface NotificationRequest {
  recipientId: string;
  recipientType: 'PATIENT' | 'PROFESSIONAL' | 'ADMIN';
  templateId: string;
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
  variables: Record<string, any>;
  scheduledFor?: string; // Para programar notificaciones
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entityId?: string; // ID de cita, paciente, etc. relacionado
  entityType?: string;
}

export interface NotificationDeliveryStatus {
  id: string;
  notificationId: string;
  channel: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED';
  attemptCount: number;
  lastAttempt: string;
  errorMessage?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private templatesCollectionName = 'notification_templates';
  private notificationsCollectionName = 'notifications';
  private deliveryStatusCollectionName = 'notification_delivery_status';

  // Templates predefinidos para el sistema médico
  private defaultTemplates: NotificationTemplate[] = [
    {
      id: 'appointment_reminder_24h',
      name: 'Recordatorio de Cita 24h',
      type: 'APPOINTMENT_REMINDER',
      channels: ['EMAIL', 'SMS'],
      templates: {
        email: {
          subject: 'Recordatorio: Cita médica mañana - {{appointmentDate}}',
          body: `
            <h2>Recordatorio de Cita Médica</h2>
            <p>Estimado/a {{patientName}},</p>
            <p>Le recordamos que tiene una cita médica programada:</p>
            <ul>
              <li><strong>Fecha:</strong> {{appointmentDate}}</li>
              <li><strong>Hora:</strong> {{appointmentTime}}</li>
              <li><strong>Profesional:</strong> Dr/Dra. {{professionalName}}</li>
              <li><strong>Ubicación:</strong> {{facilityAddress}}</li>
              <li><strong>Tipo de consulta:</strong> {{appointmentType}}</li>
            </ul>
            <p><strong>Instrucciones especiales:</strong> {{specialInstructions}}</p>
            <p>Si necesita reprogramar o cancelar, contacte con nosotros al menos 2 horas antes.</p>
            <p>¡Esperamos verle pronto!</p>
          `,
          isHTML: true
        },
        sms: {
          message: 'Recordatorio: Cita médica mañana {{appointmentDate}} a las {{appointmentTime}} con Dr/Dra. {{professionalName}}. {{facilityName}}'
        },
        push: {
          title: 'Cita médica mañana',
          body: '{{appointmentTime}} con Dr/Dra. {{professionalName}}',
          icon: 'medical-appointment'
        }
      },
      variables: ['patientName', 'appointmentDate', 'appointmentTime', 'professionalName', 'facilityName', 'facilityAddress', 'appointmentType', 'specialInstructions'],
      isActive: true,
      complianceChecks: {
        hipaaCompliant: true,
        requiresConsent: true,
        retentionDays: 365
      }
    },
    {
      id: 'appointment_cancelled',
      name: 'Cita Cancelada',
      type: 'CANCELLATION',
      channels: ['EMAIL', 'SMS', 'PUSH'],
      templates: {
        email: {
          subject: 'Cita Cancelada - {{appointmentDate}}',
          body: `
            <h2>Cita Médica Cancelada</h2>
            <p>Estimado/a {{patientName}},</p>
            <p>Lamentamos informarle que su cita médica ha sido cancelada:</p>
            <ul>
              <li><strong>Fecha original:</strong> {{appointmentDate}}</li>
              <li><strong>Hora original:</strong> {{appointmentTime}}</li>
              <li><strong>Profesional:</strong> Dr/Dra. {{professionalName}}</li>
              <li><strong>Motivo:</strong> {{cancellationReason}}</li>
            </ul>
            <p>Por favor, contacte con nosotros para reprogramar su cita.</p>
            <p>Disculpe las molestias.</p>
          `,
          isHTML: true
        },
        sms: {
          message: 'Su cita del {{appointmentDate}} a las {{appointmentTime}} ha sido cancelada. Motivo: {{cancellationReason}}. Contacte para reprogramar.'
        },
        push: {
          title: 'Cita Cancelada',
          body: 'Su cita del {{appointmentDate}} ha sido cancelada',
          icon: 'cancel'
        }
      },
      variables: ['patientName', 'appointmentDate', 'appointmentTime', 'professionalName', 'cancellationReason'],
      isActive: true,
      complianceChecks: {
        hipaaCompliant: true,
        requiresConsent: true,
        retentionDays: 365
      }
    },
    {
      id: 'critical_medical_alert',
      name: 'Alerta Médica Crítica',
      type: 'MEDICAL_ALERT',
      channels: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
      templates: {
        email: {
          subject: 'ALERTA MÉDICA CRÍTICA - {{patientName}}',
          body: `
            <h1 style="color: red;">⚠️ ALERTA MÉDICA CRÍTICA</h1>
            <p><strong>Paciente:</strong> {{patientName}}</p>
            <p><strong>ID:</strong> {{patientId}}</p>
            <p><strong>Alerta:</strong> {{alertMessage}}</p>
            <p><strong>Gravedad:</strong> {{severity}}</p>
            <p><strong>Ubicación:</strong> {{location}}</p>
            <p><strong>Hora:</strong> {{timestamp}}</p>
            <p style="color: red;"><strong>ACCIÓN REQUERIDA INMEDIATAMENTE</strong></p>
          `,
          isHTML: true
        },
        sms: {
          message: 'ALERTA CRÍTICA: {{patientName}} - {{alertMessage}}. Ubicación: {{location}}. ACCIÓN INMEDIATA REQUERIDA.'
        },
        push: {
          title: '🚨 ALERTA MÉDICA CRÍTICA',
          body: '{{patientName}} - {{alertMessage}}',
          icon: 'emergency'
        },
        inApp: {
          title: 'Alerta Médica Crítica',
          message: '{{patientName}} - {{alertMessage}} en {{location}}',
          severity: 'ERROR'
        }
      },
      variables: ['patientName', 'patientId', 'alertMessage', 'severity', 'location', 'timestamp'],
      isActive: true,
      complianceChecks: {
        hipaaCompliant: true,
        requiresConsent: false, // Emergencias no requieren consentimiento
        retentionDays: 2555 // 7 años
      }
    }
  ];

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Inicializar templates por defecto
   */
  private async initializeDefaultTemplates(): Promise<void> {
    try {
      const db = firebaseService.firestore;
      
      for (const template of this.defaultTemplates) {
        // Verificar si ya existe
        const existingQuery = query(
          collection(db, this.templatesCollectionName),
          where('id', '==', template.id)
        );
        
        const existingDocs = await getDocs(existingQuery);
        
        if (existingDocs.empty) {
          await addDoc(collection(db, this.templatesCollectionName), template);
          console.log(`Template ${template.id} inicializado`);
        }
      }
    } catch (error) {
      console.error('Error inicializando templates:', error);
    }
  }

  /**
   * Enviar notificación
   */
  async sendNotification(request: NotificationRequest): Promise<string> {
    try {
      const currentUser = firebaseService.authentication.currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      // Obtener template
      const template = await this.getTemplate(request.templateId);
      if (!template) throw new Error('Template de notificación no encontrado');

      // Obtener datos del destinatario
      const recipient = await this.getRecipientData(request.recipientId, request.recipientType);
      if (!recipient) throw new Error('Destinatario no encontrado');

      // Verificar consentimiento si es requerido
      if (template.complianceChecks.requiresConsent) {
        await this.verifyNotificationConsent(recipient, request.channels);
      }

      // Crear notificación en base de datos
      const notification = {
        templateId: request.templateId,
        recipientId: request.recipientId,
        recipientType: request.recipientType,
        channels: request.channels,
        variables: request.variables,
        priority: request.priority,
        entityId: request.entityId,
        entityType: request.entityType,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        scheduledFor: request.scheduledFor || new Date().toISOString(),
        deliveryAttempts: 0,
        maxAttempts: this.getMaxAttemptsByPriority(request.priority)
      };

      const db = firebaseService.firestore;
      const docRef = await addDoc(collection(db, this.notificationsCollectionName), notification);

      // Procesar envío inmediato o programado
      if (!request.scheduledFor || new Date(request.scheduledFor) <= new Date()) {
        await this.processNotificationDelivery(docRef.id, template, recipient, request);
      } else {
        console.log(`Notificación ${docRef.id} programada para ${request.scheduledFor}`);
      }

      return docRef.id;

    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio de cita
   */
  async sendAppointmentReminder(appointmentId: string, hoursBeforeAppointment: number = 24): Promise<void> {
    try {
      // Obtener datos de la cita
      const appointment = await this.getAppointmentData(appointmentId);
      if (!appointment) throw new Error('Cita no encontrada');

      // Obtener datos del paciente
      const patient = await this.getPatientData(appointment.patientId);
      if (!patient) throw new Error('Paciente no encontrado');

      // Obtener datos del profesional
      const professional = await this.getProfessionalData(appointment.professionalId);
      if (!professional) throw new Error('Profesional no encontrado');

      // Preparar variables para el template
      const variables = {
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        appointmentDate: this.formatDate(appointment.scheduling.scheduledDateTime),
        appointmentTime: this.formatTime(appointment.scheduling.scheduledDateTime),
        professionalName: `${professional.personalInfo.firstName} ${professional.personalInfo.lastName}`,
        facilityName: appointment.facilityName || 'Centro Médico',
        facilityAddress: appointment.facilityAddress || 'Dirección disponible en recepción',
        appointmentType: appointment.clinicalInfo.appointmentType,
        specialInstructions: appointment.clinicalInfo.preparationInstructions?.join(', ') || 'Ninguna'
      };

      // Determinar template según las horas de antelación
      const templateId = hoursBeforeAppointment <= 2 ? 'appointment_reminder_2h' : 'appointment_reminder_24h';

      // Obtener preferencias de notificación del paciente
      const channels = this.getPatientNotificationChannels(patient);

      // Enviar notificación
      await this.sendNotification({
        recipientId: patient.id,
        recipientType: 'PATIENT',
        templateId,
        channels,
        variables,
        priority: hoursBeforeAppointment <= 2 ? 'HIGH' : 'MEDIUM',
        entityId: appointmentId,
        entityType: 'APPOINTMENT'
      });

      console.log(`Recordatorio enviado para cita ${appointmentId}`);

    } catch (error) {
      console.error('Error enviando recordatorio de cita:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación de cancelación
   */
  async sendCancellationNotification(appointmentId: string): Promise<void> {
    try {
      const appointment = await this.getAppointmentData(appointmentId);
      if (!appointment) return;

      const patient = await this.getPatientData(appointment.patientId);
      if (!patient) return;

      const professional = await this.getProfessionalData(appointment.professionalId);
      if (!professional) return;

      const variables = {
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        appointmentDate: this.formatDate(appointment.scheduling.scheduledDateTime),
        appointmentTime: this.formatTime(appointment.scheduling.scheduledDateTime),
        professionalName: `${professional.personalInfo.firstName} ${professional.personalInfo.lastName}`,
        cancellationReason: appointment.auditInfo.cancellationReason || 'Motivo no especificado'
      };

      const channels = this.getPatientNotificationChannels(patient);

      await this.sendNotification({
        recipientId: patient.id,
        recipientType: 'PATIENT',
        templateId: 'appointment_cancelled',
        channels,
        variables,
        priority: 'HIGH',
        entityId: appointmentId,
        entityType: 'APPOINTMENT'
      });

    } catch (error) {
      console.error('Error enviando notificación de cancelación:', error);
    }
  }

  /**
   * Enviar notificación de confirmación
   */
  async sendConfirmationNotification(appointmentId: string): Promise<void> {
    // Similar a sendCancellationNotification pero con template de confirmación
    console.log(`Enviando confirmación para cita ${appointmentId}`);
  }

  /**
   * Enviar notificación de reprogramación
   */
  async sendRescheduleNotification(appointmentId: string, newDateTime: string): Promise<void> {
    // Similar a sendCancellationNotification pero con nueva fecha/hora
    console.log(`Enviando notificación de reprogramación para cita ${appointmentId}`);
  }

  /**
   * Enviar alerta médica crítica
   */
  async sendCriticalMedicalAlert(
    patientId: string,
    alertMessage: string,
    severity: 'HIGH' | 'CRITICAL',
    location: string,
    recipientIds: string[]
  ): Promise<void> {
    try {
      const patient = await this.getPatientData(patientId);
      if (!patient) throw new Error('Paciente no encontrado');

      const variables = {
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        patientId: patient.id,
        alertMessage,
        severity,
        location,
        timestamp: new Date().toLocaleString()
      };

      // Enviar a todos los profesionales especificados
      for (const recipientId of recipientIds) {
        await this.sendNotification({
          recipientId,
          recipientType: 'PROFESSIONAL',
          templateId: 'critical_medical_alert',
          channels: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
          variables,
          priority: 'CRITICAL',
          entityId: patientId,
          entityType: 'PATIENT'
        });
      }

      console.log(`Alerta crítica enviada para paciente ${patientId}`);

    } catch (error) {
      console.error('Error enviando alerta crítica:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de notificaciones
   */
  async getNotificationHistory(
    recipientId: string,
    limit: number = 50
  ): Promise<NotificationLog[]> {
    try {
      const db = firebaseService.firestore;
      const q = query(
        collection(db, this.notificationsCollectionName),
        where('recipientId', '==', recipientId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const notifications: NotificationLog[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const notification = docSnapshot.data();
        
        // Obtener estado de entrega
        const deliveryStatus = await this.getDeliveryStatus(docSnapshot.id);
        
        notifications.push({
          id: docSnapshot.id,
          timestamp: notification.createdAt,
          channel: notification.channels[0], // Canal principal
          recipient: recipientId,
          message: await this.renderNotificationPreview(notification),
          delivered: deliveryStatus.some(s => s.status === 'DELIVERED'),
          opened: deliveryStatus.some(s => s.status === 'OPENED'),
          clickedThrough: deliveryStatus.some(s => s.status === 'CLICKED'),
          errorMessage: deliveryStatus.find(s => s.status === 'FAILED')?.errorMessage
        });
      }

      return notifications;

    } catch (error) {
      console.error('Error obteniendo historial de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string, channel: string): Promise<void> {
    try {
      const db = firebaseService.firestore;
      
      // Buscar estado de entrega correspondiente
      const q = query(
        collection(db, this.deliveryStatusCollectionName),
        where('notificationId', '==', notificationId),
        where('channel', '==', channel)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const statusDoc = querySnapshot.docs[0];
        await updateDoc(statusDoc.ref, {
          status: 'OPENED',
          openedAt: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  }

  // Métodos auxiliares privados

  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    const db = firebaseService.firestore;
    const q = query(
      collection(db, this.templatesCollectionName),
      where('id', '==', templateId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as NotificationTemplate;
  }

  private async getRecipientData(recipientId: string, recipientType: string): Promise<any> {
    // Obtener datos del destinatario desde la colección correspondiente
    const db = firebaseService.firestore;
    let collectionName = '';

    switch (recipientType) {
      case 'PATIENT':
        collectionName = 'patients';
        break;
      case 'PROFESSIONAL':
      case 'ADMIN':
        collectionName = 'users';
        break;
      default:
        throw new Error('Tipo de destinatario inválido');
    }

    const docRef = doc(db, collectionName, recipientId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  private async verifyNotificationConsent(recipient: any, channels: string[]): Promise<void> {
    // Verificar consentimiento para cada canal
    const preferences = recipient.preferences?.notifications || {};

    for (const channel of channels) {
      const channelConsent = preferences[channel.toLowerCase()];
      if (channelConsent === false) {
        throw new Error(`El destinatario no ha dado consentimiento para ${channel}`);
      }
    }
  }

  private getMaxAttemptsByPriority(priority: string): number {
    const maxAttempts = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 5
    };

    return maxAttempts[priority as keyof typeof maxAttempts] || 1;
  }

  private async processNotificationDelivery(
    notificationId: string,
    template: NotificationTemplate,
    recipient: any,
    request: NotificationRequest
  ): Promise<void> {
    // Procesar entrega por cada canal
    for (const channel of request.channels) {
      try {
        await this.deliverToChannel(notificationId, channel, template, recipient, request);
      } catch (error) {
        console.error(`Error enviando por ${channel}:`, error);
        await this.recordDeliveryFailure(notificationId, channel, error.message);
      }
    }
  }

  private async deliverToChannel(
    notificationId: string,
    channel: string,
    template: NotificationTemplate,
    recipient: any,
    request: NotificationRequest
  ): Promise<void> {
    const renderedContent = this.renderTemplate(template, channel, request.variables);

    switch (channel) {
      case 'EMAIL':
        await this.sendEmail(recipient.personalInfo?.email, renderedContent);
        break;
      case 'SMS':
        await this.sendSMS(recipient.personalInfo?.phoneNumber, renderedContent);
        break;
      case 'PUSH':
        await this.sendPushNotification(recipient.id, renderedContent);
        break;
      case 'IN_APP':
        await this.sendInAppNotification(recipient.id, renderedContent);
        break;
    }

    await this.recordDeliverySuccess(notificationId, channel);
  }

  private renderTemplate(template: NotificationTemplate, channel: string, variables: Record<string, any>): any {
    const channelTemplate = template.templates[channel.toLowerCase() as keyof typeof template.templates];
    if (!channelTemplate) throw new Error(`Template no disponible para canal ${channel}`);

    // Reemplazar variables en el template
    const rendered = JSON.parse(JSON.stringify(channelTemplate));
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      
      if (rendered.subject) rendered.subject = rendered.subject.replace(placeholder, value);
      if (rendered.body) rendered.body = rendered.body.replace(placeholder, value);
      if (rendered.message) rendered.message = rendered.message.replace(placeholder, value);
      if (rendered.title) rendered.title = rendered.title.replace(placeholder, value);
    }

    return rendered;
  }

  private async sendEmail(email: string, content: any): Promise<void> {
    // Implementar envío de email usando servicio externo (SendGrid, AWS SES, etc.)
    console.log(`Enviando email a ${email}:`, content.subject);
  }

  private async sendSMS(phone: string, content: any): Promise<void> {
    // Implementar envío de SMS usando servicio externo (Twilio, AWS SNS, etc.)
    console.log(`Enviando SMS a ${phone}:`, content.message);
  }

  private async sendPushNotification(userId: string, content: any): Promise<void> {
    // Implementar push notification usando Firebase Cloud Messaging
    console.log(`Enviando push a ${userId}:`, content.title);
  }

  private async sendInAppNotification(userId: string, content: any): Promise<void> {
    // Crear notificación in-app en Firestore
    const db = firebaseService.firestore;
    await addDoc(collection(db, 'in_app_notifications'), {
      userId,
      title: content.title,
      message: content.message,
      severity: content.severity,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  private async recordDeliverySuccess(notificationId: string, channel: string): Promise<void> {
    const db = firebaseService.firestore;
    await addDoc(collection(db, this.deliveryStatusCollectionName), {
      notificationId,
      channel,
      status: 'SENT',
      attemptCount: 1,
      lastAttempt: new Date().toISOString()
    });
  }

  private async recordDeliveryFailure(notificationId: string, channel: string, error: string): Promise<void> {
    const db = firebaseService.firestore;
    await addDoc(collection(db, this.deliveryStatusCollectionName), {
      notificationId,
      channel,
      status: 'FAILED',
      attemptCount: 1,
      lastAttempt: new Date().toISOString(),
      errorMessage: error
    });
  }

  private async getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus[]> {
    const db = firebaseService.firestore;
    const q = query(
      collection(db, this.deliveryStatusCollectionName),
      where('notificationId', '==', notificationId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDeliveryStatus));
  }

  private async renderNotificationPreview(notification: any): Promise<string> {
    // Renderizar vista previa del contenido de la notificación
    return `Notificación ${notification.templateId} enviada`;
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getPatientNotificationChannels(patient: any): ('EMAIL' | 'SMS' | 'PUSH')[] {
    const channels: ('EMAIL' | 'SMS' | 'PUSH')[] = [];
    const preferences = patient.preferences?.notifications || {};

    if (preferences.email?.appointmentReminders !== false) channels.push('EMAIL');
    if (preferences.sms?.appointmentReminders !== false) channels.push('SMS');
    if (preferences.push?.appointmentUpdates !== false) channels.push('PUSH');

    return channels.length > 0 ? channels : ['EMAIL']; // Email por defecto
  }

  private async getAppointmentData(appointmentId: string): Promise<Appointment | null> {
    // Obtener datos de la cita
    const db = firebaseService.firestore;
    const docRef = doc(db, 'appointments', appointmentId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Appointment : null;
  }

  private async getPatientData(patientId: string): Promise<Patient | null> {
    // Obtener datos del paciente
    const db = firebaseService.firestore;
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Patient : null;
  }

  private async getProfessionalData(professionalId: string): Promise<any> {
    // Obtener datos del profesional
    const db = firebaseService.firestore;
    const docRef = doc(db, 'users', professionalId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
