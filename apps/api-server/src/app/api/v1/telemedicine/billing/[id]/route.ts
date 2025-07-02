import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para actualizar billing
const UpdateBillingSchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled', 'refunded', 'disputed']).optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'insurance']).optional(),
  paymentReference: z.string().optional(),
  refundAmount: z.number().min(0).optional(),
  refundReason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/v1/telemedicine/billing/[id]
 * Obtener información detallada de una factura específica
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: billingId } = await params;

    // Obtener la factura
    const billingDoc = await adminDb.collection('telemedicine_billing').doc(billingId).get();
    
    if (!billingDoc.exists) {
      return NextResponse.json(
        createErrorResponse('BILLING_NOT_FOUND', 'Factura no encontrada'),
        { status: 404 }
      );
    }

    const billingData = billingDoc.data();
    if (!billingData) {
      return NextResponse.json(
        createErrorResponse('BILLING_DATA_ERROR', 'No se pudo obtener datos de la factura'),
        { status: 500 }
      );
    }

    // Obtener información relacionada
    const [doctorDoc, patientDoc, sessionDoc, appointmentDoc] = await Promise.all([
      adminDb.collection('users').doc((billingData as any).doctorId).get(),
      adminDb.collection('users').doc((billingData as any).patientId).get(),
      adminDb.collection('telemedicine_sessions').doc(billingData.sessionId).get(),
      adminDb.collection('appointments').doc(billingData.appointmentId).get(),
    ]);

    const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
    const patientData = patientDoc.exists ? patientDoc.data() : null;
    const sessionData = sessionDoc.exists ? sessionDoc.data() : null;
    const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

    // Obtener historial de eventos de pago
    const eventsSnapshot = await adminDb
      .collection('billing_events')
      .where('billingId', '==', billingId)
      .orderBy('timestamp', 'desc')
      .get();

    const events = eventsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() ?? doc.data().timestamp,
    }));

    // Construir respuesta completa
    const billingResponse = {
      id: billingId,
      ...billingData,
      createdAt: (billingData as any).createdAt?.toDate?.() ?? (billingData as any).createdAt,
      updatedAt: billingData.updatedAt?.toDate?.() ?? billingData.updatedAt,
      dueDate: billingData.dueDate?.toDate?.() ?? billingData.dueDate,
      paidAt: billingData.paidAt?.toDate?.() ?? billingData.paidAt,

      // Información del doctor
      doctor: doctorData ? {
        id: (billingData as any).doctorId,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        licenseNumber: doctorData.licenseNumber,
        specialties: doctorData.specialties || [],
      } : null,

      // Información del paciente
      patient: patientData ? {
        id: (billingData as any).patientId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
      } : null,

      // Información de la sesión
      session: sessionData ? {
        id: billingData.sessionId,
        status: (sessionData as any).status,
        provider: sessionData.provider,
        scheduledAt: (sessionData as any).scheduledAt?.toDate?.() ?? (sessionData as any).scheduledAt,
        startedAt: sessionData.startedAt?.toDate?.() ?? sessionData.startedAt,
        endedAt: sessionData.endedAt?.toDate?.() ?? sessionData.endedAt,
        actualDuration: sessionData.actualDuration,
        connectionQuality: sessionData.metrics?.connectionQuality,
      } : null,

      // Información de la cita
      appointment: appointmentData ? {
        id: billingData.appointmentId,
        type: (appointmentData as any).type,
        symptoms: appointmentData.symptoms,
        diagnosis: appointmentData.diagnosis,
      } : null,

      // Historial de eventos
      events,

      // Información de pago
      paymentInfo: {
        isOverdue: billingData.dueDate && new Date() > billingData.dueDate?.toDate?.(),
        daysOverdue: billingData.dueDate 
          ? Math.max(0, Math.floor((Date.now() - billingData.dueDate?.toDate?.().getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
        paymentLink: billingData.status === 'pending' 
          ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/telemedicine/${billingId}`
          : null,
      },
    };

    return NextResponse.json(
      createSuccessResponse(billingResponse),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching billing:', error);
    
    return NextResponse.json(
      createErrorResponse('FETCH_BILLING_FAILED', 'Error al obtener factura'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/telemedicine/billing/[id]
 * Actualizar estado de facturación
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: billingId } = await params;
    const body = await request.json();
    const updateData = UpdateBillingSchema.parse(body);

    // Verificar que la factura existe
    const billingDoc = await adminDb.collection('telemedicine_billing').doc(billingId).get();
    
    if (!billingDoc.exists) {
      return NextResponse.json(
        createErrorResponse('BILLING_NOT_FOUND', 'Factura no encontrada'),
        { status: 404 }
      );
    }

    const currentData = billingDoc.data();
    if (!currentData) {
      return NextResponse.json(
        createErrorResponse('BILLING_DATA_ERROR', 'No se pudo obtener datos de la factura'),
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
        case 'paid':
          if (currentData.status === 'pending') {
            updateFields.paidAt = new Date();
            updateFields.paymentAttempts = (currentData.paymentAttempts || 0) + 1;
          }
          break;

        case 'refunded':
          if (!updateData.refundAmount) {
            return NextResponse.json(
              createErrorResponse('REFUND_AMOUNT_REQUIRED', 'Cantidad de reembolso requerida'),
              { status: 400 }
            );
          }
          updateFields.refundedAt = new Date();
          updateFields.refundAmount = updateData.refundAmount;
          break;

        case 'cancelled':
          updateFields.cancelledAt = new Date();
          break;

        case 'disputed':
          updateFields.disputedAt = new Date();
          break;
      }
    }

    // Actualizar factura
    await adminDb.collection('telemedicine_billing').doc(billingId).update(updateFields);

    // Registrar evento
    await adminDb.collection('billing_events').add({
      billingId,
      sessionId: currentData.sessionId,
      type: `billing_${(updateData as any).status || 'updated'}`,
      amount: currentData.totalAmount,
      timestamp: new Date(),
      details: {
        previousStatus: (currentData as any).status,
        newStatus: (updateData as any).status,
        paymentMethod: updateData.paymentMethod,
        paymentReference: updateData.paymentReference,
        notes: updateData.notes,
      },
    });

    // Obtener factura actualizada
    const updatedBillingDoc = await adminDb.collection('telemedicine_billing').doc(billingId).get();
    const updatedData = updatedBillingDoc.data();

    return NextResponse.json(
      createSuccessResponse({
        id: billingId,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate?.() ?? updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate?.() ?? updatedData?.updatedAt,
        dueDate: updatedData?.dueDate?.toDate?.() ?? updatedData?.dueDate,
        paidAt: updatedData?.paidAt?.toDate?.() ?? updatedData?.paidAt,
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating billing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de actualización inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('UPDATE_BILLING_FAILED', 'Error al actualizar factura'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/telemedicine/billing/[id]
 * Cancelar factura
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: billingId } = await params;

    // Verificar que la factura existe
    const billingDoc = await adminDb.collection('telemedicine_billing').doc(billingId).get();
    
    if (!billingDoc.exists) {
      return NextResponse.json(
        createErrorResponse('BILLING_NOT_FOUND', 'Factura no encontrada'),
        { status: 404 }
      );
    }

    const billingData = billingDoc.data();
    if (!billingData) {
      return NextResponse.json(
        createErrorResponse('BILLING_DATA_ERROR', 'No se pudo obtener datos de la factura'),
        { status: 500 }
      );
    }

    // Solo permitir cancelación si está pendiente
    if ((billingData as any).status !== 'pending') {
      return NextResponse.json(
        createErrorResponse('CANNOT_CANCEL', 'Solo se pueden cancelar facturas pendientes'),
        { status: 400 }
      );
    }

    // Cancelar factura
    await adminDb.collection('telemedicine_billing').doc(billingId).update({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });

    // Registrar evento
    await adminDb.collection('billing_events').add({
      billingId,
      sessionId: billingData.sessionId,
      type: 'billing_cancelled',
      amount: billingData.totalAmount,
      timestamp: new Date(),
      details: {
        reason: 'cancelled_by_request',
      },
    });

    return NextResponse.json(
      createSuccessResponse({ 
        id: billingId,
        status: 'cancelled',
        message: 'Factura cancelada exitosamente'
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error cancelling billing:', error);
    
    return NextResponse.json(
      createErrorResponse('CANCEL_BILLING_FAILED', 'Error al cancelar factura'),
      { status: 500 }
    );
  }
}
