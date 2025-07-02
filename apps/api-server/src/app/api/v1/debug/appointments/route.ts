// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';

// GET - Debug de appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    const debugInfo = {
      timestamp: new Date().toISOString(),
      request: {
        doctorId,
        patientId,
        url: request.url,
      },
      system: {
        firestore: 'checking...',
        collections: {
          users: 'checking...',
          appointments: 'checking...',
        }
      }
    };

    // Test 1: Verificar conexión a Firestore
    try {
      await adminDb.collection('test').doc('health').set({ test: true, timestamp: new Date() });
      debugInfo.system.firestore = 'connected';
    } catch (error: unknown) {
      debugInfo.system.firestore = `error: ${(error as any).message}`;
    }

    // Test 2: Verificar colección users
    try {
      const usersSnapshot = await adminDb.collection('users').limit(1).get();
      debugInfo.system.collections.users = `${usersSnapshot.size} docs accessible`;
    } catch (error: unknown) {
      debugInfo.system.collections.users = `error: ${(error as any).message}`;
    }

    // Test 3: Verificar colección appointments
    try {
      const appointmentsSnapshot = await adminDb.collection('appointments').limit(1).get();
      debugInfo.system.collections.appointments = `${appointmentsSnapshot.size} docs accessible`;
    } catch (error: unknown) {
      debugInfo.system.collections.appointments = `error: ${(error as any).message}`;
    }

    // Test 4: Verificar usuarios específicos si se proporcionan
    if (doctorId) {
      try {
        const doctorDoc = await adminDb.collection('users').doc(doctorId).get();
        (debugInfo as any).doctor = {
          exists: doctorDoc.exists,
          data: doctorDoc.exists ? {
            id: doctorDoc.id,
            role: doctorDoc.data()?.role,
            isActive: doctorDoc.data()?.isActive,
            firstName: doctorDoc.data()?.firstName,
            lastName: doctorDoc.data()?.lastName,
          } : null
        };
      } catch (error: unknown) {
        (debugInfo as any).doctor = { error: (error as any).message };
      }
    }

    if (patientId) {
      try {
        const patientDoc = await adminDb.collection('users').doc(patientId).get();
        (debugInfo as any).patient = {
          exists: patientDoc.exists,
          data: patientDoc.exists ? {
            id: patientDoc.id,
            role: patientDoc.data()?.role,
            isActive: patientDoc.data()?.isActive,
            firstName: patientDoc.data()?.firstName,
            lastName: patientDoc.data()?.lastName,
          } : null
        };
      } catch (error: unknown) {
        (debugInfo as any).patient = { error: (error as any).message };
      }
    }

    return NextResponse.json(
      createSuccessResponse(debugInfo),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Debug error:', error);
    
    return NextResponse.json(
      createErrorResponse('DEBUG_FAILED', 'Error en diagnóstico', {
        error: (error as any).message,
        stack: (error as any).stack,
      }),
      { status: 500 }
    );
  }
}

// POST - Test de creación de appointment con logs detallados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 DEBUG APPOINTMENT CREATION - START');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Log de validación paso a paso
    const requiredFields = ['doctorId', 'patientId', 'scheduledAt', 'estimatedDuration', 'type', 'reason'];
    const missingFields = requiredFields.filter((field: any) => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Campos requeridos faltantes', { missingFields }),
        { status: 400 }
      );
    }

    console.log('✅ All required fields present');

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

    // Crear appointment de prueba
    console.log('🔍 Creating test appointment...');
    const appointmentData = {
      ...body,
      scheduledAt: new Date((body as any).scheduledAt),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmationCode: `TEST-${Date.now().toString(36).toUpperCase()}`,
    };

    console.log('Appointment data to save:', JSON.stringify(appointmentData, null, 2));

    const appointmentRef = await adminDb.collection('appointments').add(appointmentData);
    console.log('✅ Appointment created with ID:', appointmentRef.id);

    console.log('🔍 DEBUG APPOINTMENT CREATION - SUCCESS');

    return NextResponse.json(
      createSuccessResponse({
        id: appointmentRef.id,
        ...appointmentData,
        message: 'Debug appointment created successfully'
      }),
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('💥 DEBUG APPOINTMENT CREATION - ERROR:', error);
    console.error('Error stack:', (error as any).stack);
    
    return NextResponse.json(
      createErrorResponse('DEBUG_CREATE_FAILED', 'Error en creación de debug appointment', {
        error: (error as any).message,
        stack: (error as any).stack,
      }),
      { status: 500 }
    );
  }
}
