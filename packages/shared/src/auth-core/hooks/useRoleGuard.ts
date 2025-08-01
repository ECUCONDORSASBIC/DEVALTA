// useRoleGuard hook - Provides role-based access control
import { useAuth } from '../providers/AuthProvider';

export const useRoleGuard = (allowedRoles: string | string[]) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  const isAllowed = isAuthenticated && hasRole(allowedRoles);

  return {
    isAllowed,
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    canAccess: (roles: string | string[]) => hasRole(roles),
    requiresAuth: !isAuthenticated,
    requiresRole: isAuthenticated && !isAllowed,
  };
};

export default useRoleGuard;
