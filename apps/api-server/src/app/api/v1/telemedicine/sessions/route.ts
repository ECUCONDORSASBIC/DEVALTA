/**
 * 📹 TELEMEDICINE SESSIONS API - ALTAMEDICA (REFACTORED)
 * Endpoint refactorizado usando Service Pattern + Unified Auth
 * IMPLEMENTADO: Era uno de los endpoints faltantes críticos para videollamadas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for telemedicine session queries
const SessionSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled', 'all']).default('all'),
  provider: z.enum(['webrtc', 'agora', 'zoom', 'google_meet', 'all']).default('all'),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema for creating telemedicine sessions
const CreateTelemedicineSessionSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  provider: z.enum(['webrtc', 'agora', 'zoom', 'google_meet']).default('webrtc'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'second_opinion']).default('consultation'),
  estimatedDuration: z.number().min(5).max(180).default(30),
  isRecorded: z.boolean().default(false),
  allowScreenShare: z.boolean().default(true),
  chatEnabled: z.boolean().default(true),
  qualitySettings: z.object({
    videoQuality: z.enum(['low', 'medium', 'high', 'hd']).default('high'),
    audioQuality: z.enum(['low', 'medium', 'high']).default('high'),
    adaptiveBitrate: z.boolean().default(true)
  }).optional(),
  metadata: z.object({
    sessionReason: z.string().optional(),
    specialRequirements: z.string().optional(),
    emergencyContact: z.string().optional()
  }).optional()
});

/**
 * GET /api/v1/telemedicine/sessions
 * List telemedicine sessions with role-based filtering
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = SessionSearchSchema.parse(Object.fromEntries(searchParams));
      
      const { page, limit, status, provider, doctorId, patientId, appointmentId, startDate, endDate, sortBy, sortOrder } = searchData;
      const offset = (page - 1) * limit;

      // Build query
      let query: any = adminDb.collection('telemedicine_sessions');

      // Apply role-based filtering
      if (authContext.user.role === 'doctor') {
        query = query.where('doctorId', '==', authContext.user.uid);
      } else if (authContext.user.role === 'patient') {
        query = query.where('patientId', '==', authContext.user.uid);
      }

      // Apply additional filters
      if (status !== 'all') {
        query = query.where('status', '==', status);
      }
      if (provider !== 'all') {
        query = query.where('provider', '==', provider);
      }
      if (doctorId && authContext.user.role !== 'doctor') {
        query = query.where('doctorId', '==', doctorId);
      }
      if (patientId && authContext.user.role !== 'patient') {
        query = query.where('patientId', '==', patientId);
      }
      if (appointmentId) {
        query = query.where('appointmentId', '==', appointmentId);
      }

      // Date filtering
      if (startDate) {
        query = query.where('scheduledAt', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('scheduledAt', '<=', new Date(endDate));
      }

      // Order and paginate
      query = query.orderBy('scheduledAt', sortOrder).offset(offset).limit(limit);

      const snapshot = await query.get();

      // Process sessions with related data
      const sessions = [];
      const doctorIds = new Set();
      const patientIds = new Set();
      const appointmentIds = new Set();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          scheduledAt: data.scheduledAt?.toDate() || data.scheduledAt,
          startedAt: data.startedAt?.toDate() || data.startedAt,
          endedAt: data.endedAt?.toDate() || data.endedAt,
          createdAt: data.createdAt?.toDate() || data.createdAt,
          updatedAt: data.updatedAt?.toDate() || data.updatedAt
        });
        
        doctorIds.add(data.doctorId);
        patientIds.add(data.patientId);
        if (data.appointmentId) appointmentIds.add(data.appointmentId);
      }

      // OPTIMIZATION: Batch fetch related data
      const [doctorsData, patientsData, appointmentsData] = await Promise.all([
        batchFetchUsers([...doctorIds], 'doctor'),
        batchFetchUsers([...patientIds], 'patient'),
        batchFetchAppointments([...appointmentIds])
      ]);

      // Enrich sessions with related data
      const enrichedSessions = sessions.map(session => ({
        ...session,
        doctor: doctorsData.get(session.doctorId),
        patient: patientsData.get(session.patientId),
        appointment: session.appointmentId ? appointmentsData.get(session.appointmentId) : null,
        joinUrls: generateJoinUrls(session.id, session.provider, session.providerConfig || {})
      }));

      // Get total count
      const totalQuery = adminDb.collection('telemedicine_sessions');
      const totalSnapshot = await totalQuery.get();

      return NextResponse.json(
        createSuccessResponse(enrichedSessions, {
          total: totalSnapshot.size,
          page,
          limit,
          hasNext: offset + limit < totalSnapshot.size,
          hasPrev: page > 1
        })
      );

    } catch (error) {
      console.error('Error in GET /telemedicine/sessions:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching telemedicine sessions'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'telemedicine_sessions_accessed',
    rateLimitKey: 'telemedicine_sessions'
  }
);

/**
 * POST /api/v1/telemedicine/sessions
 * Create new telemedicine session
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      const sessionData = CreateTelemedicineSessionSchema.parse(body);

      // Verify appointment exists and user has permission
      const appointmentDoc = await adminDb.collection('appointments').doc(sessionData.appointmentId).get();
      if (!appointmentDoc.exists) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_NOT_FOUND', 'Appointment not found'),
          { status: 404 }
        );
      }

      const appointmentInfo = appointmentDoc.data()!;

      // Verify user has permission to create session for this appointment
      if (authContext.user.role === 'doctor' && appointmentInfo.doctorId !== authContext.user.uid) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'Cannot create session for another doctor\'s appointment'),
          { status: 403 }
        );
      }
      if (authContext.user.role === 'patient' && appointmentInfo.patientId !== authContext.user.uid) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'Cannot create session for another patient\'s appointment'),
          { status: 403 }
        );
      }

      // Verify participants match appointment
      if (appointmentInfo.doctorId !== sessionData.doctorId || appointmentInfo.patientId !== sessionData.patientId) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_MISMATCH', 'Session participants do not match appointment'),
          { status: 400 }
        );
      }

      // Check for existing active session
      const existingSessionQuery = await adminDb
        .collection('telemedicine_sessions')
        .where('appointmentId', '==', sessionData.appointmentId)
        .where('status', 'in', ['scheduled', 'active'])
        .get();

      if (!existingSessionQuery.empty) {
        return NextResponse.json(
          createErrorResponse('SESSION_EXISTS', 'Active session already exists for this appointment'),
          { status: 409 }
        );
      }

      // Generate provider-specific configuration
      const providerConfig = generateProviderConfig(sessionData.provider);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create telemedicine session
      const newSession = {
        ...sessionData,
        sessionId,
        status: 'scheduled',
        scheduledAt: appointmentInfo.scheduledAt,
        providerConfig,
        participants: {
          doctor: {
            id: sessionData.doctorId,
            joinedAt: null,
            leftAt: null,
            isConnected: false,
            connectionQuality: 'unknown'
          },
          patient: {
            id: sessionData.patientId,
            joinedAt: null,
            leftAt: null,
            isConnected: false,
            connectionQuality: 'unknown'
          }
        },
        metrics: {
          totalDuration: 0,
          actualDuration: 0,
          averageConnectionQuality: 'unknown',
          interruptions: 0,
          reconnections: 0,
          dataTransferred: 0
        },
        recording: {
          isEnabled: sessionData.isRecorded,
          recordingId: null,
          recordingUrl: null,
          recordingStatus: 'none'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        endedAt: null,
        createdBy: authContext.user.uid
      };

      const sessionRef = await adminDb.collection('telemedicine_sessions').add(newSession);

      // Update appointment with session reference
      await adminDb.collection('appointments').doc(sessionData.appointmentId).update({
        telemedicineSessionId: sessionRef.id,
        hasTelemedicine: true,
        type: 'telemedicine',
        updatedAt: new Date()
      });

      // Create notifications for participants
      const joinUrls = generateJoinUrls(sessionRef.id, sessionData.provider, providerConfig);

      // Notify doctor
      await adminDb.collection('notifications').add({
        userId: sessionData.doctorId,
        type: 'telemedicine_session_created',
        title: 'Nueva Sesión de Telemedicina',
        message: `Sesión de telemedicina creada para cita programada`,
        data: {
          sessionId: sessionRef.id,
          appointmentId: sessionData.appointmentId,
          patientId: sessionData.patientId,
          joinUrl: joinUrls.doctor,
          scheduledAt: appointmentInfo.scheduledAt
        },
        isRead: false,
        createdAt: new Date()
      });

      // Notify patient
      await adminDb.collection('notifications').add({
        userId: sessionData.patientId,
        type: 'telemedicine_session_created',
        title: 'Sesión de Telemedicina Programada',
        message: `Tu consulta médica por videollamada está lista`,
        data: {
          sessionId: sessionRef.id,
          appointmentId: sessionData.appointmentId,
          doctorId: sessionData.doctorId,
          joinUrl: joinUrls.patient,
          scheduledAt: appointmentInfo.scheduledAt
        },
        isRead: false,
        createdAt: new Date()
      });

      // Audit log for HIPAA compliance
      await adminDb.collection('audit_logs').add({
        action: 'telemedicine_session_created',
        userId: authContext.user.uid,
        resourceType: 'telemedicine_session',
        resourceId: sessionRef.id,
        details: {
          appointmentId: sessionData.appointmentId,
          doctorId: sessionData.doctorId,
          patientId: sessionData.patientId,
          provider: sessionData.provider,
          isRecorded: sessionData.isRecorded,
          estimatedDuration: sessionData.estimatedDuration
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });

      return NextResponse.json(
        createSuccessResponse({
          id: sessionRef.id,
          ...newSession,
          joinUrls
        }),
        { status: 201 }
      );

    } catch (error) {
      console.error('Error in POST /telemedicine/sessions:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid session data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error creating telemedicine session'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient'],
    auditAction: 'telemedicine_session_created',
    rateLimitKey: 'telemedicine_session_create'
  }
);

// Helper functions
async function batchFetchUsers(userIds: string[], userType: 'doctor' | 'patient'): Promise<Map<string, any>> {
  if (userIds.length === 0) return new Map();

  const usersMap = new Map();
  const chunks = chunkArray([...userIds], 10);

  for (const chunk of chunks) {
    const usersSnapshot = await adminDb.collection('users')
      .where('__name__', 'in', chunk.map(id => adminDb.collection('users').doc(id)))
      .get();

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      usersMap.set(doc.id, {
        id: doc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone
      });
    }
  }

  return usersMap;
}

async function batchFetchAppointments(appointmentIds: string[]): Promise<Map<string, any>> {
  if (appointmentIds.length === 0) return new Map();

  const appointmentsMap = new Map();
  const chunks = chunkArray([...appointmentIds], 10);

  for (const chunk of chunks) {
    const appointmentsSnapshot = await adminDb.collection('appointments')
      .where('__name__', 'in', chunk.map(id => adminDb.collection('appointments').doc(id)))
      .get();

    for (const doc of appointmentsSnapshot.docs) {
      const appointmentData = doc.data();
      appointmentsMap.set(doc.id, {
        id: doc.id,
        scheduledAt: appointmentData.scheduledAt?.toDate() || appointmentData.scheduledAt,
        type: appointmentData.type,
        status: appointmentData.status,
        duration: appointmentData.duration,
        reason: appointmentData.reason
      });
    }
  }

  return appointmentsMap;
}

function generateProviderConfig(provider: string) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  switch (provider) {
    case 'webrtc':
      return {
        roomId: sessionId,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        constraints: {
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        },
        dataChannel: {
          ordered: true,
          maxRetransmits: 3
        }
      };

    case 'agora':
      return {
        appId: process.env.AGORA_APP_ID || 'demo-app-id',
        channelName: sessionId,
        token: null, // Generated dynamically on join
        uid: null,
        settings: {
          codec: 'vp8',
          mode: 'rtc',
          role: 'host'
        }
      };

    case 'zoom':
      return {
        meetingNumber: sessionId.replace(/[^0-9]/g, '').substring(0, 10),
        password: Math.random().toString(36).substr(2, 8),
        signature: null, // Generated dynamically
        settings: {
          audio: 'both',
          video: 'both',
          leaveUrl: process.env.NEXT_PUBLIC_APP_URL + '/telemedicine/complete'
        }
      };

    case 'google_meet':
      return {
        meetCode: sessionId.replace(/_/g, '-'),
        calendarEventId: null,
        settings: {
          allowExternalParticipants: false,
          recordingEnabled: false
        }
      };

    default:
      return { 
        sessionId,
        provider: 'custom',
        settings: {}
      };
  }
}

function generateJoinUrls(sessionId: string, provider: string, config: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  switch (provider) {
    case 'webrtc':
      return {
        doctor: `${baseUrl}/telemedicine/webrtc/${sessionId}?role=doctor&roomId=${config.roomId}`,
        patient: `${baseUrl}/telemedicine/webrtc/${sessionId}?role=patient&roomId=${config.roomId}`
      };

    case 'agora':
      return {
        doctor: `${baseUrl}/telemedicine/agora/${sessionId}?role=doctor&channel=${config.channelName}`,
        patient: `${baseUrl}/telemedicine/agora/${sessionId}?role=patient&channel=${config.channelName}`
      };

    case 'zoom':
      return {
        doctor: `https://zoom.us/j/${config.meetingNumber}?pwd=${config.password}&role=1`,
        patient: `https://zoom.us/j/${config.meetingNumber}?pwd=${config.password}&role=0`
      };

    case 'google_meet':
      return {
        doctor: `https://meet.google.com/${config.meetCode}?authuser=0&hs=179`,
        patient: `https://meet.google.com/${config.meetCode}?authuser=0&hs=179`
      };

    default:
      return {
        doctor: `${baseUrl}/telemedicine/session/${sessionId}?role=doctor`,
        patient: `${baseUrl}/telemedicine/session/${sessionId}?role=patient`
      };
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}
