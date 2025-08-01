/**
 * 🔔 NOTIFICATIONS API - COLLECTION
 * Endpoints para gestionar colecciones de notificaciones.
 * GET, POST, PATCH /api/notifications
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { notificationService, CreateNotificationSchema, MarkReadSchema } from '@/services/notification.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene las notificaciones del usuario autenticado.
 * @description Recupera una lista paginada de notificaciones, con opción de filtrar.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const { searchParams } = new URL(request.url);
      
      const queryOptions = {
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        filters: {
          type: searchParams.get('type'),
          status: searchParams.get('status'),
        }
      };

      const result = await notificationService.findMany(queryOptions, authContext.user!);

      return NextResponse.json(createSuccessResponse(result.data, { pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
      }}));

    } catch (error: unknown) {
      console.error('Error en GET /notifications:', error);
      return NextResponse.json(
        createErrorResponse('Error al obtener las notificaciones.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'notifications_list',
  }
);

/**
 * @summary Crea y envía una o más notificaciones.
 * @description Permite a un servicio o usuario autorizado enviar notificaciones a múltiples destinatarios.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = CreateNotificationSchema.parse(body);

      // Solo ciertos roles pueden crear notificaciones para otros.
      if (authContext.user!.role !== 'admin' && authContext.user!.role !== 'system') {
          // Si no es admin, solo puede enviarse a sí mismo (si la lógica lo permitiera).
          // Por ahora, restringimos la creación a roles de sistema/admin.
          // Esta es una regla de negocio que podría cambiar.
          if (validatedData.recipients.some(id => id !== authContext.user!.uid)) {
              throw new Error('FORBIDDEN');
          }
      }

      const result = await notificationService.create(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(result), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /notifications:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
       if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para enviar notificaciones a otros usuarios.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al crear la notificación.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    // Se restringe quién puede crear notificaciones masivas.
    allowedRoles: ['admin', 'system'], // Asumiendo un rol de 'system' para servicios internos
    auditAction: 'notification_create',
  }
);

/**
 * @summary Marca un lote de notificaciones como leídas, no leídas o archivadas.
 * @handler PATCH
 * @protected
 */
export const PATCH = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();

      const validatedData = MarkReadSchema.parse(body);
      
      const updatedCount = await notificationService.markManyAs(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse({ updatedCount }));

    } catch (error: unknown) {
      console.error('Error en PATCH /notifications:', error);
       if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al actualizar las notificaciones.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'notifications_mark_read',
  }
); 