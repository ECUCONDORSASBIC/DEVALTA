/**
 * 👤 AUTH ME - ALTAMEDICA
 * Get current user profile - Refactored with Unified Auth
 * IMPLEMENTADO: Era uno de los endpoints faltantes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { UserService } from '@/services/UserService';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';

export const dynamic = "force-dynamic";

const userService = new UserService();

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile with role-specific data
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      if (!authContext.user) {
        return NextResponse.json(
          createErrorResponse('UNAUTHORIZED', 'Authentication required'),
          { status: 401 }
        );
      }

      const serviceContext = (request as any).serviceContext;
      
      // Get full user profile with role-specific data
      const userProfile = await userService.findById(authContext.user.uid, serviceContext);
      
      if (!userProfile) {
        return NextResponse.json(
          createErrorResponse('USER_NOT_FOUND', 'User profile not found'),
          { status: 404 }
        );
      }

      // Get role-specific additional data
      let roleSpecificData = null;
      
      switch (userProfile.role) {
        case 'doctor':
          roleSpecificData = await getDoctorProfile(authContext.user.uid);
          break;
        case 'patient':
          roleSpecificData = await getPatientProfile(authContext.user.uid);
          break;
        case 'company':
          roleSpecificData = await getCompanyProfile(authContext.user.uid);
          break;
      }

      // Combine user profile with role-specific data
      const completeProfile = {
        ...userProfile,
        profile: roleSpecificData,
        permissions: authContext.permissions,
        lastActivity: new Date().toISOString()
      };

      // Update last activity
      await userService.updateLastSignIn(
        authContext.user.uid,
        getClientIP(request),
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json(
        createSuccessResponse(completeProfile)
      );

    } catch (error) {
      console.error('Error in GET /auth/me:', error);
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error retrieving user profile'),
        { status: 500 }
      );
    }
  },
  {
    auditAction: 'profile_accessed',
    rateLimitKey: 'profile'
  }
);

/**
 * PUT /api/v1/auth/me
 * Update current user profile
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      if (!authContext.user) {
        return NextResponse.json(
          createErrorResponse('UNAUTHORIZED', 'Authentication required'),
          { status: 401 }
        );
      }

      const body = await request.json();
      const serviceContext = (request as any).serviceContext;
      
      // Update user profile
      const updatedProfile = await userService.update(
        authContext.user.uid, 
        body, 
        serviceContext
      );

      return NextResponse.json(
        createSuccessResponse(updatedProfile)
      );

    } catch (error) {
      console.error('Error in PUT /auth/me:', error);
      
      if (error instanceof Error && error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          createErrorResponse('FORBIDDEN', 'Cannot update restricted fields'),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error updating profile'),
        { status: 500 }
      );
    }
  },
  {
    auditAction: 'profile_updated',
    rateLimitKey: 'profile_update'
  }
);

// Helper functions
async function getDoctorProfile(userId: string) {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const doctorDoc = await adminDb.collection('doctors').doc(userId).get();
    
    if (!doctorDoc.exists) {
      return null;
    }

    const doctorData = doctorDoc.data()!;
    
    return {
      licenseNumber: doctorData.licenseNumber,
      specialties: doctorData.specialties || [],
      medicalSchool: doctorData.medicalSchool,
      graduationYear: doctorData.graduationYear,
      verificationStatus: doctorData.verificationStatus,
      rating: doctorData.rating || 0,
      reviewCount: doctorData.reviewCount || 0,
      consultationCount: doctorData.consultationCount || 0,
      consultationFee: doctorData.consultationFee || 0,
      isAcceptingPatients: doctorData.isAcceptingPatients || false,
      availableHours: doctorData.availableHours || {},
      experience: doctorData.experience
    };
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    return null;
  }
}

async function getPatientProfile(userId: string) {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const patientDoc = await adminDb.collection('patients').doc(userId).get();
    
    if (!patientDoc.exists) {
      return null;
    }

    const patientData = patientDoc.data()!;
    
    return {
      dateOfBirth: patientData.dateOfBirth,
      bloodType: patientData.bloodType,
      allergies: patientData.allergies || [],
      emergencyContact: patientData.emergencyContact,
      medicalHistory: patientData.medicalHistory || [],
      chronicConditions: patientData.chronicConditions || [],
      medications: patientData.medications || [],
      lastCheckup: patientData.lastCheckup?.toDate?.() || patientData.lastCheckup,
      preferredLanguage: patientData.preferredLanguage || 'es',
      insurance: patientData.insurance
    };
  } catch (error) {
    console.error('Error getting patient profile:', error);
    return null;
  }
}

async function getCompanyProfile(userId: string) {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const companyDoc = await adminDb.collection('companies').doc(userId).get();
    
    if (!companyDoc.exists) {
      return null;
    }

    const companyData = companyDoc.data()!;
    
    return {
      name: companyData.name,
      type: companyData.type,
      registrationNumber: companyData.registrationNumber,
      verificationStatus: companyData.verificationStatus,
      employeeCount: companyData.employeeCount || 0,
      activeJobs: companyData.activeJobs || 0,
      rating: companyData.rating || 0,
      reviewCount: companyData.reviewCount || 0,
      isVerified: companyData.isVerified || false,
      address: companyData.address,
      website: companyData.website,
      description: companyData.description
    };
  } catch (error) {
    console.error('Error getting company profile:', error);
    return null;
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}