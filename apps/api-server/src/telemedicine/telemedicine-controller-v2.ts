import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Note: TelemedicineService and TelemedicineSessionWithRelations types need to be defined locally or imported from Prisma client
import { TelemedicineStatus, SenderType } from '@prisma/client';
import { z } from 'zod';

// Schemas de validación
const createSessionSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  roomId: z.string().optional()
});

const updateSessionSchema = z.object({
  status: z.nativeEnum(TelemedicineStatus).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  recordingUrl: z.string().url().optional()
});

const chatMessageSchema = z.object({
  senderId: z.string().min(1),
  senderType: z.nativeEnum(SenderType),
  message: z.string().min(1).max(1000)
});

const statsFilterSchema = z.object({
  userId: z.string().optional(),
  userType: z.enum(['patient', 'doctor']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    patientId?: string;
    doctorId?: string;
    status: string;
  };
}

export class TelemedicineControllerV2 {
  private telemedicineService: TelemedicineService;
  private webrtcServer: any;

  constructor(webrtcServer: any) {
    this.telemedicineService = new TelemedicineService(prisma);
    this.webrtcServer = webrtcServer;
  }

  /**
   * Crear nueva sesión de telemedicina
   * POST /api/telemedicine/sessions
   */
  async createSession(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = createSessionSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Datos de entrada inválidos',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      const { patientId, doctorId, scheduledAt, roomId } = validation.data;

      // Verificar autorización: solo admin, el doctor asignado o el paciente pueden crear
      const user = req.user!;
      const canCreate = user.roles.includes('admin') ||
                       user.doctorId === doctorId ||
                       user.patientId === patientId;

      if (!canCreate) {
        return NextResponse.json(
          { error: 'No tienes permisos para crear esta sesión' },
          { status: 403 }
        );
      }

      // Crear sesión en la base de datos
      const session = await this.telemedicineService.createSession({
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        roomId
      });

      // Crear sala en el servidor WebRTC
      try {
        await this.webrtcServer.createRoom(session.roomId);
      } catch (webrtcError) {
        console.error('Error creating WebRTC room:', webrtcError);
        // No fallar la creación de sesión por error de WebRTC
      }

      return NextResponse.json({
        sessionId: session.id,
        roomId: session.roomId,
        message: 'Sesión de telemedicina creada exitosamente',
        session
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al crear la sesión' },
        { status: 500 }
      );
    }
  }

  /**
   * Obtener sesión por ID
   * GET /api/telemedicine/sessions/[id]
   */
  async getSession(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      // Verificar autorización: solo participantes de la sesión o admin
      const user = req.user!;
      const hasAccess = user.roles.includes('admin') ||
                       user.patientId === session.patientId ||
                       user.doctorId === session.doctorId;

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'No tienes permisos para ver esta sesión' },
          { status: 403 }
        );
      }

      return NextResponse.json(session);

    } catch (error) {
      console.error('Error getting session:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al obtener la sesión' },
        { status: 500 }
      );
    }
  }

  /**
   * Obtener sesiones por usuario
   * GET /api/telemedicine/sessions?userId=xxx&userType=patient|doctor
   */
  async getSessionsByUser(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const userType = url.searchParams.get('userType') as 'patient' | 'doctor';
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      if (!userId || !userType) {
        return NextResponse.json(
          { error: 'Parámetros userId y userType son requeridos' },
          { status: 400 }
        );
      }

      // Verificar autorización: solo el propio usuario o admin
      const user = req.user!;
      const canAccess = user.roles.includes('admin') ||
                       user.id === userId ||
                       user.patientId === userId ||
                       user.doctorId === userId;

      if (!canAccess) {
        return NextResponse.json(
          { error: 'No tienes permisos para ver estas sesiones' },
          { status: 403 }
        );
      }

      const sessions = await this.telemedicineService.getSessionsByUser(
        userId,
        userType,
        limit,
        offset
      );

      return NextResponse.json({
        sessions,
        total: sessions.length,
        limit,
        offset
      });

    } catch (error) {
      console.error('Error getting sessions by user:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al obtener las sesiones' },
        { status: 500 }
      );
    }
  }

  /**
   * Iniciar sesión
   * PUT /api/telemedicine/sessions/[id]/start
   */
  async startSession(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      // Verificar que la sesión puede iniciarse
      if (session.status !== TelemedicineStatus.SCHEDULED && 
          session.status !== TelemedicineStatus.WAITING) {
        return NextResponse.json(
          { error: 'La sesión no puede iniciarse en su estado actual' },
          { status: 400 }
        );
      }

      // Verificar autorización: solo el doctor asignado o admin
      const user = req.user!;
      const canStart = user.roles.includes('admin') ||
                      user.doctorId === session.doctorId;

      if (!canStart) {
        return NextResponse.json(
          { error: 'Solo el médico asignado puede iniciar la sesión' },
          { status: 403 }
        );
      }

      const updatedSession = await this.telemedicineService.startSession(sessionId);

      return NextResponse.json({
        message: 'Sesión iniciada exitosamente',
        session: updatedSession
      });

    } catch (error) {
      console.error('Error starting session:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al iniciar la sesión' },
        { status: 500 }
      );
    }
  }

  /**
   * Finalizar sesión
   * PUT /api/telemedicine/sessions/[id]/end
   */
  async endSession(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { notes, recordingUrl } = body;

      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      if (session.status !== TelemedicineStatus.ACTIVE) {
        return NextResponse.json(
          { error: 'La sesión no está activa' },
          { status: 400 }
        );
      }

      // Verificar autorización: solo el doctor asignado o admin
      const user = req.user!;
      const canEnd = user.roles.includes('admin') ||
                    user.doctorId === session.doctorId;

      if (!canEnd) {
        return NextResponse.json(
          { error: 'Solo el médico asignado puede finalizar la sesión' },
          { status: 403 }
        );
      }

      const updatedSession = await this.telemedicineService.endSession(
        sessionId,
        notes,
        recordingUrl
      );

      return NextResponse.json({
        message: 'Sesión finalizada exitosamente',
        session: updatedSession
      });

    } catch (error) {
      console.error('Error ending session:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al finalizar la sesión' },
        { status: 500 }
      );
    }
  }

  /**
   * Cancelar sesión
   * PUT /api/telemedicine/sessions/[id]/cancel
   */
  async cancelSession(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { reason } = body;

      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      if (session.status === TelemedicineStatus.COMPLETED) {
        return NextResponse.json(
          { error: 'No se puede cancelar una sesión completada' },
          { status: 400 }
        );
      }

      // Verificar autorización: participantes de la sesión o admin
      const user = req.user!;
      const canCancel = user.roles.includes('admin') ||
                       user.patientId === session.patientId ||
                       user.doctorId === session.doctorId;

      if (!canCancel) {
        return NextResponse.json(
          { error: 'No tienes permisos para cancelar esta sesión' },
          { status: 403 }
        );
      }

      const updatedSession = await this.telemedicineService.cancelSession(sessionId, reason);

      return NextResponse.json({
        message: 'Sesión cancelada exitosamente',
        session: updatedSession
      });

    } catch (error) {
      console.error('Error cancelling session:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al cancelar la sesión' },
        { status: 500 }
      );
    }
  }

  /**
   * Agregar mensaje de chat
   * POST /api/telemedicine/sessions/[id]/chat
   */
  async addChatMessage(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = chatMessageSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Datos de mensaje inválidos',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      const { senderId, senderType, message } = validation.data;

      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      // Verificar autorización: solo participantes de la sesión activa
      const user = req.user!;
      const isParticipant = user.patientId === session.patientId ||
                           user.doctorId === session.doctorId;

      if (!isParticipant && !user.roles.includes('admin')) {
        return NextResponse.json(
          { error: 'No tienes permisos para enviar mensajes en esta sesión' },
          { status: 403 }
        );
      }

      // Verificar que el senderId corresponde al usuario autenticado
      const isValidSender = (senderType === SenderType.PATIENT && user.patientId === senderId) ||
                           (senderType === SenderType.DOCTOR && user.doctorId === senderId);

      if (!isValidSender && !user.roles.includes('admin')) {
        return NextResponse.json(
          { error: 'No puedes enviar mensajes en nombre de otro usuario' },
          { status: 403 }
        );
      }

      const chatMessage = await this.telemedicineService.addChatMessage({
        sessionId,
        senderId,
        senderType,
        message
      });

      return NextResponse.json({
        message: 'Mensaje enviado exitosamente',
        chatMessage
      }, { status: 201 });

    } catch (error) {
      console.error('Error adding chat message:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al enviar el mensaje' },
        { status: 500 }
      );
    }
  }

  /**
   * Obtener historial de chat
   * GET /api/telemedicine/sessions/[id]/chat
   */
  async getChatHistory(req: AuthenticatedRequest, sessionId: string): Promise<NextResponse> {
    try {
      const session = await this.telemedicineService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      // Verificar autorización: solo participantes de la sesión
      const user = req.user!;
      const hasAccess = user.roles.includes('admin') ||
                       user.patientId === session.patientId ||
                       user.doctorId === session.doctorId;

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'No tienes permisos para ver este chat' },
          { status: 403 }
        );
      }

      const chatHistory = await this.telemedicineService.getChatHistory(sessionId);

      return NextResponse.json(chatHistory);

    } catch (error) {
      console.error('Error getting chat history:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al obtener el historial' },
        { status: 500 }
      );
    }
  }

  /**
   * Obtener estadísticas de telemedicina
   * GET /api/telemedicine/stats
   */
  async getTelemedicineStats(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams = {
        userId: url.searchParams.get('userId'),
        userType: url.searchParams.get('userType') as 'patient' | 'doctor',
        startDate: url.searchParams.get('startDate'),
        endDate: url.searchParams.get('endDate')
      };

      const validation = statsFilterSchema.safeParse(queryParams);

      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Parámetros de filtro inválidos',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      const { userId, userType, startDate, endDate } = validation.data;

      // Verificar autorización para estadísticas
      const user = req.user!;
      if (userId && !user.roles.includes('admin')) {
        const canAccess = user.id === userId ||
                         user.patientId === userId ||
                         user.doctorId === userId;

        if (!canAccess) {
          return NextResponse.json(
            { error: 'No tienes permisos para ver estas estadísticas' },
            { status: 403 }
          );
        }
      }

      const filter = {
        userId: userId || undefined,
        userType: userType || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const stats = await this.telemedicineService.getTelemedicineStats(filter);

      return NextResponse.json(stats);

    } catch (error) {
      console.error('Error getting telemedicine stats:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al obtener estadísticas' },
        { status: 500 }
      );
    }
  }

  /**
   * Verificar disponibilidad de sala
   * GET /api/telemedicine/rooms/[roomId]/availability
   */
  async checkRoomAvailability(req: AuthenticatedRequest, roomId: string): Promise<NextResponse> {
    try {
      const availability = await this.telemedicineService.checkRoomAvailability(roomId);

      if (!availability.exists) {
        return NextResponse.json(
          { error: 'Sala no encontrada' },
          { status: 404 }
        );
      }

      // Verificar autorización para acceder a la información de la sala
      if (availability.session) {
        const user = req.user!;
        const hasAccess = user.roles.includes('admin') ||
                         user.patientId === availability.session.patientId ||
                         user.doctorId === availability.session.doctorId;

        if (!hasAccess) {
          return NextResponse.json(
            { error: 'No tienes permisos para acceder a esta sala' },
            { status: 403 }
          );
        }
      }

      // También verificar en el servidor WebRTC
      let webrtcInfo = null;
      try {
        const room = this.webrtcServer.rooms?.get(roomId);
        webrtcInfo = {
          peerCount: room?.peers?.size || 0,
          maxPeers: 10,
          webrtcAvailable: room?.peers?.size < 10
        };
      } catch (webrtcError) {
        console.error('Error checking WebRTC room:', webrtcError);
      }

      return NextResponse.json({
        roomId,
        ...availability,
        webrtc: webrtcInfo
      });

    } catch (error) {
      console.error('Error checking room availability:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al verificar disponibilidad' },
        { status: 500 }
      );
    }
  }

  /**
   * Obtener sesiones activas (solo admin)
   * GET /api/telemedicine/sessions/active
   */
  async getActiveSessions(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      // Solo admin puede ver todas las sesiones activas
      const user = req.user!;
      if (!user.roles.includes('admin')) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      const activeSessions = await this.telemedicineService.getActiveSessions();

      return NextResponse.json({
        sessions: activeSessions,
        count: activeSessions.length
      });

    } catch (error) {
      console.error('Error getting active sessions:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al obtener sesiones activas' },
        { status: 500 }
      );
    }
  }

  /**
   * Limpiar sesiones antiguas (solo admin)
   * DELETE /api/telemedicine/sessions/cleanup
   */
  async cleanupOldSessions(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      // Solo admin puede limpiar sesiones
      const user = req.user!;
      if (!user.roles.includes('admin')) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      const url = new URL(req.url);
      const daysOld = parseInt(url.searchParams.get('daysOld') || '30');

      const deletedCount = await this.telemedicineService.cleanupOldSessions(daysOld);

      return NextResponse.json({
        message: `${deletedCount} sesiones antiguas eliminadas exitosamente`,
        deletedCount,
        daysOld
      });

    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor al limpiar sesiones' },
        { status: 500 }
      );
    }
  }
}

export default TelemedicineControllerV2;