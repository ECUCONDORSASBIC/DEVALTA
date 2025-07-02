/**
 * POST /api/v1/auth/refresh
 * Token refresh endpoint
 */
import { NextRequest, NextResponse } from "next/server";
import { withSecurity } from '@/lib/security';

async function refreshHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: "Refresh token is required",
        code: "MISSING_REFRESH_TOKEN"
      }, { status: 401 });
    }

    if (refreshToken === 'invalid' || refreshToken.length < 10) {
      return NextResponse.json({
        success: false,
        error: "Invalid refresh token", 
        code: "INVALID_REFRESH_TOKEN"
      }, { status: 401 });
    }

    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        tokens: {
          customToken: 'mock-token-' + Date.now(),
          uid: 'mock-user-' + Date.now(),
          email: 'user@altamedica.com',
          role: 'doctor'
        },
        message: 'Token refreshed successfully'
      }
    });  } catch (error: unknown) {
    console.error('🔥 ERROR in refresh token:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? (error as any).message : 'Unknown error'
    }, { status: 500 });
  }
}

// Apply security middleware
export const POST = withSecurity(refreshHandler);