// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para crear/actualizar sala
const RoomSchema = z.object({
  appointmentId: z.string().min(1, 'ID de cita es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  status: z.enum(['waiting', 'active', 'ended', 'cancelled']).default('waiting'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Obtener información de la sala
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('INVALID_ROOM_ID', 'ID de sala requerido'),
        { status: 400 }
      );
    }

    // Buscar sala en Firestore
    const roomQuery = await adminDb
      .collection('telemedicine_rooms')
      .where('roomId', '==', roomId)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return NextResponse.json(
        createErrorResponse('ROOM_NOT_FOUND', 'Sala de telemedicina no encontrada'),
        { status: 404 }
      );
    }

    const roomDoc = roomQuery.docs[0];
    const roomData = roomDoc.data();

    // Obtener información del doctor y paciente
    const [doctorDoc, patientDoc] = await Promise.all([
      adminDb.collection('users').doc(roomData.doctorId).get(),
      adminDb.collection('users').doc(roomData.patientId).get(),
    ]);

    const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
    const patientData = patientDoc.exists ? patientDoc.data() : null;

    const room = {
      id: roomDoc.id,
      roomId: roomData.roomId,
      appointmentId: roomData.appointmentId,
      doctor: doctorData ? {
        id: roomData.doctorId,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        specialty: doctorData.specialty || 'Medicina General',
        licenseNumber: doctorData.licenseNumber,
      } : null,
      patient: patientData ? {
        id: roomData.patientId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
      } : null,
      status: roomData.status,
      startTime: roomData.startTime?.toDate?.() ?? roomData.startTime,
      endTime: roomData.endTime?.toDate?.() ?? roomData.endTime,
      notes: roomData.notes,
      createdAt: roomData.createdAt?.toDate?.() ?? roomData.createdAt,
      updatedAt: roomData.updatedAt?.toDate?.() ?? roomData.updatedAt,
    };

    return NextResponse.json(
      createSuccessResponse(room),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error fetching room:', error);

    return NextResponse.json(
      createErrorResponse('FETCH_ROOM_FAILED', 'Error al obtener información de la sala'),
      { status: 500 }
    );
  }
}

// POST - Crear nueva sala
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const body = await request.json();

    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('INVALID_ROOM_ID', 'ID de sala requerido'),
        { status: 400 }
      );
    }

    const roomData = RoomSchema.parse(body);

    // Verificar que la cita existe
    const appointmentDoc = await adminDb.collection('appointments').doc(roomData.appointmentId).get();
    if (!appointmentDoc.exists) {
      return NextResponse.json(
        createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
        { status: 404 }
      );
    }

    // Verificar que no existe ya una sala para esta cita
    const existingRoomQuery = await adminDb
      .collection('telemedicine_rooms')
      .where('appointmentId', '==', roomData.appointmentId)
      .limit(1)
      .get();

    if (!existingRoomQuery.empty) {
      return NextResponse.json(
        createErrorResponse('ROOM_ALREADY_EXISTS', 'Ya existe una sala para esta cita'),
        { status: 409 }
      );
    }

    // Crear la sala
    const newRoom = {
      roomId,
      appointmentId: roomData.appointmentId,
      doctorId: roomData.doctorId,
      patientId: roomData.patientId,
      status: roomData.status,
      startTime: roomData.startTime ? new Date(roomData.startTime) : null,
      endTime: roomData.endTime ? new Date(roomData.endTime) : null,
      notes: roomData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const roomRef = await adminDb.collection('telemedicine_rooms').add(newRoom);

    // Actualizar la cita con el ID de la sala
    await adminDb.collection('appointments').doc(roomData.appointmentId).update({
      videoSessionId: roomId,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      createSuccessResponse({
        id: roomRef.id,
        roomId,
        ...newRoom,
        startTime: newRoom.startTime,
        endTime: newRoom.endTime,
        createdAt: newRoom.createdAt,
        updatedAt: newRoom.updatedAt,
      }),
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Error creating room:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de sala inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_ROOM_FAILED', 'Error al crear sala'),
      { status: 500 }
    );
  }
}

// PUT - Actualizar sala
export async function PUT(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const body = await request.json();

    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('INVALID_ROOM_ID', 'ID de sala requerido'),
        { status: 400 }
      );
    }

    // Buscar la sala
    const roomQuery = await adminDb
      .collection('telemedicine_rooms')
      .where('roomId', '==', roomId)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return NextResponse.json(
        createErrorResponse('ROOM_NOT_FOUND', 'Sala no encontrada'),
        { status: 404 }
      );
    }

    const roomDoc = roomQuery.docs[0];
    const currentData = roomDoc.data();

    // Campos permitidos para actualización
    const allowedFields = ['status', 'startTime', 'endTime', 'notes'];
    const updateData: any = {
      updatedAt: new Date()
    };

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'startTime' || field === 'endTime') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Actualizar la sala
    await roomDoc.ref.update(updateData);

    // Obtener datos actualizados
    const updatedDoc = await roomDoc.ref.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json(
      createSuccessResponse({
        id: updatedDoc.id,
        ...updatedData,
        startTime: updatedData.startTime?.toDate?.() ?? updatedData.startTime,
        endTime: updatedData.endTime?.toDate?.() ?? updatedData.endTime,
        createdAt: updatedData.createdAt?.toDate?.() ?? updatedData.createdAt,
        updatedAt: updatedData.updatedAt?.toDate?.() ?? updatedData.updatedAt,
      }),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating room:', error);

    return NextResponse.json(
      createErrorResponse('UPDATE_ROOM_FAILED', 'Error al actualizar sala'),
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sala
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('INVALID_ROOM_ID', 'ID de sala requerido'),
        { status: 400 }
      );
    }

    // Buscar la sala
    const roomQuery = await adminDb
      .collection('telemedicine_rooms')
      .where('roomId', '==', roomId)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return NextResponse.json(
        createErrorResponse('ROOM_NOT_FOUND', 'Sala no encontrada'),
        { status: 404 }
      );
    }

    const roomDoc = roomQuery.docs[0];
    const roomData = roomDoc.data();

    // Eliminar la sala
    await roomDoc.ref.delete();

    // Limpiar referencia en la cita
    if (roomData.appointmentId) {
      await adminDb.collection('appointments').doc(roomData.appointmentId).update({
        videoSessionId: null,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      createSuccessResponse({ message: 'Sala eliminada correctamente' }),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error deleting room:', error);

    return NextResponse.json(
      createErrorResponse('DELETE_ROOM_FAILED', 'Error al eliminar sala'),
      { status: 500 }
    );
  }
} 