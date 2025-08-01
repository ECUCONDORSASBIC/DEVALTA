/**
 * 🔐 AUTH REGISTER API - ALTAMEDICA 
 * Endpoint para registro de nuevos usuarios usando Service Pattern + Unified Auth
 * IMPLEMENTADO: Era uno de los endpoints críticos faltantes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for user registration
const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['patient', 'doctor', 'company', 'nurse']).default('patient'),
  dateOfBirth: z.string().optional(), // Required for patients
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  
  // Additional profile data based on role
  doctorProfile: z.object({
    licenseNumber: z.string().min(1, 'License number is required'),
    specialties: z.array(z.string()).min(1, 'At least one specialty required'),
    medicalSchool: z.string().min(1, 'Medical school is required'),
    graduationYear: z.number().min(1950).max(new Date().getFullYear()),
    experience: z.number().min(0).max(50)
  }).optional(),
  
  companyProfile: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    businessType: z.enum(['clinic', 'hospital', 'laboratory', 'pharmacy', 'insurance']),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    website: z.string().url().optional()
  }).optional(),
  
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('AR')
  }),
  
  // Terms and conditions
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy'
  }),
  acceptHipaaNotice: z.boolean().refine(val => val === true, {
    message: 'You must accept the HIPAA notice'
  }),
  
  // Optional marketing consent
  marketingConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false),
  
  // Referral tracking
  referralCode: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional()
});

/**
 * POST /api/auth/register
 * Register new user with role-based profile creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = RegisterUserSchema.parse(body);
    
    // Additional role-based validation
    if (userData.role === 'patient' && !userData.dateOfBirth) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Date of birth is required for patients'),
        { status: 400 }
      );
    }
    
    if (userData.role === 'doctor' && !userData.doctorProfile) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Doctor profile is required for doctor registration'),
        { status: 400 }
      );
    }
    
    if (userData.role === 'company' && !userData.companyProfile) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Company profile is required for company registration'),
        { status: 400 }
      );
    }
    
    // Check if email already exists in Firebase Auth
    const auth = getAuth();
    try {
      await auth.getUserByEmail(userData.email);
      return NextResponse.json(
        createErrorResponse('EMAIL_EXISTS', 'A user with this email already exists'),
        { status: 409 }
      );
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error; // Re-throw if it's not "user not found"
      }
      // Email is available, continue with registration
    }
    
    // Check for duplicate license numbers (doctors only)
    if (userData.role === 'doctor' && userData.doctorProfile) {
      const existingDoctorQuery = await adminDb.collection('users')
        .where('role', '==', 'doctor')
        .where('licenseNumber', '==', userData.doctorProfile.licenseNumber)
        .limit(1)
        .get();
      
      if (!existingDoctorQuery.empty) {
        return NextResponse.json(
          createErrorResponse('LICENSE_EXISTS', 'A doctor with this license number already exists'),
          { status: 409 }
        );
      }
    }
    
    // Check for duplicate company registration numbers
    if (userData.role === 'company' && userData.companyProfile) {
      const existingCompanyQuery = await adminDb.collection('users')
        .where('role', '==', 'company')
        .where('companyRegistrationNumber', '==', userData.companyProfile.registrationNumber)
        .limit(1)
        .get();
      
      if (!existingCompanyQuery.empty) {
        return NextResponse.json(
          createErrorResponse('REGISTRATION_EXISTS', 'A company with this registration number already exists'),
          { status: 409 }
        );
      }
    }
    
    // Process referral code if provided
    let referrerData = null;
    if (userData.referralCode) {
      const referrerQuery = await adminDb.collection('users')
        .where('referralCode', '==', userData.referralCode)
        .limit(1)
        .get();
      
      if (!referrerQuery.empty) {
        referrerData = {
          referrerId: referrerQuery.docs[0].id,
          referrerEmail: referrerQuery.docs[0].data().email
        };
      }
    }
    
    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: `${userData.firstName} ${userData.lastName}`,
      disabled: false,
      emailVerified: false
    });
    
    // Calculate age for patients
    let age = null;
    if (userData.dateOfBirth) {
      const birthDate = new Date(userData.dateOfBirth);
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    
    // Create user profile in Firestore
    const userProfile = {
      // Basic info
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role,
      dateOfBirth: userData.dateOfBirth || null,
      gender: userData.gender || null,
      age: age,
      address: userData.address,
      
      // Account status
      isActive: true,
      isEmailVerified: false,
      accountStatus: userData.role === 'doctor' ? 'pending_verification' : 'active',
      verificationStatus: userData.role === 'doctor' ? 'pending' : 'verified',
      
      // Role-specific data
      ...(userData.role === 'doctor' && userData.doctorProfile && {
        licenseNumber: userData.doctorProfile.licenseNumber,
        specialties: userData.doctorProfile.specialties,
        medicalSchool: userData.doctorProfile.medicalSchool,
        graduationYear: userData.doctorProfile.graduationYear,
        experience: userData.doctorProfile.experience,
        isAcceptingPatients: false, // Will be activated after verification
        rating: 0,
        reviewCount: 0,
        consultationCount: 0
      }),
      
      ...(userData.role === 'company' && userData.companyProfile && {
        companyName: userData.companyProfile.companyName,
        businessType: userData.companyProfile.businessType,
        companyRegistrationNumber: userData.companyProfile.registrationNumber,
        website: userData.companyProfile.website
      }),
      
      // Consent tracking
      consents: {
        terms: { accepted: userData.acceptTerms, timestamp: new Date() },
        privacy: { accepted: userData.acceptPrivacyPolicy, timestamp: new Date() },
        hipaa: { accepted: userData.acceptHipaaNotice, timestamp: new Date() },
        marketing: { accepted: userData.marketingConsent, timestamp: new Date() },
        sms: { accepted: userData.smsConsent, timestamp: new Date() }
      },
      
      // Referral tracking
      referral: referrerData ? {
        referredBy: referrerData.referrerId,
        referrerEmail: referrerData.referrerEmail,
        referralCode: userData.referralCode
      } : null,
      
      // UTM tracking
      acquisition: {
        source: userData.utmSource || 'direct',
        medium: userData.utmMedium || 'organic',
        campaign: userData.utmCampaign || null,
        registrationDate: new Date()
      },
      
      // Generate unique referral code for this user
      referralCode: generateReferralCode(userData.firstName, userData.lastName),
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      
      // System fields
      firebaseUid: firebaseUser.uid
    };
    
    // Create user document
    const userRef = await adminDb.collection('users').doc(firebaseUser.uid).set(userProfile);
    
    // Create role-specific profile documents
    if (userData.role === 'doctor' && userData.doctorProfile) {
      await adminDb.collection('doctors').doc(firebaseUser.uid).set({
        userId: firebaseUser.uid,
        licenseNumber: userData.doctorProfile.licenseNumber,
        specialties: userData.doctorProfile.specialties,
        medicalSchool: userData.doctorProfile.medicalSchool,
        graduationYear: userData.doctorProfile.graduationYear,
        experience: userData.doctorProfile.experience,
        consultationFee: 0, // To be set later
        availability: {},
        languages: ['es'], // Default to Spanish for Argentina
        bio: '',
        isAcceptingPatients: false,
        verificationStatus: 'pending',
        verificationDocuments: [],
        nextAvailableSlot: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create notification for admin to verify doctor
      await adminDb.collection('notifications').add({
        userId: 'admin',
        type: 'doctor_verification_required',
        title: 'Nueva Verificación de Doctor Requerida',
        message: `El Dr. ${userData.firstName} ${userData.lastName} se ha registrado y requiere verificación`,
        data: {
          doctorId: firebaseUser.uid,
          licenseNumber: userData.doctorProfile.licenseNumber,
          specialties: userData.doctorProfile.specialties,
          email: userData.email
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    if (userData.role === 'patient') {
      await adminDb.collection('patients').doc(firebaseUser.uid).set({
        userId: firebaseUser.uid,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        age: age,
        bloodType: null,
        allergies: [],
        chronicConditions: [],
        emergencyContact: null,
        insurance: null,
        height: null,
        weight: null,
        occupation: null,
        medicalHistory: [],
        lastCheckup: null,
        nextAppointment: null,
        primaryDoctorId: null,
        riskLevel: 'low',
        isMinor: age ? age < 18 : false,
        hasChronicConditions: false,
        hasAllergies: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    if (userData.role === 'company' && userData.companyProfile) {
      await adminDb.collection('companies').doc(firebaseUser.uid).set({
        userId: firebaseUser.uid,
        companyName: userData.companyProfile.companyName,
        businessType: userData.companyProfile.businessType,
        registrationNumber: userData.companyProfile.registrationNumber,
        website: userData.companyProfile.website,
        isVerified: false,
        verificationStatus: 'pending',
        employeeCount: 0,
        activeJobs: 0,
        plan: 'basic',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Update referrer's referral count if applicable
    if (referrerData) {
      await adminDb.collection('users').doc(referrerData.referrerId).update({
        'referralStats.totalReferrals': adminDb.FieldValue.increment(1),
        'referralStats.pendingReferrals': adminDb.FieldValue.increment(1),
        updatedAt: new Date()
      });
    }
    
    // Create welcome notification for user
    await adminDb.collection('notifications').add({
      userId: firebaseUser.uid,
      type: 'welcome',
      title: `¡Bienvenido a AltaMédica, ${userData.firstName}!`,
      message: getRoleSpecificWelcomeMessage(userData.role),
      data: {
        userId: firebaseUser.uid,
        role: userData.role,
        nextSteps: getRoleSpecificNextSteps(userData.role)
      },
      priority: 'medium',
      isRead: false,
      createdAt: new Date()
    });
    
    // Audit log for HIPAA compliance
    await adminDb.collection('audit_logs').add({
      action: 'user_registered',
      userId: firebaseUser.uid,
      resourceType: 'user',
      resourceId: firebaseUser.uid,
      details: {
        email: userData.email,
        role: userData.role,
        hasReferral: !!userData.referralCode,
        utmSource: userData.utmSource || 'direct',
        accountStatus: userProfile.accountStatus
      },
      timestamp: new Date(),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent')
    });
    
    // Return success response (don't include sensitive data)
    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: firebaseUser.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          accountStatus: userProfile.accountStatus,
          verificationStatus: userProfile.verificationStatus,
          referralCode: userProfile.referralCode
        },
        message: 'User registered successfully',
        nextSteps: getRoleSpecificNextSteps(userData.role)
      }),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error in POST /auth/register:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid registration data', {
          validationErrors: error.errors
        }),
        { status: 400 }
      );
    }
    
    // Handle Firebase auth errors
    if (error instanceof Error && error.message.includes('auth/')) {
      return NextResponse.json(
        createErrorResponse('AUTH_ERROR', 'Registration failed: ' + error.message),
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Error creating user account'),
      { status: 500 }
    );
  }
}

// Helper functions
function generateReferralCode(firstName: string, lastName: string): string {
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${initials}${randomNum}`;
}

function getRoleSpecificWelcomeMessage(role: string): string {
  switch (role) {
    case 'doctor':
      return 'Tu cuenta de médico ha sido creada. Tu perfil será verificado en las próximas 24-48 horas.';
    case 'patient':
      return 'Tu cuenta de paciente ha sido creada exitosamente. Ahora puedes buscar médicos y agendar citas.';
    case 'company':
      return 'Tu cuenta empresarial ha sido creada. Tu empresa será verificada en las próximas 24-48 horas.';
    case 'nurse':
      return 'Tu cuenta de enfermero/a ha sido creada exitosamente.';
    default:
      return 'Tu cuenta ha sido creada exitosamente en AltaMédica.';
  }
}

function getRoleSpecificNextSteps(role: string): string[] {
  switch (role) {
    case 'doctor':
      return [
        'verify_email',
        'upload_medical_license',
        'complete_profile',
        'set_availability',
        'await_verification'
      ];
    case 'patient':
      return [
        'verify_email',
        'complete_medical_profile',
        'add_emergency_contact',
        'find_doctors',
        'schedule_appointment'
      ];
    case 'company':
      return [
        'verify_email',
        'upload_business_documents',
        'complete_company_profile',
        'post_first_job',
        'await_verification'
      ];
    case 'nurse':
      return [
        'verify_email',
        'complete_profile',
        'upload_credentials',
        'find_opportunities'
      ];
    default:
      return ['verify_email', 'complete_profile'];
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