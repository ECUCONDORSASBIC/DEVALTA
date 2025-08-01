/**
 * 🔔 NOTIFICATIONS API - INDIVIDUAL NOTIFICATION
 * Endpoints para gestionar una notificación específica.
 * GET, PUT, DELETE /api/v1/notifications/[id]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { notificationService, NotificationSchema } from '@/services/notification.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una notificación por su ID.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const notification = await notificationService.findById(params.id, authContext.user!);

      if (!notification) {
        return NextResponse.json(
          createErrorResponse('Notificación no encontrada o sin permisos.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(notification));
    } catch (error: unknown) {
      console.error(`Error en GET /notifications/${(params as any)?.id}:`, error);
      return NextResponse.json(
        createErrorResponse('Error al obtener la notificación.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'notification_read',
  }
);

/**
 * @summary Actualiza el estado de una notificación (ej. marcar como leída).
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      // Solo permitimos la actualización del estado.
      const validatedData = NotificationSchema.pick({ status: true }).parse(body);

      const updatedNotification = await notificationService.update(params.id, validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedNotification));
    } catch (error: unknown) {
      console.error(`Error en PUT /notifications/${(params as any)?.id}:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos. Solo se puede actualizar el "status".', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return NextResponse.json(
          createErrorResponse('Notificación no encontrada.', 'NOT_FOUND'),
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
        createErrorResponse('Error al actualizar la notificación.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'notification_update',
  }
);

/**
 * @summary Elimina (archiva) una notificación.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id:string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const success = await notificationService.delete(params.id, authContext.user!);

      if (!success) {
        return NextResponse.json(
          createErrorResponse('Notificación no encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Notificación archivada exitosamente.',
        id: params.id
      }));
    } catch (error: unknown) {
      console.error(`Error en DELETE /notifications/${(params as any)?.id}:`, error);
      
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para eliminar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Error al archivar la notificación.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'notification_delete',
  }
);