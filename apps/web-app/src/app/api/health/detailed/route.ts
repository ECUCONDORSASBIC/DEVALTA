import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: string;
  details?: string;
}

interface DetailedHealthCheck {
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    timestamp: string;
  };
  services: ServiceHealth[];
  infrastructure: {
    webApp: ServiceHealth;
    database: ServiceHealth;
    authentication: ServiceHealth;
    fileStorage: ServiceHealth;
    payments: ServiceHealth;
    notifications: ServiceHealth;
  };
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  monitoring: {
    lastIncident: string | null;
    openIncidents: number;
    scheduledMaintenance: string | null;
  };
}

async function checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
  const start = Date.now();
  
  try {
    // Simular verificación específica por servicio
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    const responseTime = Date.now() - start;
    
    // Simular diferentes estados según el servicio
    let status: ServiceHealth['status'] = 'healthy';
    let details = 'Operating normally';
    
    if (serviceName === 'payments' && Math.random() > 0.9) {
      status = 'degraded';
      details = 'Higher than normal response times';
    }
    
    return {
      name: serviceName,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
      details
    };
  } catch (error) {
    return {
      name: serviceName,
      status: 'unhealthy',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Service check failed'
    };
  }
}

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Verificar todos los servicios en paralelo
    const serviceChecks = await Promise.all([
      checkServiceHealth('web-app'),
      checkServiceHealth('database'),
      checkServiceHealth('authentication'),
      checkServiceHealth('file-storage'),
      checkServiceHealth('payments'),
      checkServiceHealth('notifications')
    ]);
    
    // Organizar resultados por infraestructura
    const infrastructure = {
      webApp: serviceChecks[0],
      database: serviceChecks[1],
      authentication: serviceChecks[2],
      fileStorage: serviceChecks[3],
      payments: serviceChecks[4],
      notifications: serviceChecks[5]
    };
    
    // Calcular métricas de rendimiento
    const totalResponseTime = Date.now() - startTime;
    const averageResponseTime = serviceChecks.reduce((sum, service) => sum + service.responseTime, 0) / serviceChecks.length;
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Calcular estado general
    const healthyCount = serviceChecks.filter(s => s.status === 'healthy').length;
    const degradedCount = serviceChecks.filter(s => s.status === 'degraded').length;
    const unhealthyCount = serviceChecks.filter(s => s.status === 'unhealthy').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }
    
    const detailedHealth: DetailedHealthCheck = {
      overall: {
        status: overallStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      services: serviceChecks,
      infrastructure,
      performance: {
        averageResponseTime: Math.round(averageResponseTime),
        totalRequests: Math.floor(Math.random() * 10000) + 1000, // Simulado
        errorRate: Math.random() * 0.1, // Simulado
        memoryUsage: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round(memoryPercentage * 100) / 100
        }
      },
      monitoring: {
        lastIncident: null, // En producción vendría de base de datos
        openIncidents: 0,
        scheduledMaintenance: null
      }
    };
    
    // Determinar código de estado HTTP
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(detailedHealth, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      overall: {
        status: 'unhealthy',
        uptime: 0,
        timestamp: new Date().toISOString()
      },
      error: 'Detailed health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}