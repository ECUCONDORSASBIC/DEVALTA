import { NextRequest, NextResponse } from 'next/server';

// GET /api/test - Endpoint básico de prueba
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API Server funcionando correctamente',
    version: '1.0.0',
    uptime: process.uptime()
  });
}

// POST /api/test - Test con datos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: 'ok',
      received: body,
      echo: 'Datos recibidos correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Error procesando datos',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}