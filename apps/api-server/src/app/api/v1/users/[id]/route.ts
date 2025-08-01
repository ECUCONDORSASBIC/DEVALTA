/**
 * 👤 USERS API - INDIVIDUAL USER
 * Endpoints para gestionar un usuario específico.
 * GET, PUT, DELETE /api/v1/users/[id]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { userService, UserUpdateSchema, AdminUserUpdateSchema } from '@/services/user.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene el perfil de un usuario por su ID.
 * @description Un usuario solo puede ver su propio perfil, a menos que sea un administrador.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const user = await userService.findById(params.id, authContext.user!);

      if (!user) {
        return NextResponse.json(
          createErrorResponse('Usuario no encontrado.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(user));
    } catch (error: unknown) {
      console.error(`Error en GET /users/${(params as any)?.id}:`, error);
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para ver este perfil.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener el usuario.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    // Se permite a todos los roles autenticados intentar, el servicio aplica la lógica de negocio.
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'user_profile_read',
  }
);

/**
 * @summary Actualiza el perfil de un usuario.
 * @description Un usuario puede actualizar su propio perfil. Un admin puede actualizar más campos.
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      // La validación se realiza dentro del servicio según el rol.
      const updatedUser = await userService.update(params.id, body, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedUser));
    } catch (error: unknown) {
      console.error(`Error en PUT /users/${(params as any)?.id}:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return NextResponse.json(createErrorResponse('Usuario no encontrado.', 'NOT_FOUND'), { status: 404 });
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(createErrorResponse('No tiene permisos para actualizar este usuario.', 'FORBIDDEN'), { status: 403 });
        }
      }

      return NextResponse.json(
        createErrorResponse('Error al actualizar el usuario.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'user_profile_update',
  }
);

/**
 * @summary Desactiva (borrado lógico) un usuario.
 * @description Solo los administradores pueden desactivar usuarios.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id:string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const success = await userService.delete(params.id, authContext.user!);

      if (!success) {
        return NextResponse.json(
          createErrorResponse('Usuario no encontrado.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Usuario desactivado exitosamente.',
        id: params.id
      }));
    } catch (error: unknown) {
      console.error(`Error en DELETE /users/${(params as any)?.id}:`, error);
      
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
            return NextResponse.json(createErrorResponse('No tiene permisos para desactivar usuarios.', 'FORBIDDEN'), { status: 403 });
        }
        if (error.message.includes('BAD_REQUEST')) {
            return NextResponse.json(createErrorResponse(error.message, 'BAD_REQUEST'), { status: 400 });
        }
      }

      return NextResponse.json(
        createErrorResponse('Error al desactivar el usuario.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'],
    auditAction: 'user_deactivate',
  }
);