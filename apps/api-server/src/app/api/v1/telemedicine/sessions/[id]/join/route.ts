import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';



// Schema para unirse a sesión
const JoinSessionSchema = z.object({
  participantType: z.enum(['doctor', 'patient']),
  participantId: z.string().min(1),
  connectionInfo: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/v1/telemedicine/sessions/[id]/join
 * Unirse a una sesión de telemedicina
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const joinData = JoinSessionSchema.parse(body);

    // Verificar que la sesión existe
    const sessionDoc = await adminDb.collection('telemedicine_sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('SESSION_NOT_FOUND', 'Sesión de telemedicina no encontrada'),
        { status: 404 }
      );
    }

    const sessionData = sessionDoc.data();
    if (!sessionData) {
      return NextResponse.json(
        createErrorResponse('SESSION_DATA_ERROR', 'No se pudo obtener datos de la sesión'),
        { status: 500 }
      );
    }

    // Verificar que la sesión está en estado válido para unirse
    if (sessionData.status === 'completed' || sessionData.status === 'cancelled') {
      return NextResponse.json(
        createErrorResponse('SESSION_ENDED', 'No se puede unir a una sesión finalizada'),
        { status: 400 }
      );
    }

    // Verificar que el participante tiene derecho a unirse
    const expectedParticipantId = joinData.participantType === 'doctor' 
      ? sessionData.doctorId 
      : (sessionData as any).patientId;

    if (joinData.participantId !== expectedParticipantId) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED_PARTICIPANT', 'No autorizado para unirse a esta sesión'),
        { status: 403 }
      );
    }

    const joinTimestamp = new Date();
    
    // Preparar datos de actualización
    const updateFields: any = {
      updatedAt: joinTimestamp,
    };

    // Actualizar información del participante
    if (joinData.participantType === 'doctor') {
      updateFields['participants.doctor.joinedAt'] = joinTimestamp;
      updateFields['participants.doctor.isConnected'] = true;
      updateFields['participants.doctor.connectionInfo'] = joinData.connectionInfo || {};
    } else {
      updateFields['participants.patient.joinedAt'] = joinTimestamp;
      updateFields['participants.patient.isConnected'] = true;
      updateFields['participants.patient.connectionInfo'] = joinData.connectionInfo || {};
    }

    // Si es el primer participante en unirse, activar la sesión
    const doctorConnected = joinData.participantType === 'doctor' || sessionData.participants?.doctor?.isConnected;
    const patientConnected = joinData.participantType === 'patient' || sessionData.participants?.patient?.isConnected;

    if (sessionData.status === 'scheduled' && (doctorConnected || patientConnected)) {
      updateFields.status = 'active';
      updateFields.startedAt = joinTimestamp;
      updateFields.actualStartedAt = joinTimestamp;
    }

    // Actualizar sesión
    await adminDb.collection('telemedicine_sessions').doc(sessionId).update(updateFields);

    // Generar credenciales específicas del proveedor
    const providerCredentials = await generateProviderCredentials(
      sessionData.provider,
      sessionData.providerConfig,
      joinData.participantType,
      joinData.participantId
    );

    // Obtener información actualizada de la sesión
    const updatedSessionDoc = await adminDb.collection('telemedicine_sessions').doc(sessionId).get();
    const updatedSessionData = updatedSessionDoc.data();

    // Registrar evento de unión
    await adminDb.collection('telemedicine_events').add({
      sessionId,
      type: 'participant_joined',
      participantType: joinData.participantType,
      participantId: joinData.participantId,
      timestamp: joinTimestamp,
      connectionInfo: joinData.connectionInfo,
      sessionStatus: updatedSessionData?.status,
    });

    return NextResponse.json(
      createSuccessResponse({
        sessionId,
        status: updatedSessionData?.status,
        participantType: joinData.participantType,
        joinedAt: joinTimestamp,
        joinUrl: generateJoinUrl(sessionId, sessionData.provider, joinData.participantType),
        providerCredentials,
        sessionInfo: {
          provider: sessionData.provider,
          sessionType: sessionData.sessionType,
          scheduledDuration: sessionData.scheduledDuration,
          participants: updatedSessionData?.participants,
        },
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error joining telemedicine session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de unión inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('JOIN_SESSION_FAILED', 'Error al unirse a sesión de telemedicina'),
      { status: 500 }
    );
  }
}

// Función para generar credenciales específicas del proveedor
async function generateProviderCredentials(provider: string, config: any, participantType: string, participantId: string) {
  switch (provider) {
    case 'webrtc':
      return {
        iceServers: config.iceServers,
        constraints: config.constraints,
        roomId: config.roomId,
        role: participantType,
      };

    case 'agora':
      // En producción, aquí generarías un token real usando Agora SDK
      const agoraToken = await generateAgoraToken(config.appId, config.channelName, participantId);
      return {
        appId: config.appId,
        channelName: config.channelName,
        token: agoraToken,
        uid: parseInt(participantId.slice(-6)), // Usar últimos 6 dígitos como UID
        role: participantType === 'doctor' ? 'host' : 'audience',
      };

    case 'zoom':
      // En producción, aquí generarías signature usando Zoom SDK
      const zoomSignature = await generateZoomSignature(config.meetingNumber, participantType);
      return {
        meetingNumber: config.meetingNumber,
        password: config.password,
        signature: zoomSignature,
        role: participantType === 'doctor' ? 1 : 0, // 1=host, 0=participant
      };

    case 'google_meet':
      return {
        meetCode: config.meetCode,
        role: participantType,
        // En producción, aquí incluirías tokens de Google Meet API
      };

    default:
      return {
        sessionId: config.sessionId,
        role: participantType,
      };
  }
}

// Función auxiliar para generar Agora token (mock)
async function generateAgoraToken(appId: string, channelName: string, uid: string): Promise<string> {
  // En producción, usar Agora Token Server
  // Por ahora, devolver un token mock
  return `agora_token_${appId}_${channelName}_${uid}_${Date.now()}`;
}

// Función auxiliar para generar Zoom signature (mock)
async function generateZoomSignature(meetingNumber: string, role: string): Promise<string> {
  // En producción, usar Zoom SDK para generar signature
  // Por ahora, devolver una signature mock
  return `zoom_signature_${meetingNumber}_${role}_${Date.now()}`;
}

// Función auxiliar para generar URL de acceso
function generateJoinUrl(sessionId: string, provider: string, participantType: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  switch (provider) {
    case 'webrtc':
      return `${baseUrl}/telemedicine/join/${sessionId}?role=${participantType}`;
    case 'agora':
      return `${baseUrl}/telemedicine/agora/${sessionId}?role=${participantType}`;
    case 'zoom':
      return `${baseUrl}/telemedicine/zoom/${sessionId}?role=${participantType}`;
    case 'google_meet':
      return `${baseUrl}/telemedicine/meet/${sessionId}?role=${participantType}`;
    default:
      return `${baseUrl}/telemedicine/generic/${sessionId}?role=${participantType}`;
  }
}
