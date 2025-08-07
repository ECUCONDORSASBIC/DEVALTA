import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/room.service.js';
import { FirebaseService } from '../services/firebase.service.js';
import { authenticateSocketToken } from '../middleware/auth.middleware.js';
import { 
  JoinRoomData, 
  LeaveRoomData, 
  SignalingMessage, 
  ChatMessageData,
  ToggleMediaData,
  VitalsUpdateData,
  User
} from '@altamedica/types';
import { v4 as uuidv4 } from 'uuid';

export class SocketController {
  private io: Server;
  private roomService: RoomService;
  private firebaseService: FirebaseService;
  private socketToUser: Map<string, User>;

  constructor(io: Server, roomService: RoomService) {
    this.io = io;
    this.roomService = roomService;
    this.firebaseService = new FirebaseService();
    this.socketToUser = new Map();
  }

  handleConnection(socket: Socket): void {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Autenticación inicial
    socket.on('authenticate', async (token: string) => {
      const user = await authenticateSocketToken(token);
      
      if (!user) {
        socket.emit('auth-error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }

      this.socketToUser.set(socket.id, user);
      socket.emit('authenticated', { user });
      console.log(`✅ Socket ${socket.id} authenticated as ${user.email}`);
    });

    // Unirse a una sala
    socket.on('join-room', async (data: JoinRoomData) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user) {
          socket.emit('error', { 
            code: 'NOT_AUTHENTICATED',
            message: 'Please authenticate first' 
          });
          return;
        }

        // Verificar permisos
        if (data.role !== user.role && user.role !== 'admin') {
          socket.emit('error', { 
            code: 'INVALID_ROLE',
            message: 'Role mismatch' 
          });
          return;
        }

        // Obtener información de conexión
        const connectionInfo = {
          socketId: socket.id,
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'] || 'unknown',
          deviceType: this.detectDeviceType(socket.handshake.headers['user-agent']),
          browser: this.detectBrowser(socket.handshake.headers['user-agent']),
          os: this.detectOS(socket.handshake.headers['user-agent'])
        };

        // Unirse a la sala
        const participant = await this.roomService.joinRoom(
          data.roomId,
          user,
          connectionInfo
        );

        if (!participant) {
          socket.emit('error', { 
            code: 'ROOM_NOT_FOUND',
            message: 'Room does not exist' 
          });
          return;
        }

        // Unirse al room de Socket.IO
        socket.join(data.roomId);
        socket.data.roomId = data.roomId;
        socket.data.userId = user.id;

        // Notificar al usuario que se unió exitosamente
        socket.emit('room-joined', {
          roomId: data.roomId,
          participantId: participant.id,
          participants: await this.roomService.getRoomParticipants(data.roomId)
        });

        // Notificar a otros participantes
        socket.to(data.roomId).emit('participant-joined', {
          participant,
          totalParticipants: (await this.roomService.getRoomParticipants(data.roomId)).length
        });

        // Registrar en Firebase
        await this.firebaseService.logParticipantJoined(data.roomId, {
          userId: user.id,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`,
          connectionInfo
        });

        console.log(`👥 User ${user.email} joined room ${data.roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { 
          code: 'JOIN_ERROR',
          message: 'Failed to join room' 
        });
      }
    });

    // Salir de una sala
    socket.on('leave-room', async (data: LeaveRoomData) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user) {
          return;
        }

        const success = await this.roomService.leaveRoom(data.roomId, user.id);
        
        if (success) {
          socket.leave(data.roomId);
          socket.to(data.roomId).emit('participant-left', {
            userId: user.id,
            remainingParticipants: await this.roomService.getRoomParticipants(data.roomId)
          });

          // Registrar salida en Firebase
          await this.firebaseService.logParticipantLeft(data.roomId, user.id);
        }

        console.log(`👤 User ${user.email} left room ${data.roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // WebRTC Signaling - Optimizado para telemedicina médico-paciente
    socket.on('webrtc-signal', async (data: SignalingMessage) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user) {
          socket.emit('error', { 
            code: 'NOT_AUTHENTICATED',
            message: 'Authentication required' 
          });
          return;
        }

        // Verificar que el usuario está en la sala
        const room = await this.roomService.getRoom(data.sessionId);
        if (!room) {
          socket.emit('error', { 
            code: 'ROOM_NOT_FOUND',
            message: 'Room not found' 
          });
          return;
        }

        // Lógica específica para telemedicina doctor-patient
        if (data.type === 'offer' && user.role === 'doctor') {
          // Solo el doctor puede iniciar la llamada
          socket.to(data.sessionId).emit('webrtc-signal', {
            type: data.type,
            from: user.id,
            to: data.to,
            data: data.data
          });
          
          // Registrar en Firebase
          await this.firebaseService.logWebRTCEvent(data.sessionId, {
            type: 'offer',
            from: user.id,
            to: data.to,
            details: { role: user.role, timestamp: new Date() }
          });
          
          // Log médico
          console.log(`🩺 Doctor ${user.email} initiated call with patient in room ${data.sessionId}`);
          
        } else if (data.type === 'answer' && user.role === 'patient') {
          // Solo el paciente puede responder la llamada del doctor
          socket.to(data.sessionId).emit('webrtc-signal', {
            type: data.type,
            from: user.id,
            to: data.to,
            data: data.data
          });
          
          // Registrar en Firebase
          await this.firebaseService.logWebRTCEvent(data.sessionId, {
            type: 'answer',
            from: user.id,
            to: data.to,
            details: { role: user.role, timestamp: new Date() }
          });
          
          // Log médico
          console.log(`👤 Patient ${user.email} answered doctor's call in room ${data.sessionId}`);
          
        } else if (data.type === 'ice-candidate') {
          // ICE candidates pueden ser de cualquier participante
          socket.to(data.sessionId).emit('webrtc-signal', {
            type: data.type,
            from: user.id,
            to: data.to,
            data: data.data
          });
          
          // Registrar ICE candidates críticos en Firebase
          await this.firebaseService.logWebRTCEvent(data.sessionId, {
            type: 'ice-candidate',
            from: user.id,
            to: data.to,
            details: { role: user.role, candidate: data.data }
          });
          
        } else {
          // Verificar que el flujo de llamada sea correcto
          console.warn(`⚠️ Invalid WebRTC flow: ${user.role} tried to send ${data.type}`);
          socket.emit('error', { 
            code: 'INVALID_WEBRTC_FLOW',
            message: 'Invalid call flow for your role' 
          });
          return;
        }

        console.log(`📡 WebRTC ${data.type} from ${user.role} ${user.id} to ${data.to}`);
      } catch (error) {
        console.error('Error handling WebRTC signal:', error);
        socket.emit('error', { 
          code: 'SIGNAL_ERROR',
          message: 'Failed to relay signal' 
        });
      }
    });

    // Chat messages
    socket.on('chat-message', async (data: ChatMessageData) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user) {
          return;
        }

        const message = {
          id: uuidv4(),
          sessionId: data.roomId,
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          message: data.message,
          timestamp: new Date(),
          type: data.type || 'text',
          fileUrl: data.fileUrl,
          fileName: data.fileName
        };

        // Emitir a todos en la sala (incluido el remitente)
        this.io.to(data.roomId).emit('chat-message', message);

        // Guardar mensaje en Firebase
        await this.firebaseService.saveChatMessage(data.roomId, message);

        console.log(`💬 Chat message in room ${data.roomId} from ${user.email}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    });

    // Toggle media (audio/video)
    socket.on('toggle-media', async (data: ToggleMediaData) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user) {
          return;
        }

        // Notificar a otros participantes
        socket.to(data.sessionId).emit('participant-toggled-media', {
          userId: user.id,
          type: data.type,
          enabled: data.enabled
        });

        console.log(`🎥 User ${user.email} toggled ${data.type}: ${data.enabled}`);
      } catch (error) {
        console.error('Error toggling media:', error);
      }
    });

    // Actualización de signos vitales
    socket.on('vitals-update', async (data: VitalsUpdateData) => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (!user || user.role !== 'patient') {
          return;
        }

        // Emitir solo al doctor en la sesión
        socket.to(data.sessionId).emit('vitals-update', {
          patientId: user.id,
          vitals: data.vitals,
          timestamp: new Date()
        });

        // Guardar signos vitales en Firebase
        await this.firebaseService.updateVitalSigns(data.sessionId, user.id, data.vitals);

        console.log(`❤️ Vitals update from patient ${user.email}`);
      } catch (error) {
        console.error('Error updating vitals:', error);
      }
    });

    // Compartir pantalla
    socket.on('screen-share-started', async (roomId: string) => {
      const user = this.socketToUser.get(socket.id);
      if (user) {
        socket.to(roomId).emit('participant-started-screen-share', {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`
        });
      }
    });

    socket.on('screen-share-stopped', async (roomId: string) => {
      const user = this.socketToUser.get(socket.id);
      if (user) {
        socket.to(roomId).emit('participant-stopped-screen-share', {
          userId: user.id
        });
      }
    });

    // Desconexión
    socket.on('disconnect', async () => {
      try {
        const user = this.socketToUser.get(socket.id);
        
        if (user && socket.data.roomId) {
          await this.roomService.leaveRoom(socket.data.roomId, user.id);
          
          socket.to(socket.data.roomId).emit('participant-disconnected', {
            userId: user.id,
            unexpected: true
          });
        }

        this.socketToUser.delete(socket.id);
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Ping/Pong para mantener conexión viva
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  }

  // Métodos auxiliares para detectar información del dispositivo
  private detectDeviceType(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
    if (!userAgent) return 'desktop';
    
    const ua = userAgent.toLowerCase();
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private detectOS(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }
}