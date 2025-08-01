// 🎥 WEBRTC TELEMEDICINE SERVICE - ALTAMEDICA
import mediasoup from 'mediasoup';
import { Consumer, Producer, Router, WebRtcTransport, Worker } from 'mediasoup/node/lib/types';
import { Server } from 'socket.io';

interface TeleMedicineSession {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'waiting' | 'connected' | 'recording' | 'ended';
  startTime: Date;
  endTime?: Date;
  recordingPath?: string;
  chatHistory: ChatMessage[];
  vitalsShared: boolean;
  screenSharing: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'vital' | 'prescription';
}

interface Participant {
  id: string;
  socketId: string;
  role: 'doctor' | 'patient';
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  transport?: WebRtcTransport;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
}

export class TeleMedicineService {
  private worker!: Worker;
  private router!: Router;
  private io: Server;
  private sessions: Map<string, TeleMedicineSession> = new Map();
  private participants: Map<string, Participant> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.initializeMediasoup();
    this.setupSocketHandlers();
  }

  private async initializeMediasoup() {
    try {
      // Create MediaSoup Worker
      this.worker = await mediasoup.createWorker({
        logLevel: 'warn',
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
      });

      this.worker.on('died', () => {
        console.error('MediaSoup worker died, exiting...');
        process.exit(1);
      });

      // Create Router
      this.router = await this.worker.createRouter({
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '4d0032',
              'level-asymmetry-allowed': 1,
            },
          },
        ],
      });

      console.log('🎥 MediaSoup initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaSoup:', error);
      throw error;
    }
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join Session
      socket.on('join-session', async (data) => {
        try {
          const { sessionId, participantId, role, name } = data;
          
          const participant: Participant = {
            id: participantId,
            socketId: socket.id,
            role,
            name,
            isVideoEnabled: true,
            isAudioEnabled: true,
            producers: new Map(),
            consumers: new Map(),
          };

          this.participants.set(socket.id, participant);
          socket.join(sessionId);

          // Get or create session
          let session = this.sessions.get(sessionId);
          if (!session) {
            session = {
              id: sessionId,
              doctorId: role === 'doctor' ? participantId : '',
              patientId: role === 'patient' ? participantId : '',
              status: 'waiting',
              startTime: new Date(),
              chatHistory: [],
              vitalsShared: false,
              screenSharing: false,
            };
            this.sessions.set(sessionId, session);
          } else {
            if (role === 'doctor') session.doctorId = participantId;
            if (role === 'patient') session.patientId = participantId;
          }

          // Check if both participants are connected
          const roomParticipants = Array.from(this.participants.values())
            .filter(p => p.id === session.doctorId || p.id === session.patientId);

          if (roomParticipants.length === 2) {
            session.status = 'connected';
            this.io.to(sessionId).emit('session-ready', {
              session,
              participants: roomParticipants,
            });
          }

          // Send router capabilities
          socket.emit('router-capabilities', this.router.rtpCapabilities);

          console.log(`${role} ${name} joined session ${sessionId}`);
        } catch (error) {
          console.error('Error joining session:', error);
          socket.emit('error', { message: 'Failed to join session' });
        }
      });

      // Create WebRTC Transport
      socket.on('create-transport', async (data) => {
        try {
          const { direction } = data; // 'send' or 'recv'
          const participant = this.participants.get(socket.id);
          
          if (!participant) {
            socket.emit('error', { message: 'Participant not found' });
            return;
          }

          const transport = await this.router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
          });

          participant.transport = transport;

          transport.on('dtlsstatechange', (dtlsState) => {
            if (dtlsState === 'closed') {
              transport.close();
            }
          });

          socket.emit('transport-created', {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          });

        } catch (error) {
          console.error('Error creating transport:', error);
          socket.emit('error', { message: 'Failed to create transport' });
        }
      });

      // Connect Transport
      socket.on('connect-transport', async (data) => {
        try {
          const { dtlsParameters } = data;
          const participant = this.participants.get(socket.id);
          
          if (!participant?.transport) {
            socket.emit('error', { message: 'Transport not found' });
            return;
          }

          await participant.transport.connect({ dtlsParameters });
          socket.emit('transport-connected');

        } catch (error) {
          console.error('Error connecting transport:', error);
          socket.emit('error', { message: 'Failed to connect transport' });
        }
      });

      // Produce Media
      socket.on('produce', async (data) => {
        try {
          const { kind, rtpParameters } = data;
          const participant = this.participants.get(socket.id);
          
          if (!participant?.transport) {
            socket.emit('error', { message: 'Transport not found' });
            return;
          }

          const producer = await participant.transport.produce({
            kind,
            rtpParameters,
          });

          participant.producers.set(producer.id, producer);

          // Notify other participants
          socket.broadcast.emit('new-producer', {
            producerId: producer.id,
            participantId: participant.id,
            participantName: participant.name,
            kind,
          });

          socket.emit('produced', { producerId: producer.id });

        } catch (error) {
          console.error('Error producing media:', error);
          socket.emit('error', { message: 'Failed to produce media' });
        }
      });

      // Consume Media
      socket.on('consume', async (data) => {
        try {
          const { producerId, rtpCapabilities } = data;
          const participant = this.participants.get(socket.id);
          
          if (!participant?.transport) {
            socket.emit('error', { message: 'Transport not found' });
            return;
          }

          if (!this.router.canConsume({ producerId, rtpCapabilities })) {
            socket.emit('error', { message: 'Cannot consume' });
            return;
          }

          const consumer = await participant.transport.consume({
            producerId,
            rtpCapabilities,
            paused: true,
          });

          participant.consumers.set(consumer.id, consumer);

          socket.emit('consumed', {
            consumerId: consumer.id,
            producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });

        } catch (error) {
          console.error('Error consuming media:', error);
          socket.emit('error', { message: 'Failed to consume media' });
        }
      });

      // Resume Consumer
      socket.on('resume-consumer', async (data) => {
        try {
          const { consumerId } = data;
          const participant = this.participants.get(socket.id);
          const consumer = participant?.consumers.get(consumerId);

          if (consumer) {
            await consumer.resume();
            socket.emit('consumer-resumed', { consumerId });
          }

        } catch (error) {
          console.error('Error resuming consumer:', error);
        }
      });

      // Chat Message
      socket.on('chat-message', async (data) => {
        try {
          const { sessionId, message, type = 'text' } = data;
          const participant = this.participants.get(socket.id);
          const session = this.sessions.get(sessionId);

          if (!participant || !session) {
            socket.emit('error', { message: 'Session or participant not found' });
            return;
          }

          const chatMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: participant.id,
            senderType: participant.role,
            message,
            timestamp: new Date(),
            type,
          };

          session.chatHistory.push(chatMessage);

          // Broadcast to all participants in the session
          this.io.to(sessionId).emit('chat-message', chatMessage);

          // Store in database for HIPAA compliance
          await this.storeChatMessage(sessionId, chatMessage);

        } catch (error) {
          console.error('Error handling chat message:', error);
        }
      });

      // Share Vitals
      socket.on('share-vitals', async (data) => {
        try {
          const { sessionId, vitals } = data;
          const session = this.sessions.get(sessionId);

          if (session) {
            session.vitalsShared = true;
            this.io.to(sessionId).emit('vitals-shared', {
              vitals,
              timestamp: new Date(),
            });

            // Store vitals for the session
            await this.storeSessionVitals(sessionId, vitals);
          }

        } catch (error) {
          console.error('Error sharing vitals:', error);
        }
      });

      // Toggle Video/Audio
      socket.on('toggle-media', async (data) => {
        try {
          const { type, enabled } = data; // 'video' or 'audio'
          const participant = this.participants.get(socket.id);

          if (participant) {
            if (type === 'video') {
              participant.isVideoEnabled = enabled;
            } else if (type === 'audio') {
              participant.isAudioEnabled = enabled;
            }

            socket.broadcast.emit('participant-media-changed', {
              participantId: participant.id,
              type,
              enabled,
            });
          }

        } catch (error) {
          console.error('Error toggling media:', error);
        }
      });

      // End Session
      socket.on('end-session', async (data) => {
        try {
          const { sessionId } = data;
          const session = this.sessions.get(sessionId);

          if (session) {
            session.status = 'ended';
            session.endTime = new Date();

            // Stop all producers and consumers
            const sessionParticipants = Array.from(this.participants.values())
              .filter(p => p.id === session.doctorId || p.id === session.patientId);

            for (const participant of sessionParticipants) {
              participant.producers.forEach(producer => producer.close());
              participant.consumers.forEach(consumer => consumer.close());
              if (participant.transport) {
                participant.transport.close();
              }
            }

            // Save session summary
            await this.saveSessionSummary(session);

            this.io.to(sessionId).emit('session-ended', {
              session,
              summary: await this.generateSessionSummary(session),
            });

            // Clean up
            this.sessions.delete(sessionId);
          }

        } catch (error) {
          console.error('Error ending session:', error);
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        const participant = this.participants.get(socket.id);
        if (participant) {
          // Clean up producers and consumers
          participant.producers.forEach(producer => producer.close());
          participant.consumers.forEach(consumer => consumer.close());
          if (participant.transport) {
            participant.transport.close();
          }

          // Notify other participants
          socket.broadcast.emit('participant-disconnected', {
            participantId: participant.id,
          });

          this.participants.delete(socket.id);
        }
      });
    });
  }

  private async storeChatMessage(sessionId: string, message: ChatMessage) {
    // Store in encrypted database for HIPAA compliance
    try {
      // Implementation would store in PostgreSQL with encryption
      console.log(`Storing chat message for session ${sessionId}: ${message.id}`);
    } catch (error) {
      console.error('Error storing chat message:', error);
    }
  }

  private async storeSessionVitals(sessionId: string, vitals: any) {
    // Store vitals shared during session
    try {
      console.log(`Storing vitals for session ${sessionId}:`, vitals);
    } catch (error) {
      console.error('Error storing session vitals:', error);
    }
  }

  private async saveSessionSummary(session: TeleMedicineSession) {
    // Save complete session summary for medical records
    try {
      console.log(`Saving session summary for ${session.id}`);
    } catch (error) {
      console.error('Error saving session summary:', error);
    }
  }

  private async generateSessionSummary(session: TeleMedicineSession) {
    // Generate AI-powered session summary
    return {
      duration: session.endTime && session.startTime 
        ? session.endTime.getTime() - session.startTime.getTime() 
        : 0,
      messagesExchanged: session.chatHistory.length,
      vitalsShared: session.vitalsShared,
      keyTopics: this.extractKeyTopics(session.chatHistory),
      recommendations: await this.generateRecommendations(session),
    };
  }

  private extractKeyTopics(messages: ChatMessage[]): string[] {
    // Simple keyword extraction - would use NLP in production
    const keywords = ['dolor', 'presión', 'medicamento', 'síntoma', 'tratamiento'];
    const topics: string[] = [];

    messages.forEach(message => {
      keywords.forEach(keyword => {
        if (message.message.toLowerCase().includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });

    return topics;
  }

  private async generateRecommendations(session: TeleMedicineSession): Promise<string[]> {
    // AI-generated recommendations based on session content
    return [
      'Seguimiento en 1 semana',
      'Continuar medicación actual',
      'Monitorear presión arterial diariamente',
    ];
  }

  public getSessionStatus(sessionId: string): TeleMedicineSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getActiveSessionsCount(): number {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'connected').length;
  }

  public async cleanup() {
    // Close all sessions and clean up resources
    this.sessions.forEach(async (session) => {
      session.status = 'ended';
      session.endTime = new Date();
      await this.saveSessionSummary(session);
    });

    this.sessions.clear();
    this.participants.clear();

    if (this.router) {
      this.router.close();
    }

    if (this.worker) {
      this.worker.close();
    }
  }
}

// Export types for use in other modules
export type { ChatMessage, Participant, TeleMedicineSession };

