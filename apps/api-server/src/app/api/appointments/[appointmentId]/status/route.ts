import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    // Verificar autenticación
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { appointmentId } = params;
    const body = await request.json();
    const { status, notes } = body;

    // Validar estado
    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    // Obtener la cita
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    const appointmentData = appointmentDoc.data();

    // Verificar que el usuario es el doctor asignado
    if (appointmentData.doctorId !== user.uid) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Actualizar estado
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.notes = notes;
    }

    // Si se completa la cita, agregar timestamp de finalización
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    await appointmentRef.update(updateData);

    // Crear registro de actividad
    await db.collection('activity').add({
      doctorId: user.uid,
      patientId: appointmentData.patientId,
      appointmentId: appointmentId,
      type: 'APPOINTMENT_COMPLETED',
      description: `Cita ${status.toLowerCase()} - ${appointmentData.patientName || 'Paciente'}`,
      timestamp: new Date(),
      metadata: {
        previousStatus: appointmentData.status,
        newStatus: status,
        notes
      }
    });

    // Obtener datos actualizados
    const updatedDoc = await appointmentRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: appointmentId,
      patientId: updatedData.patientId,
      patientName: updatedData.patientName,
      patientEmail: updatedData.patientEmail,
      patientPhone: updatedData.patientPhone,
      date: updatedData.date,
      time: updatedData.time,
      duration: updatedData.duration,
      type: updatedData.type,
      status: updatedData.status,
      specialty: updatedData.specialty,
      reason: updatedData.reason,
      notes: updatedData.notes,
      isUrgent: updatedData.isUrgent,
      telemedicineUrl: updatedData.telemedicineUrl,
      createdAt: updatedData.createdAt?.toDate?.() || updatedData.createdAt,
      updatedAt: updatedData.updatedAt?.toDate?.() || updatedData.updatedAt
    });

  } catch (error) {
    console.error('Error actualizando estado de cita:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 