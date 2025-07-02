// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';

// POST - Test crear appointment con diagnóstico
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 TEST APPOINTMENT CREATION - START');
    
    let body;
    try {
      body = await request.json();
      console.log('📥 Request body received:', JSON.stringify(body, null, 2));    } catch (parseError: any) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json(
        createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', {
          error: parseError?.message || 'Unknown parse error'
        }),
        { status: 400 }
      );
    }

    // Validación básica de campos requeridos
    const requiredFields = ['doctorId', 'patientId', 'scheduledAt', 'type', 'reason'];
    const missingFields = requiredFields.filter((field: any) => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        createErrorResponse('MISSING_FIELDS', 'Campos requeridos faltantes', {
          missingFields
        }),
        { status: 400 }
      );
    }

    // Verificar doctor
    console.log('🔍 Checking doctor:', (body as any).doctorId);
    const doctorDoc = await adminDb.collection('users').doc((body as any).doctorId).get();
    console.log('Doctor exists:', doctorDoc.exists);
    
    if (!doctorDoc.exists) {
      console.log('❌ Doctor not found');
      return NextResponse.json(
        createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor no encontrado'),
        { status: 404 }
      );
    }

    const doctorData = doctorDoc.data();
    console.log('Doctor data:', { 
      role: doctorData?.role, 
      isActive: doctorData?.isActive,
      firstName: doctorData?.firstName 
    });

    if (!doctorData?.isActive || doctorData?.role !== 'doctor') {
      console.log('❌ Doctor not available');
      return NextResponse.json(
        createErrorResponse('DOCTOR_UNAVAILABLE', 'Doctor no está disponible'),
        { status: 400 }
      );
    }

    // Verificar paciente
    console.log('🔍 Checking patient:', (body as any).patientId);
    const patientDoc = await adminDb.collection('users').doc((body as any).patientId).get();
    console.log('Patient exists:', patientDoc.exists);
    
    if (!patientDoc.exists) {
      console.log('❌ Patient not found');
      return NextResponse.json(
        createErrorResponse('PATIENT_NOT_FOUND', 'Paciente no encontrado'),
        { status: 404 }
      );
    }

    const patientData = patientDoc.data();
    console.log('Patient data:', { 
      role: patientData?.role, 
      isActive: patientData?.isActive,
      firstName: patientData?.firstName 
    });

    if (!patientData?.isActive) {
      console.log('❌ Patient not active');
      return NextResponse.json(
        createErrorResponse('PATIENT_INACTIVE', 'Cuenta de paciente inactiva'),
        { status: 400 }
      );
    }

    // Crear appointment de prueba
    console.log('🔍 Creating test appointment...');
    const appointmentData = {
      doctorId: (body as any).doctorId,
      patientId: (body as any).patientId,
      scheduledAt: new Date((body as any).scheduledAt),
      estimatedDuration: body.estimatedDuration || 30,
      type: (body as any).type,
      reason: body.reason,
      symptoms: body.symptoms || [],
      notes: body.notes || '',
      priority: body.priority || 'normal',
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmationCode: `TST-${Date.now().toString(36).toUpperCase()}`,
    };

    console.log('Appointment data to save:', JSON.stringify(appointmentData, null, 2));

    const appointmentRef = await adminDb.collection('appointments').add(appointmentData);
    console.log('✅ Appointment created with ID:', appointmentRef.id);

    console.log('🔍 TEST APPOINTMENT CREATION - SUCCESS');

    return NextResponse.json(
      createSuccessResponse({
        id: appointmentRef.id,
        ...appointmentData,
        message: 'Test appointment created successfully',
        diagnosis: {
          doctorFound: true,
          doctorActive: true,
          patientFound: true,
          patientActive: true,
          validationPassed: true
        }
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 TEST APPOINTMENT CREATION - ERROR:', error);
    console.error('Error stack:', error?.stack || 'No stack available');
    
    return NextResponse.json(
      createErrorResponse('TEST_CREATE_FAILED', 'Error en creación de test appointment', {
        error: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack available',
      }),
      { status: 500 }
    );
  }
}
