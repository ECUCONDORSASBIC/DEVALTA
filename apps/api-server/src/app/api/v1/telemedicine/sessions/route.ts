import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createPaginationMeta, createSuccessResponse, validatePagination } from '@altamedica/shared';
import { DocumentData, Query } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para crear sesión de telemedicina
const CreateTelemedicineSessionSchema = z.object({
  appointmentId: z.string().min(1, 'ID de cita requerido'),
  doctorId: z.string().min(1, 'ID de doctor requerido'),
  patientId: z.string().min(1, 'ID de paciente requerido'),
  sessionType: z.enum(['video', 'audio', 'chat']).default('video'),
  provider: z.enum(['webrtc', 'agora', 'zoom', 'google_meet']).default('webrtc'),
  scheduledDuration: z.number().min(5).max(180).default(30), // minutos
  title: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para búsqueda de sesiones
const TelemedicineQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled', 'all']).optional().default('all'),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  sessionType: z.enum(['video', 'audio', 'chat', 'all']).optional().default('all'),
  provider: z.enum(['webrtc', 'agora', 'zoom', 'google_meet', 'all']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/v1/telemedicine/sessions
 * Lista sesiones de telemedicina con filtros avanzados
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const queryData = TelemedicineQuerySchema.parse(queryParams);
    const { page, limit } = validatePagination({
      page: queryData.page,
      limit: queryData.limit,
    });    // Construir query base
    let query: Query<DocumentData> = adminDb.collection('telemedicine_sessions');

    // Aplicar filtros
    if ((queryData as any).doctorId) {
      query = (query as any).where('doctorId', '==', (queryData as any).doctorId);
    }

    if ((queryData as any).patientId) {
      query = (query as any).where('patientId', '==', (queryData as any).patientId);
    }

    if ((queryData as any).status !== 'all') {
      query = (query as any).where('status', '==', (queryData as any).status);
    }

    if (queryData.sessionType !== 'all') {
      query = (query as any).where('sessionType', '==', queryData.sessionType);
    }

    if (queryData.provider !== 'all') {
      query = (query as any).where('provider', '==', queryData.provider);
    }

    // Filtros de fecha
    if (queryData.startDate) {
      query = (query as any).where('scheduledAt', '>=', new Date(queryData.startDate));
    }

    if (queryData.endDate) {
      query = (query as any).where('scheduledAt', '<=', new Date(queryData.endDate));
    }

    // Ordenar por fecha de programación
    query = (query as any).orderBy('scheduledAt', 'desc');

    // Obtener total para paginación
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = (query as any).offset(offset).limit(limit);

    const snapshot = await query.get();
    const sessions = [];

    for (const doc of snapshot.docs) {
      const sessionData = doc.data();

      // Obtener información del doctor y paciente
      const [doctorDoc, patientDoc, appointmentDoc] = await Promise.all([
        adminDb.collection('users').doc((sessionData as any).doctorId).get(),
        adminDb.collection('users').doc((sessionData as any).patientId).get(),
        adminDb.collection('appointments').doc(sessionData.appointmentId).get(),
      ]);

      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
      const patientData = patientDoc.exists ? patientDoc.data() : null;
      const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

      sessions.push({
        id: doc.id,
        ...sessionData,
        scheduledAt: (sessionData as any).scheduledAt?.toDate?.() ?? (sessionData as any).scheduledAt,
        startedAt: sessionData.startedAt?.toDate?.() ?? sessionData.startedAt,
        endedAt: sessionData.endedAt?.toDate?.() ?? sessionData.endedAt,
        createdAt: (sessionData as any).createdAt?.toDate?.() ?? (sessionData as any).createdAt,
        updatedAt: sessionData.updatedAt?.toDate?.() ?? sessionData.updatedAt,
        // Información del doctor
        doctor: doctorData ? {
          id: (sessionData as any).doctorId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          avatar: doctorData.avatar,
        } : null,
        // Información del paciente
        patient: patientData ? {
          id: (sessionData as any).patientId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          avatar: patientData.avatar,
        } : null,
        // Información de la cita
        appointment: appointmentData ? {
          id: sessionData.appointmentId,
          type: (appointmentData as any).type,
          status: (appointmentData as any).status,
          scheduledAt: (appointmentData as any).scheduledAt?.toDate?.() ?? (appointmentData as any).scheduledAt,
        } : null,
      });
    }

    const meta = createPaginationMeta(page, limit, total);    return NextResponse.json(
      createSuccessResponse(sessions, meta as unknown as Record<string, unknown>),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching telemedicine sessions:', error);
      if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_SESSIONS_FAILED', 'Error al obtener sesiones de telemedicina'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/telemedicine/sessions
 * Crear nueva sesión de telemedicina
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const sessionData = CreateTelemedicineSessionSchema.parse(body);

    // Verificar que la cita existe y no tiene sesión activa
    const appointmentDoc = await adminDb.collection('appointments').doc(sessionData.appointmentId).get();
    if (!appointmentDoc.exists) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
        { status: 404 }
      );
    }    const appointmentInfo = appointmentDoc.data();
    
    if (!appointmentInfo) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_DATA_ERROR', 'No se pudo obtener información de la cita'),
        { status: 500 }
      );
    }

    // Verificar que el doctor y paciente coinciden con la cita
    if ((appointmentInfo as any).doctorId !== (sessionData as any).doctorId || (appointmentInfo as any).patientId !== (sessionData as any).patientId) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_MISMATCH', 'El doctor o paciente no coincide con la cita'),
        { status: 400 }
      );
    }

    // Verificar que no existe una sesión activa para esta cita
    const existingSessionQuery = await adminDb
      .collection('telemedicine_sessions')
      .where('appointmentId', '==', sessionData.appointmentId)
      .where('status', 'in', ['scheduled', 'active'])
      .get();

    if (!existingSessionQuery.empty) {
      return NextResponse.json(
        createErrorResponse('SESSION_EXISTS', 'Ya existe una sesión activa para esta cita'),
        { status: 409 }
      );
    }

    // Generar datos específicos del proveedor
    const providerConfig = generateProviderConfig(sessionData.provider);

    // Crear sesión de telemedicina
    const newSession = {
      ...sessionData,
      status: 'scheduled',
      scheduledAt: (appointmentInfo as any).scheduledAt,
      providerConfig,
      participants: {
        doctor: {
          id: (sessionData as any).doctorId,
          joinedAt: null,
          leftAt: null,
          isConnected: false,
        },
        patient: {
          id: (sessionData as any).patientId,
          joinedAt: null,
          leftAt: null,
          isConnected: false,
        },
      },
      metrics: {
        totalDuration: 0,
        actualDuration: 0,
        connectionQuality: 'unknown',
        interruptions: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    };

    const docRef = await adminDb.collection('telemedicine_sessions').add(newSession);

    // Actualizar la cita con el ID de la sesión
    await adminDb.collection('appointments').doc(sessionData.appointmentId).update({
      telemedicineSessionId: docRef.id,
      hasTelemedicine: true,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...newSession,
        joinUrls: generateJoinUrls(docRef.id, sessionData.provider, providerConfig),
      }),
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating telemedicine session:', error);
      if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de sesión inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_SESSION_FAILED', 'Error al crear sesión de telemedicina'),
      { status: 500 }
    );
  }
}

// Función auxiliar para generar configuración del proveedor
function generateProviderConfig(provider: string) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  switch (provider) {
    case 'webrtc':
      return {
        roomId: sessionId,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        constraints: {
          video: { width: 1280, height: 720 },
          audio: true,
        },
      };

    case 'agora':
      return {
        appId: process.env.AGORA_APP_ID || 'demo-app-id',
        channelName: sessionId,
        token: null, // Se genera dinámicamente en join
        uid: null,
      };

    case 'zoom':
      return {
        meetingNumber: sessionId,
        password: Math.random().toString(36).substr(2, 8),
        signature: null, // Se genera dinámicamente
      };

    case 'google_meet':
      return {
        meetCode: sessionId.replace(/_/g, '-'),
        calendarEventId: null,
      };

    default:
      return { sessionId };
  }
}

// Función auxiliar para generar URLs de acceso
function generateJoinUrls(sessionId: string, provider: string, config: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  switch (provider) {
    case 'webrtc':
      return {
        doctor: `${baseUrl}/telemedicine/join/${sessionId}?role=doctor`,
        patient: `${baseUrl}/telemedicine/join/${sessionId}?role=patient`,
      };

    case 'agora':
      return {
        doctor: `${baseUrl}/telemedicine/agora/${sessionId}?role=doctor`,
        patient: `${baseUrl}/telemedicine/agora/${sessionId}?role=patient`,
      };

    case 'zoom':
      return {
        doctor: `https://zoom.us/j/${config.meetingNumber}?pwd=${config.password}&role=host`,
        patient: `https://zoom.us/j/${config.meetingNumber}?pwd=${config.password}&role=participant`,
      };

    case 'google_meet':
      return {
        doctor: `https://meet.google.com/${config.meetCode}?role=host`,
        patient: `https://meet.google.com/${config.meetCode}?role=participant`,
      };

    default:
      return {
        doctor: `${baseUrl}/telemedicine/generic/${sessionId}?role=doctor`,
        patient: `${baseUrl}/telemedicine/generic/${sessionId}?role=patient`,
      };
  }
}
