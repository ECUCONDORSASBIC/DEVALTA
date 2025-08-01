import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase-admin';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { RegisterSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit, withRateLimit } from '@/middleware/rateLimiter';

async function registerHandler(request: NextRequest) {
  try {
    // Get Firebase instances
    const adminAuth = getAuthAdmin();
    const adminDb = getFirestoreAdmin();
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        createErrorResponse('FIREBASE_ERROR', 'Firebase no está disponible'),
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = RegisterSchema.parse(body);
    const { email, password, name, role } = validatedData;

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Set custom claims based on role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      altamedicaUser: true,
      createdAt: Date.now(),
    });

    // Save user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      isActive: true,
      metadata: {
        lastSignIn: null,
        signInCount: 0,
      },
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    // Create role-specific profile
    if (role === 'doctor') {
      await adminDb.collection('doctors').doc(userRecord.uid).set({
        userId: userRecord.uid,
        specialties: [],
        license: null,
        education: [],
        experience: [],
        availability: {},
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        createdAt: new Date(),
      });
    } else if (role === 'patient') {
      await adminDb.collection('patients').doc(userRecord.uid).set({
        userId: userRecord.uid,
        dateOfBirth: null,
        gender: null,
        bloodType: null,
        allergies: [],
        medications: [],
        emergencyContact: null,
        medicalHistory: [],
        createdAt: new Date(),
      });
    } else if (role === 'admin') {
      await adminDb.collection('companies').doc(userRecord.uid).set({
        userId: userRecord.uid,
        companyName: name,
        industry: null,
        size: null,
        description: null,
        website: null,
        address: null,
        isVerified: false,
        subscription: 'basic',
        createdAt: new Date(),
      });
    }

    // Generate custom token for immediate login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    const responseData = {
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        emailVerified: userRecord.emailVerified,
      },
      customToken,
      message: 'Usuario registrado exitosamente',
    };

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: responseData
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({
        success: false,
        message: 'EMAIL_EXISTS',
        details: 'El email ya está registrado'
      }, { status: 409 });
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json({
        success: false,
        message: 'INVALID_EMAIL',
        details: 'Email inválido'
      }, { status: 400 });
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json({
        success: false,
        message: 'WEAK_PASSWORD',
        details: 'La contraseña debe tener al menos 6 caracteres'
      }, { status: 400 });
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'VALIDATION_ERROR',
        details: 'Datos de entrada inválidos',
        validationErrors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'REGISTRATION_FAILED',
      details: 'Error en el registro'
    }, { status: 500 });
  }
}

// Aplicar rate limiting al registro
export async function POST(request: NextRequest) {
  return withRateLimit(request, authRateLimit, async () => {
    return registerHandler(request);
  });
}
