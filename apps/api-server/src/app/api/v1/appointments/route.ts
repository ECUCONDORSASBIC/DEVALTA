// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createPaginationMeta, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para consultas de appointments mejorado
const AppointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'all']).default('all'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist', 'all']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Schema para crear appointment
const CreateAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha de cita inválida'),
  estimatedDuration: z.number().min(15).max(180).default(30),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist']),
  reason: z.string().min(1, 'Motivo de la cita es requerido'),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

// GET - Lista todas las citas con filtros mejorados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = AppointmentQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, doctorId, patientId, status, type, startDate, endDate } = queryData;
    const offset = (page - 1) * limit;

    // Construir query base
    let query: any = adminDb.collection('appointments') as any;

    // Aplicar filtros
    if (doctorId) {
      query = (query as any).where('doctorId', '==', doctorId);
    }

    if (patientId) {
      query = (query as any).where('patientId', '==', patientId);
    }

    if (status !== 'all') {
      query = (query as any).where('status', '==', status);
    }

    if (type !== 'all') {
      query = (query as any).where('type', '==', type);
    }

    // Filtros de fecha
    if (startDate) {
      query = (query as any).where('scheduledAt', '>=', new Date(startDate));
    }

    if (endDate) {
      query = (query as any).where('scheduledAt', '<=', new Date(endDate));
    }

    // Ordenar por fecha de cita
    query = (query as any).orderBy('scheduledAt', 'desc');

    // Obtener datos con paginación
    const snapshot = await query.offset(offset).limit(limit).get();
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Procesar resultados
    const appointments = [];
    for (const doc of snapshot.docs) {
      const appointmentData = doc.data();

      // Obtener información relacionada en paralelo
      const [doctorDoc, patientDoc] = await Promise.all([
        adminDb.collection('users').doc((appointmentData as any).doctorId).get(),
        adminDb.collection('users').doc((appointmentData as any).patientId).get(),
      ]);

      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
      const patientData = patientDoc.exists ? patientDoc.data() : null;

      appointments.push({
        id: doc.id,
        ...appointmentData,
        scheduledAt: (appointmentData as any).scheduledAt?.toDate?.() ?? (appointmentData as any).scheduledAt,
        createdAt: (appointmentData as any).createdAt?.toDate?.() ?? (appointmentData as any).createdAt,
        updatedAt: appointmentData.updatedAt?.toDate?.() ?? appointmentData.updatedAt,

        // Información del doctor
        doctor: doctorData ? {
          id: (appointmentData as any).doctorId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          licenseNumber: doctorData.licenseNumber,
          specialties: doctorData.specialties || [],
        } : null,

        // Información del paciente
        patient: patientData ? {
          id: (appointmentData as any).patientId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          dateOfBirth: patientData.dateOfBirth,
        } : null,
      });
    }

    const meta = createPaginationMeta(page, limit, total);

    return NextResponse.json(
      createSuccessResponse(appointments, meta as unknown as Record<string, unknown>),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching appointments:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_APPOINTMENTS_FAILED', 'Error al obtener citas'),
      { status: 500 }
    );
  }
}

// POST - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 CREATING APPOINTMENT - START');
    
    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    const appointmentData = CreateAppointmentSchema.parse(body);
    console.log('✅ Validation successful');

    // Verificar que el doctor existe y está disponible
    const doctorDoc = await adminDb.collection('users').doc((appointmentData as any).doctorId).get();
    if (!doctorDoc.exists) {
      console.log('❌ Doctor not found:', (appointmentData as any).doctorId);
      return NextResponse.json(
        createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor no encontrado'),
        { status: 404 }
      );
    }

    const doctorInfo = doctorDoc.data();
    console.log('👨‍⚕️ Doctor info:', { role: doctorInfo?.role, isActive: doctorInfo?.isActive });
    
    if (!doctorInfo?.isActive || doctorInfo?.role !== 'doctor') {
      console.log('❌ Doctor not available');
      return NextResponse.json(
        createErrorResponse('DOCTOR_UNAVAILABLE', 'Doctor no está disponible'),
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const patientDoc = await adminDb.collection('users').doc((appointmentData as any).patientId).get();
    if (!patientDoc.exists) {
      console.log('❌ Patient not found:', (appointmentData as any).patientId);
      return NextResponse.json(
        createErrorResponse('PATIENT_NOT_FOUND', 'Paciente no encontrado'),
        { status: 404 }
      );
    }

    const patientInfo = patientDoc.data();
    console.log('🧑‍🤝‍🧑 Patient info:', { role: patientInfo?.role, isActive: patientInfo?.isActive });
    
    if (!patientInfo?.isActive) {
      console.log('❌ Patient not active');
      return NextResponse.json(
        createErrorResponse('PATIENT_INACTIVE', 'Cuenta de paciente inactiva'),
        { status: 400 }
      );
    }    // Verificar disponibilidad de horario (simplificado para evitar índices complejos)
    const appointmentTime = new Date((appointmentData as any).scheduledAt);
    
    console.log('🔍 Checking time conflicts (simplified query)...');
    
    // Consulta simplificada: solo doctor y rango de fecha
    const startOfDay = new Date(appointmentTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    const conflictQuery = await adminDb
      .collection('appointments')
      .where('doctorId', '==', (appointmentData as any).doctorId)
      .where('scheduledAt', '>=', startOfDay)
      .where('scheduledAt', '<=', endOfDay)
      .get();

    console.log(`🔍 Found ${conflictQuery.size} appointments for this doctor on this day`);
    
    // Verificar conflictos en memoria (más flexible)
    const conflicts = conflictQuery.docs.filter((doc: any) => {
      const existingData = doc.data();
      const existingTime = (existingData as any).scheduledAt.toDate ? (existingData as any).scheduledAt.toDate() : new Date((existingData as any).scheduledAt);
      const existingEnd = new Date(existingTime.getTime() + (existingData.estimatedDuration || 30) * 60000);
      const newStart = appointmentTime;
      const newEnd = new Date(appointmentTime.getTime() + appointmentData.estimatedDuration * 60000);
      
      // Verificar solapamiento y que esté activa
      const overlaps = (newStart < existingEnd && newEnd > existingTime);
      const isActive = ['scheduled', 'confirmed', 'in_progress'].includes((existingData as any).status);
      
      return overlaps && isActive;
    });
    
    if (conflicts.length > 0) {
      console.log('❌ Time slot conflict found');
      return NextResponse.json(
        createErrorResponse('TIME_SLOT_UNAVAILABLE', 'El horario seleccionado no está disponible'),
        { status: 409 }
      );
    }

    // Crear la cita
    console.log('✅ Creating appointment...');
    const newAppointment = {
      doctorId: (appointmentData as any).doctorId,
      patientId: (appointmentData as any).patientId,
      scheduledAt: appointmentTime,
      estimatedDuration: appointmentData.estimatedDuration,
      type: (appointmentData as any).type,
      reason: appointmentData.reason,
      symptoms: appointmentData.symptoms || [],
      notes: appointmentData.notes || '',
      priority: appointmentData.priority,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmationCode: `APT-${Date.now().toString(36).toUpperCase()}`,
    };

    const appointmentRef = await adminDb.collection('appointments').add(newAppointment);
    console.log('✅ Appointment created with ID:', appointmentRef.id);

    // Registrar evento en el historial (opcional, no crítico)
    try {
      await adminDb.collection('appointment_events').add({
        appointmentId: appointmentRef.id,
        type: 'appointment_created',
        timestamp: new Date(),
        details: {
          doctorId: (appointmentData as any).doctorId,
          patientId: (appointmentData as any).patientId,
          scheduledAt: appointmentTime,
          type: (appointmentData as any).type,
          priority: appointmentData.priority,
        },
      });
    } catch (eventError: any) {
      console.warn('⚠️ Failed to create event log:', eventError?.message);
    }

    console.log('🔍 CREATING APPOINTMENT - SUCCESS');
    
    return NextResponse.json(
      createSuccessResponse({
        id: appointmentRef.id,
        ...newAppointment,
        scheduledAt: appointmentTime,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 Error creating appointment:', error);

    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors);
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de cita inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_APPOINTMENT_FAILED', 'Error al crear cita', {
        error: error?.message || 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
