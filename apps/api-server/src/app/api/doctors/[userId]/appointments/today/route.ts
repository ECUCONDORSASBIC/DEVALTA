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

    // Obtener fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener citas del día
    const appointmentsRef = db.collection('appointments');
    const appointmentsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('date', '>=', today.toISOString().split('T')[0])
      .where('date', '<', tomorrow.toISOString().split('T')[0])
      .orderBy('time', 'asc')
      .get();

    // Obtener datos de pacientes para las citas
    const appointments = [];
    for (const doc of appointmentsQuery.docs) {
      const appointmentData = doc.data();
      
      // Obtener datos del paciente
      let patientData = {};
      if (appointmentData.patientId) {
        const patientDoc = await db.collection('patients').doc(appointmentData.patientId).get();
        if (patientDoc.exists) {
          patientData = patientDoc.data();
        }
      }

      appointments.push({
        id: doc.id,
        patientId: appointmentData.patientId,
        patientName: patientData.fullName || appointmentData.patientName || 'Paciente',
        patientEmail: patientData.email || appointmentData.patientEmail || '',
        patientPhone: patientData.phoneNumber || appointmentData.patientPhone || '',
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || 30,
        type: appointmentData.type || 'IN_PERSON',
        status: appointmentData.status || 'SCHEDULED',
        specialty: appointmentData.specialty || 'General',
        reason: appointmentData.reason || '',
        notes: appointmentData.notes || '',
        isUrgent: appointmentData.isUrgent || false,
        telemedicineUrl: appointmentData.telemedicineUrl,
        createdAt: appointmentData.createdAt?.toDate?.() || appointmentData.createdAt,
        updatedAt: appointmentData.updatedAt?.toDate?.() || appointmentData.updatedAt
      });
    }

    return NextResponse.json(appointments);

  } catch (error) {
    console.error('Error obteniendo citas del día:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 