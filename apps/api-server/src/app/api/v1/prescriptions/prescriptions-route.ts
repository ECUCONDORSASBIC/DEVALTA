// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para medicamentos en la receta
const MedicationSchema = z.object({
  name: z.string().min(1, 'Nombre del medicamento es requerido'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosis es requerida'),
  frequency: z.string().min(1, 'Frecuencia es requerida'),
  duration: z.string().min(1, 'Duración es requerida'),
  instructions: z.string().optional(),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  refills: z.number().min(0).max(10).default(0),
  isControlled: z.boolean().default(false)
});

// Schema para crear prescripción
const CreatePrescriptionSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  appointmentId: z.string().optional(),
  medicalRecordId: z.string().optional(),
  medications: z.array(MedicationSchema).min(1, 'Al menos un medicamento es requerido'),
  diagnosis: z.string().optional(),
  instructions: z.string().optional(),
  duration: z.string().min(1, 'Duración total del tratamiento es requerida'),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  notes: z.string().optional(),
  allowGeneric: z.boolean().default(true)
});

// Schema para consultar prescripciones
const PrescriptionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['pending', 'filled', 'cancelled', 'expired', 'all']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.enum(['normal', 'urgent', 'all']).default('all')
});

// GET - Obtener prescripciones
export async function GET(request: NextRequest) {
  try {
    console.log('💊 PRESCRIPTIONS GET - START');
    
    const { searchParams } = new URL(request.url);
    const queryData = PrescriptionQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, patientId, doctorId, status, startDate, endDate, priority } = queryData;
    const offset = (page - 1) * limit;

    // Construir query base
    let query: any = adminDb.collection('prescriptions') as any;

    // Aplicar filtros
    if (patientId) {
      query = (query as any).where('patientId', '==', patientId);
    }

    if (doctorId) {
      query = (query as any).where('doctorId', '==', doctorId);
    }

    if (status !== 'all') {
      query = (query as any).where('status', '==', status);
    }

    if (priority !== 'all') {
      query = (query as any).where('priority', '==', priority);
    }

    // Filtros de fecha
    if (startDate) {
      query = (query as any).where('createdAt', '>=', new Date(startDate));
    }

    if (endDate) {
      query = (query as any).where('createdAt', '<=', new Date(endDate));
    }

    // Ordenar por fecha de creación
    query = (query as any).orderBy('createdAt', 'desc');

    // Obtener datos con paginación
    const snapshot = await query.offset(offset).limit(limit).get();
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Procesar resultados
    const prescriptions = [];
    for (const doc of snapshot.docs) {
      const prescriptionData = doc.data();

      // Obtener información relacionada
      const [doctorDoc, patientDoc] = await Promise.all([
        adminDb.collection('users').doc((prescriptionData as any).doctorId).get(),
        adminDb.collection('users').doc((prescriptionData as any).patientId).get(),
      ]);

      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
      const patientData = patientDoc.exists ? patientDoc.data() : null;

      prescriptions.push({
        id: doc.id,
        ...prescriptionData,
        doctorName: doctorData ? `${doctorData.firstName} ${doctorData.lastName}` : 'Doctor Desconocido',
        patientName: patientData ? `${patientData.firstName} ${patientData.lastName}` : 'Paciente Desconocido',
        createdAt: (prescriptionData as any).createdAt?.toDate?.()?.toISOString() || (prescriptionData as any).createdAt,
        updatedAt: prescriptionData.updatedAt?.toDate?.()?.toISOString() || prescriptionData.updatedAt
      });
    }

    const response = createSuccessResponse({
      data: prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

    console.log(`✅ PRESCRIPTIONS GET - SUCCESS: ${prescriptions.length} records`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ PRESCRIPTIONS GET - ERROR:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        createErrorResponse('Parámetros de consulta inválidos', 'INVALID_QUERY_PARAMS', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('Error interno del servidor', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

// POST - Crear nueva prescripción
export async function POST(request: NextRequest) {
  try {
    console.log('💊 PRESCRIPTIONS POST - START');
    
    const body = await request.json();
    const validatedData = CreatePrescriptionSchema.parse(body);

    const now = new Date();
    
    // Verificar que doctor y paciente existen
    const [doctorDoc, patientDoc] = await Promise.all([
      adminDb.collection('users').doc((validatedData as any).doctorId).get(),
      adminDb.collection('users').doc((validatedData as any).patientId).get(),
    ]);

    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse('Doctor no encontrado', 'DOCTOR_NOT_FOUND'),
        { status: 404 }
      );
    }

    if (!patientDoc.exists) {
      return NextResponse.json(
        createErrorResponse('Paciente no encontrado', 'PATIENT_NOT_FOUND'),
        { status: 404 }
      );
    }

    const doctorData = doctorDoc.data();
    const patientData = patientDoc.data();

    // Verificar que el usuario es doctor
    if (doctorData?.role !== 'doctor') {
      return NextResponse.json(
        createErrorResponse('El usuario especificado no es un doctor', 'INVALID_DOCTOR'),
        { status: 400 }
      );
    }

    // Verificar que el usuario es paciente
    if (patientData?.role !== 'patient') {
      return NextResponse.json(
        createErrorResponse('El usuario especificado no es un paciente', 'INVALID_PATIENT'),
        { status: 400 }
      );
    }

    // Calcular fecha de expiración (por defecto 30 días)
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Crear prescripción
    const prescriptionData = {
      ...validatedData,
      status: 'pending',
      prescriptionNumber: `RX-${Date.now()}`,
      expirationDate,
      createdAt: now,
      updatedAt: now,
      filledAt: null,
      filledBy: null,
      cancelledAt: null,
      cancelledBy: null
    };

    const prescriptionRef = await adminDb.collection('prescriptions').add(prescriptionData);

    // Si hay medicalRecordId, actualizar el historial médico
    if (validatedData.medicalRecordId) {
      try {
        const medicalRecordRef = adminDb.collection('medical_records').doc(validatedData.medicalRecordId);
        await medicalRecordRef.update({
          prescriptionIds: (adminDb as any).FieldValue.arrayUnion(prescriptionRef.id),
          updatedAt: now
        });
      } catch (error: unknown) {
        console.warn('⚠️ No se pudo actualizar medical record:', error);
      }
    }

    // Respuesta con datos enriquecidos
    const response = createSuccessResponse({
      data: {
        id: prescriptionRef.id,
        ...prescriptionData,
        doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    });

    console.log(`✅ PRESCRIPTIONS POST - SUCCESS: ${prescriptionRef.id}`);
    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('❌ PRESCRIPTIONS POST - ERROR:', error);
    
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
