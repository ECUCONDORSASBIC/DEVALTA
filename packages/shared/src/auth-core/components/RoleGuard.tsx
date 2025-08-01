// RoleGuard component - Protects routes/components requiring specific roles
import React from 'react';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { RoleGuardProps } from '../types/auth.types';

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, roles, fallback }) => {
  const { isAllowed, isLoading, requiresAuth, requiresRole } = useRoleGuard(roles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiresAuth) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600">Please log in to view this content.</p>
        </div>
      </div>
    );
  }

  if (requiresRole) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have the necessary permissions to view this content.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

