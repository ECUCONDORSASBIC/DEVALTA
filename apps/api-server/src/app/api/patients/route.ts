import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@altamedica/shared';
import { z } from 'zod';

// Schema de validación para pacientes
const PatientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
});

// Mock data para desarrollo
const mockPatients = [
  {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+34 600 123 456',
    dateOfBirth: '1985-03-15',
    medicalHistory: ['Hipertensión', 'Diabetes tipo 2'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+34 600 789 012',
    dateOfBirth: '1978-11-22',
    medicalHistory: ['Asma'],
    createdAt: new Date().toISOString(),
  }
];

// GET - Obtener lista de pacientes
export async function GET(request: NextRequest) {
  try {
    // Simular delay para demostrar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(
      createSuccessResponse('Pacientes obtenidos exitosamente', {
        patients: mockPatients,
        total: mockPatients.length,
        page: 1,
        limit: 10
      }),
      {
        headers: {
          'X-API-Version': '1.0.0',
          'X-Platform': 'altamedica'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('FETCH_ERROR', 'Error al obtener pacientes'),
      { status: 500 }
    );
  }
}

// POST - Crear nuevo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos del paciente
    const validatedData = PatientSchema.parse(body);
    
    // Simular creación de paciente
    const newPatient = {
      id: String(mockPatients.length + 1),
      ...validatedData,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      createSuccessResponse('Paciente creado exitosamente', newPatient),
      { 
        status: 201,
        headers: {
          'X-API-Version': '1.0.0',
          'X-Platform': 'altamedica'
        }
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos inválidos', error.errors),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_ERROR', 'Error al crear paciente'),
      { status: 500 }
    );
  }
} 