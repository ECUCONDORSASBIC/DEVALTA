/**
 * 🩺 TELEMEDICINE SESSIONS API - INDIVIDUAL SESSION
 * Endpoints para gestionar una sesión de telemedicina específica.
 * GET, PUT, DELETE /api/v1/telemedicine/sessions/[id]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { telemedicineSessionService, TelemedicineSessionSchema } from '@/services/telemedicine-session.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una sesión de telemedicina por su ID.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const session = await telemedicineSessionService.findById(params.id, authContext.user!);

      if (!session) {
        return NextResponse.json(
          createErrorResponse('Sesión de telemedicina no encontrada o sin permisos.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(session));
    } catch (error: unknown) {
      console.error(`Error en GET /telemedicine/sessions/${(params as any)?.id}:`, error);
      return NextResponse.json(
        createErrorResponse('Error al obtener la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin'],
    auditAction: 'telemedicine_session_read',
  }
);

/**
 * @summary Actualiza una sesión de telemedicina.
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = TelemedicineSessionSchema.partial().parse(body);

      const updatedSession = await telemedicineSessionService.update(params.id, validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedSession));
    } catch (error: unknown) {
      console.error(`Error en PUT /telemedicine/sessions/${(params as any)?.id}:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return NextResponse.json(
          createErrorResponse('Sesión no encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para modificar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Error al actualizar la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'admin'],
    auditAction: 'telemedicine_session_update',
  }
);

/**
 * @summary Elimina (cancela) una sesión de telemedicina.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id:string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const success = await telemedicineSessionService.delete(params.id, authContext.user!);

      if (!success) {
        return NextResponse.json(
          createErrorResponse('Sesión no encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Sesión de telemedicina cancelada exitosamente.',
        id: params.id
      }));
    } catch (error: unknown) {
      console.error(`Error en DELETE /telemedicine/sessions/${(params as any)?.id}:`, error);
      
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para eliminar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Error al cancelar la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'], // Solo administradores pueden borrar/cancelar sesiones
    auditAction: 'telemedicine_session_delete',
  }
);