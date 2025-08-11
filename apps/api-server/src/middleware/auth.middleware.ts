// ARCHIVO MIGRADO - Ver auth/UnifiedAuthSystem.ts
// Este archivo ha sido consolidado en el sistema unificado de autenticación

export { 
  UnifiedAuth as authMiddleware,
  requireRole,
  requireAuth,
  withAuth,
  withRole,
  routePermissions,
  UserRole,
  type AuthToken,
  type AuthContext,
  type AuthResult
} from '../auth/UnifiedAuthSystem';