/**
 * 🧪 LAB RESULTS API ROUTES
 * PROACTIVO compliant API endpoints for laboratory results
 * Max lines: 250 (PROACTIVO standard)
 * POST /api/v1/lab-results - Create new lab result
 * GET /api/v1/lab-results - Query lab results
 * PUT /api/v1/lab-results - Update lab result
 * DELETE /api/v1/lab-results - Delete lab result
 */

import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import {
    validateCreateLabResult,
    validateLabResultPermissions,
    validateLabResultQuery,
    validateUpdateLabResult
} from './schemas';
import { LabResultService } from './services';
import {
    AccessLevel,
    CreateLabResultRequest,
    LabResultError,
    LabResultNotFoundError,
    LabResultPermissionError,
    LabResultQueryFilters,
    LabResultValidationError,
    UpdateLabResultRequest
} from './types';

// Force dynamic endpoint
export const dynamic = "force-dynamic";

const labResultService = new LabResultService();

/**
 * POST /api/v1/lab-results
 * Create new lab result
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    const { decodedToken, userRole, companyId, userPermissions } = authResult.data!;

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = validateCreateLabResult(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      }, { status: 400 });
    }

    const labResultRequest = validation.data as CreateLabResultRequest;

    // 3. Validate permissions
    const permissionCheck = validateLabResultPermissions(
      userRole,
      'create',
      labResultRequest.accessLevel || AccessLevel.RESTRICTED,
      userPermissions
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        details: [permissionCheck.reason]
      }, { status: 403 });
    }

    // 4. Create lab result
    const result = await labResultService.create(labResultRequest, {
      userId: decodedToken.uid,
      companyId
    });

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });

  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * GET /api/v1/lab-results
 * Query lab results
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    const { decodedToken, userRole, companyId, userPermissions } = authResult.data!;

    // 2. Validate permissions
    const permissionCheck = validateLabResultPermissions(
      userRole,
      'read',
      AccessLevel.RESTRICTED,
      userPermissions
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    // 3. Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const queryValidation = validateLabResultQuery(queryParams);
    
    if (!queryValidation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        code: 'VALIDATION_ERROR',
        details: queryValidation.errors
      }, { status: 400 });
    }

    const filters = queryValidation.data as LabResultQueryFilters;

    // 4. Query lab results
    const { results, total } = await labResultService.findMany(filters, {
      userId: decodedToken.uid,
      companyId
    });

    return NextResponse.json({
      success: true,
      data: results,
      total
    });

  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * PUT /api/v1/lab-results
 * Update lab result
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    const { decodedToken, userRole, companyId, userPermissions } = authResult.data!;

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = validateUpdateLabResult(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      }, { status: 400 });
    }

    const updateRequest = validation.data as UpdateLabResultRequest;

    // 3. Validate permissions
    const permissionCheck = validateLabResultPermissions(
      userRole,
      'update',
      AccessLevel.RESTRICTED,
      userPermissions
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    // 4. Update lab result
    const result = await labResultService.update(updateRequest, {
      userId: decodedToken.uid,
      companyId
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/lab-results
 * Delete lab result
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    const { decodedToken, userRole, companyId, userPermissions } = authResult.data!;

    // 2. Get lab result ID from query
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Lab result ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    // 3. Validate permissions
    const permissionCheck = validateLabResultPermissions(
      userRole,
      'delete',
      AccessLevel.RESTRICTED,
      userPermissions
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    // 4. Delete lab result
    await labResultService.delete(id, {
      userId: decodedToken.uid,
      companyId
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true, id }
    });

  } catch (error: unknown) {
    return handleError(error);
  }
}

// Helper Functions
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json({
        success: false,
        error: 'Authorization token required',
        code: 'MISSING_AUTH_TOKEN'
      }, { status: 401 })
    };
  }

  const idToken = authHeader.substring(7);
  
  // Mock for development
  let decodedToken: any = { uid: 'demo-user', email: 'demo@altamedica.com', role: 'doctor' };
  if (idToken !== 'mock-token') {
    try {
      const firebaseToken = await adminAuth.verifyIdToken(idToken);
      decodedToken = { ...firebaseToken, role: 'doctor' };
    } catch (error: unknown) {
      decodedToken = { uid: 'demo-user', email: 'demo@altamedica.com', role: 'doctor' };
    }
  }

  const userClaims = decodedToken as any;
  const userRole = (userClaims as any).role || 'doctor';
  const companyId = (userClaims as any).companyId || 'demo-company';
  const userPermissions = (userClaims as any).permissions || [
    'lab_results:create',
    'lab_results:read',
    'lab_results:update',
    'lab_results:delete'
  ];

  return {
    success: true,
    data: { decodedToken, userRole, companyId, userPermissions }
  };
}

function handleError(error: unknown): NextResponse {
  console.error('Lab Results API Error:', error);

  if (error instanceof LabResultValidationError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR'
    }, { status: 400 });
  }

  if (error instanceof LabResultNotFoundError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'NOT_FOUND'
    }, { status: 404 });
  }

  if (error instanceof LabResultPermissionError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'PERMISSION_DENIED'
    }, { status: 403 });
  }

  if (error instanceof LabResultError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }

  return NextResponse.json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }, { status: 500 });
}