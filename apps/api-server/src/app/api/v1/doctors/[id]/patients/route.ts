/**
 * 👨‍⚕️ DOCTORS API - PATIENTS LIST
 * Endpoint para obtener la lista de pacientes de un doctor.
 * GET /api/v1/doctors/[id]/patients
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { doctorService } from '@/services/doctor.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene la lista de pacientes de un doctor.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const patients = await doctorService.getPatients(params.id, authContext.user!);

      return NextResponse.json(createSuccessResponse(patients));
    } catch (error: unknown) {
      console.error(`Error en GET /doctors/${(params as any)?.id}/patients:`, error);
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return NextResponse.json(createErrorResponse('Doctor no encontrado.', 'NOT_FOUND'), { status: 404 });
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(createErrorResponse('No tiene permisos para ver esta lista de pacientes.', 'FORBIDDEN'), { status: 403 });
        }
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener la lista de pacientes.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'doctor_patients_list',
  }
);