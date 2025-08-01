import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase-admin';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { VerifyTokenSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security';
import { authRateLimit, withRateLimit } from '@/middleware/rateLimiter';
import { 
  createSSOToken, 
  setSSOCookies, 
  getRedirectURLForUserType 
} from '@altamedica/shared/auth';
import { UserType } from '@altamedica/shared';

async function loginHandler(request: NextRequest) {
  try {
    // Get Firebase instances
    const adminAuth = getAuthAdmin();
    const adminDb = getFirestoreAdmin();
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({
        success: false,
        message: 'FIREBASE_ERROR',
        details: 'Firebase no está disponible'
      }, { status: 503 });
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    const { token } = VerifyTokenSchema.parse(body);

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'USER_NOT_FOUND',
        details: 'Usuario no encontrado'
      }, { status: 404 });
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData?.isActive) {
      return NextResponse.json({
        success: false,
        message: 'USER_INACTIVE',
        details: 'Usuario inactivo'
      }, { status: 403 });
    }

    // Update user metadata
    await adminDb.collection('users').doc(uid).update({
      'metadata.lastSignIn': new Date(),
      'metadata.signInCount': (userData.metadata?.signInCount || 0) + 1,
      updatedAt: new Date(),
    });

    // Get role-specific profile
    let roleProfile = null;
    if (userData.role === 'doctor') {
      const doctorDoc = await adminDb.collection('doctors').doc(uid).get();
      roleProfile = doctorDoc.exists ? doctorDoc.data() : null;
    } else if (userData.role === 'patient') {
      const patientDoc = await adminDb.collection('patients').doc(uid).get();
      roleProfile = patientDoc.exists ? patientDoc.data() : null;
    } else if (userData.role === 'company') {
      const companyDoc = await adminDb.collection('companies').doc(uid).get();
      roleProfile = companyDoc.exists ? companyDoc.data() : null;
    }

    // Generate new custom token
    const customToken = await adminAuth.createCustomToken(uid, {
      role: userData.role,
      altamedicaUser: true,
    });

    // Map role to UserType
    const userTypeMap: Record<string, UserType> = {
      'patient': UserType.PATIENT,
      'doctor': UserType.DOCTOR,
      'company': UserType.COMPANY,
      'admin': UserType.ADMIN,
    };
    
    const userType = userTypeMap[userData.role] || UserType.PATIENT;

    // Create SSO tokens
    const { accessToken, refreshToken } = await createSSOToken({
      uid,
      email: email || userData.email,
      userType,
      roles: [userData.role],
      permissions: userData.permissions || [],
    });

    // Get redirect URL based on user type
    const redirectUrl = getRedirectURLForUserType(userType);

    const responseData = {
      user: {
        uid,
        email,
        name: userData.name,
        role: userData.role,
        emailVerified: userData.emailVerified,
        isActive: userData.isActive,
        metadata: userData.metadata,
      },
      roleProfile,
      customToken,
      redirectUrl,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      data: responseData
    }, { status: 200 });

    // Set SSO cookies
    setSSOCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);

    // Handle Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        createErrorResponse('TOKEN_EXPIRED', 'Token expirado'),
        { status: 401 }
      );
    }

    if (error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        createErrorResponse('TOKEN_REVOKED', 'Token revocado'),
        { status: 401 }
      );
    }

    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        createErrorResponse('INVALID_TOKEN', 'Token inválido'),
        { status: 401 }
      );
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(        createErrorResponse('VALIDATION_ERROR', 'Datos de entrada inválidos', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('LOGIN_FAILED', 'Error en el login'),
      { status: 500 }
    );
  }
}

// Aplicar middleware de seguridad con rate limiting
export async function POST(request: NextRequest) {
  return withRateLimit(request, authRateLimit, async () => {
    return withSecurity(loginHandler)(request);
  });
}
