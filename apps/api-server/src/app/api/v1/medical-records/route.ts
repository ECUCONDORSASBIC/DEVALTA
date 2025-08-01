/**
 * 🏥 MEDICAL RECORDS API - COLLECTION
 * Endpoints para gestionar la colección de historias clínicas.
 * GET, POST /api/v1/medical-records
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { medicalRecordService, MedicalRecordSchema } from '@/services/medical-record.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Lista las historias clínicas.
 * @description Devuelve una lista paginada de historias clínicas. Los pacientes solo pueden
 * ver sus propios registros, mientras que los doctores y administradores tienen una vista más amplia.
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
          doctorId: searchParams.get('doctorId'),
          type: searchParams.get('type'),
          // El servicio se encargará de restringir el acceso si el rol no es admin/doctor
        }
      };

      const result = await medicalRecordService.findMany(queryOptions, authContext.user!);

      return NextResponse.json(createSuccessResponse(result.data, { pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
      }}));

    } catch (error: unknown) {
      console.error('Error en GET /medical-records:', error);
      return NextResponse.json(
        createErrorResponse('Error al obtener las historias clínicas.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient', 'admin'],
    auditAction: 'medical_records_list',
  }
);

/**
 * @summary Crea una nueva historia clínica.
 * @description Registra una nueva historia clínica en el sistema. Requiere rol de 'doctor'.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = MedicalRecordSchema.parse(body);

      const newRecord = await medicalRecordService.create(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(newRecord), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /medical-records:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para crear historias clínicas.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al crear la historia clínica.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor'],
    auditAction: 'medical_record_create',
  }
);