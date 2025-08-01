import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: authResult.statusCode || 401 });
    }

    // Verificar que el usuario es administrador
    const hasAdminRole = authResult.user.roles.includes('admin') || authResult.user.roles.includes('ADMIN');
    if (!hasAdminRole) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador' }, { status: 403 });
    }

    // Obtener métricas del sistema
    const startTime = Date.now();
    
    // Verificar conectividad a Firestore
    const firestoreTest = await db.collection('system_health').doc('test').get();
    const responseTime = Date.now() - startTime;

    // Obtener estadísticas básicas
    const [
      usersCount,
      appointmentsCount,
      alertsCount
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('appointments').count().get(),
      db.collection('alerts').where('acknowledged', '==', false).count().get()
    ]);

    // Determinar estado del sistema
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' = 'HEALTHY';
    const issues = [];

    // Verificar tiempo de respuesta
    if (responseTime > 5000) {
      status = 'CRITICAL';
      issues.push({
        id: 'response_time',
        type: 'ERROR',
        message: 'Tiempo de respuesta muy alto',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (responseTime > 2000) {
      status = 'WARNING';
      issues.push({
        id: 'response_time',
        type: 'WARNING',
        message: 'Tiempo de respuesta elevado',
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Verificar alertas críticas
    if (alertsCount.data().count > 10) {
      status = status === 'HEALTHY' ? 'WARNING' : status;
      issues.push({
        id: 'critical_alerts',
        type: 'WARNING',
        message: `${alertsCount.data().count} alertas críticas sin resolver`,
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Verificar carga del sistema
    const totalRecords = usersCount.data().count + appointmentsCount.data().count;
    if (totalRecords > 10000) {
      status = status === 'HEALTHY' ? 'WARNING' : status;
      issues.push({
        id: 'system_load',
        type: 'INFO',
        message: 'Alto volumen de datos en el sistema',
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Calcular uptime (mock - en producción se obtendría de un servicio de monitoreo)
    const uptime = 99.9; // Porcentaje de uptime

    const health = {
      status,
      uptime,
      responseTime,
      issues,
      lastCheck: new Date().toISOString(),
      metrics: {
        totalUsers: usersCount.data().count,
        totalAppointments: appointmentsCount.data().count,
        pendingAlerts: alertsCount.data().count,
        databaseConnections: 1, // Mock
        activeSessions: Math.floor(Math.random() * 100) + 50 // Mock
      }
    };

    return NextResponse.json(health);

  } catch (error) {
    console.error('Error obteniendo salud del sistema:', error);
    
    // Retornar estado crítico si hay error
    return NextResponse.json({
      status: 'CRITICAL',
      uptime: 0,
      responseTime: 0,
      issues: [{
        id: 'system_error',
        type: 'ERROR',
        message: 'Error al verificar la salud del sistema',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        resolved: false
      }],
      lastCheck: new Date().toISOString(),
      metrics: {
        totalUsers: 0,
        totalAppointments: 0,
        pendingAlerts: 0,
        databaseConnections: 0,
        activeSessions: 0
      }
    });
  }
} 