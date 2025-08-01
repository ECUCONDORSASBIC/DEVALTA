/**
 * 🏥 MEDICAL RECORDS API - INDIVIDUAL RECORD
 * Endpoints para gestionar una historia clínica específica.
 * GET, PUT, DELETE /api/v1/medical-records/[id]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { medicalRecordService, MedicalRecordSchema } from '@/services/medical-record.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una historia clínica por su ID.
 * @description Recupera los detalles completos de una historia clínica, incluyendo
 * datos poblados del doctor y paciente de forma optimizada.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const record = await medicalRecordService.findById(params.id, authContext.user!);

      if (!record) {
        return NextResponse.json(
          createErrorResponse('Historia clínica no encontrada o sin permisos para verla.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(record));
    } catch (error: unknown) {
      console.error(`Error en GET /medical-records/${(params as any)?.id}:`, error);
      return NextResponse.json(
        createErrorResponse('Error al obtener la historia clínica.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin'],
    auditAction: 'medical_record_read',
  }
);

/**
 * @summary Actualiza una historia clínica.
 * @description Modifica los campos de una historia clínica existente.
 * Solo el doctor que la creó o un administrador pueden modificarla.
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      // Validar solo los campos que se pueden actualizar.
      const validatedData = MedicalRecordSchema.partial().parse(body);

      const updatedRecord = await medicalRecordService.update(params.id, validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedRecord));
    } catch (error: unknown) {
      console.error(`Error en PUT /medical-records/${(params as any)?.id}:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return NextResponse.json(
          createErrorResponse('Historia clínica no encontrada.', 'NOT_FOUND'),
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
        createErrorResponse('Error al actualizar la historia clínica.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'admin'],
    auditAction: 'medical_record_update',
  }
);

/**
 * @summary Elimina (archiva) una historia clínica.
 * @description Realiza un borrado lógico de la historia clínica, marcándola como 'archivada'.
 * Solo el doctor que la creó o un administrador pueden eliminarla.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id:string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const success = await medicalRecordService.delete(params.id, authContext.user!);

      if (!success) {
        return NextResponse.json(
          createErrorResponse('Historia clínica no encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Historia clínica archivada exitosamente.',
        id: params.id
      }));
    } catch (error: unknown) {
      console.error(`Error en DELETE /medical-records/${(params as any)?.id}:`, error);
      
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para eliminar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Error al eliminar la historia clínica.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'admin'],
    auditAction: 'medical_record_delete',
  }
);