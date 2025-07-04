import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verificar autenticación
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Verificar que el usuario accede a sus propios datos
    if (user.uid !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener actividad reciente
    const activityRef = db.collection('activity');
    const activityQuery = await activityRef
      .where('doctorId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    // Procesar actividad
    const activities = [];
    for (const doc of activityQuery.docs) {
      const activityData = doc.data();
      
      // Obtener datos del paciente si existe
      let patientName = '';
      if (activityData.patientId) {
        const patientDoc = await db.collection('patients').doc(activityData.patientId).get();
        if (patientDoc.exists) {
          const patientData = patientDoc.data();
          patientName = patientData.fullName || '';
        }
      }

      activities.push({
        id: doc.id,
        type: activityData.type || 'SYSTEM',
        description: activityData.description || '',
        timestamp: activityData.timestamp?.toDate?.() || activityData.timestamp,
        patientId: activityData.patientId,
        patientName: patientName,
        appointmentId: activityData.appointmentId,
        relatedEntity: activityData.relatedEntity,
        metadata: activityData.metadata || {}
      });
    }

    return NextResponse.json(activities);

  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 