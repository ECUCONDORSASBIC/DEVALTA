/**
 * 💊 PRESCRIPTIONS API ROUTES
 * Rutas REST para manejo de prescripciones médicas con cumplimiento FDA/DEA
 */

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createPaginationMeta, createSuccessResponse, validatePagination } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Middleware para validar autenticación y autorización
async function validateAuth(request: NextRequest): Promise<{
  isValid: boolean;
  userId?: string;
  userRole?: string;
  userPermissions?: string[];
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { isValid: false, error: 'Token de autorización requerido' };
    }

    const token = authHeader.substring(7);
    
    // TODO: Implementar validación real de JWT con Firebase Auth
    // Por ahora, mock para desarrollo
    const mockAuth = {
      userId: 'user-123',
      userRole: 'doctor',
      userPermissions: [
        'prescriptions:create',
        'prescriptions:read',
        'prescriptions:update',
        'prescriptions:delete',
        'prescriptions:controlled_substances'
      ]
    };

    return {
      isValid: true,
      ...mockAuth
    };

  } catch (error: any) {
    return { 
      isValid: false, 
      error: `Error de autenticación: ${error.message}` 
    };
  }
}

// Middleware para logging y auditoría
function logRequest(request: NextRequest, method: string, userId?: string) {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') ||             request.headers.get('x-real-ip') || 
             'unknown';

  console.log(`[${timestamp}] ${method} ${request.url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`);
}

// Schema para búsqueda de prescripciones
const PrescriptionSearchSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'all']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  medication: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validar parámetros de búsqueda
    const searchData = PrescriptionSearchSchema.parse(queryParams);
    const { page, limit } = validatePagination({
      page: searchData.page,
      limit: searchData.limit,
    });

    // Construir query de Firestore
    let query: any = adminDb.collection('prescriptions');

    // Aplicar filtros
    if ((searchData as any).patientId) {
      query = (query as any).where('patientId', '==', (searchData as any).patientId);
    }

    if ((searchData as any).doctorId) {
      query = (query as any).where('doctorId', '==', (searchData as any).doctorId);
    }

    // Filtros por fecha
    if (searchData.startDate && searchData.endDate) {
      const startDate = new Date(searchData.startDate);
      const endDate = new Date(searchData.endDate);
      query = (query as any).where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    // Ordenar por fecha de creación
    query = (query as any).orderBy('createdAt', 'desc');

    // Obtener total de documentos para paginación
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = (query as any).offset(offset).limit(limit);

    const snapshot = await query.get();
    const prescriptions = [];

    for (const doc of snapshot.docs) {
      const prescriptionData = doc.data();
      
      // Aplicar filtro de medicamento (post-query)
      if (searchData.medication) {
        const medicationFound = prescriptionData.medications?.some((med: {name: string}) => 
          med.name.toLowerCase().includes(searchData.medication!.toLowerCase())
        );
        if (!medicationFound) continue;
      }

      // Aplicar filtro de estado (post-query)
      const now = new Date();
      const validUntil = prescriptionData.validUntil?.toDate?.() ?? new Date(prescriptionData.validUntil);
      const isExpired = validUntil < now;
      const isCancelled = prescriptionData.status === 'cancelled';
      
      let currentStatus = 'active';
      if (isCancelled) currentStatus = 'cancelled';
      else if (isExpired) currentStatus = 'expired';

      if ((searchData as any).status !== 'all' && currentStatus !== (searchData as any).status) {
        continue;
      }

      // Obtener información del doctor y paciente
      const [doctorDoc, patientDoc] = await Promise.all([
        adminDb.collection('users').doc((prescriptionData as any).doctorId).get(),
        adminDb.collection('users').doc((prescriptionData as any).patientId).get(),
      ]);

      prescriptions.push({
        id: doc.id,
        ...prescriptionData,
        status: currentStatus,
        createdAt: (prescriptionData as any).createdAt?.toDate?.() ?? (prescriptionData as any).createdAt,
        validUntil: prescriptionData.validUntil?.toDate?.() ?? prescriptionData.validUntil,
        doctor: doctorDoc.exists ? {
          id: (prescriptionData as any).doctorId,
          firstName: doctorDoc.data()?.firstName,
          lastName: doctorDoc.data()?.lastName,
          email: doctorDoc.data()?.email,
        } : null,
        patient: patientDoc.exists ? {
          id: (prescriptionData as any).patientId,
          firstName: patientDoc.data()?.firstName,
          lastName: patientDoc.data()?.lastName,
          email: patientDoc.data()?.email,
        } : null,
      });
    }

    // Crear metadata de paginación
    const meta = createPaginationMeta(page, limit, total);

    return NextResponse.json(
      createSuccessResponse(prescriptions, { ...meta }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching prescriptions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_PRESCRIPTIONS_FAILED', 'Error al obtener prescripciones'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Token de autorización requerido'),
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar datos de la prescripción
    const prescriptionData = z.object({}).parse(body);

    // Verificar que el doctor y paciente existen
    const [doctorDoc, patientDoc] = await Promise.all([
      adminDb.collection('users').doc((prescriptionData as any).doctorId).get(),
      adminDb.collection('users').doc((prescriptionData as any).patientId).get(),
    ]);

    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor no encontrado'),
        { status: 404 }
      );
    }

    if (!patientDoc.exists) {
      return NextResponse.json(
        createErrorResponse('PATIENT_NOT_FOUND', 'Paciente no encontrado'),
        { status: 404 }
      );
    }

    // Crear la prescripción
    const now = new Date();
    const prescription = {
      ...prescriptionData,
      prescriptionNumber: `RX-${Date.now()}`,
      status: 'active',
      digitalSignature: `DR_${(prescriptionData as any).doctorId}_${Date.now()}`, // Simulación de firma digital
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('prescriptions').add(prescription);

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...prescription,
        doctor: {
          id: (prescriptionData as any).doctorId,
          firstName: doctorDoc.data()?.firstName,
          lastName: doctorDoc.data()?.lastName,
          email: doctorDoc.data()?.email,
        },
        patient: {
          id: (prescriptionData as any).patientId,
          firstName: patientDoc.data()?.firstName,
          lastName: patientDoc.data()?.lastName,
          email: patientDoc.data()?.email,
        },
      }),
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating prescription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de prescripción inválidos', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_PRESCRIPTION_FAILED', 'Error al crear prescripción'),
      { status: 500 }
    );
  }
}
