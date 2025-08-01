import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck, simpleHealthCheck } from '@/lib/monitoring';
import { auditLog } from '@/lib/audit';

// GET /api/v1/health - Health check completo del sistema
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar si se solicita un check simple o completo
    const { searchParams } = new URL(req.url);
    const simple = searchParams.get('simple') === 'true';
    const format = searchParams.get('format') || 'json';

    if (simple) {
      // Health check simple y rápido
      const health = await simpleHealthCheck();
      
      return NextResponse.json({
        status: 'healthy',
        timestamp: health.timestamp,
        version: process.env.APP_VERSION || '1.0.0',
        uptime: process.uptime(),
        responseTime: Date.now() - startTime
      });
    }

    // Health check completo
    const healthResult = await performHealthCheck();
    
    // Agregar tiempo de respuesta del endpoint
    healthResult.metrics = {
      ...healthResult.metrics,
      healthCheckResponseTime: Date.now() - startTime
    };

    // Auditar acceso al health check (sin incluir datos sensibles)
    await auditLog({
      action: 'health_check_accessed',
      userId: 'system',
      resource: 'health',
      details: {
        status: healthResult.overall,
        responseTime: Date.now() - startTime,
        requestedFormat: format
      },
      category: 'system',
      severity: 'low'
    });

    // Responder según el formato solicitado
    if (format === 'prometheus') {
      return new Response(generatePrometheusMetrics(healthResult), {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Determinar código de estado HTTP según la salud del sistema
    let statusCode = 200;
    if (healthResult.overall === 'degraded') {
      statusCode = 200; // Aún operativo pero degradado
    } else if (healthResult.overall === 'unhealthy') {
      statusCode = 503; // Service unavailable
    }

    return NextResponse.json(healthResult, { status: statusCode });

  } catch (error) {
    console.error('Error in health check:', error);
    
    // Health check falló completamente
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check system failure',
      responseTime: Date.now() - startTime
    };

    await auditLog({
      action: 'health_check_failed',
      userId: 'system',
      resource: 'health',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      },
      category: 'system',
      severity: 'critical',
      success: false
    });

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// HEAD /api/v1/health - Check ultra-rápido solo para load balancers
export async function HEAD(req: NextRequest) {
  try {
    // Check mínimo - solo verificar que el servidor responde
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Verificación básica de recursos
    const memoryOk = memoryUsage.heapUsed < 1024 * 1024 * 1024; // < 1GB
    const uptimeOk = uptime > 10; // > 10 segundos
    
    if (memoryOk && uptimeOk) {
      return new Response(null, { 
        status: 200,
        headers: {
          'X-Health': 'healthy',
          'X-Uptime': uptime.toString(),
          'X-Memory': Math.round(memoryUsage.heapUsed / 1024 / 1024).toString()
        }
      });
    } else {
      return new Response(null, { 
        status: 503,
        headers: {
          'X-Health': 'unhealthy',
          'X-Uptime': uptime.toString(),
          'X-Memory': Math.round(memoryUsage.heapUsed / 1024 / 1024).toString()
        }
      });
    }
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}

// Función para generar métricas en formato Prometheus
function generatePrometheusMetrics(health: any): string {
  const metrics = [];
  
  // Métrica de estado general
  metrics.push(`# HELP altamedica_health_status Overall system health status`);
  metrics.push(`# TYPE altamedica_health_status gauge`);
  const statusValue = health.overall === 'healthy' ? 1 : health.overall === 'degraded' ? 0.5 : 0;
  metrics.push(`altamedica_health_status ${statusValue}`);
  
  // Métricas de uptime
  metrics.push(`# HELP altamedica_uptime_seconds System uptime in seconds`);
  metrics.push(`# TYPE altamedica_uptime_seconds counter`);
  metrics.push(`altamedica_uptime_seconds ${health.uptime}`);
  
  // Métricas de requests
  metrics.push(`# HELP altamedica_requests_per_minute Requests per minute`);
  metrics.push(`# TYPE altamedica_requests_per_minute gauge`);
  metrics.push(`altamedica_requests_per_minute ${health.metrics.requestsPerMinute}`);
  
  // Métricas de response time
  metrics.push(`# HELP altamedica_response_time_ms Average response time in milliseconds`);
  metrics.push(`# TYPE altamedica_response_time_ms gauge`);
  metrics.push(`altamedica_response_time_ms ${health.metrics.averageResponseTime}`);
  
  // Métricas de error rate
  metrics.push(`# HELP altamedica_error_rate_percent Error rate percentage`);
  metrics.push(`# TYPE altamedica_error_rate_percent gauge`);
  metrics.push(`altamedica_error_rate_percent ${health.metrics.errorRate}`);
  
  // Métricas de usuarios activos
  metrics.push(`# HELP altamedica_active_users Number of active users`);
  metrics.push(`# TYPE altamedica_active_users gauge`);
  metrics.push(`altamedica_active_users ${health.metrics.activeUsers}`);
  
  // Métricas por servicio
  Object.entries(health.checks).forEach(([service, check]: [string, any]) => {
    metrics.push(`# HELP altamedica_service_status Service health status`);
    metrics.push(`# TYPE altamedica_service_status gauge`);
    const serviceValue = check.status === 'healthy' ? 1 : check.status === 'degraded' ? 0.5 : 0;
    metrics.push(`altamedica_service_status{service="${service}"} ${serviceValue}`);
    
    metrics.push(`# HELP altamedica_service_response_time_ms Service response time in milliseconds`);
    metrics.push(`# TYPE altamedica_service_response_time_ms gauge`);
    metrics.push(`altamedica_service_response_time_ms{service="${service}"} ${check.responseTime}`);
  });
  
  return metrics.join('\n') + '\n';
}

// POST /api/v1/health/reset - Reset de métricas (solo para admins)
export async function POST(req: NextRequest) {
  try {
    // En producción: verificar autenticación de admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer admin-')) {
      return NextResponse.json(
        { error: 'Admin authorization required' },
        { status: 401 }
      );
    }

    const { resetMetrics } = await import('@/lib/monitoring');
    resetMetrics();

    await auditLog({
      action: 'health_metrics_reset',
      userId: 'admin',
      resource: 'health',
      details: { timestamp: new Date().toISOString() },
      category: 'system',
      severity: 'medium'
    });

    return NextResponse.json({
      success: true,
      message: 'Health metrics reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error resetting health metrics:', error);
    return NextResponse.json(
      { error: 'Failed to reset metrics' },
      { status: 500 }
    );
  }
}
