/**
 * 🔐 Servicio de Autenticación SSO Centralizado
 * Maneja autenticación, cookies httpOnly y redirección por roles
 */

import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { getAuthAdmin } from '../lib/firebase-admin';
import { z } from 'zod';

// Esquemas de validación
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const TokenPayloadSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: z.enum(['patient', 'doctor', 'company', 'admin']),
  displayName: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

// Configuración de cookies seguras
const COOKIE_OPTIONS = {
  httpOnly: true,                    // Previene acceso desde JavaScript (XSS)
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'lax' as const,         // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 días
  path: '/',                         // Disponible en toda la app
  domain: process.env.COOKIE_DOMAIN || 'localhost' // Para compartir entre subdominios
};

// URLs de redirección por rol
const ROLE_REDIRECTS = {
  patient: process.env.PATIENT_URL || 'http://localhost:3003',
  doctor: process.env.DOCTOR_URL || 'http://localhost:3002',
  company: process.env.COMPANY_URL || 'http://localhost:3004',
  admin: process.env.ADMIN_URL || 'http://localhost:3005'
};

export class SSOAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'altamedica-sso-secret-2024';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'altamedica-refresh-2024';
  
  /**
   * Login con Google (idToken de Firebase)
   */
  async loginWithGoogle(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, message: 'Falta idToken' });
      }

      // Validar el token con Firebase Admin
      const authAdmin = getAuthAdmin();
      if (!authAdmin) {
        throw new Error('Firebase Admin no inicializado');
      }
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email || '';
      const displayName = decodedToken.name || email.split('@')[0];

      // Buscar o crear perfil de usuario
      const userProfile = await this.getUserProfile(uid);

      // Generar tokens JWT
      const { accessToken, refreshToken } = this.generateTokens({
        uid,
        email,
        role: userProfile.role,
        displayName,
        permissions: userProfile.permissions
      });

      // Establecer cookies httpOnly
      res.cookie('auth-token', accessToken, COOKIE_OPTIONS);
      res.cookie('refresh-token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Registrar en auditoría
      await this.auditLog({
        action: 'LOGIN_GOOGLE',
        userId: uid,
        email,
        role: userProfile.role,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Responder con datos de usuario
      const redirectUrl = ROLE_REDIRECTS[userProfile.role as keyof typeof ROLE_REDIRECTS];
      return res.status(200).json({
        success: true,
        message: 'Login Google exitoso',
        redirectUrl,
        user: {
          uid,
          email,
          role: userProfile.role,
          displayName
        }
      });
    } catch (error: any) {
      console.error('[SSO] Error en loginGoogle:', error);
      await this.auditLog({
        action: 'LOGIN_GOOGLE_FAILED',
        email: req.body.email,
        ip: req.ip,
        error: error.message
      });
      return res.status(401).json({ success: false, message: 'Login Google inválido' });
    }
  }

  /**
   * Iniciar sesión y crear cookies httpOnly
   */
  async login(req: Request, res: Response) {
    try {
      // 1. Validar entrada
      const { email, password } = LoginSchema.parse(req.body);
      
      console.log(`[SSO] Intento de login: ${email}`);
      
      // 2. Verificar credenciales con Firebase
      const userRecord = await this.verifyFirebaseCredentials(email, password);
      
      // 3. Obtener rol y permisos del usuario
      const userProfile = await this.getUserProfile(userRecord.uid);
      
      // 4. Generar tokens JWT
      const { accessToken, refreshToken } = this.generateTokens({
        uid: userRecord.uid,
        email: userRecord.email!,
        role: userProfile.role,
        displayName: userRecord.displayName || userProfile.displayName,
        permissions: userProfile.permissions
      });
      
      // 5. Establecer cookies httpOnly
      res.cookie('auth-token', accessToken, COOKIE_OPTIONS);
      res.cookie('refresh-token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días para refresh
      });
      
      // 6. Registrar en auditoría (HIPAA)
      await this.auditLog({
        action: 'LOGIN',
        userId: userRecord.uid,
        email,
        role: userProfile.role,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // 7. Responder con URL de redirección
      const redirectUrl = ROLE_REDIRECTS[userProfile.role as keyof typeof ROLE_REDIRECTS];
      
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        redirectUrl,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          role: userProfile.role,
          displayName: userRecord.displayName
        }
        // NO enviar tokens en el body (solo en cookies)
      });
      
    } catch (error: any) {
      console.error('[SSO] Error en login:', error);
      
      // Log de intento fallido (seguridad)
      await this.auditLog({
        action: 'LOGIN_FAILED',
        email: req.body.email,
        ip: req.ip,
        error: error.message
      });
      
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  }
  
  /**
   * Verificar token desde cookie httpOnly
   */
  async verifyAuth(req: Request, res: Response, next?: Function) {
    try {
      // 1. Obtener token de la cookie
      const token = req.cookies['auth-token'];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
          redirectUrl: 'http://localhost:3000/login'
        });
      }
      
      // 2. Verificar y decodificar token
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // 3. Validar estructura del token
      const validToken = TokenPayloadSchema.parse(decoded);
      
      // 4. Adjuntar usuario al request
      (req as any).user = validToken;
      
      // 5. Renovar token si está próximo a expirar
      if (this.shouldRenewToken(decoded)) {
        const newToken = this.renewAccessToken(validToken);
        res.cookie('auth-token', newToken, COOKIE_OPTIONS);
      }
      
      if (next) next();
      else return res.status(200).json({ success: true, user: validToken });
      
    } catch (error: any) {
      console.error('[SSO] Token inválido:', error.message);
      
      // Intentar refresh token
      const refreshToken = req.cookies['refresh-token'];
      if (refreshToken) {
        return this.refreshAuth(req, res, next);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
        redirectUrl: 'http://localhost:3000/login'
      });
    }
  }
  
  /**
   * Cerrar sesión y limpiar cookies
   */
  async logout(req: Request, res: Response) {
    try {
      // 1. Obtener usuario de la sesión actual
      const token = req.cookies['auth-token'];
      let userId = 'unknown';
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.JWT_SECRET) as any;
          userId = decoded.uid;
        } catch {}
      }
      
      // 2. Limpiar cookies
      res.clearCookie('auth-token', { path: '/', domain: COOKIE_OPTIONS.domain });
      res.clearCookie('refresh-token', { path: '/', domain: COOKIE_OPTIONS.domain });
      
      // 3. Registrar en auditoría
      await this.auditLog({
        action: 'LOGOUT',
        userId,
        ip: req.ip
      });
      
      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada',
        redirectUrl: 'http://localhost:3000'
      });
      
    } catch (error) {
      console.error('[SSO] Error en logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión'
      });
    }
  }
  
  /**
   * Middleware para proteger rutas
   */
  requireAuth(allowedRoles?: string[]) {
    return async (req: Request, res: Response, next: Function) => {
      // Verificar autenticación
      await this.verifyAuth(req, res, async () => {
        // Verificar rol si es necesario
        if (allowedRoles && allowedRoles.length > 0) {
          const user = (req as any).user;
          
          if (!allowedRoles.includes(user.role)) {
            await this.auditLog({
              action: 'UNAUTHORIZED_ACCESS',
              userId: user.uid,
              role: user.role,
              attemptedRoles: allowedRoles,
              path: req.path
            });
            
            return res.status(403).json({
              success: false,
              message: 'No tienes permisos para acceder a este recurso'
            });
          }
        }
        
        next();
      });
    };
  }
  
  // Métodos privados auxiliares
  
  private async verifyFirebaseCredentials(email: string, password: string) {
    // Simulación - En producción usar Firebase Auth SDK
    // Por ahora validamos las cuentas de prueba
    const testAccounts: any = {
      'paciente@test.com': { uid: 'patient-001', role: 'patient', password: '12345678' },
      'doctor@test.com': { uid: 'doctor-001', role: 'doctor', password: '12345678' },
      'empresa@test.com': { uid: 'company-001', role: 'company', password: '12345678' },
      'admin@test.com': { uid: 'admin-001', role: 'admin', password: '12345678' },
      'Eeecucondor@gmail.com': { uid: 'eduardo-001', role: 'admin', password: '123456789' }
    };
    
    const account = testAccounts[email];
    if (!account || account.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    return {
      uid: account.uid,
      email,
      displayName: email.split('@')[0]
    };
  }
  
  private async getUserProfile(uid: string) {
    // Simulación - En producción obtener de Firestore
    const profiles: any = {
      'patient-001': { role: 'patient', permissions: ['read_own_records'] },
      'doctor-001': { role: 'doctor', permissions: ['read_patients', 'write_prescriptions'] },
      'company-001': { role: 'company', permissions: ['manage_employees'] },
      'admin-001': { role: 'admin', permissions: ['full_access'] },
      'eduardo-001': { role: 'admin', permissions: ['full_access'] }
    };
    
    return profiles[uid] || { role: 'patient', permissions: [] };
  }
  
  private generateTokens(payload: any) {
    // Access token - 1 hora
    const accessToken = jwt.sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Refresh token - 30 días
    const refreshToken = jwt.sign(
      { uid: payload.uid },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  private shouldRenewToken(decoded: any): boolean {
    if (!decoded.exp) return false;
    
    const now = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - now;
    
    // Renovar si queda menos de 15 minutos
    return timeUntilExpiry < 15 * 60;
  }
  
  private renewAccessToken(payload: any) {
    return jwt.sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  
  private async refreshAuth(req: Request, res: Response, next?: Function) {
    try {
      const refreshToken = req.cookies['refresh-token'];
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      // Obtener perfil actualizado
      const userProfile = await this.getUserProfile(decoded.uid);
      
      // Generar nuevo access token
      const newAccessToken = this.renewAccessToken({
        uid: decoded.uid,
        ...userProfile
      });
      
      // Establecer nueva cookie
      res.cookie('auth-token', newAccessToken, COOKIE_OPTIONS);
      
      // Adjuntar usuario al request
      (req as any).user = { uid: decoded.uid, ...userProfile };
      
      if (next) next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada',
        redirectUrl: 'http://localhost:3000/login'
      });
    }
  }
  
  private async auditLog(data: any) {
    // Log para cumplimiento HIPAA
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...data
    };
    
    console.log('[AUDIT]', JSON.stringify(logEntry));
    
    // En producción: Guardar en base de datos de auditoría
    // await AuditModel.create(logEntry);
  }
}

// Exportar instancia singleton
export const ssoAuth = new SSOAuthService();