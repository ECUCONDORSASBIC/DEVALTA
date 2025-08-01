// Auth Core Module - Main exports
export { default as AuthService } from './services/AuthService';
// React components and hooks are excluded from shared package
// export { AuthProvider } from './providers/AuthProvider';
// export { useUser } from './hooks/useUser';
// export { useRoleGuard } from './hooks/useRoleGuard';
// export { AuthGuard } from './components/AuthGuard';
// export { RoleGuard } from './components/RoleGuard';
export * from './types/auth.types';
export * from './utils/auth.utils';
export { AuthError, NetworkError, ValidationError } from './errors/AuthError';
export * from './constants/auth.constants';
