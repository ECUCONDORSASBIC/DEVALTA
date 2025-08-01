import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';

// Endpoint simple para probar autenticación
const handler = async (request: NextRequest, authContext: any) => {
  return NextResponse.json({
    success: true,
    message: 'Authenticated successfully',
    data: {
      user: authContext.user,
      permissions: authContext.permissions,
      isAuthenticated: authContext.isAuthenticated
    }
  });
};

export const GET = createAuthenticatedRoute(handler, {
  required: true,
  allowedRoles: ['patient', 'doctor', 'admin', 'company']
});