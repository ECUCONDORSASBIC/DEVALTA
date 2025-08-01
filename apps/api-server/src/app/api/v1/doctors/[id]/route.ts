/**
 * 👨‍⚕️ INDIVIDUAL DOCTOR API - ALTAMEDICA (REFACTORED) 
 * CRUD individual para doctores específicos usando Service Pattern + Unified Auth
 * MIGRADO: De Firebase directo + auth manual a patrón estándar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for updating doctor profile
const UpdateDoctorSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().min(10).optional(),
  specialties: z.array(z.string()).min(1).optional(),
  medicalSchool: z.string().min(1).optional(),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()).optional(),
  experience: z.number().min(0).max(50).optional(),
  consultationFee: z.number().min(0).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('AR')
  }).optional(),
  availability: z.object({
    monday: z.array(z.string()).default([]),
    tuesday: z.array(z.string()).default([]),
    wednesday: z.array(z.string()).default([]),
    thursday: z.array(z.string()).default([]),
    friday: z.array(z.string()).default([]),
    saturday: z.array(z.string()).default([]),
    sunday: z.array(z.string()).default([])
  }).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().max(1000).optional(),
  isAcceptingPatients: z.boolean().optional(),
  profileImage: z.string().url().optional(),
  
  // Medical practice settings
  consultationTypes: z.array(z.enum(['in_person', 'telemedicine', 'both'])).optional(),
  emergencyAvailable: z.boolean().optional(),
  houseCalls: z.boolean().optional(),
  
  // Professional associations
  certifications: z.array(z.object({
    name: z.string(),
    issuingOrganization: z.string(),
    issueDate: z.string(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional()
  })).optional(),
  
  // Education
  additionalEducation: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
    specialization: z.string().optional()
  })).optional()
});

/**
 * GET /api/v1/doctors/[id]
 * Get individual doctor details with comprehensive profile data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;
    
    // Get doctor basic info from users collection
    const doctorDoc = await adminDb.collection('users').doc(doctorId).get();
    
    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor not found'),
        { status: 404 }
      );
    }
    
    const doctorData = doctorDoc.data()!;
    
    // Verify it's actually a doctor
    if (doctorData.role !== 'doctor') {
      return NextResponse.json(
        createErrorResponse('INVALID_ROLE', 'User is not a doctor'),
        { status: 400 }
      );
    }
    
    // Get detailed doctor profile
    const doctorProfileDoc = await adminDb.collection('doctors').doc(doctorId).get();
    const doctorProfile = doctorProfileDoc.exists ? doctorProfileDoc.data() : {};
    
    // Get company information if exists
    let companyData = null;
    if (doctorProfile?.companyId) {
      const companyDoc = await adminDb.collection('companies').doc(doctorProfile.companyId).get();
      if (companyDoc.exists) {
        companyData = {
          id: companyDoc.id,
          name: companyDoc.data()?.name,
          logo: companyDoc.data()?.logo,
          businessType: companyDoc.data()?.businessType
        };
      }
    }
    
    // Get doctor's recent appointments for stats
    const appointmentsQuery = await adminDb.collection('appointments')
      .where('doctorId', '==', doctorId)
      .orderBy('scheduledAt', 'desc')
      .limit(10)
      .get();
    
    const recentAppointments = appointmentsQuery.docs.map(doc => ({
      id: doc.id,
      patientId: doc.data().patientId,
      scheduledAt: doc.data().scheduledAt?.toDate(),
      status: doc.data().status,
      type: doc.data().type
    }));
    
    // Get doctor's reviews and ratings
    const reviewsQuery = await adminDb.collection('reviews')
      .where('doctorId', '==', doctorId)
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const recentReviews = reviewsQuery.docs.map(doc => ({
      id: doc.id,
      rating: doc.data().rating,
      comment: doc.data().comment,
      patientName: doc.data().patientName || 'Paciente Anónimo',
      createdAt: doc.data().createdAt?.toDate(),
      verifiedPatient: doc.data().verifiedPatient || false
    }));
    
    // Calculate additional stats
    const completedAppointments = recentAppointments.filter(apt => apt.status === 'completed').length;
    const upcomingAppointments = recentAppointments.filter(apt => 
      apt.status === 'scheduled' && apt.scheduledAt && apt.scheduledAt > new Date()
    ).length;
    
    // Get next available slot
    const nextAvailableSlot = await calculateNextAvailableSlot(doctorId, doctorProfile?.availability || {});
    
    const enrichedDoctor = {
      // Basic info
      id: doctorId,
      ...doctorData,
      createdAt: doctorData.createdAt?.toDate() || doctorData.createdAt,
      updatedAt: doctorData.updatedAt?.toDate() || doctorData.updatedAt,
      lastLoginAt: doctorData.lastLoginAt?.toDate() || doctorData.lastLoginAt,
      
      // Detailed profile
      profile: {
        ...doctorProfile,
        nextAvailableSlot: doctorProfile?.nextAvailableSlot?.toDate() || nextAvailableSlot,
        createdAt: doctorProfile?.createdAt?.toDate() || doctorProfile?.createdAt,
        updatedAt: doctorProfile?.updatedAt?.toDate() || doctorProfile?.updatedAt
      },
      
      // Company data
      company: companyData,
      
      // Statistics
      stats: {
        totalAppointments: appointmentsQuery.size,
        completedAppointments,
        upcomingAppointments,
        averageRating: doctorData.rating || 0,
        totalReviews: doctorData.reviewCount || 0,
        consultationCount: doctorData.consultationCount || 0,
        experienceYears: doctorProfile?.experience || 0,
        patientsServed: await getUniquePatientsCount(doctorId),
        responseTimeAvg: await getAverageResponseTime(doctorId)
      },
      
      // Recent activity
      recentActivity: {
        appointments: recentAppointments,
        reviews: recentReviews
      },
      
      // Availability info
      availability: {
        schedule: doctorProfile?.availability || {},
        nextAvailableSlot,
        isAcceptingPatients: doctorProfile?.isAcceptingPatients || false,
        emergencyAvailable: doctorProfile?.emergencyAvailable || false,
        consultationTypes: doctorProfile?.consultationTypes || ['in_person']
      }
    };
    
    return NextResponse.json(
      createSuccessResponse(enrichedDoctor)
    );
    
  } catch (error) {
    console.error('Error in GET /doctors/[id]:', error);
    
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Error fetching doctor details'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/doctors/[id]
 * Update doctor profile (doctor themselves or admin only) - REFACTORED to use Unified Auth
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: doctorId } = await params;
      const body = await request.json();
      const updateData = UpdateDoctorSchema.parse(body);
      
      // Check permissions - doctor can update their own profile, admin can update any
      if (authContext.user.role !== 'admin' && authContext.user.uid !== doctorId) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'You can only update your own profile'),
          { status: 403 }
        );
      }
      
      // Verify doctor exists
      const doctorDoc = await adminDb.collection('users').doc(doctorId).get();
      if (!doctorDoc.exists) {
        return NextResponse.json(
          createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor not found'),
          { status: 404 }
        );
      }
      
      const doctorData = doctorDoc.data()!;
      if (doctorData.role !== 'doctor') {
        return NextResponse.json(
          createErrorResponse('INVALID_ROLE', 'User is not a doctor'),
          { status: 400 }
        );
      }
      
      // Prepare updates for user collection
      const userUpdates: any = {
        updatedAt: new Date()
      };
      
      // Fields that go to users collection
      if (updateData.firstName) userUpdates.firstName = updateData.firstName;
      if (updateData.lastName) userUpdates.lastName = updateData.lastName;
      if (updateData.phone) userUpdates.phone = updateData.phone;
      if (updateData.address) userUpdates.address = updateData.address;
      if (updateData.specialties) userUpdates.specialties = updateData.specialties;
      if (updateData.isAcceptingPatients !== undefined) userUpdates.isAcceptingPatients = updateData.isAcceptingPatients;
      
      // Prepare updates for doctors collection
      const doctorProfileUpdates: any = {
        updatedAt: new Date()
      };
      
      // Fields that go to doctors collection
      if (updateData.medicalSchool) doctorProfileUpdates.medicalSchool = updateData.medicalSchool;
      if (updateData.graduationYear) doctorProfileUpdates.graduationYear = updateData.graduationYear;
      if (updateData.experience) doctorProfileUpdates.experience = updateData.experience;
      if (updateData.consultationFee !== undefined) doctorProfileUpdates.consultationFee = updateData.consultationFee;
      if (updateData.availability) doctorProfileUpdates.availability = updateData.availability;
      if (updateData.languages) doctorProfileUpdates.languages = updateData.languages;
      if (updateData.bio) doctorProfileUpdates.bio = updateData.bio;
      if (updateData.profileImage) doctorProfileUpdates.profileImage = updateData.profileImage;
      if (updateData.consultationTypes) doctorProfileUpdates.consultationTypes = updateData.consultationTypes;
      if (updateData.emergencyAvailable !== undefined) doctorProfileUpdates.emergencyAvailable = updateData.emergencyAvailable;
      if (updateData.houseCalls !== undefined) doctorProfileUpdates.houseCalls = updateData.houseCalls;
      if (updateData.certifications) doctorProfileUpdates.certifications = updateData.certifications;
      if (updateData.additionalEducation) doctorProfileUpdates.additionalEducation = updateData.additionalEducation;
      
      // Calculate next available slot if availability changed
      if (updateData.availability) {
        const nextSlot = await calculateNextAvailableSlot(doctorId, updateData.availability);
        doctorProfileUpdates.nextAvailableSlot = nextSlot;
      }
      
      // Update both collections in a batch
      const batch = adminDb.batch();
      
      // Update user document
      if (Object.keys(userUpdates).length > 1) { // More than just updatedAt
        batch.update(adminDb.collection('users').doc(doctorId), userUpdates);
      }
      
      // Update or create doctor profile
      const doctorProfileRef = adminDb.collection('doctors').doc(doctorId);
      const doctorProfileDoc = await doctorProfileRef.get();
      
      if (doctorProfileDoc.exists) {
        batch.update(doctorProfileRef, doctorProfileUpdates);
      } else {
        // Create profile if it doesn't exist
        batch.set(doctorProfileRef, {
          userId: doctorId,
          ...doctorProfileUpdates,
          createdAt: new Date()
        });
      }
      
      await batch.commit();
      
      // Create notification for profile update
      await adminDb.collection('notifications').add({
        userId: doctorId,
        type: 'profile_updated',
        title: 'Perfil Actualizado',
        message: 'Tu perfil médico ha sido actualizado exitosamente',
        data: {
          updatedBy: authContext.user.uid,
          updatedFields: Object.keys({...userUpdates, ...doctorProfileUpdates})
        },
        priority: 'low',
        isRead: false,
        createdAt: new Date()
      });
      
      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'doctor_profile_updated',
        userId: authContext.user.uid,
        resourceType: 'doctor',
        resourceId: doctorId,
        details: {
          updatedFields: Object.keys({...userUpdates, ...doctorProfileUpdates}),
          isSelfUpdate: authContext.user.uid === doctorId
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        createSuccessResponse({
          id: doctorId,
          message: 'Doctor profile updated successfully',
          updatedFields: Object.keys({...userUpdates, ...doctorProfileUpdates})
        })
      );
      
    } catch (error) {
      console.error('Error in PUT /doctors/[id]:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid update data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error updating doctor profile'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'doctor_profile_updated',
    rateLimitKey: 'doctor_update'
  }
);

/**
 * DELETE /api/v1/doctors/[id]
 * Soft delete doctor account (admin only) - REFACTORED to use Unified Auth
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: doctorId } = await params;
      
      // Only admins can delete doctor accounts
      if (authContext.user.role !== 'admin') {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'Only administrators can delete doctor accounts'),
          { status: 403 }
        );
      }
      
      // Verify doctor exists
      const doctorDoc = await adminDb.collection('users').doc(doctorId).get();
      if (!doctorDoc.exists) {
        return NextResponse.json(
          createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor not found'),
          { status: 404 }
        );
      }
      
      const doctorData = doctorDoc.data()!;
      if (doctorData.role !== 'doctor') {
        return NextResponse.json(
          createErrorResponse('INVALID_ROLE', 'User is not a doctor'),
          { status: 400 }
        );
      }
      
      // Check for active appointments
      const activeAppointmentsQuery = await adminDb.collection('appointments')
        .where('doctorId', '==', doctorId)
        .where('status', 'in', ['scheduled', 'confirmed', 'in-progress'])
        .get();
      
      if (!activeAppointmentsQuery.empty) {
        return NextResponse.json(
          createErrorResponse('ACTIVE_APPOINTMENTS', 
            `Cannot delete doctor with ${activeAppointmentsQuery.size} active appointments. Cancel appointments first.`),
          { status: 409 }
        );
      }
      
      // Perform soft delete (better than hard delete for audit trail)
      const batch = adminDb.batch();
      
      // Update user document
      batch.update(adminDb.collection('users').doc(doctorId), {
        isActive: false,
        accountStatus: 'deleted',
        deletedAt: new Date(),
        deletedBy: authContext.user.uid,
        updatedAt: new Date()
      });
      
      // Update doctor profile
      const doctorProfileRef = adminDb.collection('doctors').doc(doctorId);
      const doctorProfileDoc = await doctorProfileRef.get();
      if (doctorProfileDoc.exists) {
        batch.update(doctorProfileRef, {
          isAcceptingPatients: false,
          verificationStatus: 'deleted',
          deletedAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await batch.commit();
      
      // Create notification for the deleted doctor
      await adminDb.collection('notifications').add({
        userId: doctorId,
        type: 'account_deleted',
        title: 'Cuenta Desactivada',
        message: 'Tu cuenta médica ha sido desactivada por un administrador',
        data: {
          deletedBy: authContext.user.uid,
          reason: 'administrative_action',
          contactSupport: 'soporte@altamedica.com'
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
      
      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'doctor_account_deleted',
        userId: authContext.user.uid,
        resourceType: 'doctor',
        resourceId: doctorId,
        details: {
          doctorEmail: doctorData.email,
          doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
          hadActiveAppointments: false,
          deletionType: 'soft_delete'
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        createSuccessResponse({
          id: doctorId,
          message: 'Doctor account successfully deactivated',
          status: 'deleted'
        })
      );
      
    } catch (error) {
      console.error('Error in DELETE /doctors/[id]:', error);
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error deleting doctor account'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'],
    requiredPermissions: ['doctors:delete'],
    auditAction: 'doctor_account_deleted',
    rateLimitKey: 'doctor_delete'
  }
);

// Helper functions
async function calculateNextAvailableSlot(doctorId: string, availability: any): Promise<Date | null> {
  try {
    // This is a simplified implementation
    // In a real system, you'd check existing appointments and calculate based on availability
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM tomorrow
    
    return tomorrow;
  } catch (error) {
    console.error('Error calculating next available slot:', error);
    return null;
  }
}

async function getUniquePatientsCount(doctorId: string): Promise<number> {
  try {
    const appointmentsQuery = await adminDb.collection('appointments')
      .where('doctorId', '==', doctorId)
      .where('status', 'in', ['completed', 'confirmed'])
      .get();
    
    const uniquePatients = new Set();
    appointmentsQuery.docs.forEach(doc => {
      uniquePatients.add(doc.data().patientId);
    });
    
    return uniquePatients.size;
  } catch (error) {
    console.error('Error getting unique patients count:', error);
    return 0;
  }
}

async function getAverageResponseTime(doctorId: string): Promise<number> {
  try {
    // This would calculate average response time to messages/appointments
    // For now, return a mock value based on experience
    return 30; // 30 minutes average
  } catch (error) {
    console.error('Error getting average response time:', error);
    return 0;
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