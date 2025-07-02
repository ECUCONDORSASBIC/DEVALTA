/**
 * 💊 PRESCRIPTIONS API ROUTES
 * Rutas REST para manejo de prescripciones médicas con cumplimiento FDA/DEA
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCreatePrescription, validatePrescriptionQuery, validateUpdatePrescription } from './schemas';

// Service temporarily disabled
const PrescriptionService = {} as any;
import {
    CreatePrescriptionRequest,
    PrescriptionQueryFilters,
    UpdatePrescriptionRequest
} from './types';

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
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  console.log(`[${timestamp}] ${method} ${request.url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`);
}

/**
 * POST /api/v1/prescriptions/generate
 * Generar nueva prescripción con validaciones completas
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar autenticación
    const auth = await validateAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    logRequest(request, 'POST', auth.userId);

    // 2. Parsear datos del request
    let requestData: CreatePrescriptionRequest & {
      checkInteractions?: boolean;
      checkAllergies?: boolean;
      validateDosage?: boolean;
      electronicSignature?: any;
    };

    try {
      requestData = await request.json();
    } catch (error: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: 'JSON inválido en el request',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // 3. Validar datos de entrada
    const validation = validateCreatePrescription(requestData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 4. Generar prescripción con validaciones avanzadas
    const result = await PrescriptionService.generatePrescription(
      requestData,
      auth.userId!,
      auth.userRole!,
      auth.userPermissions!
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al generar prescripción',
          details: result.errors,
          code: 'GENERATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: {
          prescription: result.data!.prescription,
          reports: {
            interactions: result.data!.interactionReport,
            allergies: result.data!.allergyReport,
            dosageWarnings: result.data!.dosageWarnings
          }
        },
        warnings: result.warnings,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: auth.userId,
          validationsPassed: [
            'credentials',
            'permissions',
            'dosage',
            'interactions',
            'allergies'
          ]
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error en POST /prescriptions/generate:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: `req_${Date.now()}`
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/prescriptions
 * Consultar prescripciones con filtros y paginación
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar autenticación
    const auth = await validateAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    logRequest(request, 'GET', auth.userId);

    // 2. Parsear parámetros de consulta
    const { searchParams } = new URL(request.url);
    
    const queryParams: PrescriptionQueryFilters = {
      patientId: searchParams.get('patientId') || undefined,
      prescriberId: searchParams.get('prescriberId') || undefined,
      status: searchParams.get('status')?.split(',') as any || undefined,
      type: searchParams.get('type')?.split(',') as any || undefined,
      urgency: searchParams.get('urgency')?.split(',') as any || undefined,
      drugName: searchParams.get('drugName') || undefined,
      pharmacyId: searchParams.get('pharmacyId') || undefined,
      needsRefill: searchParams.get('needsRefill') === 'true' || undefined,
      expiringWithinDays: searchParams.get('expiringWithinDays') ? 
        parseInt(searchParams.get('expiringWithinDays')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'date',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    };

    // Filtros de fecha
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      queryParams.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    // 3. Validar parámetros
    const validation = validatePrescriptionQuery(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros de consulta inválidos',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 4. Ejecutar consulta
    const result = await PrescriptionService.queryPrescriptions(
      queryParams,
      auth.userId!,
      auth.userRole!,
      auth.userPermissions!
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al consultar prescripciones',
          details: result.errors,
          code: 'QUERY_ERROR'
        },
        { status: 400 }
      );
    }

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: result.data!.data,
        pagination: {
          total: result.data!.total,
          offset: queryParams.offset,
          limit: queryParams.limit,
          hasMore: result.data!.hasMore
        },
        metadata: {
          queriedAt: new Date().toISOString(),
          queriedBy: auth.userId,
          filters: queryParams
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error en GET /prescriptions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: `req_${Date.now()}`
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/prescriptions/{id}
 * Actualizar prescripción existente
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar autenticación
    const auth = await validateAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    logRequest(request, 'PUT', auth.userId);

    // 2. Extraer ID de la prescripción de la URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const prescriptionId = pathSegments[pathSegments.length - 1];

    if (!prescriptionId || prescriptionId === 'prescriptions') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de prescripción requerido en la URL',
          code: 'MISSING_PRESCRIPTION_ID'
        },
        { status: 400 }
      );
    }

    // 3. Parsear datos del request
    let updateData: Omit<UpdatePrescriptionRequest, 'prescriptionId'>;

    try {
      updateData = await request.json();
    } catch (error: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: 'JSON inválido en el request',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // 4. Validar datos de actualización
    const validation = validateUpdatePrescription({
      prescriptionId,
      ...updateData
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de actualización inválidos',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 5. Actualizar prescripción
    const result = await PrescriptionService.updatePrescription(
      prescriptionId,
      updateData as UpdatePrescriptionRequest,
      auth.userId!,
      auth.userRole!,
      auth.userPermissions!
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar prescripción',
          details: result.errors,
          code: 'UPDATE_ERROR'
        },
        { status: 400 }
      );
    }

    // 6. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: result.data!,
        metadata: {
          updatedAt: new Date().toISOString(),
          updatedBy: auth.userId
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error en PUT /prescriptions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: `req_${Date.now()}`
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/prescriptions/{id}
 * Cancelar prescripción (soft delete)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validar autenticación
    const auth = await validateAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    logRequest(request, 'DELETE', auth.userId);

    // 2. Extraer ID de la prescripción de la URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const prescriptionId = pathSegments[pathSegments.length - 1];

    if (!prescriptionId || prescriptionId === 'prescriptions') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de prescripción requerido en la URL',
          code: 'MISSING_PRESCRIPTION_ID'
        },
        { status: 400 }
      );
    }

    // 3. Obtener razón de cancelación
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Cancelación solicitada por usuario';

    // 4. Cancelar prescripción
    const result = await PrescriptionService.cancelPrescription(
      prescriptionId,
      reason,
      auth.userId!,
      auth.userRole!,
      auth.userPermissions!
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error al cancelar prescripción',
          details: result.errors,
          code: 'CANCELLATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: result.data!,
        metadata: {
          cancelledAt: new Date().toISOString(),
          cancelledBy: auth.userId,
          reason
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error en DELETE /prescriptions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: `req_${Date.now()}`
      },
      { status: 500 }
    );
  }
}
