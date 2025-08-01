/**
 * 🧑‍⚕️ PATIENTS API - MEDICAL RECORDS
 * Endpoint para obtener los registros médicos de un paciente.
 * GET /api/v1/patients/[id]/records
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { patientService } from '@/services/patient.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene los registros médicos de un paciente.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
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

      const result = await patientService.getRecordsForPatient(params.id, queryOptions, authContext.user!);

      return NextResponse.json(createSuccessResponse(result.data, { pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
      }}));

    } catch (error: unknown) {
      console.error(`Error en GET /patients/${(params as any)?.id}/records:`, error);
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para ver estos registros.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener los registros del paciente.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient'],
    auditAction: 'patient_records_list',
  }
);