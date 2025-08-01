/**
 * 🔐 AUTH API - ME
 * Endpoint para obtener el perfil del usuario autenticado.
 * GET /api/v1/auth/me
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { userService } from '@/services/user.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene el perfil del usuario actual.
 * @description Devuelve el perfil completo del usuario que realiza la petición,
 * incluyendo su perfil de rol específico (doctor, paciente, etc.).
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      
      const userProfile = await userService.getMe(authContext.user!);

      if (!userProfile) {
        return NextResponse.json(
          createErrorResponse('Perfil de usuario no encontrado.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(userProfile));

    } catch (error: unknown) {
      console.error('Error en GET /auth/me:', error);
      return NextResponse.json(
        createErrorResponse('Error al obtener el perfil del usuario.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    // Todos los roles autenticados pueden acceder a su propio perfil.
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'user_get_me',
  }
);