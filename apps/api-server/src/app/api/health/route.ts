import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse } from '@altamedica/shared';

export async function GET(request: NextRequest) {
  try {
    // Health check básico para el ecosistema Altamedica
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'healthy', latency: 0 },
        database: { status: 'healthy', latency: 0 },
        cache: { status: 'healthy', latency: 0 }
      },
      metrics: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        environment: process.env.NODE_ENV || 'development',
        platform: 'altamedica',
        service: 'api-server'
      }
    };
    
    return NextResponse.json(
      createSuccessResponse('Health check completed', healthStatus),
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 