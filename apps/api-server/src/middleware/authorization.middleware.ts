/**
 * Middleware de Autorización por Roles - AltaMedica
 * Sistema RBAC centralizado para control de acceso
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole, ROLE_PERMISSIONS } from '@altamedica/shared';
import { AppError, ErrorCodes } from '@/lib/response-helpers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Verificar token JWT y extraer información del usuario
 */
export async function verifyToken(token: string): Promise<DecodedToken> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    // Verificar que el token no haya expirado
    if (decoded.exp * 1000 < Date.now()) {
      throw new AppError('Token expirado', 401, ErrorCodes.UNAUTHORIZED);
    }
    
    // Verificar que sea un token de acceso, no de refresh
    if (decoded.type !== 'access') {
      throw new AppError('Tipo de token inválido', 401, ErrorCodes.UNAUTHORIZED);
    }
    
    return decoded;
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Token inválido', 401, ErrorCodes.UNAUTHORIZED);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expirado', 401, ErrorCodes.UNAUTHORIZED);
    }
    throw error;
  }
}

/**
 * Middleware para requerir autenticación
 */
export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Obtener token del header Authorization
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Token no proporcionado' },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      
      // Agregar información del usuario al request
      (request as any).user = decoded;
      
      return handler(request, ...args);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'No autorizado' },
        { status: error.statusCode || 401 }
      );
    }
  };
}

/**
 * Middleware para requerir roles específicos
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return function(handler: Function) {
    return requireAuth(async (request: NextRequest, ...args: any[]) => {
      try {
        const user = (request as any).user as DecodedToken;
        
        // Verificar si el usuario tiene uno de los roles permitidos
        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { 
              error: 'No tienes permisos para acceder a este recurso',
              requiredRoles: allowedRoles,
              userRole: user.role
            },
            { status: 403 }
          );
        }
        
        return handler(request, ...args);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Error de autorización' },
          { status: error.statusCode || 403 }
        );
      }
    });
  };
}

/**
 * Middleware para verificar permisos específicos
 */
export function requirePermission(permission: keyof typeof ROLE_PERMISSIONS[UserRole]) {
  return function(handler: Function) {
    return requireAuth(async (request: NextRequest, ...args: any[]) => {
      try {
        const user = (request as any).user as DecodedToken;
        const userPermissions = ROLE_PERMISSIONS[user.role];
        
        // Verificar si el usuario tiene el permiso específico
        if (!userPermissions[permission]) {
          return NextResponse.json(
            { 
              error: `No tienes permiso para: ${permission}`,
              userRole: user.role
            },
            { status: 403 }
          );
        }
        
        return handler(request, ...args);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Error de autorización' },
          { status: error.statusCode || 403 }
        );
      }
    });
  };
}

/**
 * Middleware para permitir al usuario o admin
 * Útil para endpoints donde un usuario puede acceder a sus propios recursos
 */
export function requireOwnerOrAdmin(getUserId: (request: NextRequest) => string) {
  return function(handler: Function) {
    return requireAuth(async (request: NextRequest, ...args: any[]) => {
      try {
        const user = (request as any).user as DecodedToken;
        const resourceUserId = getUserId(request);
        
        // Permitir si es el dueño del recurso o es admin
        const isOwner = user.uid === resourceUserId;
        const isAdmin = user.role === UserRole.PLATFORM_ADMIN;
        
        if (!isOwner && !isAdmin) {
          return NextResponse.json(
            { 
              error: 'No tienes permisos para acceder a este recurso',
              userRole: user.role
            },
            { status: 403 }
          );
        }
        
        return handler(request, ...args);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Error de autorización' },
          { status: error.statusCode || 403 }
        );
      }
    });
  };
}

/**
 * Obtener el usuario actual del request
 * Útil para usar dentro de los handlers
 */
export function getCurrentUser(request: NextRequest): DecodedToken | null {
  return (request as any).user || null;
}

/**
 * Decorador para aplicar múltiples middlewares
 */
export function compose(...middlewares: Function[]) {
  return function(handler: Function) {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}