/**
 * 🏥 INDIVIDUAL PATIENT API - ALTAMEDICA (REFACTORED) 
 * CRUD individual para pacientes específicos usando Service Pattern + Unified Auth
 * MIGRADO: De Firebase directo + auth manual a patrón estándar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for updating patient profile
const UpdatePatientSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().min(10).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  
  // Medical information
  allergies: z.array(z.object({
    allergen: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    reaction: z.string(),
    notes: z.string().optional()
  })).optional(),
  
  chronicConditions: z.array(z.object({
    condition: z.string(),
    diagnosedDate: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    medications: z.array(z.string()).default([]),
    notes: z.string().optional()
  })).optional(),
  
  // Emergency contact
  emergencyContact: z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    phone: z.string().min(10),
    email: z.string().email().optional()
  }).optional(),
  
  // Insurance information
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    groupNumber: z.string().optional(),
    expirationDate: z.string().optional()
  }).optional(),
  
  // Address
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('AR')
  }).optional(),
  
  // Physical measurements
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  occupation: z.string().optional(),
  
  // Medical history
  medicalHistory: z.array(z.object({
    condition: z.string(),
    date: z.string(),
    description: z.string(),
    resolved: z.boolean().default(false)
  })).optional(),
  
  // Preferences
  preferredLanguage: z.string().default('es').optional(),
  
  // Privacy settings
  shareDataWithResearch: z.boolean().optional(),
  allowMarketingCommunications: z.boolean().optional()
});

/**
 * GET /api/v1/patients/[id]
 * Get individual patient details with comprehensive medical profile
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: patientId } = await params;
      
      // Check permissions - patients can see their own data, doctors/admin can see any
      if (authContext.user.role === 'patient' && authContext.user.uid !== patientId) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'You can only access your own patient data'),
          { status: 403 }
        );
      }
      
      // Get patient basic info from users collection
      const patientDoc = await adminDb.collection('users').doc(patientId).get();
      
      if (!patientDoc.exists) {
        return NextResponse.json(
          createErrorResponse('PATIENT_NOT_FOUND', 'Patient not found'),
          { status: 404 }
        );
      }
      
      const patientData = patientDoc.data()!;
      
      // Verify it's actually a patient
      if (patientData.role !== 'patient') {
        return NextResponse.json(
          createErrorResponse('INVALID_ROLE', 'User is not a patient'),
          { status: 400 }
        );
      }
      
      // Get detailed patient profile
      const patientProfileDoc = await adminDb.collection('patients').doc(patientId).get();
      const patientProfile = patientProfileDoc.exists ? patientProfileDoc.data() : {};
      
      // Get patient's appointments for statistics
      const appointmentsQuery = await adminDb.collection('appointments')
        .where('patientId', '==', patientId)
        .orderBy('scheduledAt', 'desc')
        .limit(20)
        .get();
      
      const appointments = appointmentsQuery.docs.map(doc => ({
        id: doc.id,
        doctorId: doc.data().doctorId,
        scheduledAt: doc.data().scheduledAt?.toDate(),
        status: doc.data().status,
        type: doc.data().type,
        reason: doc.data().reason
      }));
      
      // Calculate appointment statistics
      const appointmentStats = {
        total: appointments.length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
        upcoming: appointments.filter(apt => 
          ['scheduled', 'confirmed'].includes(apt.status) && 
          apt.scheduledAt && apt.scheduledAt > new Date()
        ).length,
        pending: appointments.filter(apt => apt.status === 'pending').length
      };
      
      // Get next appointment
      const upcomingAppointments = appointments
        .filter(apt => 
          ['scheduled', 'confirmed'].includes(apt.status) && 
          apt.scheduledAt && apt.scheduledAt > new Date()
        )
        .sort((a, b) => a.scheduledAt!.getTime() - b.scheduledAt!.getTime());
      
      const nextAppointment = upcomingAppointments[0] || null;
      
      // Get last appointment
      const pastAppointments = appointments
        .filter(apt => apt.scheduledAt && apt.scheduledAt <= new Date())
        .sort((a, b) => b.scheduledAt!.getTime() - a.scheduledAt!.getTime());
      
      const lastAppointment = pastAppointments[0] || null;
      
      // Get patient's medical records count
      const medicalRecordsQuery = await adminDb.collection('medical_records')
        .where('patientId', '==', patientId)
        .get();
      
      // Get patient's active prescriptions
      const activePrescriptionsQuery = await adminDb.collection('prescriptions')
        .where('patientId', '==', patientId)
        .where('status', '==', 'active')
        .get();
      
      // Get primary doctor information if available
      let primaryDoctor = null;
      if (patientProfile?.primaryDoctorId) {
        const doctorDoc = await adminDb.collection('users').doc(patientProfile.primaryDoctorId).get();
        if (doctorDoc.exists && doctorDoc.data()?.role === 'doctor') {
          const doctorData = doctorDoc.data()!;
          primaryDoctor = {
            id: doctorDoc.id,
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            specialties: doctorData.specialties || [],
            rating: doctorData.rating || 0
          };
        }
      }
      
      // Calculate age if date of birth is available
      let age = null;
      if (patientData.dateOfBirth || patientProfile?.dateOfBirth) {
        const birthDate = new Date(patientData.dateOfBirth || patientProfile.dateOfBirth);
        age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      
      const enrichedPatient = {
        // Basic info
        id: patientId,
        ...patientData,
        age: age,
        createdAt: patientData.createdAt?.toDate() || patientData.createdAt,
        updatedAt: patientData.updatedAt?.toDate() || patientData.updatedAt,
        lastLoginAt: patientData.lastLoginAt?.toDate() || patientData.lastLoginAt,
        
        // Detailed medical profile
        profile: {
          ...patientProfile,
          lastCheckup: patientProfile?.lastCheckup?.toDate() || patientProfile?.lastCheckup,
          nextAppointment: patientProfile?.nextAppointment?.toDate() || patientProfile?.nextAppointment,
          createdAt: patientProfile?.createdAt?.toDate() || patientProfile?.createdAt,
          updatedAt: patientProfile?.updatedAt?.toDate() || patientProfile?.updatedAt
        },
        
        // Medical statistics
        medicalStats: {
          totalAppointments: appointmentStats.total,
          completedAppointments: appointmentStats.completed,
          upcomingAppointments: appointmentStats.upcoming,
          cancelledAppointments: appointmentStats.cancelled,
          totalMedicalRecords: medicalRecordsQuery.size,
          activePrescriptions: activePrescriptionsQuery.size,
          riskLevel: patientProfile?.riskLevel || 'low',
          hasAllergies: (patientProfile?.allergies || []).length > 0,
          hasChronicConditions: (patientProfile?.chronicConditions || []).length > 0
        },
        
        // Recent activity
        recentActivity: {
          appointments: appointments.slice(0, 5),
          nextAppointment,
          lastAppointment,
          lastVisit: lastAppointment?.scheduledAt || null
        },
        
        // Healthcare team
        healthcareTeam: {
          primaryDoctor,
          specialistsCount: await getSpecialistsCount(patientId),
          preferredHospital: patientProfile?.preferredHospital || null
        },
        
        // Health summary
        healthSummary: {
          allergiesCount: (patientProfile?.allergies || []).length,
          chronicConditionsCount: (patientProfile?.chronicConditions || []).length,
          currentMedications: (patientProfile?.currentMedications || []).length,
          lastBloodPressure: patientProfile?.lastVitals?.bloodPressure || null,
          lastWeight: patientProfile?.lastVitals?.weight || patientProfile?.weight || null,
          bmi: calculateBMI(patientProfile?.height, patientProfile?.weight)
        }
      };
      
      return NextResponse.json(
        createSuccessResponse(enrichedPatient)
      );
      
    } catch (error) {
      console.error('Error in GET /patients/[id]:', error);
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching patient details'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'patient_details_accessed',
    rateLimitKey: 'patient_details'
  }
);

/**
 * PUT /api/v1/patients/[id]
 * Update patient profile (patient themselves, their doctors, or admin)
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: patientId } = await params;
      const body = await request.json();
      const updateData = UpdatePatientSchema.parse(body);
      
      // Check permissions
      const canUpdate = await checkPatientUpdatePermissions(authContext.user, patientId);
      if (!canUpdate) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'You do not have permission to update this patient'),
          { status: 403 }
        );
      }
      
      // Verify patient exists
      const patientDoc = await adminDb.collection('users').doc(patientId).get();
      if (!patientDoc.exists) {
        return NextResponse.json(
          createErrorResponse('PATIENT_NOT_FOUND', 'Patient not found'),
          { status: 404 }
        );
      }
      
      const patientData = patientDoc.data()!;
      if (patientData.role !== 'patient') {
        return NextResponse.json(
          createErrorResponse('INVALID_ROLE', 'User is not a patient'),
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
      if (updateData.dateOfBirth) userUpdates.dateOfBirth = updateData.dateOfBirth;
      if (updateData.gender) userUpdates.gender = updateData.gender;
      if (updateData.preferredLanguage) userUpdates.preferredLanguage = updateData.preferredLanguage;
      
      // Update age if date of birth changed
      if (updateData.dateOfBirth) {
        const birthDate = new Date(updateData.dateOfBirth);
        const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        userUpdates.age = age;
      }
      
      // Prepare updates for patients collection
      const patientProfileUpdates: any = {
        updatedAt: new Date()
      };
      
      // Fields that go to patients collection
      if (updateData.bloodType) patientProfileUpdates.bloodType = updateData.bloodType;
      if (updateData.allergies) patientProfileUpdates.allergies = updateData.allergies;
      if (updateData.chronicConditions) patientProfileUpdates.chronicConditions = updateData.chronicConditions;
      if (updateData.emergencyContact) patientProfileUpdates.emergencyContact = updateData.emergencyContact;
      if (updateData.insurance) patientProfileUpdates.insurance = updateData.insurance;
      if (updateData.height) patientProfileUpdates.height = updateData.height;
      if (updateData.weight) patientProfileUpdates.weight = updateData.weight;
      if (updateData.occupation) patientProfileUpdates.occupation = updateData.occupation;
      if (updateData.medicalHistory) patientProfileUpdates.medicalHistory = updateData.medicalHistory;
      if (updateData.shareDataWithResearch !== undefined) patientProfileUpdates.shareDataWithResearch = updateData.shareDataWithResearch;
      if (updateData.allowMarketingCommunications !== undefined) patientProfileUpdates.allowMarketingCommunications = updateData.allowMarketingCommunications;
      
      // Update medical flags
      if (updateData.allergies) {
        patientProfileUpdates.hasAllergies = updateData.allergies.length > 0;
      }
      if (updateData.chronicConditions) {
        patientProfileUpdates.hasChronicConditions = updateData.chronicConditions.length > 0;
      }
      
      // Recalculate risk level if medical conditions changed
      if (updateData.allergies || updateData.chronicConditions) {
        patientProfileUpdates.riskLevel = calculateRiskLevel({
          allergies: updateData.allergies,
          chronicConditions: updateData.chronicConditions,
          age: userUpdates.age || patientData.age
        });
      }
      
      // Update both collections in a batch
      const batch = adminDb.batch();
      
      // Update user document
      if (Object.keys(userUpdates).length > 1) { // More than just updatedAt
        batch.update(adminDb.collection('users').doc(patientId), userUpdates);
      }
      
      // Update or create patient profile
      const patientProfileRef = adminDb.collection('patients').doc(patientId);
      const patientProfileDoc = await patientProfileRef.get();
      
      if (patientProfileDoc.exists) {
        batch.update(patientProfileRef, patientProfileUpdates);
      } else {
        // Create profile if it doesn't exist
        batch.set(patientProfileRef, {
          userId: patientId,
          ...patientProfileUpdates,
          createdAt: new Date()
        });
      }
      
      await batch.commit();
      
      // Create notification for profile update
      await adminDb.collection('notifications').add({
        userId: patientId,
        type: 'profile_updated',
        title: 'Perfil Médico Actualizado',
        message: 'Tu perfil médico ha sido actualizado exitosamente',
        data: {
          updatedBy: authContext.user.uid,
          updatedFields: Object.keys({...userUpdates, ...patientProfileUpdates}),
          updatedByRole: authContext.user.role
        },
        priority: 'low',
        isRead: false,
        createdAt: new Date()
      });
      
      // Audit log for HIPAA compliance
      await adminDb.collection('audit_logs').add({
        action: 'patient_profile_updated',
        userId: authContext.user.uid,
        resourceType: 'patient',
        resourceId: patientId,
        details: {
          updatedFields: Object.keys({...userUpdates, ...patientProfileUpdates}),
          isSelfUpdate: authContext.user.uid === patientId,
          updatedByRole: authContext.user.role,
          hadMedicalChanges: !!(updateData.allergies || updateData.chronicConditions || updateData.medicalHistory)
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        createSuccessResponse({
          id: patientId,
          message: 'Patient profile updated successfully',
          updatedFields: Object.keys({...userUpdates, ...patientProfileUpdates})
        })
      );
      
    } catch (error) {
      console.error('Error in PUT /patients/[id]:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid update data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error updating patient profile'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient'],
    auditAction: 'patient_profile_updated',
    rateLimitKey: 'patient_update'
  }
);

/**
 * DELETE /api/v1/patients/[id]
 * Soft delete patient account (admin only, or patient themselves)
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: patientId } = await params;
      
      // Check permissions - admin can delete any, patient can delete themselves
      if (authContext.user.role !== 'admin' && authContext.user.uid !== patientId) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'You do not have permission to delete this patient account'),
          { status: 403 }
        );
      }
      
      // Verify patient exists
      const patientDoc = await adminDb.collection('users').doc(patientId).get();
      if (!patientDoc.exists) {
        return NextResponse.json(
          createErrorResponse('PATIENT_NOT_FOUND', 'Patient not found'),
          { status: 404 }
        );
      }
      
      const patientData = patientDoc.data()!;
      if (patientData.role !== 'patient') {
        return NextResponse.json(
          createErrorResponse('INVALID_ROLE', 'User is not a patient'),
          { status: 400 }
        );
      }
      
      // Check for active appointments
      const activeAppointmentsQuery = await adminDb.collection('appointments')
        .where('patientId', '==', patientId)
        .where('status', 'in', ['scheduled', 'confirmed', 'in-progress'])
        .get();
      
      if (!activeAppointmentsQuery.empty) {
        return NextResponse.json(
          createErrorResponse('ACTIVE_APPOINTMENTS', 
            `Cannot delete patient with ${activeAppointmentsQuery.size} active appointments. Cancel appointments first.`),
          { status: 409 }
        );
      }
      
      // Perform soft delete
      const batch = adminDb.batch();
      
      // Update user document
      batch.update(adminDb.collection('users').doc(patientId), {
        isActive: false,
        accountStatus: 'deleted',
        deletedAt: new Date(),
        deletedBy: authContext.user.uid,
        updatedAt: new Date()
      });
      
      // Update patient profile
      const patientProfileRef = adminDb.collection('patients').doc(patientId);
      const patientProfileDoc = await patientProfileRef.get();
      if (patientProfileDoc.exists) {
        batch.update(patientProfileRef, {
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await batch.commit();
      
      // Create notification
      await adminDb.collection('notifications').add({
        userId: patientId,
        type: 'account_deleted',
        title: 'Cuenta Desactivada',
        message: authContext.user.uid === patientId 
          ? 'Has desactivado tu cuenta exitosamente'
          : 'Tu cuenta ha sido desactivada por un administrador',
        data: {
          deletedBy: authContext.user.uid,
          reason: authContext.user.uid === patientId ? 'self_deletion' : 'administrative_action',
          contactSupport: 'soporte@altamedica.com'
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
      
      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'patient_account_deleted',
        userId: authContext.user.uid,
        resourceType: 'patient',
        resourceId: patientId,
        details: {
          patientEmail: patientData.email,
          patientName: `${patientData.firstName} ${patientData.lastName}`,
          hadActiveAppointments: false,
          deletionType: 'soft_delete',
          isSelfDeletion: authContext.user.uid === patientId
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        createSuccessResponse({
          id: patientId,
          message: 'Patient account successfully deactivated',
          status: 'deleted'
        })
      );
      
    } catch (error) {
      console.error('Error in DELETE /patients/[id]:', error);
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error deleting patient account'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'patient'],
    auditAction: 'patient_account_deleted',
    rateLimitKey: 'patient_delete'
  }
);

// Helper functions
async function checkPatientUpdatePermissions(user: any, patientId: string): Promise<boolean> {
  // Admin can update any patient
  if (user.role === 'admin') return true;
  
  // Patient can update themselves
  if (user.role === 'patient' && user.uid === patientId) return true;
  
  // Doctor can update their patients
  if (user.role === 'doctor') {
    // Check if doctor has treated this patient
    const appointmentQuery = await adminDb.collection('appointments')
      .where('doctorId', '==', user.uid)
      .where('patientId', '==', patientId)
      .limit(1)
      .get();
    
    return !appointmentQuery.empty;
  }
  
  return false;
}

async function getSpecialistsCount(patientId: string): Promise<number> {
  try {
    const appointmentsQuery = await adminDb.collection('appointments')
      .where('patientId', '==', patientId)
      .get();
    
    const uniqueDoctors = new Set();
    appointmentsQuery.docs.forEach(doc => {
      uniqueDoctors.add(doc.data().doctorId);
    });
    
    return uniqueDoctors.size;
  } catch (error) {
    console.error('Error getting specialists count:', error);
    return 0;
  }
}

function calculateBMI(height?: number, weight?: number): number | null {
  if (!height || !weight) return null;
  
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

function calculateRiskLevel(data: any): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // Age factor
  const age = data.age || 0;
  if (age > 65) riskScore += 2;
  else if (age > 50) riskScore += 1;
  
  // Chronic conditions
  riskScore += (data.chronicConditions?.length || 0);
  
  // Severe allergies
  const severeAllergies = (data.allergies || []).filter((a: any) => a.severity === 'severe').length;
  riskScore += severeAllergies;
  
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}