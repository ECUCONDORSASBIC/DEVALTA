/**
 * 💬 AI MEDICAL CHATBOT API
 * Endpoint para interactuar con el chatbot médico inteligente.
 * POST /api/v1/ai/chatbot
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { chatbotService } from '@/services/ai/chatbot.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

export const dynamic = "force-dynamic";

// Schema para la entrada del chatbot
const ChatbotSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío.'),
  sessionId: z.string().optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  userType: z.enum(['patient', 'doctor', 'nurse', 'admin']).default('patient'),
  context: z.object({
    medicalHistory: z.array(z.string()).optional(),
    currentSymptoms: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    lastVisit: z.string().optional(),
    language: z.string().default('es'),
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    message: z.string(),
    timestamp: z.string(),
  })).optional(),
});

/**
 * @summary Inicia o continúa una conversación con el chatbot.
 * @description Este endpoint procesa un mensaje de un usuario, lo envía al servicio de IA
 * y devuelve una respuesta inteligente, manteniendo el historial de la conversación.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext: AuthContext) => {
    try {
      const body = await request.json();
      const chatbotData = ChatbotSchema.parse(body);

      // Delegar toda la lógica al servicio de chatbot
      const response = await chatbotService.processMessage(chatbotData, authContext.user!);

      return NextResponse.json(createSuccessResponse(response));

    } catch (error: unknown) {
      console.error('Error en la ruta del chatbot médico:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }

      // Asumiendo que el servicio puede lanzar errores específicos
      if (error instanceof Error && error.name === 'AI_SERVICE_ERROR') {
          return NextResponse.json(
            createErrorResponse(error.message, 'AI_SERVICE_ERROR'),
            { status: 503 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Ocurrió un error al procesar su mensaje.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    // Todos los roles autenticados pueden usar el chatbot
    allowedRoles: ['patient', 'doctor', 'nurse', 'admin', 'company'],
    auditAction: 'chatbot_message',
    rateLimitKey: 'chatbot'
  }
);

// Los métodos GET y DELETE para sesiones específicas se manejan en:
// /api/v1/ai/chatbot/sessions/[sessionId]/route.ts 