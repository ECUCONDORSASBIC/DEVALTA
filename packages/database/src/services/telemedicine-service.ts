import { PrismaClient, TelemedicineSession, ChatMessage, TelemedicineStatus, SenderType } from '@prisma/client';

export interface TelemedicineSessionWithRelations extends TelemedicineSession {
  patient: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string | null;
  };
  doctor: {
    id: string;
    nombres: string;
    apellidos: string;
    especialidad: string;
  };
  chatMessages: ChatMessage[];
}

export interface CreateTelemedicineSessionData {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  roomId?: string;
}

export interface UpdateTelemedicineSessionData {
  status?: TelemedicineStatus;
  startedAt?: Date;
  endedAt?: Date;
  notes?: string;
  recordingUrl?: string;
}

export interface CreateChatMessageData {
  sessionId: string;
  senderId: string;
  senderType: SenderType;
  message: string;
}

export interface TelemedicineStatsFilter {
  userId?: string;
  userType?: 'patient' | 'doctor';
  startDate?: Date;
  endDate?: Date;
}

export interface TelemedicineStats {
  total: number;
  scheduled: number;
  waiting: number;
  active: number;
  completed: number;
  cancelled: number;
  totalDuration: number;
  averageDuration: number;
}

export class TelemedicineService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear nueva sesión de telemedicina
   */
  async createSession(data: CreateTelemedicineSessionData): Promise<TelemedicineSession> {
    const roomId = data.roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return await this.prisma.telemedicineSession.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        scheduledAt: data.scheduledAt,
        roomId,
        status: TelemedicineStatus.SCHEDULED,
      },
    });
  }

  /**
   * Obtener sesión por ID con relaciones
   */
  async getSessionById(sessionId: string): Promise<TelemedicineSessionWithRelations | null> {
    return await this.prisma.telemedicineSession.findUnique({
      where: { id: sessionId },
      include: {
        patient: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    }) as TelemedicineSessionWithRelations | null;
  }

  /**
   * Obtener sesión por roomId
   */
  async getSessionByRoomId(roomId: string): Promise<TelemedicineSessionWithRelations | null> {
    return await this.prisma.telemedicineSession.findUnique({
      where: { roomId },
      include: {
        patient: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    }) as TelemedicineSessionWithRelations | null;
  }

  /**
   * Obtener sesiones por usuario (paciente o doctor)
   */
  async getSessionsByUser(
    userId: string, 
    userType: 'patient' | 'doctor',
    limit = 10,
    offset = 0
  ): Promise<TelemedicineSessionWithRelations[]> {
    const whereClause = userType === 'patient' 
      ? { patientId: userId }
      : { doctorId: userId };

    return await this.prisma.telemedicineSession.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      skip: offset,
    }) as TelemedicineSessionWithRelations[];
  }

  /**
   * Actualizar sesión
   */
  async updateSession(sessionId: string, data: UpdateTelemedicineSessionData): Promise<TelemedicineSession> {
    // Calcular duración si se está completando la sesión
    if (data.status === 'COMPLETED' && data.endedAt && !data.duration) {
      const session = await this.prisma.telemedicineSession.findUnique({
        where: { id: sessionId },
        select: { startedAt: true },
      });

      if (session?.startedAt) {
        data.duration = data.endedAt.getTime() - session.startedAt.getTime();
      }
    }

    return await this.prisma.telemedicineSession.update({
      where: { id: sessionId },
      data,
    });
  }

  /**
   * Iniciar sesión (cambiar estado a ACTIVE)
   */
  async startSession(sessionId: string): Promise<TelemedicineSession> {
    return await this.updateSession(sessionId, {
      status: 'ACTIVE',
      startedAt: new Date(),
    });
  }

  /**
   * Finalizar sesión
   */
  async endSession(sessionId: string, notes?: string, recordingUrl?: string): Promise<TelemedicineSession> {
    return await this.updateSession(sessionId, {
      status: 'COMPLETED',
      endedAt: new Date(),
      notes,
      recordingUrl,
    });
  }

  /**
   * Cancelar sesión
   */
  async cancelSession(sessionId: string, reason?: string): Promise<TelemedicineSession> {
    const cancelNotes = reason ? `Cancelled: ${reason}` : 'Session cancelled';
    
    return await this.updateSession(sessionId, {
      status: 'CANCELLED',
      notes: cancelNotes,
    });
  }

  /**
   * Agregar mensaje de chat
   */
  async addChatMessage(data: CreateChatMessageData): Promise<ChatMessage> {
    return await this.prisma.chatMessage.create({
      data,
    });
  }

  /**
   * Obtener historial de chat
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Obtener estadísticas de telemedicina
   */
  async getTelemedicineStats(filter: TelemedicineStatsFilter = {}): Promise<TelemedicineStats> {
    let whereClause: any = {};

    // Filtrar por usuario
    if (filter.userId && filter.userType) {
      if (filter.userType === 'patient') {
        whereClause.patientId = filter.userId;
      } else {
        whereClause.doctorId = filter.userId;
      }
    }

    // Filtrar por fechas
    if (filter.startDate && filter.endDate) {
      whereClause.scheduledAt = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    // Obtener conteos por estado
    const [total, scheduled, waiting, active, completed, cancelled, durationStats] = await Promise.all([
      this.prisma.telemedicineSession.count({ where: whereClause }),
      this.prisma.telemedicineSession.count({ 
        where: { ...whereClause, status: TelemedicineStatus.SCHEDULED }
      }),
      this.prisma.telemedicineSession.count({ 
        where: { ...whereClause, status: TelemedicineStatus.WAITING }
      }),
      this.prisma.telemedicineSession.count({ 
        where: { ...whereClause, status: TelemedicineStatus.ACTIVE }
      }),
      this.prisma.telemedicineSession.count({ 
        where: { ...whereClause, status: TelemedicineStatus.COMPLETED }
      }),
      this.prisma.telemedicineSession.count({ 
        where: { ...whereClause, status: TelemedicineStatus.CANCELLED }
      }),
      this.prisma.telemedicineSession.aggregate({
        where: { 
          ...whereClause, 
          status: TelemedicineStatus.COMPLETED,
          duration: { not: null }
        },
        _sum: { duration: true },
        _avg: { duration: true },
      }),
    ]);

    return {
      total,
      scheduled,
      waiting,
      active,
      completed,
      cancelled,
      totalDuration: durationStats._sum.duration || 0,
      averageDuration: durationStats._avg.duration || 0,
    };
  }

  /**
   * Verificar disponibilidad por roomId
   */
  async checkRoomAvailability(roomId: string): Promise<{
    exists: boolean;
    session?: TelemedicineSession;
    available: boolean;
  }> {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { roomId },
    });

    if (!session) {
      return { exists: false, available: false };
    }

    const available = session.status === TelemedicineStatus.SCHEDULED || 
                     session.status === TelemedicineStatus.WAITING;

    return { 
      exists: true, 
      session, 
      available 
    };
  }

  /**
   * Limpiar sesiones antiguas completadas
   */
  async cleanupOldSessions(daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.telemedicineSession.deleteMany({
      where: {
        status: TelemedicineStatus.COMPLETED,
        scheduledAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Obtener sesiones activas
   */
  async getActiveSessions(): Promise<TelemedicineSessionWithRelations[]> {
    return await this.prisma.telemedicineSession.findMany({
      where: { 
        status: { 
          in: [TelemedicineStatus.ACTIVE, TelemedicineStatus.WAITING] 
        } 
      },
      include: {
        patient: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { startedAt: 'asc' },
    }) as TelemedicineSessionWithRelations[];
  }

  /**
   * Buscar sesiones con filtros avanzados
   */
  async searchSessions(filters: {
    status?: TelemedicineStatus[];
    patientName?: string;
    doctorName?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<TelemedicineSessionWithRelations[]> {
    const whereClause: any = {};

    if (filters.status && filters.status.length > 0) {
      whereClause.status = { in: filters.status };
    }

    if (filters.dateFrom && filters.dateTo) {
      whereClause.scheduledAt = {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      };
    }

    if (filters.patientName) {
      whereClause.patient = {
        OR: [
          { nombres: { contains: filters.patientName, mode: 'insensitive' } },
          { apellidos: { contains: filters.patientName, mode: 'insensitive' } },
        ],
      };
    }

    if (filters.doctorName) {
      whereClause.doctor = {
        OR: [
          { nombres: { contains: filters.doctorName, mode: 'insensitive' } },
          { apellidos: { contains: filters.doctorName, mode: 'insensitive' } },
        ],
      };
    }

    return await this.prisma.telemedicineSession.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: filters.limit || 20,
      skip: filters.offset || 0,
    }) as TelemedicineSessionWithRelations[];
  }
}