// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para actualizar usuario
const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  
  // Campos específicos para doctores
  specialties: z.array(z.string()).optional(),
  consultationFee: z.number().optional(),
  availableHours: z.record(z.array(z.string())).optional(),
  
  // Campos específicos para pacientes
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  medicalHistory: z.array(z.string()).optional(),
});

// GET - Obtener usuario específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Obtener el usuario
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', 'Usuario no encontrado'),
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Remover campos sensibles
    const { password, ...safeUserData } = userData || {};

    // Obtener información adicional según el rol
    let additionalInfo = {};
    
    if (userData?.role === 'doctor') {
      // Obtener estadísticas del doctor
      const appointmentsQuery = await adminDb
        .collection('appointments')
        .where('doctorId', '==', id)
        .get();
      
      const totalAppointments = appointmentsQuery.size;
      const completedAppointments = appointmentsQuery.docs
        .filter((doc: any) => doc.data().status === 'completed').length;

      additionalInfo = {
        statistics: {
          totalAppointments,
          completedAppointments,
          rating: userData.rating || 0,
        }
      };
    }

    if (userData?.role === 'patient') {
      // Obtener citas recientes del paciente
      const recentAppointments = await adminDb
        .collection('appointments')
        .where('patientId', '==', id)
        .orderBy('scheduledAt', 'desc')
        .limit(5)
        .get();

      additionalInfo = {
        recentAppointments: recentAppointments.docs.map((doc: any) => ({
          id: doc.id,
          scheduledAt: doc.data().scheduledAt?.toDate?.() ?? doc.data().scheduledAt,
          status: doc.data().status,
          type: doc.data().type,
          doctorId: doc.data().doctorId,
        }))
      };
    }

    const responseData = {
      user: {
        id: userDoc.id,
        uid: userDoc.id,
        ...safeUserData,
        createdAt: userData?.createdAt?.toDate?.() ?? userData?.createdAt,
        updatedAt: userData?.updatedAt?.toDate?.() ?? userData?.updatedAt,
        ...additionalInfo,
      },
    };

    return NextResponse.json(createSuccessResponse(responseData), { status: 200 });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      createErrorResponse('GET_USER_FAILED', 'Error al obtener usuario'),
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = UpdateUserSchema.parse(body);

    // Verificar que el usuario existe
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', 'Usuario no encontrado'),
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Validaciones específicas por rol
    if (updateData.specialties && userData?.role !== 'doctor') {
      return NextResponse.json(
        createErrorResponse('INVALID_UPDATE', 'Solo los doctores pueden tener especialidades'),
        { status: 400 }
      );
    }

    if (updateData.medicalHistory && userData?.role !== 'patient') {
      return NextResponse.json(
        createErrorResponse('INVALID_UPDATE', 'Solo los pacientes pueden tener historial médico'),
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateDataWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Actualizar el usuario
    await adminDb.collection('users').doc(id).update(updateDataWithTimestamp);

    // Registrar evento en el historial
    await adminDb.collection('user_events').add({
      userId: id,
      type: 'user_updated',
      timestamp: new Date(),
      details: {
        updatedFields: Object.keys(updateData),
      },
    });

    // Obtener el usuario actualizado
    const updatedDoc = await adminDb.collection('users').doc(id).get();
    const updatedData = updatedDoc.data();

    // Remover campos sensibles
    const { password, ...safeUpdatedData } = updatedData || {};

    const responseData = {
      user: {
        id: updatedDoc.id,
        uid: updatedDoc.id,
        ...safeUpdatedData,
        createdAt: updatedData?.createdAt?.toDate?.() ?? updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate?.() ?? updatedData?.updatedAt,
      },
      message: 'Usuario actualizado exitosamente',
    };

    return NextResponse.json(createSuccessResponse(responseData), { status: 200 });
  } catch (error: any) {
    console.error('Update user error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de actualización inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('UPDATE_USER_FAILED', 'Error al actualizar usuario'),
      { status: 500 }
    );
  }
}

// DELETE - Desactivar usuario (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verificar que el usuario existe
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', 'Usuario no encontrado'),
        { status: 404 }
      );
    }

    // Marcar como inactivo en lugar de eliminar
    await adminDb.collection('users').doc(id).update({
      isActive: false,
      updatedAt: new Date(),
      deactivatedAt: new Date(),
    });

    // Cancelar citas futuras si es un doctor o paciente
    const userData = userDoc.data();
    if (userData?.role === 'doctor' || userData?.role === 'patient') {
      const fieldName = userData.role === 'doctor' ? 'doctorId' : 'patientId';
      
      const futureAppointments = await adminDb
        .collection('appointments')
        .where(fieldName, '==', id)
        .where('status', 'in', ['scheduled', 'confirmed'])
        .get();

      const batch = adminDb.batch();
      futureAppointments.docs.forEach((doc: any) => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancelReason: 'Usuario desactivado',
          updatedAt: new Date(),
        });
      });
      
      if (!futureAppointments.empty) {
        await batch.commit();
      }
    }

    // Registrar evento en el historial
    await adminDb.collection('user_events').add({
      userId: id,
      type: 'user_deactivated',
      timestamp: new Date(),
      details: {
        role: userData?.role,
        futureAppointmentsCancelled: 0, // TODO: contar realmente
      },
    });

    const responseData = {
      message: 'Usuario desactivado exitosamente',
      userId: id,
    };

    return NextResponse.json(createSuccessResponse(responseData), { status: 200 });
  } catch (error: any) {
    console.error('Deactivate user error:', error);
    return NextResponse.json(
      createErrorResponse('DEACTIVATE_USER_FAILED', 'Error al desactivar usuario'),
      { status: 500 }
    );
  }
}
