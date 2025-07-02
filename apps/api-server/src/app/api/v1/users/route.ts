// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createPaginationMeta, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para consultas de usuarios
const UserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(['doctor', 'patient', 'admin', 'all']).default('all'),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(), // Buscar por nombre o email
  specialty: z.string().optional(), // Para doctores
});

// Schema para crear usuario
const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1, 'Nombre es requerido'),
  lastName: z.string().min(1, 'Apellido es requerido'),
  role: z.enum(['doctor', 'patient', 'admin']),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  
  // Campos específicos para doctores
  licenseNumber: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  consultationFee: z.number().optional(),
  
  // Campos específicos para pacientes
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
});

// GET - Lista todos los usuarios con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = UserQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, role, isActive, search, specialty } = queryData;
    const offset = (page - 1) * limit;

    // Construir query base
    let query: any = adminDb.collection('users') as any;

    // Aplicar filtros
    if (role !== 'all') {
      query = (query as any).where('role', '==', role);
    }

    if (isActive !== undefined) {
      query = (query as any).where('isActive', '==', isActive);
    }

    if (specialty && role === 'doctor') {
      query = (query as any).where('specialties', 'array-contains', specialty);
    }

    // Ordenar por fecha de creación
    query = (query as any).orderBy('createdAt', 'desc');

    // Obtener datos con paginación
    const snapshot = await query.offset(offset).limit(limit).get();
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Procesar resultados
    const users = [];
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Filtro de búsqueda en memoria (simple)
      if (search) {
        const searchTerm = search.toLowerCase();
        const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
        const email = userData.email?.toLowerCase() || '';
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          continue;
        }
      }

      // Remover campos sensibles
      const { password, ...safeUserData } = userData;

      users.push({
        id: doc.id,
        uid: doc.id,
        ...safeUserData,
        createdAt: (userData as any).createdAt?.toDate?.() ?? (userData as any).createdAt,
        updatedAt: userData.updatedAt?.toDate?.() ?? userData.updatedAt,
      });
    }

    const meta = createPaginationMeta(page, limit, total);

    return NextResponse.json(
      createSuccessResponse(users, meta as unknown as Record<string, unknown>),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching users:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_USERS_FAILED', 'Error al obtener usuarios'),
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = CreateUserSchema.parse(body);

    // Verificar que el email no existe
    const existingUser = await adminDb.collection('users')
      .where('email', '==', userData.email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        createErrorResponse('EMAIL_EXISTS', 'El email ya está registrado'),
        { status: 409 }
      );
    }

    // Validaciones específicas por rol
    if (userData.role === 'doctor') {
      if (!userData.licenseNumber || !userData.specialties?.length) {
        return NextResponse.json(
          createErrorResponse('DOCTOR_VALIDATION_FAILED', 'Doctores requieren número de licencia y especialidades'),
          { status: 400 }
        );
      }
    }

    if (userData.role === 'patient') {
      if (!userData.dateOfBirth) {
        return NextResponse.json(
          createErrorResponse('PATIENT_VALIDATION_FAILED', 'Pacientes requieren fecha de nacimiento'),
          { status: 400 }
        );
      }
    }

    // Crear el usuario en Firebase Auth (simulado para desarrollo)
    // En producción, usar: await adminAuth.createUser({ email, password })
    
    // Preparar datos del usuario
    const newUser = {
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Campos específicos por rol
      ...(userData.role === 'doctor' && {
        rating: 0,
        consultationCount: 0,
        availableHours: {},
      }),
      
      ...(userData.role === 'patient' && {
        medicalHistory: [],
        lastCheckup: null,
      }),
    };

    // Crear documento en Firestore
    const userRef = await adminDb.collection('users').add(newUser);

    // Registrar evento en el historial
    await adminDb.collection('user_events').add({
      userId: userRef.id,
      type: 'user_created',
      timestamp: new Date(),
      details: {
        role: userData.role,
        email: userData.email,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        id: userRef.id,
        uid: userRef.id,
        ...newUser,
      }),
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de usuario inválidos', { 
          errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_USER_FAILED', 'Error al crear usuario'),
      { status: 500 }
    );
  }
}
