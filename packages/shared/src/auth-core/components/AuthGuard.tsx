// AuthGuard component - Protects routes/components requiring authentication
import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { AuthGuardProps } from '../types/auth.types';

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this content.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
