/**
 * Simple Patients API endpoint for basic functionality
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock patient data for testing
    const mockPatients = [
      {
        id: 'patient-001',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+57 300 123 4567',
        gender: 'male',
        birthDate: '1985-03-15',
        bloodType: 'O+',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'patient-002',
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@email.com',
        phone: '+57 300 987 6543',
        gender: 'female',
        birthDate: '1990-07-22',
        bloodType: 'A+',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockPatients,
      meta: {
        total: mockPatients.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'PATIENTS_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      data: {
        id: 'patient-' + Date.now(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'CREATE_PATIENT_ERROR'
    }, { status: 500 });
  }
}
