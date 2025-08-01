/**
 * 👨‍⚕️ DOCTORS API - AVAILABILITY
 * Endpoints para gestionar la disponibilidad de un doctor.
 * GET, PUT /api/v1/doctors/[id]/availability
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { doctorService, AvailabilitySchema } from '@/services/doctor.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene la disponibilidad de un doctor.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const availability = await doctorService.getAvailability(params.id, authContext.user!);

      return NextResponse.json(createSuccessResponse(availability));
    } catch (error: unknown) {
      console.error(`Error en GET /doctors/${(params as any)?.id}/availability:`, error);
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return NextResponse.json(createErrorResponse('Doctor no encontrado.', 'NOT_FOUND'), { status: 404 });
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener la disponibilidad.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin', 'company', 'nurse'],
    auditAction: 'doctor_availability_read',
  }
);

/**
 * @summary Actualiza la disponibilidad de un doctor.
 * @handler PUT
 * @protected
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = AvailabilitySchema.parse(body);

      const updatedAvailability = await doctorService.updateAvailability(params.id, validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(updatedAvailability));
    } catch (error: unknown) {
      console.error(`Error en PUT /doctors/${(params as any)?.id}/availability:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return NextResponse.json(createErrorResponse('Doctor no encontrado.', 'NOT_FOUND'), { status: 404 });
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(createErrorResponse('No tiene permisos para actualizar esta disponibilidad.', 'FORBIDDEN'), { status: 403 });
        }
      }

      return NextResponse.json(
        createErrorResponse('Error al actualizar la disponibilidad.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'doctor_availability_update',
  }
);