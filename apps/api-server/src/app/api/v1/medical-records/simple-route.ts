// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema simplificado para Medical Records
const CreateMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  appointmentId: z.string().optional(),
  type: z.enum(['consultation', 'diagnosis', 'treatment', 'test_result', 'prescription', 'other']),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().min(1, 'Descripción es requerida'),
  diagnosis: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string().optional()
  })).optional(),
  testResults: z.array(z.object({
    testName: z.string(),
    result: z.string(),
    normalRange: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  notes: z.string().optional(),
  isPrivate: z.boolean().default(false),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

const MedicalRecordQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  type: z.enum(['consultation', 'diagnosis', 'treatment', 'test_result', 'prescription', 'other', 'all']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// GET - Obtener historiales médicos
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 MEDICAL RECORDS GET - START');
    
    const { searchParams } = new URL(request.url);
    const queryData = MedicalRecordQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, patientId, doctorId, type, startDate, endDate } = queryData;
    const offset = (page - 1) * limit;

    // Construir query base
    let query: any = adminDb.collection('medical_records') as any;

    // Aplicar filtros
    if (patientId) {
      query = (query as any).where('patientId', '==', patientId);
    }

    if (doctorId) {
      query = (query as any).where('doctorId', '==', doctorId);
    }

    if (type !== 'all') {
      query = (query as any).where('type', '==', type);
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
    const records = [];
    for (const doc of snapshot.docs) {
      const recordData = doc.data();

      // Obtener información relacionada
      const [doctorDoc, patientDoc] = await Promise.all([
        adminDb.collection('users').doc((recordData as any).doctorId).get(),
        adminDb.collection('users').doc((recordData as any).patientId).get(),
      ]);

      records.push({
        id: doc.id,
        ...recordData,
        createdAt: (recordData as any).createdAt?.toDate?.() ?? (recordData as any).createdAt,
        updatedAt: recordData.updatedAt?.toDate?.() ?? recordData.updatedAt,

        // Información del doctor
        doctor: doctorDoc.exists ? {
          id: (recordData as any).doctorId,
          firstName: doctorDoc.data()?.firstName,
          lastName: doctorDoc.data()?.lastName,
          specialties: doctorDoc.data()?.specialties || []
        } : null,

        // Información del paciente
        patient: patientDoc.exists ? {
          id: (recordData as any).patientId,
          firstName: patientDoc.data()?.firstName,
          lastName: patientDoc.data()?.lastName
        } : null,
      });
    }

    const meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    console.log(`✅ Found ${records.length} medical records`);

    return NextResponse.json(
      createSuccessResponse(records, meta as unknown as Record<string, unknown>),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 Error fetching medical records:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_MEDICAL_RECORDS_FAILED', 'Error al obtener historiales médicos'),
      { status: 500 }
    );
  }
}

// POST - Crear nuevo historial médico
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 MEDICAL RECORDS POST - START');
    
    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    const recordData = CreateMedicalRecordSchema.parse(body);
    console.log('✅ Validation successful');

    // Verificar que el doctor existe
    const doctorDoc = await adminDb.collection('users').doc((recordData as any).doctorId).get();
    if (!doctorDoc.exists) {
      console.log('❌ Doctor not found:', (recordData as any).doctorId);
      return NextResponse.json(
        createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor no encontrado'),
        { status: 404 }
      );
    }

    const doctorInfo = doctorDoc.data();
    if (!doctorInfo?.isActive || doctorInfo?.role !== 'doctor') {
      console.log('❌ Doctor not available');
      return NextResponse.json(
        createErrorResponse('DOCTOR_UNAVAILABLE', 'Doctor no está disponible'),
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const patientDoc = await adminDb.collection('users').doc((recordData as any).patientId).get();
    if (!patientDoc.exists) {
      console.log('❌ Patient not found:', (recordData as any).patientId);
      return NextResponse.json(
        createErrorResponse('PATIENT_NOT_FOUND', 'Paciente no encontrado'),
        { status: 404 }
      );
    }

    const patientInfo = patientDoc.data();
    if (!patientInfo?.isActive) {
      console.log('❌ Patient not active');
      return NextResponse.json(
        createErrorResponse('PATIENT_INACTIVE', 'Cuenta de paciente inactiva'),
        { status: 400 }
      );
    }

    // Crear el historial médico
    console.log('✅ Creating medical record...');
    const newRecord = {
      patientId: (recordData as any).patientId,
      doctorId: (recordData as any).doctorId,
      appointmentId: recordData.appointmentId || null,
      type: (recordData as any).type,
      title: recordData.title,
      description: recordData.description,
      diagnosis: recordData.diagnosis || '',
      symptoms: recordData.symptoms || [],
      medications: recordData.medications || [],
      testResults: recordData.testResults || [],
      notes: recordData.notes || '',
      isPrivate: recordData.isPrivate,
      priority: recordData.priority,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      recordNumber: `MR-${Date.now().toString(36).toUpperCase()}`,
    };

    const recordRef = await adminDb.collection('medical_records').add(newRecord);
    console.log('✅ Medical record created with ID:', recordRef.id);

    console.log('🔍 MEDICAL RECORDS POST - SUCCESS');
    
    return NextResponse.json(
      createSuccessResponse({
        id: recordRef.id,
        ...newRecord,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 Error creating medical record:', error);

    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors);
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de entrada inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_MEDICAL_RECORD_FAILED', 'Error al crear historial médico', {
        error: error?.message || 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
