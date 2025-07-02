import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';



// Schema para actualizar sesión
const UpdateSessionSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  endReason: z.enum(['completed', 'cancelled_by_doctor', 'cancelled_by_patient', 'technical_issue', 'no_show']).optional(),
  connectionQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  technicalIssues: z.array(z.string()).optional(),
});

// Schema para unirse a sesión
const JoinSessionSchema = z.object({
  participantType: z.enum(['doctor', 'patient']),
  participantId: z.string().min(1),
  connectionInfo: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    device: z.string().optional(),
  }).optional(),
});

/**
 * GET /api/v1/telemedicine/sessions/[id]
 * Obtener información detallada de una sesión específica
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;

    // Obtener la sesión
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

    // Obtener información adicional
    const [doctorDoc, patientDoc, appointmentDoc] = await Promise.all([
      adminDb.collection('users').doc((sessionData as any).doctorId).get(),
      adminDb.collection('users').doc((sessionData as any).patientId).get(),
      adminDb.collection('appointments').doc(sessionData.appointmentId).get(),
    ]);

    const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
    const patientData = patientDoc.exists ? patientDoc.data() : null;
    const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

    // Construir respuesta completa
    const sessionResponse = {
      id: sessionId,
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
        specialties: doctorData.specialties || [],
      } : null,

      // Información del paciente
      patient: patientData ? {
        id: (sessionData as any).patientId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        avatar: patientData.avatar,
        dateOfBirth: patientData.dateOfBirth,
      } : null,

      // Información de la cita
      appointment: appointmentData ? {
        id: sessionData.appointmentId,
        type: (appointmentData as any).type,
        status: (appointmentData as any).status,
        scheduledAt: (appointmentData as any).scheduledAt?.toDate?.() ?? (appointmentData as any).scheduledAt,
        duration: appointmentData.duration,
        symptoms: appointmentData.symptoms,
      } : null,

      // URLs de acceso actualizadas
      joinUrls: generateJoinUrls(sessionId, sessionData.provider, sessionData.providerConfig),

      // Calcular duración si está activa
      currentDuration: sessionData.status === 'active' && sessionData.startedAt 
        ? Math.floor((Date.now() - (sessionData.startedAt?.toDate?.() ?? sessionData.startedAt).getTime()) / 1000)
        : null,
    };

    return NextResponse.json(
      createSuccessResponse(sessionResponse),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching telemedicine session:', error);
    
    return NextResponse.json(
      createErrorResponse('FETCH_SESSION_FAILED', 'Error al obtener sesión de telemedicina'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/telemedicine/sessions/[id]
 * Actualizar estado de una sesión de telemedicina
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const updateData = UpdateSessionSchema.parse(body);

    // Verificar que la sesión existe
    const sessionDoc = await adminDb.collection('telemedicine_sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('SESSION_NOT_FOUND', 'Sesión de telemedicina no encontrada'),
        { status: 404 }
      );
    }

    const currentData = sessionDoc.data();
    if (!currentData) {
      return NextResponse.json(
        createErrorResponse('SESSION_DATA_ERROR', 'No se pudo obtener datos de la sesión'),
        { status: 500 }
      );
    }

    // Preparar datos de actualización
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Lógica específica por estado
    if ((updateData as any).status) {
      switch ((updateData as any).status) {
        case 'active':
          if (currentData.status === 'scheduled') {
            updateFields.startedAt = new Date();
            updateFields.actualStartedAt = new Date();
          }
          break;
          
        case 'completed':
        case 'cancelled':
          if (currentData.status === 'active') {
            updateFields.endedAt = new Date();
            updateFields.actualEndedAt = new Date();
            
            // Calcular duración real
            const startTime = currentData.startedAt?.toDate?.() ?? currentData.startedAt;
            if (startTime) {
              updateFields.actualDuration = Math.floor((updateFields.endedAt.getTime() - startTime.getTime()) / 1000);
            }
          }
          break;
      }
    }

    // Actualizar métricas si se proporciona calidad de conexión
    if (updateData.connectionQuality) {
      updateFields['metrics.connectionQuality'] = updateData.connectionQuality;
    }

    // Actualizar sesión
    await adminDb.collection('telemedicine_sessions').doc(sessionId).update(updateFields);

    // Si la sesión se completó o canceló, actualizar la cita relacionada
    if (updateData.status === 'completed' || updateData.status === 'cancelled') {
      await adminDb.collection('appointments').doc(currentData.appointmentId).update({
        status: updateData.status === 'completed' ? 'completed' : 'cancelled',
        telemedicineCompleted: updateData.status === 'completed',
        updatedAt: new Date(),
      });
    }

    // Obtener sesión actualizada
    const updatedSessionDoc = await adminDb.collection('telemedicine_sessions').doc(sessionId).get();
    const updatedData = updatedSessionDoc.data();

    return NextResponse.json(
      createSuccessResponse({
        id: sessionId,
        ...updatedData,
        scheduledAt: updatedData?.scheduledAt?.toDate?.() ?? updatedData?.scheduledAt,
        startedAt: updatedData?.startedAt?.toDate?.() ?? updatedData?.startedAt,
        endedAt: updatedData?.endedAt?.toDate?.() ?? updatedData?.endedAt,
        createdAt: updatedData?.createdAt?.toDate?.() ?? updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate?.() ?? updatedData?.updatedAt,
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating telemedicine session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de actualización inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('UPDATE_SESSION_FAILED', 'Error al actualizar sesión de telemedicina'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/telemedicine/sessions/[id]
 * Cancelar/eliminar una sesión de telemedicina
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;

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

    // Solo permitir cancelación si no está activa o completada
    if (sessionData.status === 'completed') {
      return NextResponse.json(
        createErrorResponse('SESSION_COMPLETED', 'No se puede cancelar una sesión completada'),
        { status: 400 }
      );
    }

    // Actualizar estado a cancelado
    await adminDb.collection('telemedicine_sessions').doc(sessionId).update({
      status: 'cancelled',
      endReason: 'cancelled_by_request',
      endedAt: new Date(),
      updatedAt: new Date(),
    });

    // Actualizar cita relacionada
    await adminDb.collection('appointments').doc(sessionData.appointmentId).update({
      status: 'cancelled',
      telemedicineSessionId: null,
      hasTelemedicine: false,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      createSuccessResponse({ 
        id: sessionId,
        status: 'cancelled',
        message: 'Sesión de telemedicina cancelada exitosamente'
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error cancelling telemedicine session:', error);
    
    return NextResponse.json(
      createErrorResponse('CANCEL_SESSION_FAILED', 'Error al cancelar sesión de telemedicina'),
      { status: 500 }
    );
  }
}

// Función auxiliar para generar URLs de acceso (reutilizada)
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
