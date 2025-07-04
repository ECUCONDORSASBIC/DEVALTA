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

    // Obtener datos del doctor
    const doctorRef = db.collection('doctors').doc(userId);
    const doctorDoc = await doctorRef.get();

    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor no encontrado' }, { status: 404 });
    }

    const doctorData = doctorDoc.data();

    // Obtener estadísticas de citas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsRef = db.collection('appointments');
    
    // Citas del día
    const todayAppointmentsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('date', '>=', today.toISOString().split('T')[0])
      .where('date', '<', tomorrow.toISOString().split('T')[0])
      .get();

    // Citas pendientes
    const pendingAppointmentsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('status', 'in', ['SCHEDULED', 'CONFIRMED'])
      .get();

    // Citas completadas este mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedAppointmentsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('status', '==', 'COMPLETED')
      .where('date', '>=', startOfMonth.toISOString().split('T')[0])
      .get();

    // Citas canceladas este mes
    const cancelledAppointmentsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('status', '==', 'CANCELLED')
      .where('date', '>=', startOfMonth.toISOString().split('T')[0])
      .get();

    // Sesiones de telemedicina este mes
    const telemedicineSessionsQuery = await appointmentsRef
      .where('doctorId', '==', userId)
      .where('type', '==', 'TELEMEDICINE')
      .where('date', '>=', startOfMonth.toISOString().split('T')[0])
      .get();

    // Alertas críticas no reconocidas
    const criticalAlertsQuery = await db.collection('alerts')
      .where('doctorId', '==', userId)
      .where('acknowledged', '==', false)
      .where('priority', 'in', ['HIGH', 'CRITICAL'])
      .get();

    // Pacientes totales
    const patientsQuery = await db.collection('patients')
      .where('doctorId', '==', userId)
      .where('isActive', '==', true)
      .get();

    // Calcular estadísticas
    const stats = {
      totalPatients: patientsQuery.size,
      todayAppointments: todayAppointmentsQuery.size,
      pendingAppointments: pendingAppointmentsQuery.size,
      criticalAlerts: criticalAlertsQuery.size,
      monthlyConsultations: completedAppointmentsQuery.size,
      patientSatisfactionRate: doctorData?.rating || 0,
      averageWaitTime: 15, // Mock - se calcularía con datos reales
      revenueThisMonth: completedAppointmentsQuery.size * (doctorData?.consultationFee || 0),
      completedAppointments: completedAppointmentsQuery.size,
      cancelledAppointments: cancelledAppointmentsQuery.size,
      telemedicineSessions: telemedicineSessionsQuery.size
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas del doctor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 