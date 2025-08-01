// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { z } from 'zod';

// Schema para mensajes de signaling
const SignalingMessageSchema = z.object({
  type: z.enum(['offer', 'answer', 'ice-candidate', 'join', 'leave']),
  roomId: z.string().min(1, 'Room ID es requerido'),
  from: z.string().min(1, 'From es requerido'),
  to: z.string().optional(),
  data: z.any(),
  timestamp: z.number().default(() => Date.now()),
});

// Almacenamiento en memoria para sesiones (en producción usar Redis)
const activeSessions = new Map<string, Set<string>>();
const signalingMessages = new Map<string, any[]>();

// WebSocket connections (en producción usar WebSocket server)
const connections = new Map<string, any>();

// POST - Manejar mensajes de signaling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = SignalingMessageSchema.parse(body);

    const { type, roomId, from, to, data } = message;

    // Verificar que la sala existe
    if (!activeSessions.has(roomId)) {
      return NextResponse.json(
        createErrorResponse('ROOM_NOT_FOUND', 'Sala de video no encontrada'),
        { status: 404 }
      );
    }

    // Procesar mensaje según tipo
    switch (type) {
      case 'join':
        await handleJoin(roomId, from, data);
        break;
      
      case 'leave':
        await handleLeave(roomId, from);
        break;
      
      case 'offer':
        await handleOffer(roomId, from, to, data);
        break;
      
      case 'answer':
        await handleAnswer(roomId, from, to, data);
        break;
      
      case 'ice-candidate':
        await handleIceCandidate(roomId, from, to, data);
        break;
      
      default:
        return NextResponse.json(
          createErrorResponse('INVALID_MESSAGE_TYPE', 'Tipo de mensaje no válido'),
          { status: 400 }
        );
    }

    return NextResponse.json(
      createSuccessResponse({ message: 'Mensaje procesado correctamente' }),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error en signaling:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Mensaje de signaling inválido', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('SIGNALING_ERROR', 'Error en el procesamiento de signaling'),
      { status: 500 }
    );
  }
}

// GET - Obtener mensajes pendientes para un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');
    const lastMessageId = searchParams.get('lastMessageId');

    if (!roomId || !userId) {
      return NextResponse.json(
        createErrorResponse('MISSING_PARAMETERS', 'roomId y userId son requeridos'),
        { status: 400 }
      );
    }

    // Verificar que la sala existe
    if (!activeSessions.has(roomId)) {
      return NextResponse.json(
        createErrorResponse('ROOM_NOT_FOUND', 'Sala de video no encontrada'),
        { status: 404 }
      );
    }

    // Obtener mensajes pendientes para el usuario
    const messages = signalingMessages.get(roomId) || [];
    const pendingMessages = messages.filter(msg => 
      msg.to === userId && 
      (!lastMessageId || msg.id > parseInt(lastMessageId))
    );

    return NextResponse.json(
      createSuccessResponse({
        messages: pendingMessages,
        participants: Array.from(activeSessions.get(roomId) || []),
        roomId
      }),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error obteniendo mensajes:', error);

    return NextResponse.json(
      createErrorResponse('FETCH_MESSAGES_ERROR', 'Error al obtener mensajes'),
      { status: 500 }
    );
  }
}

// Funciones auxiliares para manejar tipos de mensajes
async function handleJoin(roomId: string, userId: string, userData: any) {
  // Agregar usuario a la sala
  if (!activeSessions.has(roomId)) {
    activeSessions.set(roomId, new Set());
  }
  activeSessions.get(roomId)!.add(userId);

  // Notificar a otros participantes
  const participants = Array.from(activeSessions.get(roomId) || []);
  const joinMessage = {
    id: Date.now(),
    type: 'user-joined',
    roomId,
    from: 'system',
    to: participants.filter(p => p !== userId),
    data: {
      userId,
      userData,
      participants
    },
    timestamp: Date.now()
  };

  // Almacenar mensaje
  if (!signalingMessages.has(roomId)) {
    signalingMessages.set(roomId, []);
  }
  signalingMessages.get(roomId)!.push(joinMessage);

  console.log(`Usuario ${userId} se unió a la sala ${roomId}`);
}

async function handleLeave(roomId: string, userId: string) {
  // Remover usuario de la sala
  const participants = activeSessions.get(roomId);
  if (participants) {
    participants.delete(userId);
    
    // Si no quedan participantes, limpiar la sala
    if (participants.size === 0) {
      activeSessions.delete(roomId);
      signalingMessages.delete(roomId);
    } else {
      // Notificar a otros participantes
      const leaveMessage = {
        id: Date.now(),
        type: 'user-left',
        roomId,
        from: 'system',
        to: Array.from(participants),
        data: {
          userId,
          participants: Array.from(participants)
        },
        timestamp: Date.now()
      };

      signalingMessages.get(roomId)!.push(leaveMessage);
    }
  }

  console.log(`Usuario ${userId} dejó la sala ${roomId}`);
}

async function handleOffer(roomId: string, from: string, to: string, offer: any) {
  const offerMessage = {
    id: Date.now(),
    type: 'offer',
    roomId,
    from,
    to,
    data: offer,
    timestamp: Date.now()
  };

  if (!signalingMessages.has(roomId)) {
    signalingMessages.set(roomId, []);
  }
  signalingMessages.get(roomId)!.push(offerMessage);

  console.log(`Offer enviado de ${from} a ${to} en sala ${roomId}`);
}

async function handleAnswer(roomId: string, from: string, to: string, answer: any) {
  const answerMessage = {
    id: Date.now(),
    type: 'answer',
    roomId,
    from,
    to,
    data: answer,
    timestamp: Date.now()
  };

  if (!signalingMessages.has(roomId)) {
    signalingMessages.set(roomId, []);
  }
  signalingMessages.get(roomId)!.push(answerMessage);

  console.log(`Answer enviado de ${from} a ${to} en sala ${roomId}`);
}

async function handleIceCandidate(roomId: string, from: string, to: string, candidate: any) {
  const iceMessage = {
    id: Date.now(),
    type: 'ice-candidate',
    roomId,
    from,
    to,
    data: candidate,
    timestamp: Date.now()
  };

  if (!signalingMessages.has(roomId)) {
    signalingMessages.set(roomId, []);
  }
  signalingMessages.get(roomId)!.push(iceMessage);

  console.log(`ICE candidate enviado de ${from} a ${to} en sala ${roomId}`);
} 