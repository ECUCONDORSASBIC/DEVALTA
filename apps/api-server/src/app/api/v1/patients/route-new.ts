/**
 * 🏥 PATIENTS API - ALTAMEDICA (NEW IMPLEMENTATION)
 * Endpoint usando Service Pattern + Unified Auth
 * IMPLEMENTADO: Era uno de los endpoints faltantes críticos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for patient queries
const PatientSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'all']).default('all'),
  hasChronicConditions: z.coerce.boolean().optional(),
  ageRange: z.enum(['0-18', '19-35', '36-65', '65+', 'all']).default('all'),
  isActive: z.coerce.boolean().optional(),
  lastVisit: z.enum(['week', 'month', '3months', '6months', 'year', 'all']).default('all'),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema for creating patients
const CreatePatientSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  allergies: z.array(z.object({
    allergen: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    reaction: z.string(),
    notes: z.string().optional()
  })).default([]),
  chronicConditions: z.array(z.object({
    condition: z.string(),
    diagnosedDate: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    medications: z.array(z.string()).default([]),
    notes: z.string().optional()
  })).default([]),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    email: z.string().email().optional()
  }),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    groupNumber: z.string().optional(),
    expirationDate: z.string().optional()
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('AR')
  }),
  preferredLanguage: z.string().default('es'),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  occupation: z.string().optional(),
  medicalHistory: z.array(z.object({
    condition: z.string(),
    date: z.string(),
    description: z.string(),
    resolved: z.boolean().default(false)
  })).default([])
});

/**
 * GET /api/v1/patients
 * List patients with advanced filtering (doctors and admins only)
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = PatientSearchSchema.parse(Object.fromEntries(searchParams));
      
      const { page, limit, search, bloodType, hasChronicConditions, ageRange, isActive, lastVisit, sortBy, sortOrder } = searchData;
      const offset = (page - 1) * limit;

      // Build query - only users with role 'patient'
      let query: any = adminDb.collection('users').where('role', '==', 'patient');

      // Apply role-based filtering for doctors
      if (authContext.user.role === 'doctor') {
        // Doctors can only see their own patients
        const doctorPatientsQuery = await adminDb.collection('appointments')
          .where('doctorId', '==', authContext.user.uid)
          .get();
        
        const patientIds = [...new Set(doctorPatientsQuery.docs.map(doc => doc.data().patientId))];
        
        if (patientIds.length === 0) {
          return NextResponse.json(
            createSuccessResponse([], {
              total: 0, page, limit, hasNext: false, hasPrev: false
            })
          );
        }

        // Batch the patient IDs (Firestore limit of 10 for 'in' queries)
        const patientChunks = chunkArray(patientIds, 10);
        const allPatients = [];

        for (const chunk of patientChunks) {
          const chunkQuery = await adminDb.collection('users')
            .where('role', '==', 'patient')
            .where('__name__', 'in', chunk.map(id => adminDb.collection('users').doc(id)))
            .get();
          
          allPatients.push(...chunkQuery.docs);
        }

        // Process the results manually since we can't apply other filters in the same query
        let patients = allPatients.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate() || doc.data().updatedAt
        }));

        // Apply manual filters
        patients = applyManualFilters(patients, searchData);

        // Manual pagination and sorting
        patients.sort((a, b) => {
          if (sortOrder === 'asc') {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          }
          return a[sortBy] < b[sortBy] ? 1 : -1;
        });

        const total = patients.length;
        const paginatedPatients = patients.slice(offset, offset + limit);

        // OPTIMIZATION: Batch fetch patient profiles
        const patientProfilesMap = await batchFetchPatientProfiles(paginatedPatients.map(p => p.id));

        // Enrich patients with profile data
        const enrichedPatients = paginatedPatients.map(patient => ({
          ...patient,
          profile: patientProfilesMap.get(patient.id)
        }));

        return NextResponse.json(
          createSuccessResponse(enrichedPatients, {
            total,
            page,
            limit,
            hasNext: offset + limit < total,
            hasPrev: page > 1
          })
        );

      } else {
        // Admin can see all patients with full query capabilities
        
        // Apply filters
        if (isActive !== undefined) {
          query = query.where('isActive', '==', isActive);
        }

        // Order and paginate
        query = query.orderBy(sortBy, sortOrder).offset(offset).limit(limit);

        const snapshot = await query.get();

        // Process patients
        let patients = [];
        const patientIds = [];

        for (const doc of snapshot.docs) {
          const userData = doc.data();
          
          patients.push({
            id: doc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || userData.createdAt,
            updatedAt: userData.updatedAt?.toDate() || userData.updatedAt
          });
          
          patientIds.push(doc.id);
        }

        // Apply manual filters that can't be done in Firestore
        patients = applyManualFilters(patients, searchData);

        // OPTIMIZATION: Batch fetch patient profiles
        const patientProfilesMap = await batchFetchPatientProfiles(patientIds);

        // Enrich patients with profile data and recent activity
        const enrichedPatients = await Promise.all(patients.map(async (patient) => {
          const profile = patientProfilesMap.get(patient.id);
          
          // Get recent appointments for context
          const recentAppointments = await adminDb.collection('appointments')
            .where('patientId', '==', patient.id)
            .orderBy('scheduledAt', 'desc')
            .limit(3)
            .get();

          return {
            ...patient,
            profile,
            recentActivity: {
              lastAppointment: recentAppointments.docs[0]?.data()?.scheduledAt?.toDate() || null,
              appointmentCount: recentAppointments.size,
              recentAppointments: recentAppointments.docs.map(doc => ({
                id: doc.id,
                scheduledAt: doc.data().scheduledAt?.toDate(),
                type: doc.data().type,
                status: doc.data().status
              }))
            }
          };
        }));

        // Get total count
        const totalQuery = adminDb.collection('users').where('role', '==', 'patient');
        const totalSnapshot = await totalQuery.get();

        return NextResponse.json(
          createSuccessResponse(enrichedPatients, {
            total: totalSnapshot.size,
            page,
            limit,
            hasNext: offset + limit < totalSnapshot.size,
            hasPrev: page > 1
          })
        );
      }

    } catch (error) {
      console.error('Error in GET /patients:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching patients'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'nurse'],
    auditAction: 'patients_list_accessed',
    rateLimitKey: 'patients'
  }
);

/**
 * POST /api/v1/patients
 * Create new patient (admin and doctors only)
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      const patientData = CreatePatientSchema.parse(body);

      // Check if email already exists
      const existingUserQuery = await adminDb.collection('users')
        .where('email', '==', patientData.email)
        .limit(1)
        .get();

      if (!existingUserQuery.empty) {
        return NextResponse.json(
          createErrorResponse('EMAIL_EXISTS', 'A user with this email already exists'),
          { status: 409 }
        );
      }

      // Calculate age for categorization
      const birthDate = new Date(patientData.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      // Create patient user profile
      const newPatient = {
        email: patientData.email,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        role: 'patient',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: authContext.user.uid,
        
        // Basic patient info
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        age: age,
        preferredLanguage: patientData.preferredLanguage,
        address: patientData.address
      };

      const patientRef = await adminDb.collection('users').add(newPatient);

      // Create detailed patient profile in separate collection
      await adminDb.collection('patients').doc(patientRef.id).set({
        userId: patientRef.id,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies,
        chronicConditions: patientData.chronicConditions,
        emergencyContact: patientData.emergencyContact,
        insurance: patientData.insurance,
        height: patientData.height,
        weight: patientData.weight,
        occupation: patientData.occupation,
        medicalHistory: patientData.medicalHistory,
        
        // Medical tracking fields
        lastCheckup: null,
        nextAppointment: null,
        primaryDoctorId: null,
        riskLevel: calculateRiskLevel(patientData),
        
        // System fields
        createdAt: new Date(),
        updatedAt: new Date(),
        isMinor: age < 18,
        hasChronicConditions: patientData.chronicConditions.length > 0,
        hasAllergies: patientData.allergies.length > 0
      });

      // Create welcome notification
      await adminDb.collection('notifications').add({
        userId: patientRef.id,
        type: 'welcome_patient',
        title: 'Bienvenido a AltaMédica',
        message: `Hola ${patientData.firstName}, tu cuenta de paciente ha sido creada exitosamente`,
        data: {
          patientId: patientRef.id,
          nextSteps: ['complete_profile', 'schedule_appointment', 'upload_documents']
        },
        isRead: false,
        createdAt: new Date()
      });

      // Audit log for HIPAA compliance
      await adminDb.collection('audit_logs').add({
        action: 'patient_created',
        userId: authContext.user.uid,
        resourceType: 'patient',
        resourceId: patientRef.id,
        details: {
          email: patientData.email,
          hasChronicConditions: patientData.chronicConditions.length > 0,
          hasAllergies: patientData.allergies.length > 0,
          age: age,
          riskLevel: calculateRiskLevel(patientData)
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });

      return NextResponse.json(
        createSuccessResponse({
          id: patientRef.id,
          ...newPatient,
          age: age,
          riskLevel: calculateRiskLevel(patientData)
        }),
        { status: 201 }
      );

    } catch (error) {
      console.error('Error in POST /patients:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid patient data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error creating patient'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    requiredPermissions: ['patients:create'],
    auditAction: 'patient_created',
    rateLimitKey: 'patient_create'
  }
);

// Helper functions
async function batchFetchPatientProfiles(patientIds: string[]): Promise<Map<string, any>> {
  if (patientIds.length === 0) return new Map();

  const profilesMap = new Map();
  const chunks = chunkArray(patientIds, 10);

  for (const chunk of chunks) {
    const profilesSnapshot = await adminDb.collection('patients')
      .where('userId', 'in', chunk)
      .get();

    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      profilesMap.set(profileData.userId, {
        bloodType: profileData.bloodType,
        allergies: profileData.allergies,
        chronicConditions: profileData.chronicConditions,
        emergencyContact: profileData.emergencyContact,
        insurance: profileData.insurance,
        height: profileData.height,
        weight: profileData.weight,
        occupation: profileData.occupation,
        lastCheckup: profileData.lastCheckup?.toDate() || profileData.lastCheckup,
        nextAppointment: profileData.nextAppointment?.toDate() || profileData.nextAppointment,
        primaryDoctorId: profileData.primaryDoctorId,
        riskLevel: profileData.riskLevel,
        isMinor: profileData.isMinor,
        hasChronicConditions: profileData.hasChronicConditions,
        hasAllergies: profileData.hasAllergies
      });
    }
  }

  return profilesMap;
}

function applyManualFilters(patients: any[], searchData: any): any[] {
  let filtered = [...patients];

  // Search filter
  if (searchData.search) {
    const searchTerm = searchData.search.toLowerCase();
    filtered = filtered.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = patient.email?.toLowerCase() || '';
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  }

  // Age range filter
  if (searchData.ageRange !== 'all') {
    filtered = filtered.filter(patient => {
      const age = patient.age || 0;
      switch (searchData.ageRange) {
        case '0-18': return age <= 18;
        case '19-35': return age >= 19 && age <= 35;
        case '36-65': return age >= 36 && age <= 65;
        case '65+': return age > 65;
        default: return true;
      }
    });
  }

  return filtered;
}

function calculateRiskLevel(patientData: any): 'low' | 'medium' | 'high' {
  let riskScore = 0;

  // Age factor
  const birthDate = new Date(patientData.dateOfBirth);
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (age > 65) riskScore += 2;
  else if (age > 50) riskScore += 1;

  // Chronic conditions
  riskScore += patientData.chronicConditions?.length || 0;

  // Severe allergies
  const severeAllergies = patientData.allergies?.filter((a: any) => a.severity === 'severe').length || 0;
  riskScore += severeAllergies;

  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}