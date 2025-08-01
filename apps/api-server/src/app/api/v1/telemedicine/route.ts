/**
 * 🩺 TELEMEDICINE SESSIONS API - COLLECTION
 * Endpoint para crear nuevas sesiones de telemedicina.
 * POST /api/v1/telemedicine
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { telemedicineSessionService, TelemedicineSessionSchema } from '@/services/telemedicine-session.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

// Para la creación, podemos omitir campos que se asignan automáticamente.
const CreateSessionSchema = TelemedicineSessionSchema.omit({ status: true });

/**
 * @summary Crea una nueva sesión de telemedicina.
 * @description Registra una nueva sesión, generalmente asociada a una cita.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = CreateSessionSchema.parse(body);

      const newSession = await telemedicineSessionService.create(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse(newSession), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /telemedicine:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para crear sesiones de telemedicina.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al crear la sesión de telemedicina.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'telemedicine_session_create',
  }
);
