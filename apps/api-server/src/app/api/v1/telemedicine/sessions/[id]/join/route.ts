/**
 * 🩺 TELEMEDICINE SESSIONS API - JOIN SESSION
 * Endpoint para que un usuario se una a una sesión de telemedicina.
 * POST /api/v1/telemedicine/sessions/[id]/join
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { telemedicineSessionService } from '@/services/telemedicine-session.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Se une a una sesión de telemedicina.
 * @description Valida los permisos, actualiza el estado de la sesión a "en progreso"
 * y devuelve un token de acceso para la plataforma de video.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      
      const result = await telemedicineSessionService.joinSession(params.id, authContext.user!);

      return NextResponse.json(createSuccessResponse(result));

    } catch (error: unknown) {
      console.error(`Error en POST /telemedicine/sessions/${(params as any)?.id}/join:`, error);

      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return NextResponse.json(createErrorResponse('La sesión de telemedicina no existe.', 'NOT_FOUND'), { status: 404 });
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(createErrorResponse('No tiene permisos para unirse a esta sesión.', 'FORBIDDEN'), { status: 403 });
        }
        if (error.message.startsWith('BAD_REQUEST:')) {
          return NextResponse.json(createErrorResponse(error.message.replace('BAD_REQUEST: ', ''), 'BAD_REQUEST'), { status: 400 });
        }
      }

      return NextResponse.json(
        createErrorResponse('Error al intentar unirse a la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient'], // Solo doctores y pacientes pueden unirse a sesiones
    auditAction: 'telemedicine_session_join',
    rateLimitKey: 'telemedicine_join'
  }
);