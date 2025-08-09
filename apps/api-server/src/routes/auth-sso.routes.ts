/**
 * 🔐 Rutas de Autenticación SSO
 * Endpoints centralizados para login, logout y verificación
 */

import { Router, Request, Response } from 'express';
import { ssoAuth } from '../services/sso-auth.service';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting para prevenir ataques de fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/v1/auth/login
 * Login con email y password
 */
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  await ssoAuth.login(req, res);
});

/**
 * POST /api/v1/auth/login-google
 * Login con Google (idToken de Firebase)
 */
router.post('/login-google', async (req: Request, res: Response) => {
  await ssoAuth.loginWithGoogle(req, res);
});

/**
 * POST /api/v1/auth/sso
 * Endpoint SSO principal - Login con email y password
 */
router.post('/sso', loginLimiter, async (req: Request, res: Response) => {
  await ssoAuth.login(req, res);
});

/**
 * GET /api/v1/auth/sso
 * Verificar sesión SSO existente
 */
router.get('/sso', async (req: Request, res: Response) => {
  await ssoAuth.verifyAuth(req, res);
});

/**
 * POST /api/v1/auth/logout
 * Cerrar sesión y limpiar cookies
 */
router.post('/logout', async (req: Request, res: Response) => {
  await ssoAuth.logout(req, res);
});

/**
 * GET /api/v1/auth/verify
 * Verificar si el usuario está autenticado
 */
router.get('/verify', async (req: Request, res: Response) => {
  await ssoAuth.verifyAuth(req, res);
});

/**
 * GET /api/v1/auth/me
 * Obtener información del usuario actual
 */
router.get('/me', ssoAuth.requireAuth(), async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  res.json({
    success: true,
    user: {
      uid: user.uid,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      permissions: user.permissions
    }
  });
});

/**
 * GET /api/v1/auth/check-role/:role
 * Verificar si el usuario tiene un rol específico
 */
router.get('/check-role/:role', ssoAuth.requireAuth(), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const requiredRole = req.params.role;
  
  const hasRole = user.role === requiredRole;
  
  res.json({
    success: true,
    hasRole,
    currentRole: user.role,
    requiredRole
  });
});

/**
 * POST /api/v1/auth/refresh
 * Renovar token usando refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  // El método verifyAuth ya maneja el refresh automáticamente
  await ssoAuth.verifyAuth(req, res);
});

/**
 * GET /api/v1/auth/health
 * Verificar que el servicio SSO está funcionando
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'SSO Authentication',
    status: 'operational',
    timestamp: new Date().toISOString(),
    features: {
      httpOnlyCookies: true,
      jwtTokens: true,
      roleBasedAccess: true,
      auditLogging: true,
      rateLimiting: true
    }
  });
});

export default router;