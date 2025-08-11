/**
 * Middleware exports for @altamedica/auth
 */

export { authGuard, createAuthMiddleware } from './auth-guard';
export { 
  createSSOMiddleware, 
  ssoMiddlewareConfig,
  type SSOConfig 
} from './sso-middleware';