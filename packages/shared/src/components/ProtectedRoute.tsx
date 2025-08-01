import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    router.push(redirectTo);
    return null;
  }

  // Si se requieren roles específicos, verificar
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(requiredRoles)) {
      // Redirigir al dashboard correspondiente al rol del usuario
      const dashboardUrl = getDashboardUrlByRole(user?.role);
      router.push(dashboardUrl);
      return null;
    }
  }

  return <>{children}</>;
}

// Componente específico para pacientes
export function PatientRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['patient']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para médicos
export function DoctorRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['doctor']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para empresas
export function CompanyRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['company']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para administradores
export function AdminRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente para roles médicos (médicos y administradores)
export function MedicalRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['doctor', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Función helper para obtener URL del dashboard según el rol
function getDashboardUrlByRole(role?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  
  switch (role) {
    case 'patient':
      return `${baseUrl.replace('3001', '3002')}/dashboard`;
    case 'doctor':
      return `${baseUrl.replace('3001', '3003')}/dashboard`;
    case 'company':
      return `${baseUrl.replace('3001', '3004')}/dashboard`;
    case 'admin':
      return `${baseUrl.replace('3001', '3006')}/dashboard`;
    default:
      return '/';
  }
}