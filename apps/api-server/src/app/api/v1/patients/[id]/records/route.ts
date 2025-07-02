import { adminDb, adminAuth } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse, createPaginationMeta, validatePagination } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for clinical records query parameters
const ClinicalRecordsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  type: z.enum(['consultation', 'diagnosis', 'treatment', 'test_result', 'prescription', 'other']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorId: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  includePrivate: z.string().optional().transform(val => val === 'true'),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: patientId } = await params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const queryData = ClinicalRecordsQuerySchema.parse(queryParams);
    const { page, limit } = validatePagination({
      page: queryData.page,
      limit: queryData.limit,
    });

    // Verify patient exists
    const patientDoc = await adminDb.collection('patients').doc(patientId).get();
    if (!patientDoc.exists) {
      return NextResponse.json(
        createErrorResponse('PATIENT_NOT_FOUND', 'Paciente no encontrado'),
        { status: 404 }
      );
    }

    // Auth check - verify token and permissions
    const authHeader = request.headers.get('Authorization');
    let currentUserId = null;
    let userRole = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        currentUserId = decodedToken.uid;
        userRole = decodedToken.role;
      } catch (authError) {
        return NextResponse.json(
          createErrorResponse('INVALID_TOKEN', 'Token de autorización inválido'),
          { status: 401 }
        );
      }
    }

    // Build Firestore query
    let query: any = adminDb.collection('medical_records')
      .where('patientId', '==', patientId);

    // Apply filters
    if (queryData.type) {
      query = query.where('type', '==', queryData.type);
    }

    if (queryData.doctorId) {
      query = query.where('doctorId', '==', queryData.doctorId);
    }

    if (queryData.priority) {
      query = query.where('priority', '==', queryData.priority);
    }

    // Date filters
    if (queryData.startDate) {
      query = query.where('createdAt', '>=', new Date(queryData.startDate));
    }

    if (queryData.endDate) {
      query = query.where('createdAt', '<=', new Date(queryData.endDate));
    }

    // Privacy filter - only show private records to patient or treating doctors
    if (!queryData.includePrivate || 
        (currentUserId !== patientId && userRole !== 'doctor')) {
      query = query.where('isPrivate', '==', false);
    }

    // Order by creation date (most recent first)
    query = query.orderBy('createdAt', 'desc');

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    const snapshot = await query.get();
    const records = [];

    // Process each record
    for (const doc of snapshot.docs) {
      const recordData = doc.data();
      
      // Get doctor information
      const doctorDoc = await adminDb.collection('users').doc(recordData.doctorId).get();
      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;

      // Get doctor profile
      let doctorProfile = null;
      if (doctorData) {
        const doctorProfileDoc = await adminDb.collection('doctors').doc(recordData.doctorId).get();
        doctorProfile = doctorProfileDoc.exists ? doctorProfileDoc.data() : null;
      }

      records.push({
        id: doc.id,
        recordNumber: recordData.recordNumber,
        type: recordData.type,
        title: recordData.title,
        description: recordData.description,
        diagnosis: recordData.diagnosis,
        symptoms: recordData.symptoms || [],
        medications: recordData.medications || [],
        testResults: recordData.testResults || [],
        notes: recordData.notes,
        priority: recordData.priority,
        isPrivate: recordData.isPrivate,
        status: recordData.status,
        appointmentId: recordData.appointmentId,
        createdAt: recordData.createdAt?.toDate?.() ?? recordData.createdAt,
        updatedAt: recordData.updatedAt?.toDate?.() ?? recordData.updatedAt,
        
        // Doctor information
        doctor: doctorData ? {
          id: recordData.doctorId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          specialties: doctorProfile?.specialties || [],
          licenseNumber: doctorProfile?.licenseNumber,
          hospital: doctorProfile?.hospital,
        } : null,
      });
    }

    // Create pagination metadata
    const meta = createPaginationMeta(page, limit, total);

    // Additional clinical summary for the patient
    const clinicalSummary = {
      totalRecords: total,
      recordTypes: await getClinicalRecordTypes(patientId),
      lastVisit: records.length > 0 ? records[0].createdAt : null,
      activePrescriptions: await getActivePrescriptions(patientId),
    };

    return NextResponse.json(
      createSuccessResponse(records, { 
        ...meta, 
        clinicalSummary 
      }),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error fetching patient clinical records:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { 
          validationErrors: error.errors 
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_CLINICAL_RECORDS_FAILED', 'Error al obtener historial clínico'),
      { status: 500 }
    );
  }
}

// Helper function to get record type statistics
async function getClinicalRecordTypes(patientId: string) {
  try {
    const recordsSnapshot = await adminDb
      .collection('medical_records')
      .where('patientId', '==', patientId)
      .get();

    const typeCount: Record<string, number> = {};
    
    recordsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return typeCount;
  } catch (error) {
    console.error('Error getting record types:', error);
    return {};
  }
}

// Helper function to get active prescriptions
async function getActivePrescriptions(patientId: string) {
  try {
    const prescriptionsSnapshot = await adminDb
      .collection('prescriptions')
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .get();

    return prescriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt,
    }));
  } catch (error) {
    console.error('Error getting active prescriptions:', error);
    return [];
  }
}
