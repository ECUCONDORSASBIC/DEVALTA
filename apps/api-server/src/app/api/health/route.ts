import { NextRequest, NextResponse } from 'next/server';
import { captureMessage } from '@/lib/sentry';

export async function GET(request: NextRequest) {
  try {
    // Capturar métrica de health check
    captureMessage('Health check realizado', 'info', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'healthy', // TODO: Verificar conexión real
        redis: 'healthy',    // TODO: Verificar conexión real
        sentry: process.env.SENTRY_DSN ? 'configured' : 'not-configured',
      },
    };

    return NextResponse.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    // Capturar error en Sentry
    captureMessage('Health check falló', 'error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 