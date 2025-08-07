/**
 * @altamedica/auth/hooks
 * Exportaciones consolidadas de hooks de autenticación
 */

// Exportar hooks principales consolidados
export * from './useAuth';
export { useAuth as default } from './useAuth';

// Para compatibilidad, re-exportar hooks legacy desde useAuth
export { useRole, useProtectedRoute, useRequireAuth } from './useAuth';
