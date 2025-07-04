import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'API Altamedica funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: {
          register: '/api/auth/register',
          login: '/api/auth/login',
        },
        appointments: {
          list: '/api/appointments',
          create: '/api/appointments',
          update: '/api/appointments/[id]',
          cancel: '/api/appointments/[id]/status',
        },
        notifications: {
          list: '/api/v1/notifications',
          markAsRead: '/api/v1/notifications/[id]/read',
        },
      },
      database: {
        status: 'connected',
        type: 'PostgreSQL',
      },
      security: {
        jwt_enabled: true,
        cors_enabled: true,
        rate_limiting: true,
      },
    });
  } catch (error) {
    console.error('Error en endpoint de prueba:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test POST endpoint funcionando',
      received_data: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en endpoint de prueba POST:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 