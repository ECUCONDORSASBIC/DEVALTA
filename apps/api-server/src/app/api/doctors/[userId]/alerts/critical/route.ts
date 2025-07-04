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

    // Verificar que el usuario accede a sus propios datos
    if (user.uid !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener alertas críticas no reconocidas
    const alertsRef = db.collection('alerts');
    const alertsQuery = await alertsRef
      .where('doctorId', '==', userId)
      .where('acknowledged', '==', false)
      .where('priority', 'in', ['HIGH', 'CRITICAL'])
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    // Procesar alertas
    const alerts = [];
    for (const doc of alertsQuery.docs) {
      const alertData = doc.data();
      
      // Obtener datos del paciente si existe
      let patientName = '';
      if (alertData.patientId) {
        const patientDoc = await db.collection('patients').doc(alertData.patientId).get();
        if (patientDoc.exists) {
          const patientData = patientDoc.data();
          patientName = patientData.fullName || '';
        }
      }

      alerts.push({
        id: doc.id,
        type: alertData.type || 'SYSTEM',
        patientId: alertData.patientId,
        patientName: patientName,
        message: alertData.message || '',
        description: alertData.description || '',
        timestamp: alertData.timestamp?.toDate?.() || alertData.timestamp,
        priority: alertData.priority || 'MEDIUM',
        acknowledged: alertData.acknowledged || false,
        actionRequired: alertData.actionRequired || false,
        actionUrl: alertData.actionUrl,
        expiresAt: alertData.expiresAt?.toDate?.() || alertData.expiresAt
      });
    }

    return NextResponse.json(alerts);

  } catch (error) {
    console.error('Error obteniendo alertas críticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 