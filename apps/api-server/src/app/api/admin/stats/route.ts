import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es administrador
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.role !== 'ADMIN' && !userData?.isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador' }, { status: 403 });
    }

    // Obtener estadísticas del sistema
    const [
      usersSnapshot,
      doctorsSnapshot,
      patientsSnapshot,
      companiesSnapshot,
      appointmentsSnapshot,
      alertsSnapshot
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('doctors').get(),
      db.collection('patients').get(),
      db.collection('companies').get(),
      db.collection('appointments').get(),
      db.collection('alerts').where('acknowledged', '==', false).get()
    ]);

    // Calcular estadísticas
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'ACTIVE').length;
    const pendingApprovals = usersSnapshot.docs.filter(doc => doc.data().status === 'PENDING').length;
    const criticalAlerts = alertsSnapshot.docs.filter(doc => 
      doc.data().priority === 'CRITICAL' || doc.data().priority === 'HIGH'
    ).length;

    // Calcular ingresos (mock - se calcularía con datos reales de pagos)
    const totalRevenue = appointmentsSnapshot.docs.reduce((total, doc) => {
      const appointment = doc.data();
      if (appointment.status === 'COMPLETED') {
        return total + (appointment.consultationFee || 0);
      }
      return total;
    }, 0);

    // Calcular crecimiento mensual (mock)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthUsers = usersSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt >= lastMonth;
    }).length;

    const monthlyGrowth = lastMonth > 0 ? ((lastMonthUsers / lastMonth) * 100) : 0;

    // Obtener incidentes de seguridad (mock)
    const securityIncidents = 0; // Se calcularía con logs de auditoría

    // Calcular uptime del sistema (mock)
    const systemUptime = 99.9; // Porcentaje de uptime

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals,
      criticalAlerts,
      systemUptime,
      totalRevenue,
      monthlyGrowth,
      securityIncidents,
      totalDoctors: doctorsSnapshot.size,
      totalPatients: patientsSnapshot.size,
      totalCompanies: companiesSnapshot.size
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas administrativas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 