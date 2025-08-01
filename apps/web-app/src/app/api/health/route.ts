import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function checkDatabaseHealth(): Promise<{ status: string; responseTime: number }> {
  const start = Date.now();
  try {
    // Simular verificación de base de datos
    // En producción aquí harías una consulta real a Firebase/Firestore
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start
    };
  }
}

async function checkExternalServices(): Promise<{ [key: string]: { status: string; responseTime: number } }> {
  const start = Date.now();
  
  // Simular verificación de servicios externos
  const services = {
    firebase: { status: 'healthy', responseTime: 45 },
    mercadopago: { status: 'healthy', responseTime: 120 },
    cloudinary: { status: 'healthy', responseTime: 80 }
  };
  
  return services;
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Verificar componentes del sistema
    const [dbHealth, externalServices] = await Promise.all([
      checkDatabaseHealth(),
      checkExternalServices()
    ]);
    
    // Calcular estado general
    const allServicesHealthy = dbHealth.status === 'healthy' && 
      Object.values(externalServices).every(service => service.status === 'healthy');
    
    const overallStatus = allServicesHealthy ? 'healthy' : 'unhealthy';
    const totalResponseTime = Date.now() - startTime;
    
    const healthCheck = {
      status: overallStatus,
      service: 'altamedica-web-app',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev-1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      checks: {
        database: dbHealth,
        externalServices,
        api: {
          status: 'healthy',
          responseTime: totalResponseTime
        }
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external
        }
      },
      metrics: {
        totalResponseTime,
        servicesChecked: Object.keys(externalServices).length + 2, // DB + API + external services
        healthyServices: allServicesHealthy ? Object.keys(externalServices).length + 2 : 0
      }
    };
    
    // Devolver código HTTP apropiado
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status: statusCode });
    
  } catch (error) {
    // En caso de error crítico
    return NextResponse.json({
      status: 'unhealthy',
      service: 'altamedica-web-app',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev-1.0.0',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}