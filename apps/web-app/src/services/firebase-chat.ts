'use client'

import { 
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  updateDoc,
  getDocs,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { db, auth } from '../../config/firebase'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: 'patient' | 'doctor' | 'company'
  message: string
  timestamp: Timestamp
  messageType: 'text' | 'image' | 'file' | 'prescription' | 'appointment'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  read: boolean
  edited?: boolean
  editedAt?: Timestamp
  // Campos médicos específicos
  prescriptionData?: {
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
    }>
    notes?: string
  }
  appointmentData?: {
    date: Timestamp
    duration: number
    type: 'consultation' | 'follow-up' | 'emergency'
    notes?: string
  }
}

export interface ChatConversation {
  id: string
  participants: string[] // UIDs de usuarios
  participantDetails: Array<{
    uid: string
    name: string
    role: 'patient' | 'doctor' | 'company'
    photoURL?: string
  }>
  type: 'doctor-patient' | 'doctor-doctor' | 'support'
  title: string
  lastMessage?: string
  lastMessageTimestamp?: Timestamp
  lastMessageSender?: string
  unreadCount: { [uid: string]: number }
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  // Campos médicos
  patientId?: string
  doctorId?: string
  medicalRecordId?: string
  appointmentId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[] // ['cardiology', 'follow-up', 'prescription', etc.]
}

export interface ChatService {
  // Conversaciones
  createConversation: (participants: string[], type: ChatConversation['type'], title: string) => Promise<string>
  getConversations: (userId: string) => Promise<ChatConversation[]>
  subscribeToConversations: (userId: string, callback: (conversations: ChatConversation[]) => void) => () => void
  
  // Mensajes
  sendMessage: (conversationId: string, message: string, messageType?: ChatMessage['messageType']) => Promise<void>
  sendPrescription: (conversationId: string, prescriptionData: ChatMessage['prescriptionData']) => Promise<void>
  sendAppointmentRequest: (conversationId: string, appointmentData: ChatMessage['appointmentData']) => Promise<void>
  getMessages: (conversationId: string) => Promise<ChatMessage[]>
  subscribeToMessages: (conversationId: string, callback: (messages: ChatMessage[]) => void) => () => void
  
  // Estado de lectura
  markMessagesAsRead: (conversationId: string, userId: string) => Promise<void>
  
  // Búsqueda
  searchConversations: (userId: string, searchTerm: string) => Promise<ChatConversation[]>
  searchMessages: (conversationId: string, searchTerm: string) => Promise<ChatMessage[]>
}

class FirebaseChatService implements ChatService {
  private conversationsCollection = 'medical_conversations'
  private messagesCollection = 'medical_messages'

  // Conversaciones
  async createConversation(
    participants: string[], 
    type: ChatConversation['type'], 
    title: string
  ): Promise<string> {
    try {
      const authInstance = auth()
      if (!authInstance?.currentUser) throw new Error('Usuario no autenticado')

      const conversationData: Omit<ChatConversation, 'id'> = {
        participants,
        participantDetails: [], // Se llenará después
        type,
        title,
        unreadCount: participants.reduce((acc, uid) => ({ ...acc, [uid]: 0 }), {}),
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        priority: 'medium',
        tags: []
      }

      const docRef = await addDoc(collection(db, this.conversationsCollection), conversationData)
      return docRef.id
    } catch (error) {
      throw new Error(`Error creando conversación: ${error}`)
    }
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatConversation))
    } catch (error) {
      throw new Error(`Error obteniendo conversaciones: ${error}`)
    }
  }

  subscribeToConversations(
    userId: string, 
    callback: (conversations: ChatConversation[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      )

      return onSnapshot(q, (querySnapshot) => {
        const conversations: ChatConversation[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatConversation))
        callback(conversations)
      })
    } catch (error) {
      console.error('Error suscribiendo a conversaciones:', error)
      return () => {}
    }
  }

  // Mensajes
  async sendMessage(
    conversationId: string, 
    message: string, 
    messageType: ChatMessage['messageType'] = 'text'
  ): Promise<void> {
    try {
      const authInstance = auth()
      if (!authInstance?.currentUser) throw new Error('Usuario no autenticado')

      const user = authInstance.currentUser
      
      // Obtener datos del usuario (esto debería venir del perfil)
      const userProfile = await this.getUserProfile(user.uid)

      const messageData: Omit<ChatMessage, 'id'> = {
        conversationId,
        senderId: user.uid,
        senderName: userProfile?.displayName || user.displayName || 'Usuario',
        senderRole: userProfile?.role || 'patient',
        message,
        messageType,
        timestamp: serverTimestamp(),
        read: false
      }

      // Agregar mensaje
      await addDoc(collection(db, this.messagesCollection), messageData)

      // Actualizar conversación
      await this.updateConversationLastMessage(conversationId, message, user.uid)
    } catch (error) {
      throw new Error(`Error enviando mensaje: ${error}`)
    }
  }

  async sendPrescription(
    conversationId: string, 
    prescriptionData: ChatMessage['prescriptionData']
  ): Promise<void> {
    try {
      const authInstance = auth()
      if (!authInstance?.currentUser) throw new Error('Usuario no autenticado')

      const user = authInstance.currentUser
      const userProfile = await this.getUserProfile(user.uid)

      const messageData: Omit<ChatMessage, 'id'> = {
        conversationId,
        senderId: user.uid,
        senderName: userProfile?.displayName || user.displayName || 'Doctor',
        senderRole: userProfile?.role || 'doctor',
        message: '📋 Nueva prescripción médica',
        messageType: 'prescription',
        timestamp: serverTimestamp(),
        read: false,
        prescriptionData
      }

      await addDoc(collection(db, this.messagesCollection), messageData)
      await this.updateConversationLastMessage(conversationId, 'Nueva prescripción', user.uid)
    } catch (error) {
      throw new Error(`Error enviando prescripción: ${error}`)
    }
  }

  async sendAppointmentRequest(
    conversationId: string, 
    appointmentData: ChatMessage['appointmentData']
  ): Promise<void> {
    try {
      const authInstance = auth()
      if (!authInstance?.currentUser) throw new Error('Usuario no autenticado')

      const user = authInstance.currentUser
      const userProfile = await this.getUserProfile(user.uid)

      const messageData: Omit<ChatMessage, 'id'> = {
        conversationId,
        senderId: user.uid,
        senderName: userProfile?.displayName || user.displayName || 'Usuario',
        senderRole: userProfile?.role || 'patient',
        message: '📅 Solicitud de cita médica',
        messageType: 'appointment',
        timestamp: serverTimestamp(),
        read: false,
        appointmentData
      }

      await addDoc(collection(db, this.messagesCollection), messageData)
      await this.updateConversationLastMessage(conversationId, 'Solicitud de cita', user.uid)
    } catch (error) {
      throw new Error(`Error enviando solicitud de cita: ${error}`)
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
        limit(100) // Limitar para performance
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage))
    } catch (error) {
      throw new Error(`Error obteniendo mensajes: ${error}`)
    }
  }

  subscribeToMessages(
    conversationId: string, 
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
        limit(100)
      )

      return onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatMessage))
        callback(messages)
      })
    } catch (error) {
      console.error('Error suscribiendo a mensajes:', error)
      return () => {}
    }
  }

  // Estado de lectura
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      )

      const querySnapshot = await getDocs(q)
      const batch = db().batch ? db().batch() : null
      
      if (batch) {
        querySnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { read: true })
        })
        await batch.commit()
      } else {
        // Fallback sin batch
        for (const docSnapshot of querySnapshot.docs) {
          await updateDoc(docSnapshot.ref, { read: true })
        }
      }

      // Resetear contador de no leídos en la conversación
      const conversationRef = doc(db, this.conversationsCollection, conversationId)
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      })
    } catch (error) {
      throw new Error(`Error marcando mensajes como leídos: ${error}`)
    }
  }

  // Búsqueda
  async searchConversations(userId: string, searchTerm: string): Promise<ChatConversation[]> {
    try {
      // Firebase no soporta búsqueda de texto completo nativamente
      // Esta es una implementación básica
      const conversations = await this.getConversations(userId)
      return conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      throw new Error(`Error buscando conversaciones: ${error}`)
    }
  }

  async searchMessages(conversationId: string, searchTerm: string): Promise<ChatMessage[]> {
    try {
      const messages = await this.getMessages(conversationId)
      return messages.filter(msg => 
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      throw new Error(`Error buscando mensajes: ${error}`)
    }
  }

  // Métodos privados
  private async updateConversationLastMessage(
    conversationId: string, 
    message: string, 
    senderId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, this.conversationsCollection, conversationId)
      await updateDoc(conversationRef, {
        lastMessage: message,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: senderId,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error actualizando último mensaje:', error)
    }
  }

  private async getUserProfile(uid: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? userSnap.data() : null
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error)
      return null
    }
  }
}

// Instancia singleton
export const firebaseChat = new FirebaseChatService()
export default firebaseChat