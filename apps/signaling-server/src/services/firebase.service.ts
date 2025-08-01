import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { serverConfig } from '../config/server.config.js';

/**
 * Firebase Service para Signaling Server
 * Maneja persistencia de eventos de telemedicina en Firestore
 */
export class FirebaseService {
  private db: FirebaseFirestore.Firestore | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      if (getApps().length === 0) {
        // Configuración Firebase desde variables de entorno
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID || 'altamedica-medical',
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'demo-key',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'demo@altamedica.com'
        };

        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }

      this.db = getFirestore();
      this.isInitialized = true;
      console.log('✅ Firebase Admin initialized in Signaling Server');
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed, continuing without persistence:', error);
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Actualizar estado de sesión de telemedicina
   */
  async updateTelemedicineSession(sessionId: string, updateData: any): Promise<void> {
    if (!this.db) return;

    try {
      const sessionRef = this.db.collection('telemedicine_sessions').doc(sessionId);
      
      await sessionRef.update({
        ...updateData,
        updatedAt: Timestamp.now(),
        lastSignalingUpdate: Timestamp.now()
      });

      console.log(`📊 Updated telemedicine session ${sessionId} in Firebase`);
    } catch (error) {
      console.error('Error updating telemedicine session:', error);
    }
  }

  /**
   * Guardar mensaje de chat en Firebase
   */
  async saveChatMessage(sessionId: string, message: any): Promise<void> {
    if (!this.db) return;

    try {
      const messagesRef = this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .collection('messages');

      await messagesRef.add({
        ...message,
        timestamp: Timestamp.fromDate(message.timestamp),
        savedAt: Timestamp.now()
      });

      console.log(`💬 Saved chat message to Firebase for session ${sessionId}`);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  /**
   * Registrar evento de conexión WebRTC
   */
  async logWebRTCEvent(sessionId: string, event: {
    type: 'offer' | 'answer' | 'ice-candidate' | 'connection-established' | 'connection-failed';
    from: string;
    to?: string;
    details?: any;
  }): Promise<void> {
    if (!this.db) return;

    try {
      const eventsRef = this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .collection('webrtc_events');

      await eventsRef.add({
        ...event,
        timestamp: Timestamp.now(),
        sessionId
      });

      console.log(`📡 Logged WebRTC ${event.type} event for session ${sessionId}`);
    } catch (error) {
      console.error('Error logging WebRTC event:', error);
    }
  }

  /**
   * Actualizar signos vitales del paciente
   */
  async updateVitalSigns(sessionId: string, patientId: string, vitals: any): Promise<void> {
    if (!this.db) return;

    try {
      const vitalsRef = this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .collection('vital_signs');

      await vitalsRef.add({
        patientId,
        vitals,
        timestamp: Timestamp.now(),
        sessionId
      });

      // También actualizar en el registro médico del paciente
      const patientVitalsRef = this.db
        .collection('medical_records')
        .doc(patientId)
        .collection('vital_signs');

      await patientVitalsRef.add({
        vitals,
        source: 'telemedicine',
        sessionId,
        timestamp: Timestamp.now()
      });

      console.log(`❤️ Updated vital signs for patient ${patientId} in session ${sessionId}`);
    } catch (error) {
      console.error('Error updating vital signs:', error);
    }
  }

  /**
   * Registrar participante que se une a la sala
   */
  async logParticipantJoined(sessionId: string, participant: {
    userId: string;
    role: string;
    name: string;
    connectionInfo: any;
  }): Promise<void> {
    if (!this.db) return;

    try {
      const participantsRef = this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .collection('participants');

      await participantsRef.doc(participant.userId).set({
        ...participant,
        joinedAt: Timestamp.now(),
        status: 'connected'
      });

      // Actualizar contador de participantes en la sesión principal
      const sessionRef = this.db.collection('telemedicine_sessions').doc(sessionId);
      await sessionRef.update({
        [`participants.${participant.userId}`]: {
          role: participant.role,
          name: participant.name,
          joinedAt: Timestamp.now(),
          status: 'connected'
        },
        lastActivity: Timestamp.now()
      });

      console.log(`👥 Logged participant ${participant.name} joined session ${sessionId}`);
    } catch (error) {
      console.error('Error logging participant joined:', error);
    }
  }

  /**
   * Registrar participante que sale de la sala
   */
  async logParticipantLeft(sessionId: string, userId: string): Promise<void> {
    if (!this.db) return;

    try {
      const participantRef = this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .collection('participants')
        .doc(userId);

      await participantRef.update({
        status: 'disconnected',
        leftAt: Timestamp.now()
      });

      // Actualizar en la sesión principal
      const sessionRef = this.db.collection('telemedicine_sessions').doc(sessionId);
      await sessionRef.update({
        [`participants.${userId}.status`]: 'disconnected',
        [`participants.${userId}.leftAt`]: Timestamp.now(),
        lastActivity: Timestamp.now()
      });

      console.log(`👤 Logged participant ${userId} left session ${sessionId}`);
    } catch (error) {
      console.error('Error logging participant left:', error);
    }
  }

  /**
   * Obtener información de sesión desde Firebase
   */
  async getTelemedicineSession(sessionId: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const sessionDoc = await this.db
        .collection('telemedicine_sessions')
        .doc(sessionId)
        .get();

      if (!sessionDoc.exists) {
        return null;
      }

      return {
        id: sessionDoc.id,
        ...sessionDoc.data()
      };
    } catch (error) {
      console.error('Error getting telemedicine session:', error);
      return null;
    }
  }

  /**
   * Verificar si Firebase está disponible
   */
  isAvailable(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Obtener estadísticas de sesiones activas
   */
  async getActiveSessionsStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalParticipants: number;
  }> {
    if (!this.db) {
      return { totalSessions: 0, activeSessions: 0, totalParticipants: 0 };
    }

    try {
      const activeSessionsQuery = await this.db
        .collection('telemedicine_sessions')
        .where('status', '==', 'active')
        .get();

      const totalSessionsQuery = await this.db
        .collection('telemedicine_sessions')
        .get();

      let totalParticipants = 0;
      activeSessionsQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.participants) {
          totalParticipants += Object.keys(data.participants).length;
        }
      });

      return {
        totalSessions: totalSessionsQuery.size,
        activeSessions: activeSessionsQuery.size,
        totalParticipants
      };
    } catch (error) {
      console.error('Error getting sessions stats:', error);
      return { totalSessions: 0, activeSessions: 0, totalParticipants: 0 };
    }
  }
}