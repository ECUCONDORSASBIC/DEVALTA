/**
 * 👨‍⚕️ DOCTORS API - ALTAMEDICA (REFACTORED)
 * Endpoint refactorizado usando Service Pattern + Unified Auth
 * MIGRADO: De DoctorService legacy + verifyToken a patrón estándar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { UserService } from '@/services/UserService';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Initialize service
const userService = new UserService();

// Schema for doctor queries
const DoctorSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  specialty: z.string().optional(),
  location: z.string().optional(),
  isAcceptingPatients: z.coerce.boolean().optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'all']).default('all'),
  rating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema for creating doctors
const CreateDoctorSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  medicalSchool: z.string().min(1, 'Medical school is required'),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()),
  experience: z.number().min(0).max(50),
  consultationFee: z.number().min(0),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('AR')
  }),
  availability: z.object({
    monday: z.array(z.string()).default([]),
    tuesday: z.array(z.string()).default([]),
    wednesday: z.array(z.string()).default([]),
    thursday: z.array(z.string()).default([]),
    friday: z.array(z.string()).default([]),
    saturday: z.array(z.string()).default([]),
    sunday: z.array(z.string()).default([])
  }).optional(),
  languages: z.array(z.string()).default(['es']),
  bio: z.string().optional(),
  isAcceptingPatients: z.boolean().default(true)
});

/**
 * GET /api/v1/doctors
 * List doctors with advanced filtering
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = DoctorSearchSchema.parse(Object.fromEntries(searchParams));
      
      const { page, limit, specialty, location, isAcceptingPatients, verificationStatus, rating, search, sortBy, sortOrder } = searchData;
      const offset = (page - 1) * limit;

      // Build query
      let query: any = adminDb.collection('users').where('role', '==', 'doctor');

      // Apply filters
      if (specialty) {
        query = query.where('specialties', 'array-contains', specialty);
      }
      if (isAcceptingPatients !== undefined) {
        query = query.where('isAcceptingPatients', '==', isAcceptingPatients);
      }
      if (verificationStatus !== 'all') {
        query = query.where('verificationStatus', '==', verificationStatus);
      }
      if (rating) {
        query = query.where('rating', '>=', rating);
      }

      // Order and paginate
      query = query.orderBy(sortBy, sortOrder).offset(offset).limit(limit);

      const snapshot = await query.get();

      // Process doctors with additional data
      const doctors = [];
      const doctorIds = [];

      for (const doc of snapshot.docs) {
        const userData = doc.data();
        
        // Apply search filter if provided
        if (search) {
          const searchTerm = search.toLowerCase();
          const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
          const specialtiesText = (userData.specialties || []).join(' ').toLowerCase();
          
          if (!fullName.includes(searchTerm) && !specialtiesText.includes(searchTerm)) {
            continue;
          }
        }

        doctors.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate() || userData.createdAt,
          updatedAt: userData.updatedAt?.toDate() || userData.updatedAt
        });
        
        doctorIds.push(doc.id);
      }

      // OPTIMIZATION: Batch fetch additional doctor profile data
      const doctorProfilesMap = await batchFetchDoctorProfiles(doctorIds);

      // Enrich doctors with profile data
      const enrichedDoctors = doctors.map(doctor => ({
        ...doctor,
        profile: doctorProfilesMap.get(doctor.id)
      }));

      // Get total count
      const totalQuery = adminDb.collection('users').where('role', '==', 'doctor');
      const totalSnapshot = await totalQuery.get();

      return NextResponse.json(
        createSuccessResponse(enrichedDoctors, {
          total: totalSnapshot.size,
          page,
          limit,
          hasNext: offset + limit < totalSnapshot.size,
          hasPrev: page > 1
        })
      );

    } catch (error) {
      console.error('Error in GET /doctors:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching doctors'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'company', 'nurse'],
    auditAction: 'doctors_list_accessed',
    rateLimitKey: 'doctors'
  }
);

/**
 * POST /api/v1/doctors
 * Create new doctor (admin only)
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      const doctorData = CreateDoctorSchema.parse(body);

      // Check if email already exists
      const existingUserQuery = await adminDb.collection('users')
        .where('email', '==', doctorData.email)
        .limit(1)
        .get();

      if (!existingUserQuery.empty) {
        return NextResponse.json(
          createErrorResponse('EMAIL_EXISTS', 'A user with this email already exists'),
          { status: 409 }
        );
      }

      // Check if license number already exists
      const existingLicenseQuery = await adminDb.collection('users')
        .where('licenseNumber', '==', doctorData.licenseNumber)
        .where('role', '==', 'doctor')
        .limit(1)
        .get();

      if (!existingLicenseQuery.empty) {
        return NextResponse.json(
          createErrorResponse('LICENSE_EXISTS', 'A doctor with this license number already exists'),
          { status: 409 }
        );
      }

      // Create user profile
      const newDoctor = {
        ...doctorData,
        role: 'doctor',
        isActive: true,
        verificationStatus: 'pending',
        rating: 0,
        reviewCount: 0,
        consultationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: authContext.user.uid
      };

      const doctorRef = await adminDb.collection('users').add(newDoctor);

      // Create doctor profile in separate collection
      await adminDb.collection('doctors').doc(doctorRef.id).set({
        userId: doctorRef.id,
        licenseNumber: doctorData.licenseNumber,
        specialties: doctorData.specialties,
        medicalSchool: doctorData.medicalSchool,
        graduationYear: doctorData.graduationYear,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        address: doctorData.address,
        availability: doctorData.availability || {},
        languages: doctorData.languages,
        bio: doctorData.bio || '',
        isAcceptingPatients: doctorData.isAcceptingPatients,
        verificationStatus: 'pending',
        verificationDocuments: [],
        rating: 0,
        reviewCount: 0,
        consultationCount: 0,
        nextAvailableSlot: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create notification for verification team
      await adminDb.collection('notifications').add({
        userId: 'admin',
        type: 'doctor_verification_required',
        title: 'Nueva Verificación de Doctor Requerida',
        message: `El Dr. ${doctorData.firstName} ${doctorData.lastName} requiere verificación`,
        data: {
          doctorId: doctorRef.id,
          licenseNumber: doctorData.licenseNumber,
          specialties: doctorData.specialties
        },
        isRead: false,
        createdAt: new Date()
      });

      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'doctor_created',
        userId: authContext.user.uid,
        resourceType: 'doctor',
        resourceId: doctorRef.id,
        details: {
          email: doctorData.email,
          licenseNumber: doctorData.licenseNumber,
          specialties: doctorData.specialties
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });

      return NextResponse.json(
        createSuccessResponse({
          id: doctorRef.id,
          ...newDoctor
        }),
        { status: 201 }
      );

    } catch (error) {
      console.error('Error in POST /doctors:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid doctor data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error creating doctor'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'],
    requiredPermissions: ['doctors:create'],
    auditAction: 'doctor_created',
    rateLimitKey: 'doctor_create'
  }
);

// Helper functions
async function batchFetchDoctorProfiles(doctorIds: string[]): Promise<Map<string, any>> {
  if (doctorIds.length === 0) return new Map();

  const profilesMap = new Map();
  const chunks = chunkArray(doctorIds, 10);

  for (const chunk of chunks) {
    const profilesSnapshot = await adminDb.collection('doctors')
      .where('userId', 'in', chunk)
      .get();

    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      profilesMap.set(profileData.userId, {
        licenseNumber: profileData.licenseNumber,
        medicalSchool: profileData.medicalSchool,
        graduationYear: profileData.graduationYear,
        experience: profileData.experience,
        consultationFee: profileData.consultationFee,
        address: profileData.address,
        availability: profileData.availability,
        languages: profileData.languages,
        bio: profileData.bio,
        nextAvailableSlot: profileData.nextAvailableSlot?.toDate() || profileData.nextAvailableSlot
      });
    }
  }

  return profilesMap;
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