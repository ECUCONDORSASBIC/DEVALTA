import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    // Verificar autenticación
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { alertId } = params;
    const body = await request.json();
    const { notes } = body;

    // Obtener la alerta
    const alertRef = db.collection('alerts').doc(alertId);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 });
    }

    const alertData = alertDoc.data();

    // Verificar que el usuario es el doctor asignado
    if (alertData.doctorId !== user.uid) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Actualizar alerta
    const updateData: any = {
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: user.uid
    };

    if (notes) {
      updateData.acknowledgementNotes = notes;
    }

    await alertRef.update(updateData);

    // Crear registro de actividad
    await db.collection('activity').add({
      doctorId: user.uid,
      patientId: alertData.patientId,
      type: 'ALERT_ACKNOWLEDGED',
      description: `Alerta reconocida: ${alertData.message}`,
      timestamp: new Date(),
      metadata: {
        alertId: alertId,
        alertType: alertData.type,
        priority: alertData.priority,
        notes
      }
    });

    // Obtener datos actualizados
    const updatedDoc = await alertRef.get();
    const updatedData = updatedDoc.data();

    // Obtener nombre del paciente si existe
    let patientName = '';
    if (updatedData.patientId) {
      const patientDoc = await db.collection('patients').doc(updatedData.patientId).get();
      if (patientDoc.exists) {
        const patientData = patientDoc.data();
        patientName = patientData.fullName || '';
      }
    }

    return NextResponse.json({
      id: alertId,
      type: updatedData.type,
      patientId: updatedData.patientId,
      patientName: patientName,
      message: updatedData.message,
      description: updatedData.description,
      timestamp: updatedData.timestamp?.toDate?.() || updatedData.timestamp,
      priority: updatedData.priority,
      acknowledged: updatedData.acknowledged,
      actionRequired: updatedData.actionRequired,
      actionUrl: updatedData.actionUrl,
      expiresAt: updatedData.expiresAt?.toDate?.() || updatedData.expiresAt,
      acknowledgedAt: updatedData.acknowledgedAt?.toDate?.() || updatedData.acknowledgedAt,
      acknowledgementNotes: updatedData.acknowledgementNotes
    });

  } catch (error) {
    console.error('Error reconociendo alerta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 