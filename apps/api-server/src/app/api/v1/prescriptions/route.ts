/**
 * 💊 PRESCRIPTIONS API - COLLECTION
 * Endpoints para gestionar la colección de recetas médicas.
 * GET, POST /api/v1/prescriptions
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { prescriptionService, PrescriptionSchema } from '@/services/prescription.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Lista las recetas médicas.
 * @description Devuelve una lista paginada de recetas. Los pacientes solo ven las suyas,
 * los doctores solo las que emitieron, y los admins tienen acceso total.
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
          patientId: searchParams.get('patientId'),
          status: searchParams.get('status'),
        }
      };

      const result = await prescriptionService.findMany(queryOptions, authContext.user!);

      return NextResponse.json(createSuccessResponse(result.data, { pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
      }}));

    } catch (error: unknown) {
      console.error('Error en GET /prescriptions:', error);
      return NextResponse.json(
        createErrorResponse('Error al obtener las recetas.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin'],
    auditAction: 'prescriptions_list',
  }
);

/**
 * @summary Crea una nueva receta médica.
 * @description Registra una nueva receta en el sistema. Requiere rol de 'doctor'.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = PrescriptionSchema.parse(body);

      const newPrescription = await prescriptionService.create(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(newPrescription), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /prescriptions:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para crear recetas.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al crear la receta.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor'],
    auditAction: 'prescription_create',
  }
);