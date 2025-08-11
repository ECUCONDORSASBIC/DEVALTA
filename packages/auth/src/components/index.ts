/**
 * @fileoverview Componentes de autenticación unificados
 * @module @altamedica/auth/components
 * @description Componentes React para manejo de autenticación y autorización
 */

// 🛡️ Guards de autenticación
export { 
  AuthGuard, 
  RouteGuard, 
  ProtectedRoute, 
  PublicRoute,
  type AuthGuardProps 
} from './AuthGuard';

// TODO: Futuros componentes a agregar
// export { LoginForm } from './LoginForm';
// export { RegisterForm } from './RegisterForm';
// export { ForgotPasswordForm } from './ForgotPasswordForm';
// export { UserMenu } from './UserMenu';
// export { SessionTimeout } from './SessionTimeout';