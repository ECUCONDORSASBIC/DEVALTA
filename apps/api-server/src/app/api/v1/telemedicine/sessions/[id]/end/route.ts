import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';



// Schema para finalizar sesión
const EndSessionSchema = z.object({
  endedBy: z.enum(['doctor', 'patient', 'system']),
  endReason: z.enum(['completed', 'cancelled_by_doctor', 'cancelled_by_patient', 'technical_issue', 'timeout', 'no_show']),
  participantId: z.string().min(1),
  sessionNotes: z.string().optional(),
  connectionQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  technicalIssues: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

/**
 * POST /api/v1/telemedicine/sessions/[id]/end
 * Finalizar una sesión de telemedicina
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const endData = EndSessionSchema.parse(body);

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

    // Verificar que la sesión puede ser finalizada
    if (sessionData.status === 'completed' || sessionData.status === 'cancelled') {
      return NextResponse.json(
        createErrorResponse('SESSION_ALREADY_ENDED', 'La sesión ya ha sido finalizada'),
        { status: 400 }
      );
    }

    // Verificar autorización del participante
    const isAuthorized = 
      (endData.endedBy === 'doctor' && endData.participantId === (sessionData as any).doctorId) ||
      (endData.endedBy === 'patient' && endData.participantId === (sessionData as any).patientId) ||
      endData.endedBy === 'system';

    if (!isAuthorized) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'No autorizado para finalizar esta sesión'),
        { status: 403 }
      );
    }

    const endTimestamp = new Date();
    
    // Calcular duración real
    let actualDuration = 0;
    if (sessionData.startedAt) {
      const startTime = sessionData.startedAt?.toDate?.() ?? sessionData.startedAt;
      actualDuration = Math.floor((endTimestamp.getTime() - startTime.getTime()) / 1000);
    }

    // Determinar el estado final
    const finalStatus = endData.endReason === 'completed' ? 'completed' : 'cancelled';

    // Actualizar participante que se desconecta
    const participantUpdate: any = {};
    if (endData.endedBy === 'doctor') {
      participantUpdate['participants.doctor.leftAt'] = endTimestamp;
      participantUpdate['participants.doctor.isConnected'] = false;
    } else if (endData.endedBy === 'patient') {
      participantUpdate['participants.patient.leftAt'] = endTimestamp;
      participantUpdate['participants.patient.isConnected'] = false;
    }

    // Preparar datos de actualización de la sesión
    const updateFields = {
      status: finalStatus,
      endedAt: endTimestamp,
      endedBy: endData.endedBy,
      endReason: endData.endReason,
      actualDuration,
      sessionNotes: endData.sessionNotes || '',
      updatedAt: endTimestamp,
      ...participantUpdate,
      // Actualizar métricas
      'metrics.actualDuration': actualDuration,
      'metrics.connectionQuality': endData.connectionQuality || sessionData.metrics?.connectionQuality || 'unknown',
      'metrics.technicalIssues': endData.technicalIssues || [],
      'metrics.endedBy': endData.endedBy,
      'metrics.endReason': endData.endReason,
    };

    // Actualizar sesión
    await adminDb.collection('telemedicine_sessions').doc(sessionId).update(updateFields);

    // Actualizar cita relacionada
    const appointmentUpdate: any = {
      status: finalStatus,
      updatedAt: endTimestamp,
    };

    if (finalStatus === 'completed') {
      appointmentUpdate.telemedicineCompleted = true;
      appointmentUpdate.completedAt = endTimestamp;
    }

    await adminDb.collection('appointments').doc(sessionData.appointmentId).update(appointmentUpdate);

    // Registrar evento de finalización
    await adminDb.collection('telemedicine_events').add({
      sessionId,
      type: 'session_ended',
      endedBy: endData.endedBy,
      endReason: endData.endReason,
      participantId: endData.participantId,
      timestamp: endTimestamp,
      actualDuration,
      finalStatus,
      sessionNotes: endData.sessionNotes,
      connectionQuality: endData.connectionQuality,
      technicalIssues: endData.technicalIssues,
    });

    // Si se proporcionó rating, guardarlo
    if (endData.rating) {
      await adminDb.collection('session_ratings').add({
        sessionId,
        appointmentId: sessionData.appointmentId,
        ratedBy: endData.endedBy,
        participantId: endData.participantId,
        rating: endData.rating,
        feedback: endData.feedback || '',
        createdAt: endTimestamp,
      });
    }

    // Calcular estadísticas de sesión
    const sessionStats = calculateSessionStats(sessionData, updateFields);

    // Enviar notificaciones (en producción)
    await sendSessionEndNotifications(sessionData, endData, finalStatus);

    return NextResponse.json(
      createSuccessResponse({
        sessionId,
        status: finalStatus,
        endedAt: endTimestamp,
        endedBy: endData.endedBy,
        endReason: endData.endReason,
        actualDuration,
        sessionStats,
        message: finalStatus === 'completed' 
          ? 'Sesión de telemedicina completada exitosamente'
          : 'Sesión de telemedicina cancelada',
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error ending telemedicine session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de finalización inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('END_SESSION_FAILED', 'Error al finalizar sesión de telemedicina'),
      { status: 500 }
    );
  }
}

// Función para calcular estadísticas de la sesión
function calculateSessionStats(sessionData: any, updateFields: any) {
  const scheduledDuration = sessionData.scheduledDuration * 60; // convertir a segundos
  const actualDuration = updateFields.actualDuration;
  
  return {
    scheduledDuration: sessionData.scheduledDuration, // en minutos
    actualDuration: Math.floor(actualDuration / 60), // en minutos
    durationDifference: Math.floor(actualDuration / 60) - sessionData.scheduledDuration,
    connectionQuality: updateFields['metrics.connectionQuality'],
    technicalIssuesCount: updateFields['metrics.technicalIssues'].length,
    wasCompleted: updateFields.status === 'completed',
    efficiency: actualDuration > 0 ? Math.min(100, Math.floor((scheduledDuration / actualDuration) * 100)) : 0,
  };
}

// Función para enviar notificaciones de finalización
async function sendSessionEndNotifications(sessionData: any, endData: any, finalStatus: string) {
  try {
    // En producción, aquí implementarías:
    // 1. Notificaciones push a participantes
    // 2. Emails de resumen de sesión
    // 3. Actualización de sistemas externos
    // 4. Generación de reportes médicos
    
    console.log(`Session ${sessionData.id} ended - Status: ${finalStatus}, EndedBy: ${endData.endedBy}`);
    
    // Mock de notificaciones
    const notifications = [
      {
        type: 'session_ended',
        recipientId: (sessionData as any).doctorId,
        recipientType: 'doctor',
        message: `Sesión de telemedicina ${finalStatus === 'completed' ? 'completada' : 'cancelada'}`,
        sessionId: sessionData.id,
      },
      {
        type: 'session_ended',
        recipientId: (sessionData as any).patientId,
        recipientType: 'patient',
        message: `Sesión de telemedicina ${finalStatus === 'completed' ? 'completada' : 'cancelada'}`,
        sessionId: sessionData.id,
      },
    ];

    // En producción, enviar estas notificaciones a un servicio de notificaciones
    console.log('Notifications to send:', notifications);
    
  } catch (error: unknown) {
    console.error('Error sending session end notifications:', error);
    // No fallar la operación principal por errores de notificación
  }
}
