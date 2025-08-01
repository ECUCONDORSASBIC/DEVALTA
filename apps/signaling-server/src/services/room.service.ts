import { v4 as uuidv4 } from 'uuid';
import { Room, Participant, User, TelemedicineSession } from '../types/index.js';
import { createClient } from 'redis';
import { serverConfig } from '../config/server.config.js';

export class RoomService {
  private rooms: Map<string, Room>;
  private redisClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.rooms = new Map();
    this.initRedis();
  }

  private async initRedis() {
    try {
      this.redisClient = createClient({
        url: serverConfig.redis.url
      });
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('✅ Redis connected for room management');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      // Continue sin Redis en desarrollo
    }
  }

  async createRoom(sessionId: string, appointmentId: string): Promise<Room> {
    const roomId = `room-${appointmentId}-${uuidv4()}`;
    
    const room: Room = {
      id: roomId,
      sessionId,
      participants: new Map(),
      createdAt: new Date(),
      status: 'active',
      recordingEnabled: false
    };

    this.rooms.set(roomId, room);
    
    // Guardar en Redis si está disponible
    if (this.redisClient) {
      await this.redisClient.set(
        `${serverConfig.redis.keyPrefix}room:${roomId}`,
        JSON.stringify({
          ...room,
          participants: [] // Redis no puede almacenar Map directamente
        }),
        {
          EX: 3600 * 4 // 4 horas de expiración
        }
      );
    }

    console.log(`🏥 Room created: ${roomId}`);
    return room;
  }

  async joinRoom(
    roomId: string, 
    user: User, 
    connectionInfo: any
  ): Promise<Participant | null> {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      console.error(`Room not found: ${roomId}`);
      return null;
    }

    // Verificar si el usuario ya está en la sala
    const existingParticipant = Array.from(room.participants.values())
      .find(p => p.userId === user.id);
    
    if (existingParticipant) {
      // Actualizar conexión existente
      existingParticipant.status = 'connected';
      existingParticipant.connectionInfo = connectionInfo;
      return existingParticipant;
    }

    const participant: Participant = {
      id: uuidv4(),
      userId: user.id,
      role: user.role as 'patient' | 'doctor',
      name: `${user.firstName} ${user.lastName}`,
      status: 'connected',
      joinedAt: new Date(),
      connectionInfo
    };

    room.participants.set(participant.id, participant);
    
    // Actualizar Redis
    if (this.redisClient) {
      await this.updateRoomInRedis(room);
    }

    console.log(`👤 User ${user.id} joined room ${roomId}`);
    return participant;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return false;
    }

    const participant = Array.from(room.participants.values())
      .find(p => p.userId === userId);
    
    if (!participant) {
      return false;
    }

    participant.status = 'disconnected';
    participant.leftAt = new Date();
    
    // Si todos los participantes se han ido, marcar la sala como terminada
    const activeParticipants = Array.from(room.participants.values())
      .filter(p => p.status === 'connected');
    
    if (activeParticipants.length === 0) {
      room.status = 'ended';
      
      // Eliminar de Redis después de un tiempo
      if (this.redisClient) {
        setTimeout(async () => {
          await this.redisClient?.del(`${serverConfig.redis.keyPrefix}room:${roomId}`);
          this.rooms.delete(roomId);
        }, 60000); // 1 minuto
      }
    }

    console.log(`👤 User ${userId} left room ${roomId}`);
    return true;
  }

  async getRoom(roomId: string): Promise<Room | null> {
    let room = this.rooms.get(roomId);
    
    if (!room && this.redisClient) {
      // Intentar recuperar de Redis
      const roomData = await this.redisClient.get(
        `${serverConfig.redis.keyPrefix}room:${roomId}`
      );
      
      if (roomData) {
        const parsedRoom = JSON.parse(roomData);
        room = {
          ...parsedRoom,
          participants: new Map(),
          createdAt: new Date(parsedRoom.createdAt)
        };
        this.rooms.set(roomId, room);
      }
    }
    
    return room || null;
  }

  async getRoomParticipants(roomId: string): Promise<Participant[]> {
    const room = await this.getRoom(roomId);
    
    if (!room) {
      return [];
    }
    
    return Array.from(room.participants.values());
  }

  async updateParticipantStatus(
    roomId: string, 
    userId: string, 
    status: 'waiting' | 'connected' | 'disconnected'
  ): Promise<boolean> {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return false;
    }

    const participant = Array.from(room.participants.values())
      .find(p => p.userId === userId);
    
    if (!participant) {
      return false;
    }

    participant.status = status;
    
    if (this.redisClient) {
      await this.updateRoomInRedis(room);
    }
    
    return true;
  }

  async endRoom(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return false;
    }

    room.status = 'ended';
    
    // Marcar todos los participantes como desconectados
    room.participants.forEach(participant => {
      participant.status = 'disconnected';
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }
    });
    
    if (this.redisClient) {
      await this.updateRoomInRedis(room);
    }
    
    console.log(`🏥 Room ended: ${roomId}`);
    return true;
  }

  async cleanupInactiveRooms(): Promise<void> {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.status === 'ended' || room.createdAt < fourHoursAgo) {
        this.rooms.delete(roomId);
        
        if (this.redisClient) {
          await this.redisClient.del(`${serverConfig.redis.keyPrefix}room:${roomId}`);
        }
        
        console.log(`🗑️ Cleaned up room: ${roomId}`);
      }
    }
  }

  private async updateRoomInRedis(room: Room): Promise<void> {
    if (!this.redisClient) return;
    
    const roomData = {
      ...room,
      participants: Array.from(room.participants.values())
    };
    
    await this.redisClient.set(
      `${serverConfig.redis.keyPrefix}room:${room.id}`,
      JSON.stringify(roomData),
      {
        EX: 3600 * 4 // 4 horas
      }
    );
  }

  // Método para obtener estadísticas
  async getRoomStats(): Promise<{
    totalRooms: number;
    activeRooms: number;
    totalParticipants: number;
  }> {
    const activeRooms = Array.from(this.rooms.values())
      .filter(room => room.status === 'active');
    
    const totalParticipants = activeRooms
      .reduce((sum, room) => sum + room.participants.size, 0);
    
    return {
      totalRooms: this.rooms.size,
      activeRooms: activeRooms.length,
      totalParticipants
    };
  }
}