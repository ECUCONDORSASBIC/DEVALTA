'use client';

import React from 'react';
import { useAuth, useUserPermissions, UserProfile } from '@/contexts/AuthContext';
import AuthLoading from './AuthLoading';
import { Shield, AlertTriangle } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: UserProfile['userType'][];
  fallbackRedirect?: string;
  loadingMessage?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  allowedUserTypes,
  fallbackRedirect = '/login',
  loadingMessage = 'Verificando acceso...'
}) => {
  const { user, userProfile, loading } = useAuth();
  const { hasPermission } = useUserPermissions();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <AuthLoading message={loadingMessage} />;
  }

  // Redireccionar si requiere autenticación y no hay usuario
  if (requireAuth && !user) {
    if (typeof window !== 'undefined') {
      window.location.href = fallbackRedirect;
    }
    return <AuthLoading message="Redirigiendo..." />;
  }

  // Verificar permisos de tipo de usuario
  if (allowedUserTypes && userProfile && !hasPermission(allowedUserTypes)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Tu tipo de usuario:</strong> {userProfile.userType}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Tipos permitidos:</strong> {allowedUserTypes.join(', ')}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Volver Atrás
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full border-2 border-blue-300 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario pero no se requiere autenticación
  if (!requireAuth && !user) {
    return <>{children}</>;
  }

  // Si hay usuario pero no hay perfil completo
  if (user && !userProfile && requireAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perfil Incompleto
            </h2>
            
            <p className="text-gray-600 mb-6">
              Tu perfil necesita ser completado para acceder a esta sección.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/profile/complete'}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Completar Perfil
              </button>
              
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full border-2 border-blue-300 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default RouteGuard;