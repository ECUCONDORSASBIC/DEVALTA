import { NextRequest, NextResponse } from 'next/server';
import { applyCorsHeaders } from '@/config/cors.config';

/**
 * Ejemplo de cómo aplicar CORS en una API route de Next.js
 */

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Esta es una respuesta con CORS configurado',
    timestamp: new Date().toISOString(),
  });

  // Aplicar headers CORS
  const origin = request.headers.get('origin');
  if (origin) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
    ];

    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  const origin = request.headers.get('origin');
  if (origin) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
    ];

    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
  }

  return response;
}