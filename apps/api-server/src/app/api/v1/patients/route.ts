/**
 * 🧑‍⚕️ PATIENTS API - COLLECTION
 * Endpoints para gestionar la colección de pacientes.
 * GET, POST /api/v1/patients
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { patientService, CreatePatientSchema } from '@/services/patient.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una lista de todos los pacientes.
 * @description Devuelve una lista de todos los pacientes. Requiere rol de 'doctor' o 'admin'.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const patients = await patientService.getAllPatients(authContext.user!);

      return NextResponse.json(createSuccessResponse(patients));
    } catch (error: unknown) {
      console.error('Error en GET /patients:', error);
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para ver la lista de pacientes.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener los pacientes.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'patients_list',
  }
);

/**
 * @summary Crea un nuevo paciente.
 * @description Registra un nuevo paciente en el sistema. Requiere rol de 'doctor' o 'admin'.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = CreatePatientSchema.parse(body);

      const newPatient = await patientService.createPatient(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(newPatient), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /patients:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para crear pacientes.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al crear el paciente.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'patient_create',
  }
);
