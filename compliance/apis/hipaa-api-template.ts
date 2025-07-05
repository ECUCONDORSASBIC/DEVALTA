/**
 * Template de Compliance HIPAA para APIs
 * Altamedica - API Security Template
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { encryptData, decryptData } from '@/lib/encryption';
import { auditLog } from '@/lib/audit';
import { validateInput, sanitizeData } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

// Configuración de seguridad
const SECURITY_CONFIG = {
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutos
  rateLimitMax: 100 // 100 requests por ventana
};

// Middleware de autenticación HIPAA
export async function authenticateRequest(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'Token de autenticación requerido', status: 401 };
    }
    
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwtSecret);
    
    // Verificar roles y permisos
    if (!decoded.roles || !decoded.roles.includes('medical_staff')) {
      return { error: 'Permisos insuficientes', status: 403 };
    }
    
    // Log de auditoría
    await auditLog({
      action: 'API_ACCESS',
      userId: decoded.userId,
      endpoint: req.url,
      timestamp: new Date().toISOString()
    });
    
    return { user: decoded, status: 200 };
  } catch (error) {
    return { error: 'Token inválido', status: 401 };
  }
}

// Función principal de la API
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, SECURITY_CONFIG);
    if (rateLimitResult.blocked) {
      return NextResponse.json(
        { error: 'Rate limit excedido' },
        { status: 429 }
      );
    }
    
    // Autenticación
    const authResult = await authenticateRequest(req);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Validación de inputs
    const { searchParams } = new URL(req.url);
    const validatedParams = validateInput(searchParams);
    if (!validatedParams.valid) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validatedParams.errors },
        { status: 400 }
      );
    }
    
    // Lógica de la API (aquí iría tu lógica original)
    const data = {
      // Tu lógica aquí
    };
    
    // Encriptar datos sensibles antes de enviar
    const encryptedData = encryptData(data, SECURITY_CONFIG.encryptionKey);
    
    // Headers de seguridad
    const response = NextResponse.json({ data: encryptedData });
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return response;
    
  } catch (error) {
    // Log de error
    await auditLog({
      action: 'API_ERROR',
      error: error.message,
      endpoint: req.url,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, SECURITY_CONFIG);
    if (rateLimitResult.blocked) {
      return NextResponse.json(
        { error: 'Rate limit excedido' },
        { status: 429 }
      );
    }
    
    // Autenticación
    const authResult = await authenticateRequest(req);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Obtener y validar body
    const body = await req.json();
    const validatedBody = validateInput(body);
    if (!validatedBody.valid) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedBody.errors },
        { status: 400 }
      );
    }
    
    // Sanitizar datos
    const sanitizedData = sanitizeData(validatedBody.data);
    
    // Lógica de la API (aquí iría tu lógica original)
    const result = {
      // Tu lógica aquí
    };
    
    // Log de auditoría
    await auditLog({
      action: 'DATA_CREATED',
      userId: authResult.user.userId,
      endpoint: req.url,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    await auditLog({
      action: 'API_ERROR',
      error: error.message,
      endpoint: req.url,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
