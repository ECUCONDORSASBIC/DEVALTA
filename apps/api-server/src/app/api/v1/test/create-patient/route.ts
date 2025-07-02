import { adminDb } from '@altamedica/firebase';
import { createSuccessResponse, createErrorResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🏥 Creando paciente de prueba...');
    
    const patientData = {
      id: 'patient-123',
      firstName: 'Juan',
      lastName: 'Pérez', 
      email: 'juan.perez@test.com',
      dateOfBirth: '1988-06-15',
      gender: 'male',
      phone: '+1234567890',
      address: {
        street: 'Calle Test 123',
        city: 'Ciudad Test',
        country: 'País Test',
        zipCode: '12345'
      },
      medicalHistory: ['diabetes', 'hipertensión'],
      allergies: ['penicilina'],
      currentMedications: ['metformina', 'lisinopril'],
      emergencyContact: {
        name: 'María Pérez',
        phone: '+1234567891',
        relationship: 'esposa'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await adminDb.collection('patients').doc('patient-123').set(patientData);
    
    return NextResponse.json(
      createSuccessResponse({ 
        message: 'Paciente de prueba creado exitosamente',
        patientId: 'patient-123',
        data: patientData 
      })
    );

  } catch (error: unknown) {
    console.error('❌ Error creando paciente:', error);
    return NextResponse.json(
      createErrorResponse('PATIENT_CREATION_FAILED', 'Error al crear paciente de prueba'),
      { status: 500 }
    );
  }
}
