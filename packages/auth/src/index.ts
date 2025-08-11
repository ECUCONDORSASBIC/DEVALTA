// @altamedica/auth - Paquete centralizado de autenticación consolidado
// IMPORTANTE: Este archivo ahora incluye toda la funcionalidad unificada

export const authVersion = '1.1.0';

// ============== SERVICIOS ==============
// Servicio de autenticación consolidado (migrado desde auth-service)
export {
    AuthService, PublicUserRole, UserRole, getAuthService
} from './services/AuthService';

// Tipos principales
export type {
    AuthState,
    LoginCredentials,
    RegisterData, User
} from './services/AuthService';

// ============== HOOKS Y COMPONENTES ==============
// Hooks de React (migrado y mejorado desde auth-service)
export {
    AuthContext, AuthProvider,
    useAuth,
    useProtectedRoute,
    useRequireAuth,
    useRole
} from './hooks/useAuth';

// ============== LEGACY EXPORTS ==============
// Re-export todo desde client.ts para mantener compatibilidad con imports existentes
// Esto permite que el código existente siga funcionando sin cambios inmediatos
export * from './client';

// ============== COMPATIBILIDAD ==============
// Exportaciones adicionales para compatibilidad con auth-service
export { default as default } from './services/AuthService';

// ============== REDIRECCIONES ==============
export * from './utils/redirects';

// ============== CONSTANTES ==============
// Nombres de cookies estandarizados (evitar imports profundos)
export { AUTH_COOKIES, LEGACY_AUTH_COOKIES } from './constants/cookies';

// ============== MIDDLEWARE ==============
// SSO Middleware para Next.js apps
export { 
  createAuthMiddleware,
  authGuard 
} from './middleware/auth-guard';
export { 
  createSSOMiddleware, 
  ssoMiddlewareConfig,
  type SSOConfig 
} from './middleware/sso-middleware';

