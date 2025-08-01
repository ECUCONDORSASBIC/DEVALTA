import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getFirestoreInstance } from '../lib/firebase-admin';
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

interface TelemedicineSession {
  id: string;
  roomId: string;
  patientId: string;
  doctorId: string;
  status: 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  notes?: string;
  recordingUrl?: string;
  chatHistory: ChatMessage[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  message: string;
  timestamp: Date;
}

class TelemedicineController {
  private db: any;
  private webrtcServer: any;
  private sessionsCollection = 'telemedicine_sessions';
  private messagesCollection = 'chat_messages';

  constructor(webrtcServer: any) {
    this.webrtcServer = webrtcServer;
    this.db = getFirestoreInstance();
    
    if (!this.db) {
      console.warn('Firebase not available, falling back to memory storage');
      // Fallback to Map for development
      this.sessions = new Map<string, TelemedicineSession>();
    }
  }

  private sessions?: Map<string, TelemedicineSession>;
  
  // Método auxiliar para verificar si Firebase está disponible
  private isFirebaseAvailable(): boolean {
    return this.db !== null && this.db !== undefined;
  }
  
  // Método auxiliar para obtener información de estado del sistema
  async getSystemStatus(req: Request, res: Response) {
    try {
      const isFirebaseConnected = this.isFirebaseAvailable();
      
      let sessionCount = 0;
      if (isFirebaseConnected && this.db) {
        try {
          const snapshot = await getDocs(collection(this.db, this.sessionsCollection));
          sessionCount = snapshot.size;
        } catch (error) {
          console.warn('Error counting Firebase sessions:', error);
        }
      } else if (this.sessions) {
        sessionCount = this.sessions.size;
      }
      
      res.json({
        status: 'healthy',
        database: {
          firebase: isFirebaseConnected,
          fallback: !isFirebaseConnected
        },
        sessions: {
          total: sessionCount,
          storage: isFirebaseConnected ? 'firestore' : 'memory'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting system status:', error);
      res.status(500).json({
        status: 'error',
        error: 'Failed to get system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Crear nueva sesión de telemedicina
  async createSession(req: Request, res: Response) {
    try {
      const { patientId, doctorId, scheduledAt } = req.body;

      if (!patientId || !doctorId || !scheduledAt) {
        return res.status(400).json({
          error: 'Missing required fields: patientId, doctorId, scheduledAt'
        });
      }

      const sessionId = uuidv4();
      const roomId = uuidv4();

      const sessionData = {
        id: sessionId,
        roomId,
        patientId,
        doctorId,
        status: 'scheduled',
        scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
        chatHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (this.db) {
        // Usar Firebase Firestore
        const docRef = await addDoc(collection(this.db, this.sessionsCollection), sessionData);
        
        // Crear sala en el servidor WebRTC
        if (this.webrtcServer?.createRoom) {
          await this.webrtcServer.createRoom(roomId);
        }

        res.status(201).json({
          sessionId: docRef.id,
          roomId,
          message: 'Telemedicine session created successfully'
        });
      } else {
        // Fallback a Map en memoria para desarrollo
        const session: TelemedicineSession = {
          ...sessionData,
          scheduledAt: new Date(scheduledAt)
        };
        this.sessions?.set(sessionId, session);
        
        if (this.webrtcServer?.createRoom) {
          await this.webrtcServer.createRoom(roomId);
        }

        res.status(201).json({
          sessionId,
          roomId,
          message: 'Telemedicine session created successfully (memory mode)'
        });
      }
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      res.status(500).json({
        error: 'Failed to create telemedicine session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener sesión por ID
  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (this.db) {
        // Usar Firebase Firestore
        const docRef = doc(this.db, this.sessionsCollection, sessionId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const sessionData = docSnap.data();
        // Convertir Timestamp a Date para compatibilidad
        if (sessionData.scheduledAt) {
          sessionData.scheduledAt = sessionData.scheduledAt.toDate();
        }
        if (sessionData.startedAt) {
          sessionData.startedAt = sessionData.startedAt.toDate();
        }
        if (sessionData.endedAt) {
          sessionData.endedAt = sessionData.endedAt.toDate();
        }

        res.json({ id: docSnap.id, ...sessionData });
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        res.json(session);
      }
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        error: 'Failed to get session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener sesiones por usuario
  async getSessionsByUser(req: Request, res: Response) {
    try {
      const { userId, userType } = req.query;
      
      if (this.db) {
        // Usar Firebase Firestore con queries optimizadas
        let q;
        if (userType === 'patient') {
          q = query(
            collection(this.db, this.sessionsCollection),
            where('patientId', '==', userId),
            orderBy('scheduledAt', 'desc'),
            limit(50)
          );
        } else if (userType === 'doctor') {
          q = query(
            collection(this.db, this.sessionsCollection),
            where('doctorId', '==', userId),
            orderBy('scheduledAt', 'desc'),
            limit(50)
          );
        } else {
          return res.status(400).json({
            error: 'userType must be either "patient" or "doctor"'
          });
        }

        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Convertir Timestamps a Dates
          if (data.scheduledAt) data.scheduledAt = data.scheduledAt.toDate();
          if (data.startedAt) data.startedAt = data.startedAt.toDate();
          if (data.endedAt) data.endedAt = data.endedAt.toDate();
          return { id: doc.id, ...data };
        });

        res.json(sessions);
      } else {
        // Fallback a Map en memoria
        const sessions: TelemedicineSession[] = [];
        
        this.sessions?.forEach(session => {
          if (userType === 'patient' && session.patientId === userId) {
            sessions.push(session);
          } else if (userType === 'doctor' && session.doctorId === userId) {
            sessions.push(session);
          }
        });

        // Ordenar por fecha programada (más reciente primero)
        sessions.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

        res.json(sessions);
      }
    } catch (error) {
      console.error('Error getting sessions by user:', error);
      res.status(500).json({
        error: 'Failed to get sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Iniciar sesión
  async startSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (this.db) {
        // Usar Firebase Firestore
        const docRef = doc(this.db, this.sessionsCollection, sessionId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const sessionData = docSnap.data();
        
        if (sessionData.status !== 'scheduled' && sessionData.status !== 'waiting') {
          return res.status(400).json({
            error: 'Session cannot be started in current status',
            currentStatus: sessionData.status
          });
        }

        // Actualizar estado en Firestore
        await updateDoc(docRef, {
          status: 'active',
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Obtener datos actualizados
        const updatedDoc = await getDoc(docRef);
        const updatedData = updatedDoc.data();
        
        res.json({
          message: 'Session started successfully',
          session: { id: updatedDoc.id, ...updatedData }
        });
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        if (session.status !== 'scheduled' && session.status !== 'waiting') {
          return res.status(400).json({
            error: 'Session cannot be started in current status'
          });
        }

        session.status = 'active';
        session.startedAt = new Date();
        this.sessions?.set(sessionId, session);

        res.json({
          message: 'Session started successfully (memory mode)',
          session
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({
        error: 'Failed to start session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Finalizar sesión
  async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { notes, recordingUrl } = req.body;
      
      if (this.db) {
        // Usar Firebase Firestore
        const docRef = doc(this.db, this.sessionsCollection, sessionId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const sessionData = docSnap.data();
        
        if (sessionData.status !== 'active') {
          return res.status(400).json({
            error: 'Session is not active',
            currentStatus: sessionData.status
          });
        }

        const endTime = new Date();
        let duration = 0;
        
        if (sessionData.startedAt) {
          const startTime = sessionData.startedAt.toDate();
          duration = endTime.getTime() - startTime.getTime();
        }

        // Actualizar estado en Firestore
        await updateDoc(docRef, {
          status: 'completed',
          endedAt: Timestamp.fromDate(endTime),
          notes: notes || null,
          recordingUrl: recordingUrl || null,
          duration,
          updatedAt: serverTimestamp()
        });

        // Obtener datos actualizados
        const updatedDoc = await getDoc(docRef);
        const updatedData = updatedDoc.data();
        
        res.json({
          message: 'Session ended successfully',
          session: { id: updatedDoc.id, ...updatedData }
        });
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        if (session.status !== 'active') {
          return res.status(400).json({
            error: 'Session is not active'
          });
        }

        session.status = 'completed';
        session.endedAt = new Date();
        session.notes = notes;
        session.recordingUrl = recordingUrl;

        if (session.startedAt) {
          session.duration = session.endedAt.getTime() - session.startedAt.getTime();
        }

        this.sessions?.set(sessionId, session);

        res.json({
          message: 'Session ended successfully (memory mode)',
          session
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({
        error: 'Failed to end session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cancelar sesión
  async cancelSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;
      
      if (this.db) {
        // Usar Firebase Firestore
        const docRef = doc(this.db, this.sessionsCollection, sessionId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const sessionData = docSnap.data();
        
        if (sessionData.status === 'completed') {
          return res.status(400).json({
            error: 'Cannot cancel completed session'
          });
        }

        // Actualizar estado en Firestore
        await updateDoc(docRef, {
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Session cancelled',
          updatedAt: serverTimestamp()
        });

        // Obtener datos actualizados
        const updatedDoc = await getDoc(docRef);
        const updatedData = updatedDoc.data();
        
        res.json({
          message: 'Session cancelled successfully',
          session: { id: updatedDoc.id, ...updatedData }
        });
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        if (session.status === 'completed') {
          return res.status(400).json({
            error: 'Cannot cancel completed session'
          });
        }

        session.status = 'cancelled';
        session.notes = reason ? `Cancelled: ${reason}` : 'Session cancelled';
        this.sessions?.set(sessionId, session);

        res.json({
          message: 'Session cancelled successfully (memory mode)',
          session
        });
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      res.status(500).json({
        error: 'Failed to cancel session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Agregar mensaje de chat
  async addChatMessage(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { senderId, senderType, message } = req.body;
      
      if (this.db) {
        // Usar Firebase Firestore con subcolección para mensajes
        const sessionRef = doc(this.db, this.sessionsCollection, sessionId);
        const sessionDoc = await getDoc(sessionRef);
        
        if (!sessionDoc.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const chatMessage = {
          senderId,
          senderType,
          message,
          timestamp: serverTimestamp(),
          sessionId
        };

        // Agregar mensaje a subcolección
        const messagesRef = collection(this.db, this.sessionsCollection, sessionId, 'messages');
        const docRef = await addDoc(messagesRef, chatMessage);

        res.json({
          message: 'Chat message added successfully',
          chatMessage: { id: docRef.id, ...chatMessage }
        });
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        const chatMessage: ChatMessage = {
          id: uuidv4(),
          senderId,
          senderType,
          message,
          timestamp: new Date()
        };

        session.chatHistory.push(chatMessage);
        this.sessions?.set(sessionId, session);

        res.json({
          message: 'Chat message added successfully (memory mode)',
          chatMessage
        });
      }
    } catch (error) {
      console.error('Error adding chat message:', error);
      res.status(500).json({
        error: 'Failed to add chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener historial de chat
  async getChatHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (this.db) {
        // Usar Firebase Firestore con subcolección
        const sessionRef = doc(this.db, this.sessionsCollection, sessionId);
        const sessionDoc = await getDoc(sessionRef);
        
        if (!sessionDoc.exists()) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        // Obtener mensajes ordenados por timestamp
        const messagesQuery = query(
          collection(this.db, this.sessionsCollection, sessionId, 'messages'),
          orderBy('timestamp', 'asc')
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        const chatHistory = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          // Convertir Timestamp a Date si existe
          if (data.timestamp) {
            data.timestamp = data.timestamp.toDate();
          }
          return { id: doc.id, ...data };
        });

        res.json(chatHistory);
      } else {
        // Fallback a Map en memoria
        const session = this.sessions?.get(sessionId);
        
        if (!session) {
          return res.status(404).json({
            error: 'Session not found'
          });
        }

        res.json(session.chatHistory || []);
      }
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({
        error: 'Failed to get chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener estadísticas de telemedicina
  async getTelemedicineStats(req: Request, res: Response) {
    try {
      const { userId, userType, startDate, endDate } = req.query;
      
      if (this.db) {
        // Usar Firebase Firestore con queries optimizadas
        let q = collection(this.db, this.sessionsCollection);
        const constraints = [];
        
        // Filtrar por usuario si se especifica
        if (userId && userType) {
          if (userType === 'patient') {
            constraints.push(where('patientId', '==', userId));
          } else if (userType === 'doctor') {
            constraints.push(where('doctorId', '==', userId));
          }
        }
        
        // Filtrar por fecha si se proporciona
        if (startDate) {
          constraints.push(where('scheduledAt', '>=', Timestamp.fromDate(new Date(startDate as string))));
        }
        if (endDate) {
          constraints.push(where('scheduledAt', '<=', Timestamp.fromDate(new Date(endDate as string))));
        }
        
        if (constraints.length > 0) {
          q = query(collection(this.db, this.sessionsCollection), ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map(doc => doc.data());
        
        // Calcular estadísticas
        const stats = {
          total: sessions.length,
          scheduled: sessions.filter(s => s.status === 'scheduled').length,
          waiting: sessions.filter(s => s.status === 'waiting').length,
          active: sessions.filter(s => s.status === 'active').length,
          completed: sessions.filter(s => s.status === 'completed').length,
          cancelled: sessions.filter(s => s.status === 'cancelled').length,
          totalDuration: sessions.reduce((total, session) => 
            total + (session.duration || 0), 0
          ),
          averageDuration: sessions.length > 0 ? 
            sessions.reduce((total, session) => 
              total + (session.duration || 0), 0
            ) / sessions.length : 0,
          completionRate: sessions.length > 0 ? 
            (sessions.filter(s => s.status === 'completed').length / sessions.length) * 100 : 0
        };

        res.json(stats);
      } else {
        // Fallback a Map en memoria
        let sessions: TelemedicineSession[] = [];
        
        this.sessions?.forEach(session => {
          if (userType === 'patient' && session.patientId === userId) {
            sessions.push(session);
          } else if (userType === 'doctor' && session.doctorId === userId) {
            sessions.push(session);
          } else if (!userType) {
            sessions.push(session);
          }
        });

        // Filtrar por fecha si se proporciona
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          sessions = sessions.filter(session => 
            session.scheduledAt >= start && session.scheduledAt <= end
          );
        }

        const stats = {
          total: sessions.length,
          scheduled: sessions.filter(s => s.status === 'scheduled').length,
          active: sessions.filter(s => s.status === 'active').length,
          completed: sessions.filter(s => s.status === 'completed').length,
          cancelled: sessions.filter(s => s.status === 'cancelled').length,
          totalDuration: sessions.reduce((total, session) => 
            total + (session.duration || 0), 0
          ),
          averageDuration: sessions.length > 0 ? 
            sessions.reduce((total, session) => 
              total + (session.duration || 0), 0
            ) / sessions.length : 0
        };

        res.json({ ...stats, mode: 'memory' });
      }
    } catch (error) {
      console.error('Error getting telemedicine stats:', error);
      res.status(500).json({
        error: 'Failed to get telemedicine stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Verificar disponibilidad de sala
  async checkRoomAvailability(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      
      // Verificar si la sala existe en el servidor WebRTC
      const room = this.webrtcServer.rooms.get(roomId);
      
      if (!room) {
        return res.status(404).json({
          error: 'Room not found'
        });
      }

      const availability = {
        roomId,
        exists: true,
        peerCount: room.peers.size,
        maxPeers: 10, // Configurable
        available: room.peers.size < 10
      };

      res.json(availability);
    } catch (error) {
      console.error('Error checking room availability:', error);
      res.status(500).json({
        error: 'Failed to check room availability'
      });
    }
  }

  // Limpiar sesiones antiguas
  async cleanupOldSessions() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      if (this.db) {
        // Usar Firebase Firestore para limpieza
        const q = query(
          collection(this.db, this.sessionsCollection),
          where('scheduledAt', '<', Timestamp.fromDate(thirtyDaysAgo)),
          where('status', '==', 'completed')
        );
        
        const querySnapshot = await getDocs(q);
        const batch = this.db.batch();
        let deleteCount = 0;
        
        querySnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
          deleteCount++;
        });
        
        if (deleteCount > 0) {
          await batch.commit();
        }
        
        console.log(`Cleaned up ${deleteCount} old sessions from Firestore`);
        return deleteCount;
      } else {
        // Fallback a Map en memoria
        const sessionsToDelete: string[] = [];
        
        this.sessions?.forEach((session, sessionId) => {
          if (session.scheduledAt < thirtyDaysAgo && session.status === 'completed') {
            sessionsToDelete.push(sessionId);
          }
        });

        sessionsToDelete.forEach(sessionId => {
          this.sessions?.delete(sessionId);
        });

        console.log(`Cleaned up ${sessionsToDelete.length} old sessions from memory`);
        return sessionsToDelete.length;
      }
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      return 0;
    }
  }
}

export default TelemedicineController; 