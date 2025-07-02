import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@altamedica/shared';
import { adminAuth, adminDb } from '@altamedica/firebase';
import { z } from 'zod';
import { 
  FinOpsEstimator, 
  CostEstimationRequestSchema, 
  MedicalAPIUsageMetrics,
  estimateAPICallCost 
} from '@/lib/finops-estimator';

// Force dynamic rendering for real-time cost calculations
export const dynamic = "force-dynamic";

// Schema for usage analytics request
const UsageAnalyticsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
  userGrowthRate: z.number().min(0).max(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - only admins can access FinOps data
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Token de autorización requerido'),
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user has admin role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Acceso denegado - Solo administradores'),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryData = UsageAnalyticsSchema.parse(Object.fromEntries(searchParams));

    // Get current usage metrics from Firebase
    const usageMetrics = await getCurrentUsageMetrics(queryData.startDate, queryData.endDate);
    
    // Initialize FinOps estimator
    const estimator = FinOpsEstimator.getInstance();
    
    // Calculate cost breakdown
    const costBreakdown = estimator.estimateMedicalAPICosts(
      usageMetrics, 
      queryData.timeframe
    );

    // Generate optimization recommendations
    const optimizations = estimator.generateOptimizationRecommendations(costBreakdown);

    // Calculate per-endpoint costs
    const endpointCosts = [
      { endpoint: 'POST /patients', cost: estimateAPICallCost('/patients', 'POST') },
      { endpoint: 'GET /patients', cost: estimateAPICallCost('/patients', 'GET') },
      { endpoint: 'GET /patients/:id/records', cost: estimateAPICallCost('/patients/:id/records', 'GET') },
      { endpoint: 'POST /medical-records', cost: estimateAPICallCost('/medical-records', 'POST') },
      { endpoint: 'GET /auth/login', cost: estimateAPICallCost('/auth/login', 'GET') },
    ];

    // Predict future costs if growth rate provided
    let futureProjection = null;
    if (queryData.userGrowthRate) {
      futureProjection = estimator.predictMonthlyCosts(usageMetrics, queryData.userGrowthRate);
    }

    const responseData = {
      currentCosts: costBreakdown,
      usageMetrics,
      endpointCosts,
      optimizations,
      futureProjection,
      metadata: {
        calculatedAt: new Date().toISOString(),
        timeframe: queryData.timeframe,
        dataSource: 'firebase_analytics',
      },
    };

    return NextResponse.json(
      createSuccessResponse(responseData),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error calculating FinOps cost estimation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros inválidos', { 
          validationErrors: error.errors 
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FINOPS_CALCULATION_FAILED', 'Error al calcular estimación de costos'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Token de autorización requerido'),
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check admin access
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Acceso denegado - Solo administradores'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const requestData = CostEstimationRequestSchema.parse(body);

    const estimator = FinOpsEstimator.getInstance();
    
    // Calculate costs based on provided operations
    const totalCost = estimator.estimateOperationCosts(
      requestData.operations.map(op => ({ type: op.type, count: op.count }))
    );

    // Build detailed breakdown if metrics provided
    let detailedBreakdown = null;
    if (requestData.userCount && requestData.storageUsageGB) {
      const metrics: MedicalAPIUsageMetrics = {
        patientOperations: {
          creates: requestData.operations.filter(op => op.type === 'write').reduce((sum, op) => sum + op.count, 0),
          reads: requestData.operations.filter(op => op.type === 'read').reduce((sum, op) => sum + op.count, 0),
          updates: requestData.operations.filter(op => op.type === 'write').reduce((sum, op) => sum + op.count, 0) * 0.3,
          deletes: requestData.operations.filter(op => op.type === 'delete').reduce((sum, op) => sum + op.count, 0),
        },
        medicalRecordOperations: {
          creates: requestData.operations.filter(op => op.type === 'write').reduce((sum, op) => sum + op.count, 0) * 0.5,
          reads: requestData.operations.filter(op => op.type === 'read').reduce((sum, op) => sum + op.count, 0) * 2,
          updates: requestData.operations.filter(op => op.type === 'write').reduce((sum, op) => sum + op.count, 0) * 0.2,
          deletes: requestData.operations.filter(op => op.type === 'delete').reduce((sum, op) => sum + op.count, 0) * 0.1,
        },
        authOperations: {
          logins: requestData.operations.filter(op => op.type === 'auth').reduce((sum, op) => sum + op.count, 0),
          registrations: requestData.operations.filter(op => op.type === 'auth').reduce((sum, op) => sum + op.count, 0) * 0.1,
          tokenRefreshes: requestData.operations.filter(op => op.type === 'auth').reduce((sum, op) => sum + op.count, 0) * 3,
        },
        storageMetrics: {
          documentsGB: requestData.storageUsageGB * 0.6,
          imagesGB: requestData.storageUsageGB * 0.3,
          backupsGB: requestData.storageUsageGB * 0.1,
        },
      };

      detailedBreakdown = estimator.estimateMedicalAPICosts(
        metrics,
        requestData.timeframe,
        requestData.userCount
      );
    }

    const responseData = {
      estimatedCost: totalCost,
      timeframe: requestData.timeframe,
      currency: 'USD',
      detailedBreakdown,
      operations: requestData.operations,
      calculatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      createSuccessResponse(responseData),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error processing FinOps cost estimation request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de solicitud inválidos', { 
          validationErrors: error.errors 
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FINOPS_ESTIMATION_FAILED', 'Error al procesar estimación de costos'),
      { status: 500 }
    );
  }
}

// Helper function to get current usage metrics from Firebase
async function getCurrentUsageMetrics(
  startDate?: string, 
  endDate?: string
): Promise<MedicalAPIUsageMetrics> {
  try {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get patients metrics
    const patientsSnapshot = await adminDb
      .collection('patients')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    // Get medical records metrics
    const recordsSnapshot = await adminDb
      .collection('medical_records')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    // Get auth metrics (approximate from user activity)
    const usersSnapshot = await adminDb
      .collection('users')
      .where('metadata.lastSignIn', '>=', start)
      .where('metadata.lastSignIn', '<=', end)
      .get();

    // Calculate storage usage (rough estimate)
    const totalPatients = patientsSnapshot.size;
    const totalRecords = recordsSnapshot.size;
    const estimatedDocumentsGB = (totalPatients * 0.001) + (totalRecords * 0.005); // Rough estimates
    const estimatedImagesGB = totalRecords * 0.02; // Assume some records have images
    const estimatedBackupsGB = estimatedDocumentsGB * 0.1;

    return {
      patientOperations: {
        creates: patientsSnapshot.size,
        reads: patientsSnapshot.size * 5, // Estimate 5 reads per patient
        updates: patientsSnapshot.size * 2, // Estimate 2 updates per patient
        deletes: Math.floor(patientsSnapshot.size * 0.01), // 1% deletion rate
      },
      medicalRecordOperations: {
        creates: recordsSnapshot.size,
        reads: recordsSnapshot.size * 3, // Estimate 3 reads per record
        updates: recordsSnapshot.size * 1.5, // Estimate 1.5 updates per record
        deletes: Math.floor(recordsSnapshot.size * 0.005), // 0.5% deletion rate
      },
      authOperations: {
        logins: usersSnapshot.size * 10, // Estimate 10 logins per active user
        registrations: Math.floor(usersSnapshot.size * 0.1), // 10% new registrations
        tokenRefreshes: usersSnapshot.size * 20, // Estimate 20 token refreshes per user
      },
      storageMetrics: {
        documentsGB: estimatedDocumentsGB,
        imagesGB: estimatedImagesGB,
        backupsGB: estimatedBackupsGB,
      },
    };
  } catch (error) {
    console.error('Error getting usage metrics:', error);
    
    // Return default metrics if unable to fetch real data
    return {
      patientOperations: {
        creates: 100,
        reads: 500,
        updates: 200,
        deletes: 1,
      },
      medicalRecordOperations: {
        creates: 300,
        reads: 900,
        updates: 450,
        deletes: 2,
      },
      authOperations: {
        logins: 1000,
        registrations: 10,
        tokenRefreshes: 2000,
      },
      storageMetrics: {
        documentsGB: 1.5,
        imagesGB: 0.8,
        backupsGB: 0.2,
      },
    };
  }
}
