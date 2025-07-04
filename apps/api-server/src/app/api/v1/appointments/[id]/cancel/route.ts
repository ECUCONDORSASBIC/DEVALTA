// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para cancelar cita
const CancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Motivo de cancelación es requerido').max(500, 'Motivo demasiado largo'),
});

// PUT - Cancelar cita
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        createErrorResponse('INVALID_ID', 'ID de cita requerido'),
        { status: 400 }
      );
    }

    const cancelData = CancelAppointmentSchema.parse(body);

    // Verificar que la cita existe
    const appointmentDoc = await adminDb.collection('appointments').doc(id).get();

    if (!appointmentDoc.exists) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
        { status: 404 }
      );
    }

    const appointmentData = appointmentDoc.data();
    const currentStatus = (appointmentData as any).status;

    // Verificar que la cita puede ser cancelada
    if (['cancelled', 'completed', 'no_show'].includes(currentStatus)) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_CANNOT_BE_CANCELLED', 'La cita no puede ser cancelada en su estado actual'),
        { status: 400 }
      );
    }

    // Actualizar estado de la cita
    const updateData = {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: cancelData.reason,
      updatedAt: new Date(),
    };

    await adminDb.collection('appointments').doc(id).update(updateData);

    // Registrar evento de cancelación
    try {
      await adminDb.collection('appointment_events').add({
        appointmentId: id,
        type: 'appointment_cancelled',
        timestamp: new Date(),
        details: {
          reason: cancelData.reason,
          previousStatus: currentStatus,
          cancelledAt: new Date(),
        },
      });
    } catch (eventError: any) {
      console.warn('⚠️ Failed to create cancellation event log:', eventError?.message);
    }

    // Obtener la cita actualizada
    const updatedDoc = await adminDb.collection('appointments').doc(id).get();
    const updatedData = updatedDoc.data();

    const appointment = {
      id: updatedDoc.id,
      ...updatedData,
      scheduledAt: (updatedData as any).scheduledAt?.toDate?.() ?? (updatedData as any).scheduledAt,
      createdAt: (updatedData as any).createdAt?.toDate?.() ?? (updatedData as any).createdAt,
      updatedAt: updatedData.updatedAt?.toDate?.() ?? updatedData.updatedAt,
      cancelledAt: updatedData.cancelledAt?.toDate?.() ?? updatedData.cancelledAt,
    };

    return NextResponse.json(
      createSuccessResponse(appointment, { message: 'Cita cancelada exitosamente' }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error cancelling appointment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de cancelación inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CANCEL_APPOINTMENT_FAILED', 'Error al cancelar cita'),
      { status: 500 }
    );
  }
} 