// @altamedica/auth - Paquete centralizado de autenticación consolidado
// IMPORTANTE: Este archivo ahora incluye toda la funcionalidad unificada

export const authVersion = '1.1.0';

// ============== SERVICIOS ==============
// Servicio de autenticación consolidado (migrado desde auth-service)
export {
  AuthService,
  getAuthService,
  UserRole,
  PublicUserRole
} from './services/AuthService';

// Tipos principales
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData
} from './services/AuthService';

// ============== HOOKS Y COMPONENTES ==============
// Hooks de React (migrado y mejorado desde auth-service)
export {
  AuthProvider,
  useAuth,
  useProtectedRoute,
  useRequireAuth,
  useRole,
  AuthContext
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

