/**
 * 💊 PRESCRIPTIONS API - INDIVIDUAL PRESCRIPTION
 * Endpoints para gestionar una prescripción médica específica.
 * GET, PUT, DELETE /api/v1/prescriptions/[id]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { prescriptionService, PrescriptionSchema } from '@/services/prescription.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una prescripción por su ID.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const prescription = await prescriptionService.findById(params.id, authContext.user!);

      if (!prescription) {
        return NextResponse.json(
          createErrorResponse('Prescripción no encontrada o sin permisos para verla.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse(prescription));
    } catch (error: unknown) {
      console.error(`Error en GET /prescriptions/${(params as any)?.id}:`, error);
      return NextResponse.json(
        createErrorResponse('Error al obtener la prescripción.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin'],
    auditAction: 'prescription_read',
  }
);

/**
 * @summary Actualiza una prescripción.
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = PrescriptionSchema.partial().parse(body);

      const updatedPrescription = await prescriptionService.update(params.id, validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedPrescription));
    } catch (error: unknown) {
      console.error(`Error en PUT /prescriptions/${(params as any)?.id}:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return NextResponse.json(
          createErrorResponse('Prescripción no encontrada.', 'NOT_FOUND'),
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
        createErrorResponse('Error al actualizar la prescripción.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'admin'],
    auditAction: 'prescription_update',
  }
);

/**
 * @summary Elimina (cancela) una prescripción.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id:string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const success = await prescriptionService.delete(params.id, authContext.user!);

      if (!success) {
        return NextResponse.json(
          createErrorResponse('Prescripción no encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Prescripción cancelada exitosamente.',
        id: params.id
      }));
    } catch (error: unknown) {
      console.error(`Error en DELETE /prescriptions/${(params as any)?.id}:`, error);
      
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para eliminar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Error al cancelar la prescripción.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'admin'],
    auditAction: 'prescription_delete',
  }
);
