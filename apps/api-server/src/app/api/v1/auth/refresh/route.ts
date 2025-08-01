/**
 * POST /api/v1/auth/refresh
 * Token refresh endpoint - REAL IMPLEMENTATION
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { z } from 'zod';

// Schema for refresh token request
const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
  userId: z.string().optional(),
});

async function refreshHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, userId } = RefreshTokenSchema.parse(body);

    // Verify refresh token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(refreshToken, true);
    } catch (error: any) {
      console.error('Invalid refresh token:', error);
      
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
      
      return NextResponse.json(
        createErrorResponse('INVALID_REFRESH_TOKEN', 'Refresh token inválido'),
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND', 'Usuario no encontrado'),
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Check if user is active
    if (userData?.status === 'suspended' || userData?.status === 'disabled') {
      return NextResponse.json(
        createErrorResponse('USER_SUSPENDED', 'Usuario suspendido'),
        { status: 403 }
      );
    }

    // Generate new custom token
    const customToken = await adminAuth.createCustomToken(uid, {
      role: userData?.role || 'patient',
      email: userData?.email,
      name: userData?.name,
      isVerified: userData?.isVerified || false,
    });

    // Update last activity
    await adminDb.collection('users').doc(uid).update({
      'metadata.lastTokenRefresh': new Date(),
      'metadata.lastActivity': new Date(),
      updatedAt: new Date(),
    });

    // Log security event
    await adminDb.collection('security_events').add({
      type: 'token_refresh',
      userId: uid,
      timestamp: new Date(),
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        success: true,
      },
    });

    const responseData = {
      tokens: {
        customToken,
        uid,
        email: userData?.email,
        role: userData?.role || 'patient',
        name: userData?.name,
        isVerified: userData?.isVerified || false,
      },
      user: {
        id: uid,
        email: userData?.email,
        name: userData?.name,
        role: userData?.role,
        isVerified: userData?.isVerified,
        profileComplete: userData?.profileComplete || false,
      },
      expiresIn: 3600, // 1 hour
      message: 'Token renovado exitosamente'
    };

    return NextResponse.json(
      createSuccessResponse(responseData),
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('🔥 ERROR in refresh token:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos inválidos', {
          validationErrors: error.errors
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Error interno del servidor'),
      { status: 500 }
    );
  }
}

// Apply security middleware
export const POST = withSecurity(refreshHandler);