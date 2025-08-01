/**
 * 💬 AI CHATBOT SESSIONS API - ALTAMEDICA  
 * Endpoints para la gestión de sesiones de chatbot.
 * GET, DELETE /api/v1/ai/chatbot/sessions/[sessionId]
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { chatbotService } from '@/services/ai/chatbot.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene una sesión de chatbot por su ID.
 * @description Recupera el historial y los metadatos de una sesión de conversación específica.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { sessionId: string } }) => {
    try {
      const { sessionId } = params;
      const authContext = (request as any).authContext as AuthContext;

      const session = await chatbotService.getSessionById(sessionId, authContext.user!);
      
      if (!session) {
        return NextResponse.json(
          createErrorResponse('La sesión de chat no fue encontrada.', 'NOT_FOUND'),
          { status: 404 }
        );
      }

      // La lógica de permisos ahora debería estar dentro del servicio, pero una doble verificación aquí es segura.
      const user = authContext.user!;
      if (session.patientId !== user.uid && session.doctorId !== user.uid && user.role !== 'admin') {
         return NextResponse.json(
          createErrorResponse('No tiene permiso para acceder a este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      
      return NextResponse.json(createSuccessResponse(session));

    } catch (error: unknown) {
      console.error(`Error al obtener la sesión de chatbot:`, error);
      return NextResponse.json(
        createErrorResponse('Ocurrió un error al recuperar la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['patient', 'doctor', 'admin'],
    auditAction: 'chatbot_session_read'
  }
);

/**
 * @summary Elimina una sesión de chatbot.
 * @description Elimina permanentemente una sesión de conversación y su historial.
 * @handler DELETE
 * @protected
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, { params }: { params: { sessionId: string } }) => {
    try {
      const { sessionId } = params;
      const authContext = (request as any).authContext as AuthContext;

      // Primero, obtenemos la sesión para verificar la propiedad antes de eliminar.
      const session = await chatbotService.getSessionById(sessionId, authContext.user!);
       if (!session) {
        // No es necesario devolver un error si el objetivo es que no exista.
        // Devolver éxito para que la operación sea idempotente.
        return NextResponse.json(createSuccessResponse({ message: 'La sesión ya no existe.' }));
      }

      const user = authContext.user!;
      if (session.patientId !== user.uid && session.doctorId !== user.uid && user.role !== 'admin') {
         return NextResponse.json(
          createErrorResponse('No tiene permiso para eliminar este recurso.', 'FORBIDDEN'),
          { status: 403 }
        );
      }

      await chatbotService.deleteSession(sessionId, authContext.user!);
      
      return NextResponse.json(createSuccessResponse({ 
        message: 'Sesión eliminada exitosamente.',
        sessionId
      }));

    } catch (error: unknown) {
      console.error(`Error al eliminar la sesión de chatbot:`, error);
      return NextResponse.json(
        createErrorResponse('Ocurrió un error al eliminar la sesión.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['patient', 'doctor', 'admin'],
    auditAction: 'chatbot_session_delete'
  }
);
