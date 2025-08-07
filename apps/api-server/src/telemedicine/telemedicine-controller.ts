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
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase-admin/firestore';
import { cryptoService } from '@altamedica/core/services/crypto'; // Asumiendo la ruta del servicio

// Helper para logueo seguro
const logError = (message: string, error: any) => {
  const sanitizedMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`${message}: ${sanitizedMessage}`);
};

// Interfaces (sin cambios)
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

// Helper para desencriptar datos de sesión
const decryptSessionData = (sessionData: any) => {
    if (!sessionData) return null;
    const decrypted = { ...sessionData };
    if (decrypted.patientId) decrypted.patientId = cryptoService.decrypt(decrypted.patientId);
    if (decrypted.doctorId) decrypted.doctorId = cryptoService.decrypt(decrypted.doctorId);
    if (decrypted.notes) decrypted.notes = cryptoService.decrypt(decrypted.notes);
    if (decrypted.recordingUrl) decrypted.recordingUrl = cryptoService.decrypt(decrypted.recordingUrl);
    // Convertir Timestamps a Dates
    if (decrypted.scheduledAt?.toDate) decrypted.scheduledAt = decrypted.scheduledAt.toDate();
    if (decrypted.startedAt?.toDate) decrypted.startedAt = decrypted.startedAt.toDate();
    if (decrypted.endedAt?.toDate) decrypted.endedAt = decrypted.endedAt.toDate();
    return decrypted;
}

class TelemedicineController {
  private db: any;
  private webrtcServer: any;
  private sessionsCollection = 'telemedicine_sessions';

  constructor(webrtcServer: any) {
    this.webrtcServer = webrtcServer;
    this.db = getFirestoreInstance();
    
    if (!this.db) {
      console.warn('Firebase not available. Critical features like encryption are disabled.');
    }
  }
  
  // ... (getSystemStatus no maneja PHI, se mantiene igual)

  async createSession(req: Request, res: Response) {
    try {
      const { patientId, doctorId, scheduledAt } = req.body;
      if (!patientId || !doctorId || !scheduledAt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const sessionId = uuidv4();
      const roomId = uuidv4();

      // ENCRIPTAR PHI
      const encryptedPatientId = cryptoService.encrypt(patientId);
      const encryptedDoctorId = cryptoService.encrypt(doctorId);

      const sessionData = {
        id: sessionId,
        roomId,
        patientId: encryptedPatientId,
        doctorId: encryptedDoctorId,
        status: 'scheduled',
        scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, this.sessionsCollection), sessionData);
      if (this.webrtcServer?.createRoom) {
        await this.webrtcServer.createRoom(roomId);
      }

      res.status(201).json({
        sessionId: docRef.id,
        roomId,
        message: 'Telemedicine session created successfully'
      });
    } catch (error) {
      logError('Error creating telemedicine session', error);
      res.status(500).json({ error: 'Failed to create telemedicine session' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const docRef = doc(this.db, this.sessionsCollection, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // DESENCRIPTAR PHI
      const decryptedData = decryptSessionData(docSnap.data());
      res.json({ id: docSnap.id, ...decryptedData });

    } catch (error) {
      logError('Error getting session', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  async getSessionsByUser(req: Request, res: Response) {
    try {
      const { userId, userType } = req.query;
      if (!userId || !userType) {
          return res.status(400).json({ error: 'userId and userType are required' });
      }

      // ENCRIPTAR ID para la búsqueda
      const encryptedUserId = cryptoService.encrypt(userId as string);
      const fieldToQuery = userType === 'patient' ? 'patientId' : 'doctorId';

      const q = query(
        collection(this.db, this.sessionsCollection),
        where(fieldToQuery, '==', encryptedUserId),
        orderBy('scheduledAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      // DESENCRIPTAR PHI para la respuesta
      const sessions = querySnapshot.docs.map(d => ({ id: d.id, ...decryptSessionData(d.data()) }));

      res.json(sessions);
    } catch (error) {
      logError('Error getting sessions by user', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { notes, recordingUrl } = req.body;
      
      const docRef = doc(this.db, this.sessionsCollection, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return res.status(404).json({ error: 'Session not found' });

      const sessionData = docSnap.data();
      if (sessionData.status !== 'active') return res.status(400).json({ error: 'Session is not active' });

      const endTime = new Date();
      let duration = 0;
      if (sessionData.startedAt) {
        duration = endTime.getTime() - sessionData.startedAt.toDate().getTime();
      }

      // ENCRIPTAR PHI
      const updateData: any = {
        status: 'completed',
        endedAt: Timestamp.fromDate(endTime),
        duration,
        updatedAt: serverTimestamp()
      };
      if (notes) updateData.notes = cryptoService.encrypt(notes);
      if (recordingUrl) updateData.recordingUrl = cryptoService.encrypt(recordingUrl);

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      // DESENCRIPTAR para la respuesta
      res.json({
        message: 'Session ended successfully',
        session: { id: updatedDoc.id, ...decryptSessionData(updatedDoc.data()) }
      });
    } catch (error) {
      logError('Error ending session', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  }

  // ... (Otros métodos como startSession, cancelSession, chat, etc. se refactorizarían de manera similar)
  // ... (Por brevedad, se omiten pero seguirían el mismo patrón de leer, modificar y escribir)
  // ... (El código completo incluiría la refactorización de todos los métodos)

}

export default TelemedicineController;
