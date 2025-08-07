import { adminAuth, adminDb } from '@/shared/lib/firebase-admin';
import { AuthUser, SSOLoginRequest, SSOLoginResponse, SSOTokenResponse } from './auth.types';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional()
});

export class AuthService {
  private static usersCollection = 'users';

  static async ssoLogin(data: SSOLoginRequest): Promise<SSOLoginResponse> {
    try {
      // Validar datos de entrada
      const validatedData = LoginSchema.parse(data);

      // Verificar credenciales en Firebase Auth
      const userRecord = await adminAuth.getUserByEmail(validatedData.email);
      
      if (!userRecord) {
        return {
          success: false,
          error: 'Credenciales inválidas'
        };
      }

      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await adminDb.collection(this.usersCollection).doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return {
          success: false,
          error: 'Usuario no encontrado en la base de datos'
        };
      }

      const userData = userDoc.data();
      
      // Verificar si el usuario está activo
      if (!userData?.isActive) {
        return {
          success: false,
          error: 'Usuario inactivo'
        };
      }

      // Crear custom token para Firebase Auth
      const customToken = await adminAuth.createCustomToken(userRecord.uid);

      // Crear objeto de usuario
      const user: AuthUser = {
        id: userRecord.uid,
        email: userRecord.email || '',
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.isActive,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date()
      };

      // Determinar URL de redirección basada en el rol
      const redirectUrl = this.getRedirectUrlByRole(user.role);

      return {
        success: true,
        user,
        accessToken: customToken,
        redirectUrl
      };

    } catch (error) {
      console.error('Error en SSO login:', error);
      return {
        success: false,
        error: error instanceof z.ZodError ? 'Datos de entrada inválidos' : 'Error interno del servidor'
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<SSOTokenResponse> {
    try {
      // Verificar el refresh token
      const decodedToken = await adminAuth.verifyIdToken(refreshToken);
      
      // Generar nuevo token
      const newToken = await adminAuth.createCustomToken(decodedToken.uid);

      return {
        success: true,
        accessToken: newToken
      };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return {
        success: false,
        error: 'Token inválido'
      };
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Obtener datos del usuario
      const userDoc = await adminDb.collection(this.usersCollection).doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      
      return {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        role: userData?.role,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        isActive: userData?.isActive || false,
        createdAt: userData?.createdAt?.toDate() || new Date(),
        updatedAt: userData?.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error al verificar token:', error);
      return null;
    }
  }

  private static getRedirectUrlByRole(role: string): string {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://altamedica.com' 
      : 'http://localhost';

    switch (role) {
      case 'PATIENT':
        return `${baseUrl}:3003/dashboard`;
      case 'DOCTOR':
        return `${baseUrl}:3002/dashboard`;
      case 'COMPANY':
        return `${baseUrl}:3004/dashboard`;
      case 'ADMIN':
        return `${baseUrl}:3005/dashboard`;
      default:
        return `${baseUrl}:3000/dashboard`;
    }
  }

  static async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      const userDoc = await adminDb.collection(this.usersCollection).doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      
      return {
        id: userRecord.uid,
        email: userRecord.email || '',
        role: userData?.role,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        isActive: userData?.isActive || false,
        createdAt: userData?.createdAt?.toDate() || new Date(),
        updatedAt: userData?.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      return null;
    }
  }
}