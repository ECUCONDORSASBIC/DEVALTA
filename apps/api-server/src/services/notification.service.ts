import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase-admin';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase-admin/firestore';

// Interfaces
export interface Notification {
  id: string;
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
}

export interface GetNotificationsOptions {
  status?: 'unread' | 'read' | 'archived';
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: Record<string, number>;
}

class NotificationService {
  private static db = adminDb;
  private static notificationsCollection = 'notifications';

  // Core CRUD Operations
  static async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const notificationData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        scheduledFor: data.scheduledFor ? Timestamp.fromDate(data.scheduledFor) : null
      };

      const docRef = await addDoc(collection(this.db, this.notificationsCollection), notificationData);
      
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  static async getNotification(notificationId: string): Promise<Notification | null> {
    try {
      const docRef = doc(this.db, this.notificationsCollection, notificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToNotification({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting notification:', error);
      throw new Error('Failed to get notification');
    }
  }

  static async getUserNotifications(
    userId: string, 
    userType: 'patient' | 'doctor' | 'admin',
    options: GetNotificationsOptions = {}
  ): Promise<Notification[]> {
    try {
      let q = query(
        collection(this.db, this.notificationsCollection),
        where('userId', '==', userId),
        where('userType', '==', userType),
        orderBy('createdAt', 'desc')
      );

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToNotification({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  static async markAsRead(notificationId: string): Promise<Notification | null> {
    try {
      const docRef = doc(this.db, this.notificationsCollection, notificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      await updateDoc(docRef, {
        status: 'read',
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToNotification({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  static async markAsArchived(notificationId: string): Promise<Notification | null> {
    try {
      const docRef = doc(this.db, this.notificationsCollection, notificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      await updateDoc(docRef, {
        status: 'archived',
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToNotification({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error('Failed to archive notification');
    }
  }

  static async markAllAsRead(userId: string, userType: 'patient' | 'doctor' | 'admin'): Promise<number> {
    try {
      const q = query(
        collection(this.db, this.notificationsCollection),
        where('userId', '==', userId),
        where('userType', '==', userType),
        where('status', '==', 'unread')
      );

      const querySnapshot = await getDocs(q);
      let count = 0;

      // Update all unread notifications to read
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        await updateDoc(docSnapshot.ref, {
          status: 'read',
          updatedAt: serverTimestamp()
        });
        count++;
      });

      await Promise.all(updatePromises);
      return count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const docRef = doc(this.db, this.notificationsCollection, notificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Statistics
  static async getNotificationStats(userId: string, userType: 'patient' | 'doctor' | 'admin'): Promise<NotificationStats> {
    try {
      const q = query(
        collection(this.db, this.notificationsCollection),
        where('userId', '==', userId),
        where('userType', '==', userType)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => doc.data());

      const stats: NotificationStats = {
        total: notifications.length,
        unread: 0,
        read: 0,
        archived: 0,
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        },
        byType: {}
      };

      notifications.forEach(notification => {
        // Count by status
        if (notification.status === 'unread') stats.unread++;
        else if (notification.status === 'read') stats.read++;
        else if (notification.status === 'archived') stats.archived++;

        // Count by priority
        if (notification.priority && stats.byPriority[notification.priority as keyof typeof stats.byPriority] !== undefined) {
          stats.byPriority[notification.priority as keyof typeof stats.byPriority]++;
        }

        // Count by type
        if (notification.type) {
          stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error('Failed to get notification statistics');
    }
  }

  // Specialized Notification Types
  static async createAppointmentReminder(
    userId: string,
    userType: 'patient' | 'doctor',
    appointmentData: any,
    reminderHours: number = 24
  ): Promise<Notification> {
    const appointmentDate = new Date(appointmentData.appointmentDate);
    const reminderDate = new Date(appointmentDate.getTime() - (reminderHours * 60 * 60 * 1000));

    const title = `Appointment Reminder`;
    const message = userType === 'patient' 
      ? `You have an appointment with Dr. ${appointmentData.doctorName} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}`
      : `You have an appointment with ${appointmentData.patientName} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}`;

    return this.createNotification({
      userId,
      userType,
      type: 'appointment_reminder',
      title,
      message,
      priority: 'high',
      status: 'unread',
      scheduledFor: reminderDate,
      metadata: {
        appointmentId: appointmentData.appointmentId,
        appointmentDate: appointmentData.appointmentDate,
        reminderHours,
        ...appointmentData
      }
    });
  }

  static async createTelemedicineConfirmation(
    userId: string,
    userType: 'patient' | 'doctor',
    telemedicineData: any
  ): Promise<Notification> {
    const title = 'Telemedicine Session Confirmed';
    const message = userType === 'patient'
      ? `Your telemedicine session with Dr. ${telemedicineData.doctorName} is confirmed for ${new Date(telemedicineData.scheduledAt).toLocaleDateString()}`
      : `Your telemedicine session with ${telemedicineData.patientName} is confirmed for ${new Date(telemedicineData.scheduledAt).toLocaleDateString()}`;

    return this.createNotification({
      userId,
      userType,
      type: 'telemedicine_confirmation',
      title,
      message,
      priority: 'medium',
      status: 'unread',
      metadata: {
        sessionId: telemedicineData.sessionId,
        roomId: telemedicineData.roomId,
        joinUrl: telemedicineData.joinUrl,
        ...telemedicineData
      }
    });
  }

  static async createMedicalAlert(
    userId: string,
    userType: 'patient' | 'doctor',
    alertMessage: string,
    alertOptions: any = {}
  ): Promise<Notification> {
    const title = 'Medical Alert';
    const priority = alertOptions.priority || 'urgent';

    return this.createNotification({
      userId,
      userType,
      type: 'medical_alert',
      title,
      message: alertMessage,
      priority,
      status: 'unread',
      metadata: {
        alertType: alertOptions.alertType || 'general',
        relatedRecordId: alertOptions.relatedRecordId,
        actionRequired: alertOptions.actionRequired || true,
        ...alertOptions
      }
    });
  }

  static async createDoctorMessage(
    patientId: string,
    doctorName: string,
    message: string,
    messageOptions: any = {}
  ): Promise<Notification> {
    const title = messageOptions.subject || `Message from Dr. ${doctorName}`;
    const priority = messageOptions.priority || 'medium';

    return this.createNotification({
      userId: patientId,
      userType: 'patient',
      type: 'doctor_message',
      title,
      message,
      priority,
      status: 'unread',
      metadata: {
        doctorName,
        senderId: messageOptions.senderId,
        requiresResponse: messageOptions.requiresResponse || false,
        relatedAppointmentId: messageOptions.relatedAppointmentId,
        ...messageOptions
      }
    });
  }

  // Admin functions
  static async getAllNotifications(filters: any = {}): Promise<Notification[]> {
    try {
      let q = query(
        collection(this.db, this.notificationsCollection),
        orderBy('createdAt', 'desc')
      );

      if (filters.userType) {
        q = query(q, where('userType', '==', filters.userType));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToNotification({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting all notifications:', error);
      throw new Error('Failed to get all notifications');
    }
  }

  static async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        collection(this.db, this.notificationsCollection),
        where('status', 'in', ['read', 'archived']),
        where('createdAt', '<', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);
      let deletedCount = 0;

      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
        deletedCount++;
      });

      await Promise.all(deletePromises);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw new Error('Failed to cleanup old notifications');
    }
  }

  // Helper methods
  private static convertFirestoreToNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.userId,
      userType: data.userType,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      status: data.status,
      metadata: data.metadata,
      scheduledFor: data.scheduledFor?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}

export default NotificationService;