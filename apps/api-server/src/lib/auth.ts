import { DecodedIdToken } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getAuthAdmin } from './firebase-admin';

// Tipos de roles disponibles en el sistema
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  COMPANY = 'company',
  STAFF = 'staff'
}

// Estructura del token JWT personalizado
export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
  firebaseUid?: string;
  permissions?: string[];
  exp: number;
  iat?: number;
}

// Tipo para el contexto de autenticación
export interface AuthContext {
  user: AuthToken | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Obtener el secret JWT de manera segura
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('🚨 CRITICAL: JWT_SECRET environment variable is required. Server cannot start without proper authentication secret.');
  }
  return secret;
};

// Verificar token JWT personalizado
export const verifyAuthToken = async (token: string): Promise<AuthToken | null> => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthToken;
    
    // Validar estructura del token
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error('Invalid token structure');
      return null;
    }
    
    // Validar que el rol sea válido
    if (!Object.values(UserRole).includes(decoded.role)) {
      console.error('Invalid user role:', decoded.role);
      return null;
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token');
    } else {
      console.error('Token verification failed:', error);
    }
    return null;
  }
};

// Verificar token de Firebase y convertirlo a JWT personalizado
export const verifyFirebaseToken = async (firebaseToken: string): Promise<AuthToken | null> => {
  try {
    const auth = getAuthAdmin();
    if (!auth) {
      console.error('Firebase Admin not initialized');
      return null;
    }

    const decodedToken: DecodedIdToken = await auth.verifyIdToken(firebaseToken);
    
    // Obtener custom claims (rol y permisos)
    const role = (decodedToken.role as UserRole) || UserRole.PATIENT;
    const permissions = decodedToken.permissions as string[] || [];
    
    // Crear token JWT personalizado con los datos de Firebase
    const authToken: Omit<AuthToken, 'exp' | 'iat'> = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      role,
      firebaseUid: decodedToken.uid,
      permissions
    };
    
    // Generar nuevo JWT con los datos de Firebase
    const jwtToken = generateAuthToken(authToken);
    const decoded = jwt.decode(jwtToken) as AuthToken;
    
    return decoded;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
};

// Generar token JWT con opciones configurables
export const generateAuthToken = (
  payload: Omit<AuthToken, 'exp' | 'iat'>,
  expiresIn: string = '24h'
): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
    issuer: 'altamedica-api',
    audience: 'altamedica-platform'
  });
};

// Generar refresh token con mayor duración
export const generateRefreshToken = (data: { uid: string, sessionId?: string } | string): string => {
  const payload = typeof data === 'string' 
    ? { userId: data, type: 'refresh' }
    : { userId: data.uid, sessionId: data.sessionId, type: 'refresh' };
    
  return jwt.sign(
    payload,
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// Verificar refresh token
export const verifyRefreshToken = async (token: string): Promise<{ userId: string } | null> => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

// Verificar autenticación desde el request
export const verifyAuth = async (request: NextRequest): Promise<{ isValid: boolean; user: AuthToken | null }> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      // Intentar obtener token de cookies como fallback
      const cookieToken = request.cookies.get('auth-token')?.value;
      if (cookieToken) {
        const user = await verifyAuthToken(cookieToken);
        return { isValid: !!user, user };
      }
      return { isValid: false, user: null };
    }

    // Verificar si es un token de Firebase o JWT personalizado
    let user: AuthToken | null = null;
    
    // Primero intentar como JWT personalizado
    user = await verifyAuthToken(token);
    
    // Si falla, intentar como token de Firebase
    if (!user) {
      user = await verifyFirebaseToken(token);
    }
    
    return { isValid: !!user, user };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { isValid: false, user: null };
  }
};

// Crear contexto de autenticación
export const createAuthContext = (user: AuthToken | null): AuthContext => {
  return {
    user,
    isAuthenticated: !!user,
    hasRole: (role: UserRole) => user?.role === role,
    hasPermission: (permission: string) => user?.permissions?.includes(permission) || false
  };
};

// Establecer custom claims en Firebase para un usuario
export const setUserClaims = async (
  uid: string,
  role: UserRole,
  permissions: string[] = []
): Promise<boolean> => {
  try {
    const auth = getAuthAdmin();
    if (!auth) {
      console.error('Firebase Admin not initialized');
      return false;
    }

    await auth.setCustomUserClaims(uid, {
      role,
      permissions
    });

    console.log(`✅ Custom claims set for user ${uid}: role=${role}`);
    return true;
  } catch (error) {
    console.error('Failed to set custom claims:', error);
    return false;
  }
};

// Obtener usuario de Firebase por UID
export const getFirebaseUser = async (uid: string) => {
  try {
    const auth = getAuthAdmin();
    if (!auth) {
      return null;
    }
    return await auth.getUser(uid);
  } catch (error) {
    console.error('Failed to get Firebase user:', error);
    return null;
  }
};

// Configuración de cookies SSO
export const SSO_COOKIE_CONFIG = {
  name: 'altamedica_sso_session',
  domain: process.env.NODE_ENV === 'production' ? '.altamedica.com' : 'localhost',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 // 7 días en segundos
};

// URLs de redirección por rol
export const ROLE_REDIRECT_URLS = {
  patient: process.env.NEXT_PUBLIC_PATIENT_URL || 'http://localhost:3003/dashboard',
  doctor: process.env.NEXT_PUBLIC_DOCTOR_URL || 'http://localhost:3002/dashboard',
  company: process.env.NEXT_PUBLIC_COMPANY_URL || 'http://localhost:3004/dashboard',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005/dashboard',
  staff: process.env.NEXT_PUBLIC_STAFF_URL || 'http://localhost:3000/dashboard'
};

// Función helper para hash de contraseñas (usando bcrypt)
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};