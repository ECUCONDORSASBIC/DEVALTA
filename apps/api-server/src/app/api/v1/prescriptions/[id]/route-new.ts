// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para actualizar prescripción
const UpdatePrescriptionSchema = z.object({
  medications: z.array(z.object({
    name: z.string().min(1),
    genericName: z.string().optional(),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional(),
    quantity: z.number().min(1),
    refills: z.number().min(0).max(10),
    isControlled: z.boolean().default(false)
  })).optional(),
  diagnosis: z.string().optional(),
  instructions: z.string().optional(),
  duration: z.string().optional(),
  priority: z.enum(['normal', 'urgent']).optional(),
  notes: z.string().optional(),
  allowGeneric: z.boolean().optional()
});

// GET - Obtener prescripción específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`💊 PRESCRIPTIONS GET [${params.id}] - START`);
    
    const prescriptionDoc = await adminDb.collection('prescriptions').doc(params.id).get();
    
    if (!prescriptionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('Prescripción no encontrada', 'PRESCRIPTION_NOT_FOUND'),
        { status: 404 }
      );
    }

    const prescriptionData = prescriptionDoc.data();

    // Obtener información relacionada
    const [doctorDoc, patientDoc] = await Promise.all([
      adminDb.collection('users').doc(prescriptionData!.doctorId).get(),
      adminDb.collection('users').doc(prescriptionData!.patientId).get(),
    ]);

    const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
    const patientData = patientDoc.exists ? patientDoc.data() : null;

    // Si hay appointmentId, obtener la cita también
    let appointmentData = null;
    if (prescriptionData!.appointmentId) {
      const appointmentDoc = await adminDb.collection('appointments').doc(prescriptionData!.appointmentId).get();
      appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;
    }

    // Si hay medicalRecordId, obtener el historial médico también
    let medicalRecordData = null;
    if (prescriptionData!.medicalRecordId) {
      const medicalRecordDoc = await adminDb.collection('medical_records').doc(prescriptionData!.medicalRecordId).get();
      medicalRecordData = medicalRecordDoc.exists ? medicalRecordDoc.data() : null;
    }

    const enrichedPrescription = {
      id: prescriptionDoc.id,
      ...prescriptionData,
      doctorName: doctorData ? `${doctorData.firstName} ${doctorData.lastName}` : 'Doctor Desconocido',
      patientName: patientData ? `${patientData.firstName} ${patientData.lastName}` : 'Paciente Desconocido',
      doctorInfo: doctorData ? {
        id: prescriptionData!.doctorId,
        name: `${doctorData.firstName} ${doctorData.lastName}`,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber
      } : null,
      patientInfo: patientData ? {
        id: prescriptionData!.patientId,
        name: `${patientData.firstName} ${patientData.lastName}`,
        age: patientData.age,
        phoneNumber: patientData.phoneNumber
      } : null,
      appointmentInfo: appointmentData ? {
        id: prescriptionData!.appointmentId,
        date: appointmentData.date,
        type: (appointmentData as any).type
      } : null,
      medicalRecordInfo: medicalRecordData ? {
        id: prescriptionData!.medicalRecordId,
        title: medicalRecordData.title,
        date: (medicalRecordData as any).createdAt
      } : null,
      createdAt: prescriptionData!.createdAt?.toDate?.()?.toISOString() || prescriptionData!.createdAt,
      updatedAt: prescriptionData!.updatedAt?.toDate?.()?.toISOString() || prescriptionData!.updatedAt,
      expirationDate: prescriptionData!.expirationDate?.toDate?.()?.toISOString() || prescriptionData!.expirationDate,
      filledAt: prescriptionData!.filledAt?.toDate?.()?.toISOString() || prescriptionData!.filledAt,
      cancelledAt: prescriptionData!.cancelledAt?.toDate?.()?.toISOString() || prescriptionData!.cancelledAt
    };

    const response = createSuccessResponse({ data: enrichedPrescription });

    console.log(`✅ PRESCRIPTIONS GET [${params.id}] - SUCCESS`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ PRESCRIPTIONS GET [${params.id}] - ERROR:`, error);
    
    return NextResponse.json(
      createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

// PUT - Actualizar prescripción
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`💊 PRESCRIPTIONS PUT [${params.id}] - START`);
    
    const body = await request.json();
    const validatedData = UpdatePrescriptionSchema.parse(body);

    const prescriptionDoc = await adminDb.collection('prescriptions').doc(params.id).get();
    
    if (!prescriptionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('Prescripción no encontrada', 'PRESCRIPTION_NOT_FOUND'),
        { status: 404 }
      );
    }

    const currentData = prescriptionDoc.data();

    // Verificar que la prescripción no esté filled o cancelled
    if (currentData!.status === 'filled') {
      return NextResponse.json(
        createErrorResponse('No se puede modificar una prescripción ya dispensada', 'PRESCRIPTION_ALREADY_FILLED'),
        { status: 400 }
      );
    }

    if (currentData!.status === 'cancelled') {
      return NextResponse.json(
        createErrorResponse('No se puede modificar una prescripción cancelada', 'PRESCRIPTION_CANCELLED'),
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData = {
      ...validatedData,
      updatedAt: now
    };

    await adminDb.collection('prescriptions').doc(params.id).update(updateData);

    const response = createSuccessResponse({
      data: {
        id: params.id,
        updated: true,
        updatedAt: now.toISOString()
      }
    });

    console.log(`✅ PRESCRIPTIONS PUT [${params.id}] - SUCCESS`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ PRESCRIPTIONS PUT [${params.id}] - ERROR:`, error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        createErrorResponse('Datos de entrada inválidos', 'VALIDATION_ERROR', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
