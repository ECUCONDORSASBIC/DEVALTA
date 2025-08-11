import { DecodedIdToken } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthAdmin, adminDb } from '../lib/firebase-admin';

// ============================================================================
// TYPES AND ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor', 
  PATIENT = 'patient',
  COMPANY = 'company',
  STAFF = 'staff'
}

export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
  firebaseUid?: string;
  permissions?: string[];
  patientId?: string;
  doctorId?: string;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  exp: number;
  iat?: number;
}

export interface AuthContext {
  user: AuthToken | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthToken;
  response?: NextResponse;
}

export interface SSOLoginRequest {
  email: string;
  password?: string;
  idToken?: string; // Firebase ID token
  rememberMe?: boolean;
}

export interface SSOLoginResponse {
  success: boolean;
  user?: AuthToken;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  idToken: z.string().optional(),
  rememberMe: z.boolean().optional()
}).refine(data => data.password || data.idToken, {
  message: "Se requiere contraseña o token de Firebase"
});

export const TokenRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido')
});

// ============================================================================
// ROUTE PERMISSIONS CONFIGURATION
// ============================================================================

export const routePermissions: Record<string, { 
  roles?: UserRole[]; 
  permissions?: string[]; 
  public?: boolean;
  allowAnyAuthenticated?: boolean;
}> = {
  // Public routes
  '/api/health': { public: true },
  '/api/v1/auth/sso': { public: true },
  '/api/v1/auth/login': { public: true },
  '/api/v1/auth/register': { public: true },
  
  // Authenticated routes (any role)
  '/api/v1/auth/logout': { allowAnyAuthenticated: true },
  '/api/v1/auth/me': { allowAnyAuthenticated: true },
  '/api/v1/auth/refresh': { allowAnyAuthenticated: true },
  
  // Admin routes
  '/api/v1/admin': { roles: [UserRole.ADMIN] },
  '/api/v1/users': { roles: [UserRole.ADMIN], permissions: ['users:manage'] },
  '/api/v1/settings': { roles: [UserRole.ADMIN] },
  
  // Doctor routes
  '/api/v1/doctors': { roles: [UserRole.DOCTOR, UserRole.ADMIN] },
  '/api/v1/appointments/doctor': { roles: [UserRole.DOCTOR] },
  '/api/v1/prescriptions': { roles: [UserRole.DOCTOR], permissions: ['prescriptions:write'] },
  
  // Patient routes
  '/api/v1/patients': { roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN] },
  '/api/v1/appointments/patient': { roles: [UserRole.PATIENT] },
  '/api/v1/medical-records': { roles: [UserRole.PATIENT, UserRole.DOCTOR], permissions: ['medical:read'] },
  
  // Company routes
  '/api/v1/companies': { roles: [UserRole.COMPANY, UserRole.ADMIN] },
  '/api/v1/marketplace': { roles: [UserRole.COMPANY, UserRole.DOCTOR] },
  
  // Telemedicine routes
  '/api/v1/telemedicine': { roles: [UserRole.PATIENT, UserRole.DOCTOR] },
  '/api/v1/webrtc': { roles: [UserRole.PATIENT, UserRole.DOCTOR] }
};

// ============================================================================
// CORE AUTH SERVICE
// ============================================================================

export class UnifiedAuthService {
  private static usersCollection = 'users';
  private static jwtSecret: string | null = null;
  private static jwtRefreshSecret: string | null = null;

  // JWT Secret management
  private static getJwtSecret(): string {
    if (!this.jwtSecret) {
      this.jwtSecret = process.env.JWT_SECRET;
      if (!this.jwtSecret) {
        throw new Error('🚨 CRITICAL: JWT_SECRET environment variable is required');
      }
    }
    return this.jwtSecret;
  }

  private static getJwtRefreshSecret(): string {
    if (!this.jwtRefreshSecret) {
      this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!this.jwtRefreshSecret) {
        throw new Error('🚨 CRITICAL: JWT_REFRESH_SECRET environment variable is required');
      }
    }
    return this.jwtRefreshSecret;
  }

  // Token generation
  static generateAuthToken(user: Partial<AuthToken>, expiresIn: string = '1h'): string {
    const payload: Omit<AuthToken, 'exp' | 'iat'> = {
      userId: user.userId!,
      email: user.email!,
      role: user.role!,
      firebaseUid: user.firebaseUid,
      permissions: user.permissions || [],
      patientId: user.patientId,
      doctorId: user.doctorId,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return jwt.sign(payload, this.getJwtSecret(), { 
      expiresIn,
      issuer: 'altamedica-api',
      audience: 'altamedica-platform'
    });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' }, 
      this.getJwtRefreshSecret(), 
      { 
        expiresIn: '7d',
        issuer: 'altamedica-api' 
      }
    );
  }

  // Token verification
  static async verifyAuthToken(token: string): Promise<AuthToken | null> {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret()) as AuthToken;
      
      // Validate token structure
      if (!decoded.userId || !decoded.email || !decoded.role) {
        console.error('Invalid token structure');
        return null;
      }

      // Check if user still exists and is active
      const userDoc = await adminDb.collection(this.usersCollection).doc(decoded.userId).get();
      if (!userDoc.exists) {
        console.error('User not found in database');
        return null;
      }

      const userData = userDoc.data();
      if (!userData?.isActive) {
        console.error('User is not active');
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, this.getJwtRefreshSecret()) as any;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded.userId;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Firebase token verification
  static async verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
    try {
      const authAdmin = getAuthAdmin();
      if (!authAdmin) {
        throw new Error('Firebase Auth not available');
      }
      
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  }

  // SSO Login
  static async ssoLogin(data: SSOLoginRequest): Promise<SSOLoginResponse> {
    try {
      const validatedData = LoginSchema.parse(data);
      let userRecord: any = null;
      let firebaseUid: string | null = null;

      // Handle Firebase ID token login
      if (validatedData.idToken) {
        const decodedToken = await this.verifyFirebaseToken(validatedData.idToken);
        if (!decodedToken) {
          return {
            success: false,
            error: 'Token de Firebase inválido'
          };
        }
        
        firebaseUid = decodedToken.uid;
        const authAdmin = getAuthAdmin();
        userRecord = await authAdmin.getUser(firebaseUid);
      } else {
        // Handle email/password login (if implemented)
        const authAdmin = getAuthAdmin();
        userRecord = await authAdmin.getUserByEmail(validatedData.email);
      }

      if (!userRecord) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Get additional user data from Firestore
      const userDoc = await adminDb.collection(this.usersCollection).doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return {
          success: false,
          error: 'Perfil de usuario no encontrado'
        };
      }

      const userData = userDoc.data()!;
      
      // Check if user is active
      if (!userData.isActive) {
        return {
          success: false,
          error: 'Usuario inactivo'
        };
      }

      // Create auth token
      const tokenData: Partial<AuthToken> = {
        userId: userRecord.uid,
        email: userRecord.email,
        role: userData.role as UserRole,
        firebaseUid: userRecord.uid,
        permissions: userData.permissions || [],
        patientId: userData.patientId,
        doctorId: userData.doctorId,
        companyId: userData.companyId,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      const expiresIn = validatedData.rememberMe ? '30d' : '1h';
      const authToken = this.generateAuthToken(tokenData, expiresIn);
      const refreshToken = this.generateRefreshToken(userRecord.uid);

      // Update last login
      await adminDb.collection(this.usersCollection).doc(userRecord.uid).update({
        lastLoginAt: new Date(),
        lastLoginIP: 'unknown' // This would come from request in actual implementation
      });

      return {
        success: true,
        user: tokenData as AuthToken,
        token: authToken,
        refreshToken,
        expiresIn: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 60 * 60 // seconds
      };

    } catch (error) {
      console.error('SSO Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<SSOLoginResponse> {
    try {
      const userId = await this.verifyRefreshToken(refreshToken);
      if (!userId) {
        return {
          success: false,
          error: 'Refresh token inválido'
        };
      }

      // Get user data
      const userDoc = await adminDb.collection(this.usersCollection).doc(userId).get();
      if (!userDoc.exists) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      const userData = userDoc.data()!;
      if (!userData.isActive) {
        return {
          success: false,
          error: 'Usuario inactivo'
        };
      }

      // Generate new tokens
      const tokenData: Partial<AuthToken> = {
        userId: userId,
        email: userData.email,
        role: userData.role as UserRole,
        firebaseUid: userId,
        permissions: userData.permissions || [],
        patientId: userData.patientId,
        doctorId: userData.doctorId,
        companyId: userData.companyId,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      const newAuthToken = this.generateAuthToken(tokenData);
      const newRefreshToken = this.generateRefreshToken(userId);

      return {
        success: true,
        user: tokenData as AuthToken,
        token: newAuthToken,
        refreshToken: newRefreshToken,
        expiresIn: 60 * 60 // 1 hour
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Error al refrescar token'
      };
    }
  }

  // Logout
  static async logout(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update user's last logout
      await adminDb.collection(this.usersCollection).doc(userId).update({
        lastLogoutAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Error al cerrar sesión'
      };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<AuthToken | null> {
    try {
      const userDoc = await adminDb.collection(this.usersCollection).doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data()!;
      return {
        userId: userId,
        email: userData.email,
        role: userData.role,
        firebaseUid: userId,
        permissions: userData.permissions || [],
        patientId: userData.patientId,
        doctorId: userData.doctorId,
        companyId: userData.companyId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
}

// ============================================================================
// AUTH CONTEXT UTILITIES  
// ============================================================================

export function createAuthContext(user: AuthToken | null): AuthContext {
  return {
    user,
    isAuthenticated: !!user,
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => !!user && roles.includes(user.role),
    hasPermission: (permission: string) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission) || user.role === UserRole.ADMIN;
    }
  };
}

// ============================================================================
// REQUEST UTILITIES
// ============================================================================

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function getUserFromRequest(request: NextRequest): Partial<AuthToken> {
  return {
    userId: request.headers.get('x-user-id') || undefined,
    email: request.headers.get('x-user-email') || undefined,
    role: request.headers.get('x-user-role') as UserRole || undefined,
    firstName: request.headers.get('x-user-first-name') || undefined,
    lastName: request.headers.get('x-user-last-name') || undefined,
  };
}

// ============================================================================
// UNIFIED AUTH MIDDLEWARE
// ============================================================================

export async function UnifiedAuth(
  request: NextRequest, 
  requiredRoles?: UserRole[] | 'any'
): Promise<AuthResult> {
  const pathname = request.nextUrl.pathname;

  // Find route configuration
  const routeConfig = findRouteConfig(pathname);

  // Allow public routes
  if (routeConfig?.public) {
    return { success: true };
  }

  // Extract and verify token
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      response: createUnauthorizedResponse('Token de autenticación requerido')
    };
  }

  const user = await UnifiedAuthService.verifyAuthToken(token);
  if (!user) {
    return {
      success: false,
      response: createUnauthorizedResponse('Token inválido o expirado')
    };
  }

  // Check roles if specified in parameters
  if (requiredRoles && requiredRoles !== 'any') {
    if (!requiredRoles.includes(user.role)) {
      return {
        success: false,
        response: createForbiddenResponse(`Rol ${user.role} no autorizado. Requerido: ${requiredRoles.join(', ')}`)
      };
    }
  }

  // Check route-specific roles
  if (routeConfig?.roles && routeConfig.roles.length > 0) {
    if (!routeConfig.roles.includes(user.role)) {
      return {
        success: false,
        response: createForbiddenResponse('Rol insuficiente para esta ruta')
      };
    }
  }

  // Check permissions
  if (routeConfig?.permissions && routeConfig.permissions.length > 0) {
    const authContext = createAuthContext(user);
    const hasAllPermissions = routeConfig.permissions.every(permission => 
      authContext.hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return {
        success: false,
        response: createForbiddenResponse('Permisos insuficientes')
      };
    }
  }

  // Allow any authenticated user if specified
  if (routeConfig?.allowAnyAuthenticated && user) {
    return { success: true, user };
  }

  return { success: true, user };
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

function findRouteConfig(pathname: string) {
  // Exact match
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  // Prefix match for dynamic routes
  const matchingRoute = Object.keys(routePermissions).find(route => {
    const routePattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${routePattern}`);
    return regex.test(pathname);
  });

  return matchingRoute ? routePermissions[matchingRoute] : null;
}

function createUnauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message,
      statusCode: 401,
      timestamp: new Date().toISOString()
    },
    { 
      status: 401,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store'
      }
    }
  );
}

function createForbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Forbidden',
      message,
      statusCode: 403,
      timestamp: new Date().toISOString()
    },
    { 
      status: 403,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store'
      }
    }
  );
}

// ============================================================================
// CONVENIENCE WRAPPERS
// ============================================================================

export const requireAuth = (requiredRoles?: UserRole[]) => {
  return (request: NextRequest) => UnifiedAuth(request, requiredRoles);
};

export const requireRole = (...roles: UserRole[]) => {
  return (request: NextRequest) => UnifiedAuth(request, roles);
};

export const requireAdmin = () => requireRole(UserRole.ADMIN);
export const requireDoctor = () => requireRole(UserRole.DOCTOR);
export const requirePatient = () => requireRole(UserRole.PATIENT);
export const requireCompany = () => requireRole(UserRole.COMPANY);

// HOC for API routes
export function withAuth(
  handler: (request: NextRequest, context: { user: AuthToken }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await UnifiedAuth(request, 'any');
    
    if (!authResult.success) {
      return authResult.response!;
    }
    
    return handler(request, { user: authResult.user! });
  };
}

export function withRole(
  roles: UserRole[],
  handler: (request: NextRequest, context: { user: AuthToken }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await UnifiedAuth(request, roles);
    
    if (!authResult.success) {
      return authResult.response!;
    }
    
    return handler(request, { user: authResult.user! });
  };
}

export default UnifiedAuthService;