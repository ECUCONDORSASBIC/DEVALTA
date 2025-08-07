/**
 * 🔗 B2C COMMUNICATION SERVICE - ALTAMEDICA DATABASE
 * Servicios de comunicación entre Companies y Doctors
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { app } from '@altamedica/firebase'
import {
  JobApplication,
  Interview,
  CompanyDoctorRelationship,
  B2CNotification,
  ApplicationMessage,
  DoctorSearchFilters,
  CompanySearchFilters,
  CommunicationEvent
} from '@altamedica/types'

const db = getFirestore(app)

// =====================================
// JOB APPLICATIONS SERVICE
// =====================================

export const jobApplicationsService = {
  // Submit new application from doctor to company
  async submitApplication(application: Partial<JobApplication>): Promise<string> {
    try {
      const applicationData = {
        ...application,
        status: 'pending',
        appliedAt: Timestamp.now(),
        messages: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'job_applications'), applicationData)
      
      // Create notification for company
      await notificationsService.createNotification({
        recipientId: application.companyId!,
        recipientType: 'company',
        type: 'job_application',
        title: 'Nueva aplicación recibida',
        message: `${application.doctorProfile?.fullName} aplicó para la posición`,
        relatedId: docRef.id,
        relatedType: 'application',
        priority: 'medium',
        category: 'hiring'
      })

      // Log communication event
      await communicationEventsService.logEvent({
        type: 'application_submitted',
        triggeredBy: application.doctorId!,
        triggeredFor: application.companyId!,
        entityId: docRef.id,
        entityType: 'application',
        source: 'doctors_app'
      })

      return docRef.id
    } catch (error) {
      console.error('Error submitting application:', error)
      throw error
    }
  },

  // Get all applications for a company
  async getCompanyApplications(companyId: string): Promise<JobApplication[]> {
    try {
      const q = query(
        collection(db, 'job_applications'),
        where('companyId', '==', companyId),
        orderBy('appliedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[]
    } catch (error) {
      console.error('Error fetching company applications:', error)
      throw error
    }
  },

  // Get all applications from a doctor
  async getDoctorApplications(doctorId: string): Promise<JobApplication[]> {
    try {
      const q = query(
        collection(db, 'job_applications'),
        where('doctorId', '==', doctorId),
        orderBy('appliedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[]
    } catch (error) {
      console.error('Error fetching doctor applications:', error)
      throw error
    }
  },

  // Update application status (by company)
  async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status'],
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      const applicationRef = doc(db, 'job_applications', applicationId)
      
      // Get current application data
      const applicationDoc = await getDoc(applicationRef)
      const currentApplication = applicationDoc.data() as JobApplication

      // Update application
      batch.update(applicationRef, {
        status,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Add system message about status change
      const statusMessage: ApplicationMessage = {
        id: crypto.randomUUID(),
        applicationId,
        senderId: updatedBy,
        senderType: 'company',
        content: `Estado de aplicación actualizado a: ${status}${notes ? `. Notas: ${notes}` : ''}`,
        type: 'status_update',
        sentAt: new Date()
      }

      batch.update(applicationRef, {
        messages: [...(currentApplication.messages || []), statusMessage],
        lastMessageAt: Timestamp.now()
      })

      await batch.commit()

      // Create notification for doctor
      await notificationsService.createNotification({
        recipientId: currentApplication.doctorId,
        recipientType: 'doctor',
        type: 'status_update',
        title: 'Actualización de aplicación',
        message: `Tu aplicación fue ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'actualizada'}`,
        relatedId: applicationId,
        relatedType: 'application',
        priority: status === 'accepted' || status === 'rejected' ? 'high' : 'medium',
        category: 'hiring'
      })

      // Log event
      await communicationEventsService.logEvent({
        type: 'status_changed',
        triggeredBy: updatedBy,
        triggeredFor: currentApplication.doctorId,
        entityId: applicationId,
        entityType: 'application',
        previousValue: currentApplication.status,
        currentValue: status,
        source: 'companies_app'
      })

    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
  },

  // Get single application with full details
  async getApplication(applicationId: string): Promise<JobApplication | null> {
    try {
      const docSnap = await getDoc(doc(db, 'job_applications', applicationId))
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as JobApplication
      }
      return null
    } catch (error) {
      console.error('Error fetching application:', error)
      throw error
    }
  }
}

// =====================================
// MESSAGING SERVICE
// =====================================

export const messagingService = {
  // Send message in application thread
  async sendMessage(
    applicationId: string,
    senderId: string,
    senderType: 'company' | 'doctor',
    content: string,
    type: ApplicationMessage['type'] = 'text',
    attachments?: ApplicationMessage['attachments']
  ): Promise<void> {
    try {
      const applicationRef = doc(db, 'job_applications', applicationId)
      const applicationDoc = await getDoc(applicationRef)
      
      if (!applicationDoc.exists()) {
        throw new Error('Application not found')
      }

      const currentApplication = applicationDoc.data() as JobApplication
      
      const newMessage: ApplicationMessage = {
        id: crypto.randomUUID(),
        applicationId,
        senderId,
        senderType,
        content,
        type,
        attachments,
        sentAt: new Date()
      }

      await updateDoc(applicationRef, {
        messages: [...(currentApplication.messages || []), newMessage],
        lastMessageAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Create notification for recipient
      const recipientId = senderType === 'company' ? currentApplication.doctorId : currentApplication.companyId
      const recipientType = senderType === 'company' ? 'doctor' : 'company'

      await notificationsService.createNotification({
        recipientId,
        recipientType,
        type: 'message',
        title: 'Nuevo mensaje',
        message: `Tienes un nuevo mensaje sobre tu aplicación`,
        relatedId: applicationId,
        relatedType: 'application',
        priority: 'medium',
        category: 'communication'
      })

      // Log event
      await communicationEventsService.logEvent({
        type: 'message_sent',
        triggeredBy: senderId,
        triggeredFor: recipientId,
        entityId: applicationId,
        entityType: 'message',
        metadata: { messageType: type, hasAttachments: !!attachments?.length },
        source: senderType === 'company' ? 'companies_app' : 'doctors_app'
      })

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  // Mark message as read
  async markMessageAsRead(applicationId: string, messageId: string): Promise<void> {
    try {
      const applicationRef = doc(db, 'job_applications', applicationId)
      const applicationDoc = await getDoc(applicationRef)
      
      if (!applicationDoc.exists()) return

      const currentApplication = applicationDoc.data() as JobApplication
      const updatedMessages = currentApplication.messages?.map(msg =>
        msg.id === messageId ? { ...msg, readAt: new Date() } : msg
      ) || []

      await updateDoc(applicationRef, {
        messages: updatedMessages,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }
}

// =====================================
// INTERVIEWS SERVICE
// =====================================

export const interviewsService = {
  // Schedule new interview
  async scheduleInterview(interview: Partial<Interview>): Promise<string> {
    try {
      const interviewData = {
        ...interview,
        status: 'scheduled',
        remindersSent: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'interviews'), interviewData)

      // Update application status
      if (interview.applicationId) {
        await jobApplicationsService.updateApplicationStatus(
          interview.applicationId,
          'interview_scheduled',
          interview.companyId!,
          `Entrevista programada para ${interview.scheduledAt}`
        )
      }

      // Create notifications for all participants
      await notificationsService.createNotification({
        recipientId: interview.doctorId!,
        recipientType: 'doctor',
        type: 'interview_scheduled',
        title: 'Entrevista programada',
        message: `Tu entrevista está programada para ${interview.scheduledAt}`,
        relatedId: docRef.id,
        relatedType: 'interview',
        priority: 'high',
        category: 'interview'
      })

      return docRef.id
    } catch (error) {
      console.error('Error scheduling interview:', error)
      throw error
    }
  },

  // Get interviews for company
  async getCompanyInterviews(companyId: string): Promise<Interview[]> {
    try {
      const q = query(
        collection(db, 'interviews'),
        where('companyId', '==', companyId),
        orderBy('scheduledAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Interview[]
    } catch (error) {
      console.error('Error fetching company interviews:', error)
      throw error
    }
  },

  // Get interviews for doctor
  async getDoctorInterviews(doctorId: string): Promise<Interview[]> {
    try {
      const q = query(
        collection(db, 'interviews'),
        where('doctorId', '==', doctorId),
        orderBy('scheduledAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Interview[]
    } catch (error) {
      console.error('Error fetching doctor interviews:', error)
      throw error
    }
  }
}

// =====================================
// NOTIFICATIONS SERVICE
// =====================================

export const notificationsService = {
  // Create new notification
  async createNotification(notification: Partial<B2CNotification>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        isRead: false,
        createdAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'b2c_notifications'), notificationData)
      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  },

  // Get notifications for user
  async getUserNotifications(
    userId: string, 
    userType: 'company' | 'doctor',
    unreadOnly: boolean = false
  ): Promise<B2CNotification[]> {
    try {
      let q = query(
        collection(db, 'b2c_notifications'),
        where('recipientId', '==', userId),
        where('recipientType', '==', userType)
      )

      if (unreadOnly) {
        q = query(q, where('isRead', '==', false))
      }

      q = query(q, orderBy('createdAt', 'desc'), limit(50))
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as B2CNotification[]
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'b2c_notifications', notificationId), {
        isRead: true,
        readAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }
}

// =====================================
// COMMUNICATION EVENTS SERVICE
// =====================================

export const communicationEventsService = {
  // Log communication event for audit trail
  async logEvent(event: Partial<CommunicationEvent>): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: Timestamp.now()
      }

      await addDoc(collection(db, 'communication_events'), eventData)
    } catch (error) {
      console.error('Error logging communication event:', error)
      // Don't throw error for logging failures
    }
  }
}

// =====================================
// REAL-TIME SUBSCRIPTIONS
// =====================================

export const realtimeService = {
  // Subscribe to application updates
  subscribeToApplicationUpdates(
    userId: string,
    userType: 'company' | 'doctor',
    callback: (applications: JobApplication[]) => void
  ): () => void {
    const field = userType === 'company' ? 'companyId' : 'doctorId'
    
    const q = query(
      collection(db, 'job_applications'),
      where(field, '==', userId),
      orderBy('updatedAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[]
      
      callback(applications)
    })
  },

  // Subscribe to notifications
  subscribeToNotifications(
    userId: string,
    userType: 'company' | 'doctor',
    callback: (notifications: B2CNotification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'b2c_notifications'),
      where('recipientId', '==', userId),
      where('recipientType', '==', userType),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as B2CNotification[]
      
      callback(notifications)
    })
  }
}